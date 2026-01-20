import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
    return (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-12 w-40 rounded-lg" />
            </header>

            {/* Filters Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="md:col-span-2 h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-5 space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <div className="grid grid-cols-2 gap-3">
                                <Skeleton className="h-16 rounded-lg" />
                                <Skeleton className="h-16 rounded-lg" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-10 flex-1 rounded-lg" />
                                <Skeleton className="h-10 w-12 rounded-lg" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
