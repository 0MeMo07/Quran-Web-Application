import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BookLayout } from '../components/BookLayout';
import { selectAllVerses, setBookCurrentSurahId } from '../store/slices/quranSlice';
import { AppDispatch } from '../store/store';

export function SurahPage() {
  const { surahId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const allVerses = useSelector(selectAllVerses);

  useEffect(() => {
    if (surahId) {
      dispatch(setBookCurrentSurahId(Number(surahId)));
    }
  }, [surahId, dispatch]);

  return <BookLayout verses={allVerses} />;
} 