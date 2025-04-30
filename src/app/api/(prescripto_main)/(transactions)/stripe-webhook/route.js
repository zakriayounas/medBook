// app/api/stripe-webhook/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import prisma from "../../../../../../lib/prisma";

export const config = {
    api: {
        bodyParser: false, // Required to get raw body
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    // Get the raw body as a buffer
    const rawBody = await req.text();

    // Use headers() to read the signature
    const headerList = headers();
    const stripeSignature = headerList.get("stripe-signature");

    if (!stripeSignature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, stripeSignature, endpointSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // ✅ Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const appointmentId = parseInt(session.metadata.appointmentId);
        const userId = parseInt(session.metadata.userId);
        const paymentIntentId = session.payment_intent;
        const amount = session.amount_total / 100;

        try {
            await prisma.transaction.create({
                data: {
                    appointmentId,
                    userId,
                    stripePaymentIntentId: paymentIntentId,
                    amount,
                    status: "succeeded",
                },
            });
        } catch (err) {
            console.error("Error saving transaction from webhook:", err);
        }
    }

    return NextResponse.json({ received: true });
}
