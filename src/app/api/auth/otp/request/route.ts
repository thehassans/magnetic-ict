import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOtpEmail, sendPasswordResetEmail } from "@/lib/email";
import { generateOtpCode, hashOtpCode } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { name: true }
    });

    await prisma.emailOtp.create({
      data: {
        email,
        tokenHash: hashOtpCode(code),
        expiresAt
      }
    });

    if (existingUser) {
      await sendPasswordResetEmail({ email, code, customerName: existingUser.name });
    } else {
      await sendOtpEmail({ email, code });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("OTP request failed", error);

    return NextResponse.json(
      { error: "Unable to send verification code right now." },
      { status: 500 }
    );
  }
}
