import Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });

  const PLANS: Record<string, string> = {
    light:    process.env.STRIPE_PRICE_LIGHT!,
    standard: process.env.STRIPE_PRICE_STANDARD!,
    premium:  process.env.STRIPE_PRICE_PREMIUM!,
  };

  try {
    const { plan, facilityName } = await request.json();

    const priceId = PLANS[plan];
    if (!priceId) {
      return Response.json({ error: "無効なプランです" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { facilityName, plan },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe エラー:", error);
    return Response.json({ error: "決済セッションの作成に失敗しました" }, { status: 500 });
  }
}
