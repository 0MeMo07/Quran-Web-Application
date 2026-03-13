import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { type NavigateFunction } from 'react-router-dom';

interface UseBookLayoutPaginationParams {
  currentPage: number;
  totalPages: number;
  surahId?: string;
  currentSurahId: number | null;
  navigate: NavigateFunction;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setInputPage: Dispatch<SetStateAction<string>>;
}

export function useBookLayoutPagination({
  currentPage,
  totalPages,
  surahId,
  currentSurahId,
  navigate,
  setCurrentPage,
  setInputPage,
}: UseBookLayoutPaginationParams) {
  const navigateToPage = useCallback(
    (nextPage: number) => {
      if (nextPage < 0 || nextPage > totalPages) {
        return;
      }

      setCurrentPage(nextPage);
      setInputPage(nextPage.toString());
      window.scrollTo(0, 0);

      const targetSurahId = surahId || currentSurahId;
      if (targetSurahId) {
        navigate(`/surah/${targetSurahId}/page/${nextPage}`, { replace: true });
      }
    },
    [currentSurahId, navigate, setCurrentPage, setInputPage, surahId, totalPages]
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

      const pageNumber = Number(value);
      if (!Number.isNaN(pageNumber) && pageNumber >= 0 && pageNumber <= totalPages) {
        navigateToPage(pageNumber);
      }
    },
    [navigateToPage, setInputPage, totalPages]
  );

  return {
    handleNextPage,
    handlePreviousPage,
    handlePageChange,
  };
}
