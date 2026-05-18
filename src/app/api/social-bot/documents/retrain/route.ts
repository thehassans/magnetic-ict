import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext } from "@/lib/social-bot-access";
import { getSocialBotChunks, getSocialBotDocuments, socialBotCollections, upsertMongoDocument } from "@/lib/social-bot-db";
import { embedText } from "@/lib/social-bot-rag";

export const runtime = "nodejs";

export async function POST(_request: Request) {
  const session = await getRequiredUserSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    return NextResponse.json({ error: "Magnetic Social Bot is not unlocked for this account." }, { status: 403 });
  }

  const workspace = await getWorkspaceContext(session.user.id);

  try {
    const userId = workspace.ownerId;
    const chunks = await getSocialBotChunks(userId);

    if (chunks.length === 0) {
      return NextResponse.json({ ok: true, retrainedChunks: 0, message: "No training data found. Upload documents first." });
    }

    const docIds = [...new Set(chunks.map((c) => c.documentId))];

    for (const docId of docIds) {
      await upsertMongoDocument(
        socialBotCollections.documents,
        { _id: docId, userId },
        { status: "PROCESSING", updatedAt: new Date().toISOString() }
      );
    }

    let retrainedCount = 0;
    for (const chunk of chunks) {
      try {
        const embedding = await embedText(chunk.content, "RETRIEVAL_DOCUMENT");
        await upsertMongoDocument(
          socialBotCollections.chunks,
          { _id: chunk._id, userId },
          { embedding }
        );
        retrainedCount++;
      } catch {
        /* skip single chunk failure */
      }
    }

    for (const docId of docIds) {
      const docChunkCount = chunks.filter((c) => c.documentId === docId).length;
      await upsertMongoDocument(
        socialBotCollections.documents,
        { _id: docId, userId },
        { status: "READY", chunkCount: docChunkCount, updatedAt: new Date().toISOString() }
      );
    }

    const updatedDocuments = await getSocialBotDocuments(userId);

    return NextResponse.json({
      ok: true,
      retrainedChunks: retrainedCount,
      totalChunks: chunks.length,
      documents: updatedDocuments,
      message: `Retrained ${retrainedCount} of ${chunks.length} knowledge chunks successfully.`
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Retrain failed." },
      { status: 500 }
    );
  }
}
