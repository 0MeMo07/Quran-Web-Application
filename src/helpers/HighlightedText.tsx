
const globalStyles = `
  em {
    background-color: #D1FAE5;
    border-radius: 4px;
    padding: 2px 4px;
    font-weight: 500;
    color: #065F46;
    font-style: normal;
  }
`;

interface HighlightedTextProps {
  text: string;
}

export const HighlightedText = ({ text }: HighlightedTextProps) => {
  return (
    <>
      <style>{globalStyles}</style>
      <span dangerouslySetInnerHTML={{ __html: text }} />
    </>
  );
}; 