import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingSkeleton = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300 relative overflow-hidden shiny-text">
          {t('form.loading')}
        </div>
      </div>

      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                ))}
              </div>
            </div>
            <div className="mt-4 h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton