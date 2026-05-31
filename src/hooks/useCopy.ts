import { useState, useCallback } from 'react';

export function useCopy(ms = 2000) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
      setCopied(true);
      setTimeout(() => setCopied(false), ms);
    },
    [ms],
  );
  return { copied, copy };
}
