const EmptyState = () => {
  return (
    <div className="text-center py-8 sm:py-12 px-4">
      <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">No reading history yet.</p>
      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
        Your reading history will appear here once you start reading content.
      </p>
    </div>
  );
};

export default EmptyState;
