import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { t, isRtl } = useApp();

  if (isInstalled || dismissed) return null;

  return (
    <>
      {isInstallable && (
        <div className="mx-4 my-2 p-3 rounded-2xl glass-panel border border-[#91A8FF]/30 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#91A8FF] to-[#7C5CFC] flex items-center justify-center text-slate-950 shrink-0 font-bold shadow-md">
              <Download className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{t.appName}</h4>
              <p className="text-xs text-slate-300 truncate">
                {isRtl ? 'نصب نسخه وب‌اپلیکیشن روی گوشی' : 'Install web app on your home screen'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={install}
              className="px-3 py-1.5 rounded-xl bg-[#91A8FF] text-slate-950 text-xs font-semibold hover:bg-white transition cursor-pointer shadow-sm"
            >
              {t.installApp}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              aria-label="بستن اعلان نصب"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isIOS && (
        <>
          <div className="mx-4 my-2 p-3 rounded-2xl glass-panel border border-[#91A8FF]/20 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#91A8FF] shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">
                  {isRtl ? 'نصب روی آیفون / آیپد' : 'Install on iPhone / iPad'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isRtl ? 'افزودن به صفحه اصلی Safari' : 'Add to Home Screen in Safari'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIOSGuide(true)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition cursor-pointer"
              >
                {isRtl ? 'راهنما' : 'Guide'}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="بستن اعلان نصب"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-2xl glass-panel p-6 border border-[#91A8FF]/30 shadow-2xl">
                <h3 className="text-base font-bold text-white mb-3">
                  {isRtl ? 'راهنمای نصب روی iOS' : 'Install on iPhone / iPad'}
                </h3>
                <ol className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#91A8FF]/20 text-[#91A8FF] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      ۱
                    </span>
                    <span>
                      {isRtl
                        ? 'در نوار پایین مرورگر سافاری روی دکمه اشتراک‌گذاری (Share) بزنید.'
                        : 'Tap the Share button in Safari toolbar.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#91A8FF]/20 text-[#91A8FF] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      ۲
                    </span>
                    <span>
                      {isRtl ? (
                        <>
                          اسکرول کرده و گزینه <strong>Add to Home Screen</strong> (افزودن به صفحه اصلی){' '}
                          <PlusSquare className="inline w-3.5 h-3.5 mx-1" /> را انتخاب کنید.
                        </>
                      ) : (
                        'Scroll down and tap Add to Home Screen.'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#91A8FF]/20 text-[#91A8FF] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      ۳
                    </span>
                    <span>
                      {isRtl
                        ? 'روی دکمه Add در بالای صفحه بزنید. آیکون برنامه در صفحه گوشی ظاهر می‌شود.'
                        : 'Tap Add. LifeLog will now appear on your home screen.'}
                    </span>
                  </li>
                </ol>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-[#91A8FF] text-slate-950 font-semibold text-sm hover:brightness-110 cursor-pointer"
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
