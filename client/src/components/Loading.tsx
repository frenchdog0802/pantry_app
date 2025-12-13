import React from 'react';
interface LoadingProps {
  fullScreen?: boolean;
}
export function Loading({
  fullScreen = false
}: LoadingProps) {
  const loadingContent = <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>;
  if (fullScreen) {
    return <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {loadingContent}
      </div>;
  }
  return loadingContent;
}