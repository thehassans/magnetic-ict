import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { markOrdersPaid } from "@/lib/order-processing";
import { capturePayPalCheckoutOrder } from "@/lib/payments";

const requestSchema = z.object({
  paypalOrderId: z.string().min(1),
  orderIds: z.array(z.string().min(1)).min(1)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid capture payload." }, { status: 400 });
    }

    const { paypalOrderId, orderIds } = parsed.data;

    const capture = await capturePayPalCheckoutOrder(paypalOrderId);

    if (!capture || !["COMPLETED", "APPROVED"].includes(capture.status)) {
      return NextResponse.json({ error: "Google Pay payment capture failed." }, { status: 400 });
    }

    await markOrdersPaid(orderIds, paypalOrderId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Google Pay capture failed", error);
    return NextResponse.json({ error: "Unable to capture Google Pay payment." }, { status: 500 });
  }
}
