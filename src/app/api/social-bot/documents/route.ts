import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { addKnowledgeDocument } from "@/lib/social-bot-service";
import { extractTextFromUploadedFile } from "@/lib/social-bot-rag";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getRequiredUserSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    return NextResponse.json({ error: "Magnetic Social Bot is not unlocked for this account." }, { status: 403 });
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
        userId: session.user.id,
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
