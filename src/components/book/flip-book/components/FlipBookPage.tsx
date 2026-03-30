import React, { forwardRef, memo } from 'react';
import { cn } from '../../../ui/cn';
import type { MushafPageItem, MushafPageLayout } from '../hooks/mushafPagination';

interface PageProps {
  children?: React.ReactNode;
  number: number;
  total: number;
  isLeft?: boolean;
  isMobile?: boolean;
  isSinglePage?: boolean;
  flippingMode?: '3d' | 'flat';
  coverKind?: 'front' | 'back' | null;
  pageLayout?: MushafPageLayout;
}

function renderPageItem(item: MushafPageItem, pageLayout: MushafPageLayout) {
  const typography = pageLayout.typography;

  if (item.kind === 'surah-header') {
    const hasTitle = item.titleLines.length > 0;
    const hasSubtitle = item.subtitleLines.length > 0;
    const hasBasmala = item.basmalaLines.length > 0;

    return (
      <div
        style={{
          paddingTop: typography.headerPaddingYPx,
          paddingBottom: typography.headerPaddingYPx,
        }}
      >
        {hasTitle && (
          <p
            className="m-0 text-center text-black/85"
            style={{
              fontFamily: typography.headerFontFamily,
              fontWeight: 700,
              fontSize: typography.headerTitleFontSize,
              lineHeight: `${typography.headerTitleLineHeightPx}px`,
              whiteSpace: 'pre-wrap',
            }}
          >
            {item.titleLines.join('\n')}
          </p>
        )}

        {hasSubtitle && (
          <p
            className="m-0 text-center text-black/55"
            style={{
              marginTop: hasTitle ? typography.headerSectionGapPx : 0,
              fontFamily: typography.translationFontFamily,
              fontWeight: 600,
              fontSize: typography.headerSubtitleFontSize,
              lineHeight: `${typography.headerSubtitleLineHeightPx}px`,
              whiteSpace: 'pre-wrap',
            }}
          >
            {item.subtitleLines.join('\n')}
          </p>
        )}

        {hasBasmala && (
          <p
            className="m-0 text-right text-black/80"
            dir="rtl"
            style={{
              marginTop: hasTitle || hasSubtitle ? typography.headerSectionGapPx : 0,
              fontFamily: typography.arabicFontFamily,
              fontWeight: 600,
              fontSize: typography.basmalaFontSize,
              lineHeight: `${typography.basmalaLineHeightPx}px`,
              whiteSpace: 'pre-wrap',
            }}
          >
            {item.basmalaLines.join('\n')}
          </p>
        )}
      </div>
    );
  }

  const hasArabic = item.arabicLines.length > 0;
  const hasTranslation = item.translationLines.length > 0;

  return (
    <div
      style={{
        paddingTop: typography.versePaddingYPx,
        paddingBottom: typography.versePaddingYPx,
      }}
    >
      {hasArabic && (
        <p
          className="m-0 text-right text-black/90"
          dir="rtl"
          style={{
            fontFamily: typography.arabicFontFamily,
            fontWeight: 600,
            fontSize: typography.arabicFontSize,
            lineHeight: `${typography.arabicLineHeightPx}px`,
            whiteSpace: 'pre-wrap',
          }}
        >
          {item.arabicLines.join('\n')}
        </p>
      )}

      {hasTranslation && (
        <p
          className="m-0 text-black/80"
          style={{
            marginTop: hasArabic ? typography.sectionGapPx : 0,
            fontFamily: typography.translationFontFamily,
            fontWeight: 500,
            fontSize: typography.translationFontSize,
            lineHeight: `${typography.translationLineHeightPx}px`,
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
          }}
        >
          {item.translationLines.join('\n')}
        </p>
      )}
    </div>
  );
}

function renderCoverPage(kind: 'front' | 'back') {
  const isFront = kind === 'front';

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className={cn(
          'absolute inset-0',
          isFront
            ? 'bg-[linear-gradient(145deg,#0f3a2f_0%,#1a5a47_45%,#2f7a5f_100%)]'
            : 'bg-[linear-gradient(145deg,#173f35_0%,#24584a_50%,#2f6d59_100%)]',
        )}
      />

      <div className="absolute inset-[14px] border border-amber-100/35 rounded-[6px]" />
      <div className="absolute inset-[24px] border border-amber-100/20 rounded-[4px]" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center text-amber-50">
        {isFront ? (
          <>
            <p className="text-[10px] uppercase tracking-[0.32em] text-amber-100/75">Mushaf</p>
            <h2
              className="mt-5 font-serif text-[58px] leading-[1.05] text-amber-50"
              dir="rtl"
              style={{ fontFamily: 'Scheherazade New, Noto Naskh Arabic, serif' }}
            >
              Quran
            </h2>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full border border-amber-100/40 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-amber-100/40" />
            </div>
            <p className="mt-8 text-[10px] uppercase tracking-[0.28em] text-amber-100/65">Back Cover</p>
            <p className="mt-3 text-sm text-amber-100/75">Elhamdulillah</p>
          </>
        )}
      </div>
    </div>
  );
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

    const pageLayout = props.pageLayout;
    const isFrontCover = props.coverKind === 'front';
    const isBackCover = props.coverKind === 'back';
    const isCoverPage = isFrontCover || isBackCover;
    const hasPageContent = Boolean(pageLayout && pageLayout.items.length > 0);
    const safeAreaStyle: React.CSSProperties = pageLayout
      ? {
          top: pageLayout.safeArea.top,
          left: pageLayout.safeArea.left,
          width: pageLayout.safeArea.width,
          height: pageLayout.safeArea.height,
        }
      : {
          top: 24,
          left: 24,
          right: 24,
          bottom: 40,
        };
    const interItemGap = pageLayout?.renderGapPx ?? 10;

    return (
      <div 
        ref={ref}
        className={cn(
          "flex flex-col h-full relative select-none overflow-hidden transition-all",
          isCoverPage ? 'bg-[#173f35]' : 'bg-[#fdfbf7]',
          props.isMobile && !props.isSinglePage ? "border-none shadow-none" : "shadow-sm"
        )}
        style={{
          borderRadius,
          border: props.isMobile && !props.isSinglePage
            ? 'none' 
            : '1px solid rgba(80,55,20,0.12)'
        }}
      >
        <div className="flex-1 relative z-10 h-full">
          {isCoverPage ? (
            renderCoverPage(isFrontCover ? 'front' : 'back')
          ) : hasPageContent ? (
            <div className="absolute overflow-hidden flex flex-col" style={safeAreaStyle}>
              {pageLayout!.items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    marginBottom: index < pageLayout!.items.length - 1 ? interItemGap : 0,
                  }}
                >
                  {renderPageItem(item, pageLayout!)}
                </div>
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[100px] font-serif text-black/5 select-none pointer-events-none">
                {props.number}
              </div>
            </div>
          )}

          {props.children}
        </div>

        {!isCoverPage && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center text-[10px] font-medium text-black/20 tracking-widest uppercase z-20">
            <span>{props.number} / {props.total}</span>
          </div>
        )}
      </div>
    );
  }
));

FlipBookPage.displayName = 'FlipBookPage';
