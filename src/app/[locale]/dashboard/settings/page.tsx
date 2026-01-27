import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Link } from '@/i18n/routing';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user?.email
    ? await db.user.findUnique({ where: { email: session.user.email } })
    : null;

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Paramètres</h1>

      <Card className="p-6 border-slate-800 bg-slate-900/50">
        <h2 className="text-xl font-bold text-white mb-4">Profil</h2>
        <SettingsForm user={user} />
      </Card>

      <Card className="p-6 border-slate-800 bg-slate-900/50">
        <h2 className="text-xl font-bold text-white mb-4">Connexions</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Shopify</h3>
            <p className="text-sm text-slate-400">
              {user.shopifyConnected ? "Connecté" : "Non connecté"}
            </p>
          </div>
          {user.shopifyConnected ? (
            <Button variant="outline" className="text-red-400 border-red-900/50">Déconnecter</Button>
          ) : (
            <Link href="/api/shopify/connect">
              <Button>Connecter ma boutique</Button>
            </Link>
          )}
        </div>
      </Card>

      <Card className="p-6 border-slate-800 bg-slate-900/50">
        <h2 className="text-xl font-bold text-white mb-4">Abonnement</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white capitalize">{user.subscription} Plan</h3>
            <p className="text-sm text-slate-400">
              {user.subscription === 'free' ? 'Upgradez pour plus de fonctionnalités.' : 'Gérez votre facturation.'}
            </p>
          </div>
          {user.subscription === 'free' ? (
            <Link href="/pricing">
              <Button className="bg-blue-600 hover:bg-blue-500">Devenir Pro</Button>
            </Link>
          ) : (
            <Link href="/api/stripe/portal">
              <Button variant="outline">Gérer mon abonnement</Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
