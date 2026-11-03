import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AppSettings, MainNavTab } from '../types';
import { db, DEFAULT_SETTINGS } from '../utils/storage';
import { translations, Language } from '../utils/translations';
import { seedRealisticData } from '../utils/seeder';

interface AppContextValue {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  activeTab: MainNavTab;
  setActiveTab: (tab: MainNavTab) => void;
  // Sub-views / modal triggers
  activeSubView: string | null;
  openSubView: (viewName: string) => void;
  closeSubView: () => void;
  // Lock state
  isLocked: boolean;
  unlockApp: () => void;
  lockApp: () => void;
  // Data refresh trigger
  dataVersion: number;
  triggerRefresh: () => void;
  // Translation helper
  t: typeof translations.fa;
  lang: Language;
  isRtl: boolean;
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Quick task modal state
  editingTaskId: string | null;
  openTaskModal: (taskId?: string | null) => void;
  closeTaskModal: () => void;
  isTaskModalOpen: boolean;
  // Daily review modal
  isDailyReviewOpen: boolean;
  openDailyReview: () => void;
  closeDailyReview: () => void;
  // Focus timer modal
  isFocusModalOpen: boolean;
  openFocusModal: () => void;
  closeFocusModal: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<MainNavTab>('today');
  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [dataVersion, setDataVersion] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isDailyReviewOpen, setIsDailyReviewOpen] = useState(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);

  const lang = settings.language;
  const isRtl = lang === 'fa';
  const t = translations[lang];

  const triggerRefresh = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  }, []);

  // Initialize DB and settings
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const loaded = await db.getSettings();
        if (!isMounted) return;
        setSettings(loaded);

        // Apply HTML document attributes
        document.documentElement.lang = loaded.language;
        document.documentElement.dir = loaded.language === 'fa' ? 'rtl' : 'ltr';
        if (loaded.theme === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
        }

        // Check if PIN lock is enabled
        if (loaded.enablePin && loaded.pinHash) {
          setIsLocked(true);
        }

        // Check if initial database has tasks, if totally empty, seed realistic initial data
        const tasks = await db.getTasks();
        if (tasks.length === 0) {
          await seedRealisticData();
          triggerRefresh();
        }
      } catch (err) {
        console.error('Failed to init app state:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [triggerRefresh]);

  // Sync settings updates
  const updateSettings = async (newValues: Partial<AppSettings>) => {
    const updated = { ...settings, ...newValues };
    setSettings(updated);
    await db.saveSettings(updated);

    // Apply HTML changes
    document.documentElement.lang = updated.language;
    document.documentElement.dir = updated.language === 'fa' ? 'rtl' : 'ltr';
    if (updated.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }

    triggerRefresh();
  };

  const openSubView = (viewName: string) => {
    setActiveSubView(viewName);
  };

  const closeSubView = () => {
    setActiveSubView(null);
  };

  const unlockApp = () => {
    setIsLocked(false);
  };

  const lockApp = () => {
    if (settings.enablePin && settings.pinHash) {
      setIsLocked(true);
    }
  };

  const openTaskModal = (taskId: string | null = null) => {
    setEditingTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setEditingTaskId(null);
    setIsTaskModalOpen(false);
  };

  const openDailyReview = () => setIsDailyReviewOpen(true);
  const closeDailyReview = () => setIsDailyReviewOpen(false);

  const openFocusModal = () => setIsFocusModalOpen(true);
  const closeFocusModal = () => setIsFocusModalOpen(false);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        activeTab,
        setActiveTab,
        activeSubView,
        openSubView,
        closeSubView,
        isLocked,
        unlockApp,
        lockApp,
        dataVersion,
        triggerRefresh,
        t,
        lang,
        isRtl,
        toastMessage,
        showToast,
        editingTaskId,
        openTaskModal,
        closeTaskModal,
        isTaskModalOpen,
        isDailyReviewOpen,
        openDailyReview,
        closeDailyReview,
        isFocusModalOpen,
        openFocusModal,
        closeFocusModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
