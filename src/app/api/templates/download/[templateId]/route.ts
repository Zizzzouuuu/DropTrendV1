import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { SHOPIFY_TEMPLATES } from '@/lib/template-data';
import { getTemplatePreviewHtml } from '@/lib/template-utils';

interface Props {
    params: Promise<{ templateId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
    const { templateId } = await params;

    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const template = SHOPIFY_TEMPLATES.find(t => t.id === templateId);

    if (!template) {
        return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 });
    }

    // Check PRO access
    if (template.isPro && user.subscription !== 'pro') {
        return NextResponse.json({ error: 'Abonnement Pro requis' }, { status: 403 });
    }

    // Generate the template HTML
    const html = getTemplatePreviewHtml(template);

    // Return as downloadable HTML file
    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="${template.id}-theme.html"`
        }
    });
}
