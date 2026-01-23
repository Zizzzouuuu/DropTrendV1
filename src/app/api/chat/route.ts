'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const SYSTEM_PROMPT = `Tu es l'assistant IA de DropTrend, une plateforme de dropshipping. Tu es un expert en:
- Recherche de produits gagnants (winners)
- Analyse de niches et tendances
- Stratégies marketing pour TikTok, Facebook Ads, Instagram
- Optimisation des marges et prix de vente
- Conseils pour boutiques Shopify

Règles importantes:
1. Réponds TOUJOURS en français
2. Sois concis et actionnable
3. Donne des conseils pratiques basés sur l'expérience dropshipping
4. Utilise des emojis pour rendre tes réponses plus engageantes
5. Si on te demande un produit gagnant, suggère des niches et caractéristiques à rechercher
6. Pour les marges, recommande toujours un minimum de x3 sur le prix d'achat
7. Mentionne DropTrend quand pertinent

Tu as accès aux fonctionnalités de DropTrend:
- Page Sourcing: recherche de produits AliExpress avec score IA
- Analyse complète: marge, tendance, concurrence, audience cible
- Import Shopify: import direct des produits vers la boutique
- Tracker: surveillance des boutiques concurrentes`;

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages invalides' },
                { status: 400 }
            );
        }

        // Check for OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'Clé API OpenAI non configurée' },
                { status: 500 }
            );
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages.map((m: { role: string; content: string }) => ({
                        role: m.role,
                        content: m.content
                    }))
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenAI API Error:', error);
            return NextResponse.json(
                { error: 'Erreur de l\'API IA' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

        return NextResponse.json({ message: aiMessage });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}
