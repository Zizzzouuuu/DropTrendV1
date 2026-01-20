import { auth } from "@/auth";
import { db } from "@/lib/db";
import DashboardClient, { UIProduct } from "./DashboardClient";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";

export default async function DashboardPage() {
  try {
    const session = await auth();

    if (!session?.user || !session.user.email) {
      redirect("/login");
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { savedProducts: true }
    });

    if (!user) {
      redirect("/login");
    }

    const savedProductIds = new Set(user.savedProducts.map(sp => sp.productId));

    const isFree = user.subscription === 'free';
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: isFree ? 3 : undefined
    });

    const formattedProducts: UIProduct[] = products.map(p => {
      let marketing: any = {};
      try {
        if (p.marketing && (p.marketing.trim().startsWith('{') || p.marketing.trim().startsWith('['))) {
          marketing = JSON.parse(p.marketing);
        } else {
          marketing = { platform: "N/A", text: p.marketing || "" };
        }
      } catch (e) {
        marketing = { platform: "N/A", text: p.marketing || "" };
      }

      const competition = p.status === "Winner" ? "Faible" : "Moyenne";

      return {
        id: p.id,
        name: p.name,
        niche: p.niche,
        buyPrice: p.cost,
        sellPrice: p.price,
        margin: p.margin,
        competition: competition,
        platform: marketing.platform || "N/A",
        supplier: p.supplier,
        analysis: p.description,
        image: p.image,
        status: p.status
      };
    });

    return (
      <DashboardClient
        products={formattedProducts}
        userSubscription={user.subscription || "free"}
        savedProductIds={Array.from(savedProductIds)}
      />
    );
  } catch (error) {
    console.error("Dashboard Page Error:", error);

    // Using simple anchor tag to avoid server component event handler issues
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md w-full border border-red-200 shadow-sm">
          <h2 className="text-lg font-bold mb-2">Erreur de chargement</h2>
          <p className="text-sm mb-4">Impossible d'afficher le tableau de bord.</p>
          <pre className="text-xs text-left bg-white p-2 rounded border border-red-100 overflow-auto max-h-40">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
        <Link
          href="/login"
          className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors inline-block"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }
}
