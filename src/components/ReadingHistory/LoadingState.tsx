import { Skeleton } from "@/components/ui/skeleton";

const LoadingState = () => {
  return (
    <div className="flex justify-center items-center py-8 sm:py-12 px-2">
      <div className="animate-pulse space-y-3 sm:space-y-4 w-full">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 sm:h-24 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
