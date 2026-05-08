import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-44 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/5" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl mt-2" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}
