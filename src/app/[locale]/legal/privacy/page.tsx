import React from 'react';
import { Card } from '@/components/ui/Card';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Politique de Confidentialité – DropTrend</h1>
      <Card className="p-8 border-slate-800 bg-slate-900/50 space-y-6 text-slate-300">
        <p className="text-sm text-slate-500">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
        
        <p>La présente Politique de Confidentialité décrit comment DropTrend collecte, utilise, stocke et protège les données personnelles de ses utilisateurs, conformément aux réglementations en vigueur, notamment le Règlement Général sur la Protection des Données (RGPD).</p>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">1. Responsable du traitement</h2>
            <p>DropTrend est responsable du traitement des données personnelles collectées via le site web DropTrend, les services associés et l’éventuelle extension navigateur.</p>
            <p className="mt-2">Pour toute question relative à la protection des données, vous pouvez nous contacter à : 📧 [email de contact]</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">2. Données collectées</h2>
            <p>Nous collectons uniquement les données strictement nécessaires au bon fonctionnement du service.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Données fournies par l'utilisateur :</strong> Adresse email, mot de passe (haché), informations liées au compte.</li>
                <li><strong>Données collectées automatiquement :</strong> Adresse IP, données de navigation anonymisées, logs techniques.</li>
                <li><strong>Données liées aux paiements :</strong> Traités par des prestataires tiers sécurisés (ex : Stripe). DropTrend ne stocke jamais les informations bancaires.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">3. Utilisation des données</h2>
            <p>Les données collectées sont utilisées pour fournir et améliorer les services, gérer les comptes, assurer la sécurité, et communiquer avec les utilisateurs. DropTrend ne revend jamais les données personnelles.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">4. Cookies et technologies similaires</h2>
            <p>DropTrend utilise des cookies pour assurer le bon fonctionnement du site, mémoriser les préférences et analyser l'audience de manière anonyme.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">5. Extension navigateur</h2>
            <p>Si une extension DropTrend est utilisée, elle fonctionne uniquement après connexion. Aucune donnée personnelle n’est collectée sans consentement. Aucune donnée n’est vendue à des fins publicitaires.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">6. Partage des données</h2>
            <p>Les données peuvent être partagées uniquement avec des prestataires techniques nécessaires (hébergement, paiement) ou les autorités si la loi l’exige.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">7. Sécurité des données</h2>
            <p>Mesures mises en œuvre : chiffrement, mots de passe hachés, accès restreint, surveillance.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">8. Durée de conservation</h2>
            <p>Les données sont conservées tant que le compte est actif ou selon les obligations légales. L'utilisateur peut demander la suppression à tout moment.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">9. Droits des utilisateurs</h2>
            <p>Conformément au RGPD, vous disposez des droits d'accès, rectification, suppression, limitation et portabilité.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-white mb-2">10. Contact</h2>
            <p>Pour toute question : 📧 [email de contact]</p>
        </section>
      </Card>
    </div>
  );
}
