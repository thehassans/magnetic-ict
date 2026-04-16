import { NextResponse } from "next/server";
import { requireAdminSocialBotTarget } from "@/lib/admin-social-bot";
import { addKnowledgeDocument } from "@/lib/social-bot-service";
import { extractTextFromUploadedFile } from "@/lib/social-bot-rag";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const target = await requireAdminSocialBotTarget(request);

  if (target.response || !target.userId) {
    return target.response as NextResponse;
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Upload at least one document." }, { status: 400 });
    }

    for (const file of files) {
      const text = await extractTextFromUploadedFile(file);
      await addKnowledgeDocument({
        userId: target.userId,
        fileName: file.name,
        mimeType: file.type,
        text
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process these documents." },
      { status: 400 }
    );
  }
}
