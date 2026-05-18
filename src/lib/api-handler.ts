import { NextResponse } from "next/server";
import { captureError } from "@/lib/sentry";
import { findOneMongoDocument, upsertMongoDocument } from "@/lib/social-bot-db";
import { randomUUID } from "crypto";

export type ApiErrorRecord = {
  _id: string;
  requestId: string;
  route: string;
  method: string;
  message: string;
  stack: string | null;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  resolved: boolean;
};

const ERROR_COLLECTION = "ApiErrors";

async function logErrorToDb(record: Omit<ApiErrorRecord, "_id">) {
  try {
    const id = `err_${randomUUID()}`;
    await upsertMongoDocument(
      ERROR_COLLECTION,
      { requestId: record.requestId },
      { ...record },
      { _id: id, ...record }
    );
  } catch {
    // Don't let logging failures cascade
    console.error("[api-handler] Failed to write error to MongoDB");
  }
}

type RouteHandler = (req: Request, ctx?: unknown) => Promise<Response>;

export function withApiHandler(
  handler: RouteHandler,
  options?: { route?: string; method?: string }
): RouteHandler {
  return async (req: Request, ctx?: unknown) => {
    const requestId = randomUUID();
    const route = options?.route ?? new URL(req.url).pathname;
    const method = options?.method ?? req.method;

    try {
      return await handler(req, ctx);
    } catch (error) {
      const isError = error instanceof Error;
      const message = isError ? error.message : String(error);
      const stack = isError ? (error.stack ?? null) : null;

      // Determine severity
      const severity: ApiErrorRecord["severity"] =
        message.includes("unauthorized") || message.includes("forbidden")
          ? "medium"
          : message.includes("database") || message.includes("mongo")
          ? "high"
          : "medium";

      const record: Omit<ApiErrorRecord, "_id"> = {
        requestId,
        route,
        method,
        message,
        stack,
        severity,
        timestamp: new Date().toISOString(),
        resolved: false,
      };

      // Log to Sentry
      captureError(error, { requestId, route, method });

      // Log to MongoDB
      await logErrorToDb(record);

      return NextResponse.json(
        {
          error: "An unexpected server error occurred.",
          requestId,
          ...(process.env.NODE_ENV !== "production" ? { detail: message } : {}),
        },
        { status: 500 }
      );
    }
  };
}

export async function getApiErrors(limit = 100): Promise<ApiErrorRecord[]> {
  const results: ApiErrorRecord[] = [];
  // We use the mongo find pattern — fetch up to `limit` docs
  for (let i = 0; i < limit; i++) {
    const doc = await findOneMongoDocument<ApiErrorRecord>(ERROR_COLLECTION, {
      resolved: false,
    });
    if (!doc) break;
    results.push(doc);
  }
  return results;
}
