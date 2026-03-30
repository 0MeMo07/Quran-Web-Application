import React, { forwardRef, memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { cn } from '../../../ui/cn';
import type { MushafPageItem, MushafPageLayout, MushafVerseItem } from '../hooks/mushafPagination';
import type { ViewType } from '../../../../store/slices/uiSlice';
import { selectSearchLanguage } from '../../../../store/slices/searchSlice';

interface PageProps {
  children?: React.ReactNode;
  number: number;
  total: number;
  isLeft?: boolean;
  isMobile?: boolean;
  isSinglePage?: boolean;
  flippingMode?: '3d' | 'flat';
  viewType?: ViewType;
  coverKind?: 'front' | 'back' | null;
  pageLayout?: MushafPageLayout;
}

function renderPageItem(
  item: MushafPageItem,
  pageLayout: MushafPageLayout,
  language: string,
  onOpenFootnotePopup: (item: MushafVerseItem) => void,
) {
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
  const hasFootnotes = item.footnotes.length > 0;
  const showFootnotesLabel = language === 'tr' ? 'Dipnotları göster' : 'Show footnotes';

  const preventPageTurn = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      style={{
        position: 'relative',
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

      {hasTranslation && hasFootnotes && (
        <button
          type="button"
          onPointerDown={preventPageTurn}
          onClick={(event) => {
            preventPageTurn(event);
            onOpenFootnotePopup(item);
          }}
          className="absolute left-0 top-full -mt-1 inline-flex items-center gap-1.5 px-1 py-0.5 rounded text-[10px] font-semibold text-emerald-700/80 hover:text-emerald-700 bg-[#fffdfa]/90"
          aria-label={showFootnotesLabel}
        >
          <span>{showFootnotesLabel}</span>
          <span className="text-emerald-700/50">({item.footnotes.length})</span>
        </button>
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
            ? 'bg-[linear-gradient(145deg,rgba(var(--color-primary),0.85)_0%,rgba(var(--color-primary),0.7)_45%,rgba(var(--color-primary),0.9)_100%)]'
            : 'bg-[linear-gradient(145deg,rgba(var(--color-primary),0.9)_0%,rgba(var(--color-primary),0.65)_50%,rgba(var(--color-primary),0.85)_100%)]',
        )}
      />

      <div className="absolute inset-[14px] border border-primary-foreground/45 rounded-[6px]" />
      <div className="absolute inset-[24px] border border-primary-foreground/25 rounded-[4px]" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center text-primary-foreground">
        {isFront ? (
          <>
            <p className="text-[10px] uppercase tracking-[0.32em] text-primary-foreground/80">Mushaf</p>
            <h2
              className="mt-5 font-serif text-[58px] leading-[1.05] text-primary-foreground"
              dir="rtl"
              style={{ fontFamily: 'Scheherazade New, Noto Naskh Arabic, serif' }}
            >
              Quran
            </h2>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full border border-primary-foreground/45 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-primary-foreground/45" />
            </div>
            <p className="mt-8 text-[10px] uppercase tracking-[0.28em] text-primary-foreground/70">Back Cover</p>
            <p className="mt-3 text-sm text-primary-foreground/85">Elhamdulillah</p>
          </>
        )}
      </div>
    </div>
  );
}

function renderVerseLoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-10">
      <div className="w-full max-w-[75%] space-y-3">
        <div className="h-2.5 rounded-full bg-primary/20 animate-pulse" />
        <div className="h-2.5 rounded-full bg-primary/15 animate-pulse" />
        <div className="h-2.5 w-[84%] ml-auto rounded-full bg-primary/20 animate-pulse" />
        <div className="h-2.5 w-[68%] ml-auto rounded-full bg-primary/15 animate-pulse" />
      </div>
    </div>
  );
}

function renderArabicOpeningFrame(content: React.ReactNode, isMobile: boolean) {
  const frameInsetOuter = isMobile ? 8 : 10;
  const frameInsetMid = isMobile ? 14 : 18;
  const panelInset = isMobile ? 24 : 30;
  const contentPadding = isMobile ? 12 : 14;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#f5efdf]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.08)_100%)]" />

      <div
        className="absolute border rounded-[8px] border-[#cdbd9a]/70"
        style={{
          top: frameInsetOuter,
          left: frameInsetOuter,
          right: frameInsetOuter,
          bottom: frameInsetOuter,
        }}
      />
      <div
        className="absolute border rounded-[7px] border-[#dfd2b4]/85"
        style={{
          top: frameInsetMid,
          left: frameInsetMid,
          right: frameInsetMid,
          bottom: frameInsetMid,
        }}
      />

      <div
        className="absolute border rounded-[7px] border-[#c8b48a]/65 overflow-hidden bg-[#fcfaf3]"
        style={{
          top: panelInset,
          left: panelInset,
          right: panelInset,
          bottom: panelInset,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.14)_100%)]" />
        <div className="absolute inset-x-4 top-3 h-px bg-[#c7b48a]/70" />
        <div className="absolute inset-x-4 bottom-3 h-px bg-[#c7b48a]/70" />

        <div
          className="absolute overflow-hidden"
          style={{
            top: contentPadding,
            left: contentPadding,
            right: contentPadding,
            bottom: contentPadding,
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

export const FlipBookPage = memo(forwardRef<HTMLDivElement, PageProps>(
  (props, ref) => {
    const language = useSelector(selectSearchLanguage);
    const [popupItem, setPopupItem] = useState<MushafVerseItem | null>(null);

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
    const isArabicOpeningPage = !isCoverPage && props.viewType === 'kuran' && (props.number === 1 || props.number === 2);
    const hasPageContent = Boolean(pageLayout && pageLayout.items.length > 0);
    const isVerseLoading = !isCoverPage && !pageLayout;
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
    const openingInterItemGap = isArabicOpeningPage
      ? Math.max(10, Math.min(interItemGap, props.isMobile ? 16 : 22))
      : interItemGap;
    const closeLabel = language === 'tr' ? 'Kapat' : 'Close';
    const footnotesTitleLabel = language === 'tr' ? 'Dipnotlar' : 'Footnotes';

    const handleOpenFootnotePopup = (item: MushafVerseItem) => {
      if (item.footnotes.length === 0) {
        return;
      }
      setPopupItem(item);
    };

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
          ) : isArabicOpeningPage && hasPageContent ? (
            renderArabicOpeningFrame(
              <div className="w-full h-full overflow-hidden flex flex-col justify-center">
                {pageLayout!.items.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: index < pageLayout!.items.length - 1 ? openingInterItemGap : 0,
                    }}
                  >
                    {renderPageItem(item, pageLayout!, language, handleOpenFootnotePopup)}
                  </div>
                ))}
              </div>,
              Boolean(props.isMobile),
            )
          ) : isVerseLoading ? (
            renderVerseLoadingState()
          ) : hasPageContent ? (
            <div className="absolute overflow-hidden flex flex-col" style={safeAreaStyle}>
              {pageLayout!.items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    marginBottom: index < pageLayout!.items.length - 1 ? interItemGap : 0,
                  }}
                >
                  {renderPageItem(item, pageLayout!, language, handleOpenFootnotePopup)}
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

          {popupItem && (
            <div
              className="absolute inset-0 z-30"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/35"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  setPopupItem(null);
                }}
                aria-label={closeLabel}
              />

              <div
                className="absolute left-1/2 top-1/2 w-[88%] max-h-[72%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-emerald-700/25 bg-[#fffdfa] shadow-2xl overflow-hidden"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="h-10 px-3 flex items-center justify-between border-b border-emerald-700/15">
                  <span className="text-[11px] font-semibold text-emerald-800/80">
                    {footnotesTitleLabel} [{popupItem.verseNumber}]
                  </span>
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setPopupItem(null);
                    }}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-emerald-800/60 hover:text-emerald-900 hover:bg-emerald-700/10"
                    aria-label={closeLabel}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 max-h-[calc(72vh-44px)] overflow-y-auto space-y-2">
                  {popupItem.footnotes.map((footnote) => (
                    <p
                      key={footnote.id}
                      className="m-0 text-[11px] text-emerald-900/75 italic"
                      style={{ lineHeight: '1.45' }}
                    >
                      <span className="font-semibold text-emerald-700/90">[{footnote.number}]</span>{' '}
                      {footnote.text}
                    </p>
                  ))}
                </div>
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
