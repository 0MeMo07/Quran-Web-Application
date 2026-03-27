import React, { forwardRef, memo } from 'react';

interface PageProps {
  children?: React.ReactNode;
  number: number;
  total: number;
  isLeft?: boolean;
  isMobile?: boolean;
}

export const FlipBookPage = memo(forwardRef<HTMLDivElement, PageProps>(
  (props, ref) => {
    return (
      <div 
        className={`bg-[#fdfbf7] flex flex-col h-full relative select-none overflow-hidden ${
          props.isMobile 
            ? 'border-none shadow-none' 
            : `border border-black/5 shadow-sm ${props.isLeft ? 'rounded-l-sm' : 'rounded-r-sm'}`
        }`} 
        ref={ref}
      >
        {/* Simple Page Content */}
        <div className="flex-1 relative z-10 flex flex-col h-full items-center justify-center">
          {props.children}
          <div className="text-[100px] font-serif text-black/5 select-none pointer-events-none">
            {props.number}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center text-[10px] font-medium text-black/20 tracking-widest uppercase z-20">
          <span>{props.number} / {props.total}</span>
        </div>
      </div>
    );
  }
));

FlipBookPage.displayName = 'FlipBookPage';
