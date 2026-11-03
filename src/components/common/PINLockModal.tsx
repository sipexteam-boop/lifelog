import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { verifyPin } from '../../utils/crypto';
import { Lock, Delete, ShieldCheck } from 'lucide-react';
import { toPersianDigits } from '../../utils/calendar';

export const PINLockModal: React.FC = () => {
  const { isLocked, unlockApp, settings, t, isRtl } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isLocked) return null;

  const handleDigit = async (digit: string) => {
    if (pinInput.length >= 6 || isVerifying) return;
    const nextPin = pinInput + digit;
    setPinInput(nextPin);
    setErrorMsg('');

    // If matches expected length (4 or 6 digits)
    if (nextPin.length >= 4 && settings.pinHash) {
      setIsVerifying(true);
      const ok = await verifyPin(nextPin, settings.pinHash);
      if (ok) {
        unlockApp();
        setPinInput('');
      } else if (nextPin.length === 6) {
        setErrorMsg(t.incorrectPin);
        setPinInput('');
      }
      setIsVerifying(false);
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A12] p-4 select-none">
      <div className="w-full max-w-sm rounded-3xl glass-panel p-6 sm:p-8 flex flex-col items-center border border-[#91A8FF]/25 shadow-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#91A8FF]/20 to-[#7C5CFC]/20 border border-[#91A8FF]/30 flex items-center justify-center mb-4 text-[#91A8FF] shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">{t.appName}</h2>
        <p className="text-xs text-slate-400 mb-6 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#35D6A0]" />
          <span>{t.enterPin}</span>
        </p>

        {/* PIN Dots feedback */}
        <div className="flex items-center gap-3.5 mb-8">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < pinInput.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 border ${
                  isFilled
                    ? 'bg-[#91A8FF] border-[#91A8FF] shadow-[0_0_10px_#91A8FF]'
                    : 'bg-white/5 border-white/20'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs text-[#FF6B82] mb-4 font-medium animate-pulse">{errorMsg}</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(String(num))}
              className="h-14 rounded-2xl glass-panel border border-white/10 hover:border-[#91A8FF]/40 hover:bg-[#91A8FF]/10 text-xl font-semibold text-white transition active:scale-95 flex items-center justify-center font-mono cursor-pointer"
            >
              {isRtl ? toPersianDigits(num) : num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl glass-panel border border-white/10 hover:border-[#91A8FF]/40 hover:bg-[#91A8FF]/10 text-xl font-semibold text-white transition active:scale-95 flex items-center justify-center font-mono cursor-pointer"
          >
            {isRtl ? toPersianDigits(0) : '0'}
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl glass-panel border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition active:scale-95 flex items-center justify-center cursor-pointer"
            aria-label="پاک کردن رقم"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
