// app/api/alerts/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, criteria } = await req.json();

    if (!email || !criteria || !Array.isArray(criteria) || criteria.length === 0) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        email,
        criteria,
        lastNotified: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}