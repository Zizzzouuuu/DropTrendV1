
import React from 'react';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import PricingClient from './PricingClient';

export default async function PricingPage() {
  const session = await auth();

  let user = null;
  if (session?.user?.id) {
    user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        phoneNumber: true,
        subscription: true
      }
    });
  }

  return <PricingClient user={user} />;
}
