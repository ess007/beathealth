import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6 animate-fade-in">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Greeting Skeleton */}
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-64 mb-6" />

        {/* HeartScore Card Skeleton */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>

        {/* Streak Card Skeleton */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-8 w-20" />
        </Card>

        {/* Ritual Progress Skeletons */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </Card>
          
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
};

export const FamilySkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6 animate-fade-in">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-64 mb-6" />
        
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const InsightsSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6 animate-fade-in">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-40" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-10 w-56 mb-6" />
        
        {/* Chart Skeletons */}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full" />
        </Card>
        
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    </div>
  );
};
