import { openDB, type IDBPDatabase } from "idb";

export type QueuedRequest = {
  id?: number;
  url: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  enqueuedAt: string;
  retries: number;
};

const DB_NAME = "magnetic-ict-queue";
const STORE_NAME = "requests";
const DB_VERSION = 1;
const MAX_RETRIES = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });
  }
  return dbPromise;
}

export async function enqueueRequest(req: Omit<QueuedRequest, "id" | "retries">): Promise<void> {
  const db = await getDb();
  await db.add(STORE_NAME, { ...req, retries: 0 } as QueuedRequest);
}

async function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function flushRequestQueue(
  onSuccess?: (req: QueuedRequest) => void,
  onFailure?: (req: QueuedRequest, error: string) => void
): Promise<void> {
  if (!navigator.onLine) return;

  const db = await getDb();
  const all = await db.getAll(STORE_NAME) as QueuedRequest[];

  // Sort chronologically
  all.sort((a, b) =>
    new Date(a.enqueuedAt).getTime() - new Date(b.enqueuedAt).getTime()
  );

  for (const item of all) {
    let success = false;
    let lastError = "";
    let waitMs = 200;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) await delay(waitMs);
      waitMs *= 2; // exponential backoff

      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: { "Content-Type": "application/json", ...item.headers },
          body: item.body,
        });

        if (res.ok) {
          success = true;
          break;
        }
        lastError = `HTTP ${res.status}`;
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Network error";
      }
    }

    if (success) {
      if (item.id !== undefined) await db.delete(STORE_NAME, item.id);
      onSuccess?.(item);
    } else {
      // Update retry count; remove if exhausted
      if (item.retries + 1 >= MAX_RETRIES) {
        if (item.id !== undefined) await db.delete(STORE_NAME, item.id);
        onFailure?.(item, lastError);
      } else {
        const updated: QueuedRequest = { ...item, retries: item.retries + 1 };
        await db.put(STORE_NAME, updated);
      }
    }
  }
}

export async function getQueuedRequestCount(): Promise<number> {
  const db = await getDb();
  return db.count(STORE_NAME);
}
