import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { sendSms } from "@/lib/sms";

const bodySchema = z.object({
  phone: z.string().trim().min(7).max(20),
  message: z.string().trim().min(1).max(160),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid phone or message." },
        { status: 400 }
      );
    }

    const { phone, message } = parsed.data;
    const result = await sendSms(phone, message);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      textId: result.textId,
      quotaRemaining: result.quotaRemaining,
    });
  } catch (err) {
    console.error("[admin/sms] Failed", err);
    return NextResponse.json({ error: "Failed to send SMS." }, { status: 500 });
  }
}
