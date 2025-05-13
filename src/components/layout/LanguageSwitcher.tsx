import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        className="flex items-center text-gray-500 hover:text-gray-700"
      >
        <Globe className="h-5 w-5" />
      </button>
      
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
        <div className="py-1">
          <button
            onClick={() => changeLanguage('tr')}
            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
              i18n.language === 'tr' ? 'bg-gray-50' : ''
            }`}
          >
            Türkçe
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
              i18n.language === 'en' ? 'bg-gray-50' : ''
            }`}
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;