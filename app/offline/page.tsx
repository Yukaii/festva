'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">You are offline</h1>
      <p className="text-gray-600 text-center mb-6">
        Please check your internet connection and try again
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
      >
        Retry
      </button>
    </div>
  );
}
