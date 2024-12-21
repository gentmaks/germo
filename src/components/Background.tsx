import React, { FC, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode
}

const LayoutContainer: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-900/10 to-black" />

      {/* Ambient gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />

      {/* Content container with glass effect */}
      <div className="relative min-h-screen text-gray-100 backdrop-blur-sm">
        <div className="h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LayoutContainer;