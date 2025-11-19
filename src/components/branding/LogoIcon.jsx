import React from 'react';
import clsx from 'clsx';

export default function LogoIcon({ className }) {
  return (
    <svg
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('text-purple-500', className)}
    >
      <rect width="128" height="128" fill="none" />
      {/* Play triangle */}
      <path
        d="M12 24c0-5 5.4-8 9.7-5.4l64 40c4.3 2.7 4.3 8.9 0 11.6l-64 40C17.4 112 12 109 12 104.1V24Z"
        fill="currentColor"
      />
      {/* Stylised head */}
      <path
        d="M76 32c16 0 28 12.9 28 28.8 0 8.3-3.5 15.3-9.8 21.4-5.2 5.1-8.2 11.6-8.7 18.6-.3 3.8-3.4 7.2-7.2 7.2H60c-3.5 0-6-3-6.5-6.4-.8-5.3-2.8-7.7-7.5-11.5C36 84.2 32 78.2 32 66.8c0-18.3 18.6-34.8 44-34.8Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Circuit nodes */}
      <circle cx="92" cy="34" r="6" fill="currentColor" opacity="0.8" />
      <circle cx="106" cy="48" r="4.5" fill="currentColor" opacity="0.75" />
      <circle cx="96" cy="92" r="5.5" fill="currentColor" opacity="0.75" />
      <path
        d="M96 34v18M106 48l-10 44"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

