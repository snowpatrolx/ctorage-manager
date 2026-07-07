import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function PageHeader({ title, showBack = false, rightAction }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-stone-50/80 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="font-semibold text-lg text-stone-800" style={{ fontFamily: '"Noto Serif SC", serif' }}>
            {title}
          </h1>
        </div>
        <div>{rightAction}</div>
      </div>
    </header>
  );
}
