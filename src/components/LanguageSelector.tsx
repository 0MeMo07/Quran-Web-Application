import Select from 'react-select';

interface Edition {
  englishName: string;
  name: string;
  [key: string]: unknown;
}

interface Language {
  name: string;
  editions: Edition[];
}

interface LanguageSelectorProps {
  languages: Language[];
  selectedEditions: Edition[];
  onEditionChange: (editions: Edition[]) => void;
}

export function LanguageSelector({ 
  languages, 
  selectedEditions, 
  onEditionChange 
}: LanguageSelectorProps) {
  const options = languages.map(lang => ({
    label: lang.name,
    options: lang.editions.map(edition => ({
      value: edition,
      label: `${edition.englishName} (${edition.name})`
    }))
  }));

  const value = selectedEditions.map(edition => ({
    value: edition,
    label: `${edition.englishName} (${edition.name})`
  }));

  return (
    <Select
      isMulti
      value={value}
      options={options}
      className="w-full"
      classNamePrefix="select"
      onChange={(selected) => {
        onEditionChange(selected ? selected.map(option => option.value) : []);
      }}
      placeholder="Select translations..."
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: '#059669',
          primary75: '#10b981',
          primary50: '#6ee7b7',
          primary25: '#d1fae5',
        },
      })}
    />
  );
}