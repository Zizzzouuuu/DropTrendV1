import { auth } from "@/auth";
import ProfitCalculator from "@/components/dashboard/ProfitCalculator";
import { redirect } from "next/navigation";

export default async function CalculatorPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="p-8 min-h-screen bg-slate-950/50">
            <ProfitCalculator />
        </div>
    );
}
