import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
}

export default function Logo({ size = 40, color = '#2563eb' }: LogoProps) {
  return (
    <div className="group">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform duration-300 group-hover:scale-110"
      >
        <circle cx="50" cy="50" r="45" fill={color} className="transition-all duration-300 group-hover:brightness-110" />
        
        {/* Binoculars */}
        <g className="transform origin-center transition-transform duration-300 group-hover:rotate-[-5deg]">
          {/* Left lens */}
          <circle cx="35" cy="50" r="12" fill="white" />
          <circle cx="35" cy="50" r="8" fill="#111827" />
          {/* Right lens */}
          <circle cx="65" cy="50" r="12" fill="white" />
          <circle cx="65" cy="50" r="8" fill="#111827" />
          {/* Bridge */}
          <rect x="47" y="45" width="6" height="10" fill="white" />
          {/* Top bar */}
          <path d="M30 42 C30 42 50 42 70 42" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Letter G */}
        <text
          x="50"
          y="80"
          fontFamily="Arial, sans-serif"
          fontSize="20"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          className="transition-opacity duration-300 group-hover:opacity-90"
        >
          G
        </text>
      </svg>
    </div>
  );
} 