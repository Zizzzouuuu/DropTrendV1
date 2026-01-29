import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const emailSchema = z.object({
    email: z.string().email("Email invalide"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = emailSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0].message },
                { status: 400 }
            );
        }

        const { email } = result.data;
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        // Check if duplicate
        const existing = await db.waitingList.findUnique({
            where: { email },
        });

        if (existing) {
            return NextResponse.json(
                { message: "Vous êtes déjà inscrit !" },
                { status: 200 }
            );
        }

        await db.waitingList.create({
            data: {
                email,
                ipAddress: ip,
            },
        });

        return NextResponse.json(
            { message: "Inscription réussie ! On vous tient au courant." },
            { status: 201 }
        );
    } catch (error) {
        console.error("Waiting List Error:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue." },
            { status: 500 }
        );
    }
}
