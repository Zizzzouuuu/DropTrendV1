import React from 'react';
import { Card } from '@/components/ui/Card';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Conditions Générales d’Utilisation – DropTrend</h1>
      <Card className="p-8 border-slate-800 bg-slate-900/50 space-y-6 text-slate-300">
        <p className="text-sm text-slate-500">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
        
        <p>Les présentes Conditions Générales d’Utilisation (CGU) régissent l’accès et l’utilisation du service DropTrend. En créant un compte, l’utilisateur accepte sans réserve les présentes CGU.</p>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">1. Présentation du service</h2>
            <p>DropTrend est une plateforme SaaS destinée aux e-commerçants, proposant des outils d’analyse de produits et de tendances. DropTrend ne garantit aucun résultat financier.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">2. Accès au service</h2>
            <p>L’accès nécessite la création d’un compte avec des informations exactes. L’utilisateur est responsable de la confidentialité de ses identifiants.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">3. Abonnements et accès</h2>
            <p>DropTrend propose un accès gratuit limité et des abonnements payants. Les abonnements sont reconduits automatiquement sauf résiliation.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">4. Paiement et facturation</h2>
            <p>Paiements sécurisés via prestataires tiers. Aucun remboursement pour une période entamée.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">5. Utilisation autorisée</h2>
            <p>Toute utilisation abusive, frauduleuse ou détournée est interdite.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">6. Propriété intellectuelle</h2>
            <p>L’ensemble du contenu de DropTrend est protégé. Toute reproduction non autorisée est interdite.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">7. Responsabilité</h2>
            <p>DropTrend n'est pas responsable des pertes financières ou des décisions prises par l'utilisateur. Le service est fourni « tel quel ».</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">8. Droit applicable</h2>
            <p>Les présentes CGU sont régies par le droit applicable dans le pays d’exploitation de DropTrend.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">9. Contact</h2>
            <p>Pour toute question : 📧 [email de contact]</p>
        </section>
      </Card>
    </div>
  );
}
