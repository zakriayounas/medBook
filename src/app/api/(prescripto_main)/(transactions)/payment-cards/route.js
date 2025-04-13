import { NextResponse } from "next/server";
import Stripe from "stripe";
import { extractUserId } from "../../../../../../lib/UserHelpers";
import prisma from "../../../../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const POST = async (req) => {
    try {
        const userId = extractUserId(req);
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Stripe token is required" }, { status: 400 });
        }

        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Create or fetch Stripe customer
        let stripeCustomerId = user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
            });
            stripeCustomerId = customer.id;

            await prisma.users.update({
                where: { id: userId },
                data: { stripeCustomerId },
            });
        }

        // Add card to customer using the token
        const card = await stripe.customers.createSource(stripeCustomerId, {
            source: token,
        });

        // Check if user already has saved cards
        const existingCards = await prisma.customerCard.findMany({ where: { userId } });
        const isDefault = existingCards.length === 0;

        // If first card, set as default in Stripe
        if (isDefault) {
            await stripe.customers.update(stripeCustomerId, {
                default_source: card.id,
            });
        }

        // Save card in DB (excluding expMonth/expYear as you said)
        const savedCard = await prisma.customerCard.create({
            data: {
                userId,
                stripeCustomerId,
                stripePaymentMethodId: card.id,
                brand: card.brand,
                last4: card.last4,
                isDefault,
            },
        });

        return NextResponse.json({
            status: 200,
            message: "Card added successfully!",
            card: savedCard,
        });
    } catch (error) {
        console.error("Add Card via Token Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};

export const GET = async (req) => {
    try {
        const userId = extractUserId(req);

        const cards = await prisma.customerCard.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            status: 200,
            cards,
        });
    } catch (error) {
        console.error("Fetch Cards Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};
