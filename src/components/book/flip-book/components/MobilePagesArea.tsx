import React from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import HTMLPageFlip from 'react-pageflip';
import { FlipBookPage } from './FlipBookPage';
import { LOGICAL_PAGE_HEIGHT, LOGICAL_PAGE_WIDTH } from '../hooks/useFlipBook';
import { cn } from '../../../ui/cn';
import { FlippingMode, ViewType } from '../../../store/slices/uiSlice';
import type { MushafPageLayout } from '../hooks/mushafPagination';

interface MobilePagesAreaProps {
  isSinglePageOverride: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  singlePageItemHeight: number;
  currentPage: number;
  pages: any[];
  onPage: (e: any) => void;
  singlePageViewportWidth: string;
  effectiveSinglePageScale: number;
  viewType: ViewType;
  pageLayoutsByNumber: Map<number, MushafPageLayout>;
  zoomLevel: number;
  viewportScale: number;
  dragMarginX: number;
  dragMarginY: number;
  bookRef: React.RefObject<any>;
  flippingMode: FlippingMode;
}

export const MobilePagesArea = React.memo(function MobilePagesArea({
  isSinglePageOverride,
  scrollContainerRef,
  singlePageItemHeight,
  currentPage,
  pages,
  onPage,
  singlePageViewportWidth,
  effectiveSinglePageScale,
  viewType,
  pageLayoutsByNumber,
  zoomLevel,
  viewportScale,
  dragMarginX,
  dragMarginY,
  bookRef,
  flippingMode,
}: MobilePagesAreaProps) {
  const lastActivePageRef = React.useRef(currentPage);
  const scrollTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    lastActivePageRef.current = currentPage;
  }, [currentPage]);

  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "flex-1 relative overflow-hidden overscroll-none bg-background flex items-center justify-center",
        isSinglePageOverride && "pt-[calc(env(safe-area-inset-top)+56px)]",
      )}
    >
      {isSinglePageOverride ? (
        <div
          ref={scrollContainerRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            if (scrollTimeoutRef.current !== null) return;

            scrollTimeoutRef.current = window.setTimeout(() => {
              scrollTimeoutRef.current = null;
              const idx = Math.round(el.scrollTop / singlePageItemHeight);
              if (idx !== lastActivePageRef.current && idx >= 0 && idx < pages.length) {
                lastActivePageRef.current = idx;
                onPage({ data: idx });
              }
            }, 60);
          }}
          className="h-full w-full overflow-y-auto overflow-x-auto flex flex-col overscroll-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-center"
        >
          {pages.map((p, index) => {
            const isVisible = Math.abs(index - currentPage) <= 3;
            
            return (
              <div
                key={index}
                id={`quran-page-${index}`}
                data-page-index={index}
                className="relative flex-shrink-0 overflow-hidden"
                style={{ width: singlePageViewportWidth, height: singlePageItemHeight }}
              >
                {isVisible ? (
                  <div
                    className="absolute left-1/2 top-0 origin-top"
                    style={{
                      width: LOGICAL_PAGE_WIDTH,
                      height: LOGICAL_PAGE_HEIGHT,
                      transform: `translateX(-50%) scale(${effectiveSinglePageScale})`,
                    }}
                  >
                    <FlipBookPage 
                      number={p.number} 
                      total={pages.length} 
                      isLeft={p.isLeft} 
                      isMobile={true}
                      isSinglePage={true}
                      viewType={viewType}
                      coverKind={p.coverKind}
                      pageLayout={pageLayoutsByNumber.get(p.quranPageNumber)}
                    >
                      {null}
                    </FlipBookPage>
                  </div>
                ) : (
                  <div
                    className="absolute left-1/2 top-0 origin-top bg-[#fdfbf7] border-b border-black/[0.03]"
                    style={{
                      width: LOGICAL_PAGE_WIDTH,
                      height: LOGICAL_PAGE_HEIGHT,
                      transform: `translateX(-50%) scale(${effectiveSinglePageScale})`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <motion.div
          drag={zoomLevel > 1}
          dragConstraints={{
            left: -dragMarginX,
            right: dragMarginX,
            top: -dragMarginY,
            bottom: dragMarginY,
          }}
          dragElastic={0.05}
          dragMomentum={true}
          dragTransition={{ power: 0.1, timeConstant: 200 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: viewportScale * zoomLevel,
            x: zoomLevel <= 1.01
              ? (currentPage === 0 ? -LOGICAL_PAGE_WIDTH / 2 : (currentPage === pages.length - 1 ? LOGICAL_PAGE_WIDTH / 2 : 0))
              : undefined,
            y: zoomLevel <= 1.01 ? 0 : undefined,
          }}
          transition={{ type: 'spring', damping: 35, stiffness: 80 }}
          className={cn(
            'relative flex items-center justify-center origin-center will-change-transform',
            zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
          )}
          style={{ backfaceVisibility: 'hidden', touchAction: 'none' }}
        >
          <div className="absolute left-1/2 top-0 bottom-0 w-[4px] z-0 -translate-x-1/2 pointer-events-none bg-gradient-to-r from-black/20 via-black/5 to-black/20 opacity-60" />
          <HTMLPageFlip
            key={`double-mobile-${flippingMode}`}
            ref={bookRef}
            width={LOGICAL_PAGE_WIDTH}
            height={LOGICAL_PAGE_HEIGHT}
            size="fixed"
            minWidth={300}
            maxWidth={3000}
            minHeight={400}
            maxHeight={3000}
            maxShadowOpacity={flippingMode === '3d' ? 0.2 : 0}
            showCover={true}
            mobileScrollSupport={true}
            usePortrait={false}
            flippingTime={flippingMode === '3d' ? 800 : 400}
            startPage={currentPage}
            drawShadow={flippingMode === '3d'}
            startZIndex={1}
            autoSize={false}
            clickEventForward={true}
            useMouseEvents={zoomLevel <= 1.01}
            swipeDistance={zoomLevel <= 1.01 ? 30 : 0}
            showPageCorners={false}
            disableFlipByClick={true}
            onFlip={onPage}
            className="quran-flipbook"
            style={{
              backgroundColor: 'transparent',
              pointerEvents: zoomLevel > 1.01 ? 'none' : 'auto',
            }}
          >
            {pages.map((p, idx) => {
              const isVisible = Math.abs(idx - currentPage) <= 8;

              return (
                <div 
                  key={p.key ?? p.number} 
                  className="page-wrapper" 
                  data-density={flippingMode === 'flat' ? 'hard' : 'soft'} 
                  style={{ 
                    width: LOGICAL_PAGE_WIDTH, 
                    height: LOGICAL_PAGE_HEIGHT,
                    borderRadius: p.isLeft ? '6px 0 0 6px' : '0 6px 6px 0',
                    overflow: 'hidden',
                    pointerEvents: 'auto',
                    cursor: zoomLevel <= 1.01 ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (zoomLevel > 1.01) return;
                    if (p.isLeft) bookRef.current?.pageFlip()?.flipPrev();
                    else bookRef.current?.pageFlip()?.flipNext();
                  }}
                >
                  {isVisible ? (
                    <FlipBookPage 
                      number={p.number} 
                      total={pages.length} 
                      isLeft={p.isLeft} 
                      isMobile={false}
                      isSinglePage={false}
                      flippingMode={flippingMode}
                      viewType={viewType}
                      coverKind={p.coverKind}
                      pageLayout={pageLayoutsByNumber.get(p.quranPageNumber)}
                    >
                      {null}
                    </FlipBookPage>
                  ) : (
                    <div className="w-full h-full bg-card flex items-center justify-center border border-border/5 opacity-40">
                      <span className="text-black/10 font-serif text-xl">{p.number}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </HTMLPageFlip>
        </motion.div>
      )}
    </div>
  );
});
