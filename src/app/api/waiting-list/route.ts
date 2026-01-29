import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const emailSchema = z.object({
    email: z.string().email("Invalid email"),
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
                { message: "You are already registered!" },
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
            { message: "Registration successful! We'll keep you posted." },
            { status: 201 }
        );
    } catch (error) {
        console.error("Waiting List Error:", error);
        return NextResponse.json(
            { error: "An error occurred." },
            { status: 500 }
        );
    }
}
