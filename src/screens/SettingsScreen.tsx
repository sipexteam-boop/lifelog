import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../utils/storage';
import { hashPin } from '../utils/crypto';
import { seedRealisticData } from '../utils/seeder';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import {
  Settings,
  Languages,
  Moon,
  Sun,
  Calendar,
  Lock,
  Download,
  Upload,
  Trash2,
  Database,
  Info,
  Check,
  Shield,
  Bell,
  RefreshCw,
  X,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, showToast, triggerRefresh, lockApp, t, isRtl } = useApp();

  // PIN Setup Modal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  // Clear data confirmation modal
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // File import ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle PIN Setup
  const handleSavePin = async () => {
    if (pinCode.length < 4) {
      setPinError('رمز عبور باید حداقل ۴ رقم باشد.');
      return;
    }
    if (pinCode !== pinConfirm) {
      setPinError('تکرار رمز عبور یکسان نیست.');
      return;
    }

    const hashed = await hashPin(pinCode);
    await updateSettings({
      enablePin: true,
      pinHash: hashed,
    });
    setIsPinModalOpen(false);
    setPinCode('');
    setPinConfirm('');
    setPinError('');
    showToast('رمز عبور امنیتی با موفقیت فعال شد.');
  };

  const handleDisablePin = async () => {
    if (confirm('آیا مایل به غیرفعال‌سازی قفل برنامه هستید؟')) {
      await updateSettings({
        enablePin: false,
        pinHash: undefined,
      });
      showToast('قفل برنامه غیرفعال شد.');
    }
  };

  // Export Data JSON
  const handleExportData = async () => {
    try {
      const json = await db.exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifelog_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('فایل پشتیبان با موفقیت دانلود شد.');
    } catch (err) {
      console.error(err);
      showToast('خطا در صدور فایل پشتیبان');
    }
  };

  // Import Data JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const res = await db.importAllData(content);
        if (res.success) {
          triggerRefresh();
          showToast('اطلاعات با موفقیت از فایل پشتیبان بازگردانی شد.');
        } else {
          showToast(`خطا: ${res.error}`);
        }
      } catch (err) {
        showToast('فایل پشتیبان معتبر نیست.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Clear All Data
  const handleConfirmClear = async () => {
    await db.clearAllData();
    setIsClearModalOpen(false);
    triggerRefresh();
    showToast('کلیه داده‌های محلی پاکسازی شدند.');
  };

  // Seed Demo Data
  const handleSeedData = async () => {
    await seedRealisticData();
    triggerRefresh();
    showToast(t.seedSuccess);
  };

  // Test Server Connection
  const [showFlutterGuide, setShowFlutterGuide] = useState(false);

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#91A8FF]/20 to-[#7C5CFC]/20 text-[#91A8FF] flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{t.settings}</h2>
          <span className="text-xs text-slate-400">پیکربندی هویت، زبان، امنیت و داده‌ها</span>
        </div>
      </div>

      {/* User Name input card */}
      <GlassCard className="p-4">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          نام کاربری نمایش داده شده در داشبورد
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={settings.userName}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            placeholder="نام شما..."
            className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs text-white"
          />
        </div>
      </GlassCard>

      {/* Appearance & Localization */}
      <GlassCard className="p-4 sm:p-5 space-y-4">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
          <Languages className="w-4 h-4 text-[#91A8FF]" />
          <span>زبان و تقویم</span>
        </h3>

        {/* Language Switch */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-200">{t.language}</p>
            <span className="text-[11px] text-slate-400">جهت چینش و نگارش متون</span>
          </div>
          <div className="flex p-1 rounded-xl glass-panel text-xs border border-white/10">
            <button
              onClick={() => updateSettings({ language: 'fa' })}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                settings.language === 'fa' ? 'bg-[#91A8FF] text-slate-950' : 'text-slate-400'
              }`}
            >
              فارسی (RTL)
            </button>
            <button
              onClick={() => updateSettings({ language: 'en' })}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                settings.language === 'en' ? 'bg-[#91A8FF] text-slate-950' : 'text-slate-400'
              }`}
            >
              English (LTR)
            </button>
          </div>
        </div>

        {/* Calendar System */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            <p className="text-xs font-bold text-slate-200">{t.calendarSystem}</p>
            <span className="text-[11px] text-slate-400">محاسبه دقیق جهش‌ها و ماه‌ها</span>
          </div>
          <div className="flex p-1 rounded-xl glass-panel text-xs border border-white/10">
            <button
              onClick={() => updateSettings({ calendarSystem: 'jalali' })}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                settings.calendarSystem === 'jalali' ? 'bg-[#91A8FF] text-slate-950' : 'text-slate-400'
              }`}
            >
              جلالی (شمسی)
            </button>
            <button
              onClick={() => updateSettings({ calendarSystem: 'gregorian' })}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                settings.calendarSystem === 'gregorian' ? 'bg-[#91A8FF] text-slate-950' : 'text-slate-400'
              }`}
            >
              میلادی
            </button>
          </div>
        </div>

        {/* Theme Mode */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            <p className="text-xs font-bold text-slate-200">{t.theme}</p>
            <span className="text-[11px] text-slate-400">تاریک شیشه‌ای یا روشن مدرن</span>
          </div>
          <div className="flex p-1 rounded-xl glass-panel text-xs border border-white/10">
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                settings.theme === 'dark' ? 'bg-[#91A8FF] text-slate-950' : 'text-slate-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>تاریک</span>
            </button>
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                settings.theme === 'light' ? 'bg-[#91A8FF] text-slate-950' : 'text-slate-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>روشن</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Security & Passcode PIN */}
      <GlassCard className="p-4 sm:p-5 space-y-3.5">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
          <Shield className="w-4 h-4 text-[#35D6A0]" />
          <span>امنیت و قفل برنامه (PIN)</span>
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-200">{t.securityPin}</p>
            <span className="text-[11px] text-slate-400">
              رمزگذاری محلی SHA-256 در مرورگر و حفاظت از ژورنال
            </span>
          </div>

          {settings.enablePin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#35D6A0] font-bold">فعال</span>
              <button
                onClick={handleDisablePin}
                className="px-2.5 py-1 rounded-lg bg-[#FF6B82]/20 text-[#FF6B82] text-xs font-semibold cursor-pointer"
              >
                غیرفعال‌سازی
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#91A8FF] text-slate-950 font-bold text-xs cursor-pointer hover:brightness-110"
            >
              تنظیم رمز
            </button>
          )}
        </div>
      </GlassCard>

      {/* Backup & Persistence */}
      <GlassCard className="p-4 sm:p-5 space-y-3.5">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
          <Database className="w-4 h-4 text-[#FFBD69]" />
          <span>پایگاه داده، پشتیبان‌گیری و بازگردانی</span>
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed">
          کلیه اطلاعات در پایگاه داده محلی IndexedDB روی گوشی شما ذخیره شده و با آفلاین بودن هیچ وابستگی خارجی ندارد.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportData}
            className="p-3 rounded-xl glass-panel border border-[#91A8FF]/30 text-white hover:bg-[#91A8FF]/10 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#91A8FF]" />
            <span>دانلود فایل JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl glass-panel border border-white/10 text-slate-200 hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#35D6A0]" />
            <span>بارگذاری فایل پشتیبان</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Demo Data Seeder Button */}
        <div className="pt-2">
          <button
            onClick={handleSeedData}
            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#91A8FF]/30 text-xs font-medium text-slate-300 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#91A8FF]" />
            <span>{t.seedDemoData} (۷ روز گذشته)</span>
          </button>
        </div>

        {/* Clear Data Button */}
        <div className="pt-1">
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="w-full p-2.5 rounded-xl bg-[#FF6B82]/10 border border-[#FF6B82]/25 hover:bg-[#FF6B82]/20 text-xs font-bold text-[#FF6B82] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearAllData}</span>
          </button>
        </div>
      </GlassCard>

      {/* Native Android Flutter Architecture & Offline Guarantee */}
      <GlassCard className="p-4 sm:p-5 space-y-3.5 border border-[#91A8FF]/30">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#35D6A0]" />
            <span>نسخه نیتیو اندروید و حریم خصوصی ۱۰۰٪ آفلاین</span>
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#35D6A0]/15 text-[#35D6A0] font-mono">
            com.yasin.lifelog
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          اپلیکیشن نیتیو لایف‌لاگ با فریمورک <strong>Flutter</strong>، پایگاه‌داده محلی <strong>SQLite</strong> و احراز هویت بیومتریک پیاده‌سازی شده است. هیچ مجوزی برای اینترنت درخواست نشده و صفر بایت داده به بیرون ارسال نمی‌شود.
        </p>

        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>شناسه بسته اندروید:</span>
            <span className="font-mono text-[#91A8FF]">com.yasin.lifelog</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>موتور پایگاه‌داده:</span>
            <span className="font-mono text-[#35D6A0]">SQLite (lifelog_native.db)</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>مجوز اینترنت:</span>
            <span className="text-[#35D6A0] font-bold">ندارد (Strictly Offline)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setShowFlutterGuide(!showFlutterGuide)}
            className="flex-1 p-2.5 rounded-xl bg-[#91A8FF]/20 hover:bg-[#91A8FF]/30 text-xs font-bold text-[#91A8FF] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{showFlutterGuide ? 'بستن راهنمای ساخت APK' : 'راهنمای ساخت فایل APK فلاتر'}</span>
          </button>
        </div>

        {showFlutterGuide && (
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-[#91A8FF]/20 space-y-2.5 text-xs text-slate-300">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#35D6A0]" />
              پروژه فلاتر در دایرکتوری <code className="text-[#91A8FF]">/flutter_lifelog</code> آماده است.
            </p>
            <p className="text-[11px] text-slate-400">
              گردش‌کار خودکار گیت‌هاب اکشنز در فایل <code className="text-[#FFBD69]">.github/workflows/build_apk.yml</code> قرار دارد که با هر Push فایل <code>app-release.apk</code> را خودکار کامپایل و دانلود می‌کند.
            </p>
            <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-[#91A8FF] leading-relaxed">
              cd flutter_lifelog<br />
              flutter pub get<br />
              flutter build apk --release
            </div>
          </div>
        )}
      </GlassCard>

      {/* App Information */}
      <GlassCard className="p-4 text-center space-y-1">
        <p className="text-xs font-bold text-white">LifeLog Personal Operating System</p>
        <p className="text-[11px] text-slate-400">
          طراحی شده ویژه یاسین با دارک گلس‌مورفیسم، تقویم جلالی، SQLite و معماری نیتیو اندروید
        </p>
        <p className="text-[10px] text-slate-500 font-mono">Version 1.0.0 — Native Flutter Android + Web</p>
      </GlassCard>

      {/* PIN Code Setup Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-[#91A8FF]/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#91A8FF]" />
                <span>تعیین رمز عبور (PIN)</span>
              </h3>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">رمز عبور (۴ تا ۶ رقم)</label>
              <input
                type="password"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 rounded-xl glass-input text-center text-lg font-mono tracking-widest text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">تکرار رمز عبور</label>
              <input
                type="password"
                maxLength={6}
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 rounded-xl glass-input text-center text-lg font-mono tracking-widest text-white"
              />
            </div>

            {pinError && <p className="text-xs text-[#FF6B82] text-center">{pinError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <GlassButton variant="ghost" size="sm" onClick={() => setIsPinModalOpen(false)}>
                انصراف
              </GlassButton>
              <GlassButton variant="primary" size="sm" onClick={handleSavePin}>
                تأیید و ذخیره
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-[#FF6B82]/40 shadow-2xl space-y-4 text-center">
            <Trash2 className="w-12 h-12 text-[#FF6B82] mx-auto" />
            <h3 className="text-base font-bold text-white">پاکسازی پایگاه داده</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{t.clearConfirmText}</p>

            <div className="flex justify-center gap-3 pt-2">
              <GlassButton variant="ghost" size="sm" onClick={() => setIsClearModalOpen(false)}>
                انصراف
              </GlassButton>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-xl bg-[#FF6B82] text-white font-bold text-xs hover:brightness-110"
              >
                بله، تمام داده‌ها پاک شوند
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
