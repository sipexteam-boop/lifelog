import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useApp();

  if (isOnline) return null;

  return (
    <aside aria-label="وضعیت اتصال اینترنت" className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 z-40 flex items-center gap-2.5 rounded-xl bg-amber-500/20 backdrop-blur-md border border-amber-500/40 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-xl animate-bounce">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>{t.offlineNotice}</span>
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ms-auto" />
    </aside>
  );
};
