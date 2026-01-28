import { auth } from "@/auth";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  try {
    const session = await auth();

    if (!session?.user || !session.user.email) {
      redirect("/login");
    }

    // Fetch user subscription status
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { subscription: true }
    });

    const isFree = user?.subscription === 'free';

    return (
      <div className="p-8 min-h-screen bg-slate-950/50">
        <DashboardOverview
          userName={session.user.name || "Travailleur"}
          isPro={!isFree}
        />
      </div>
    );
  } catch (error) {
    console.error("Dashboard Page Error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md w-full border border-red-200 shadow-sm">
          <p>Une erreur est survenue lors du chargement de la calculatrice.</p>
        </div>
      </div>
    );
  }
}
