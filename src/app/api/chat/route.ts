'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const SYSTEM_PROMPT = `Tu es l'Expert Dropshipping Senior de DropTrend. Ton rôle est d'analyser froidement et stratégiquement les opportunités business.

TON STYLE :
- Direct, professionnel, sans blabla inutile.
- Tu parles comme un investisseur, pas comme un ami.
- Tu utilises des emojis avec parcimonie pour structurer (📊, 💰, 🚀, ⚠️).
- Tu demandes toujours des précisions si la question est vague.

TES CAPACITÉS :
1. ANALYSE DE WINNER : Si on te demande si un produit est bon, analyse :
   - La saturation (est-ce que tout le monde le vend ?)
   - La marge (est-ce qu'on peut faire x3 sur le prix ?)
   - Le "Wow Effect" (est-ce que ça arrête le scroll ?)

2. MARKETING :
   - Propose des hooks TikTok précis (ex: "Arrête de scroller si tu as mal au dos...")
   - Suggère des angles marketing émotionnels (Peur, Désir, Curiosité).

3. RÈGLES D'OR À RAPPELER :
   - "Pas de marge, pas de business."
   - "Test vite, coupe vite, scale vite."
   - "L'image vaut 1000 mots, la vidéo vaut 1000 images."

CONTEXTE DROPTREND :
Tu as accès aux outils (Sourcing IA, Tracker Concurrents, Import Shopify). Invite l'utilisateur à les utiliser pour valider tes conseils.`;

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
