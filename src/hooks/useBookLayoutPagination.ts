import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { type NavigateFunction } from 'react-router-dom';

interface UseBookLayoutPaginationParams {
  currentPage: number;
  minPage: number;
  totalPages: number;
  surahId?: string;
  currentSurahId: number | null;
  navigate: NavigateFunction;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setInputPage: Dispatch<SetStateAction<string>>;
}

export function useBookLayoutPagination({
  currentPage,
  minPage,
  totalPages,
  surahId,
  currentSurahId,
  navigate,
  setCurrentPage,
  setInputPage,
}: UseBookLayoutPaginationParams) {
  const navigateToPage = useCallback(
    (nextPage: number) => {
      if (nextPage < minPage || nextPage > totalPages) {
        return;
      }

      setCurrentPage(nextPage);
      setInputPage(nextPage.toString());
      window.scrollTo(0, 0);

      const targetSurahId = currentSurahId ?? (surahId ? Number(surahId) : null);
      if (targetSurahId) {
        navigate(`/surah/${targetSurahId}/page/${nextPage}`, { replace: true });
      }
    },
    [currentSurahId, minPage, navigate, setCurrentPage, setInputPage, surahId, totalPages]
  );

  const handleNextPage = useCallback(() => {
    navigateToPage(currentPage + 1);
  }, [currentPage, navigateToPage]);

  const handlePreviousPage = useCallback(() => {
    navigateToPage(currentPage - 1);
  }, [currentPage, navigateToPage]);

  const handlePageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputPage(value);
    },
    [setInputPage]
  );

  const commitPageInput = useCallback(
    (rawValue: string) => {
      const trimmedValue = rawValue.trim();
      if (!trimmedValue) {
        setInputPage(currentPage.toString());
        return;
      }

      const pageNumber = Number(trimmedValue);
      if (!Number.isNaN(pageNumber) && pageNumber >= minPage && pageNumber <= totalPages) {
        navigateToPage(pageNumber);
        return;
      }

      setInputPage(currentPage.toString());
    },
    [currentPage, minPage, navigateToPage, setInputPage, totalPages]
  );

  const handlePageBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      commitPageInput(e.target.value);
    },
    [commitPageInput]
  );

  const handlePageKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') {
        return;
      }

      e.preventDefault();
      commitPageInput(e.currentTarget.value);
    },
    [commitPageInput]
  );

  return {
    handleNextPage,
    handlePreviousPage,
    handlePageChange,
    handlePageBlur,
    handlePageKeyDown,
  };
}
