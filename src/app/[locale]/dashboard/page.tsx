import { auth } from "@/auth";
import ProfitCalculator from "@/components/dashboard/ProfitCalculator";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";

export default async function DashboardPage() {
  try {
    const session = await auth();

    if (!session?.user || !session.user.email) {
      redirect("/login");
    }

    return (
      <div className="p-8 min-h-screen bg-slate-950/50">
        <ProfitCalculator />
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
