import React, { FC, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode
}

const LayoutContainer: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-bl from-gray-300/10 via-blue-900/10 to-black" />

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