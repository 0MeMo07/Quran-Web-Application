import React, { forwardRef, memo } from 'react';
import { cn } from '../../../ui/cn';

interface PageProps {
  children?: React.ReactNode;
  number: number;
  total: number;
  isLeft?: boolean;
  isMobile?: boolean;
  isSinglePage?: boolean;
  flippingMode?: '3d' | 'flat';
}

export const FlipBookPage = memo(forwardRef<HTMLDivElement, PageProps>(
  (props, ref) => {
    // Determine the border radius based on the layout mode
    let borderRadius = '0';
    if (!props.isMobile) {
      if (props.isSinglePage) {
        borderRadius = '6px'; // Uniform radius for single cards
      } else {
        borderRadius = props.isLeft ? '6px 0 0 6px' : '0 6px 6px 0';
      }
    } else if (props.isSinglePage) {
       // On mobile, maybe a small radius for single scroll mode?
       borderRadius = '3px';
    }

    return (
      <div 
        ref={ref}
        className={cn(
          "bg-[#fdfbf7] flex flex-col h-full relative select-none overflow-hidden transition-all",
          props.isMobile && !props.isSinglePage ? "border-none shadow-none" : "shadow-sm"
        )}
        style={{
          borderRadius,
          border: props.isMobile && !props.isSinglePage
            ? 'none' 
            : '1px solid rgba(80,55,20,0.12)'
        }}
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
