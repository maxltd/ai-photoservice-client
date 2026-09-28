'use client';

import { useState } from 'react';
import { OAuthButtons } from './oauth-buttons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [agreementError, setAgreementError] = useState(false);

  const handleClose = (): void => {
    setAgreed(false);
    setAgreementError(false);
    onClose();
  };

  const handleAgreementChange = (checked: boolean): void => {
    setAgreed(checked);
    if (checked) {
      setAgreementError(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          ✕
        </button>

        {/* Photo collage */}
        <div className="relative h-[360px] md:h-[440px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/auth/auth.webp')" }}
          />
        
          {/* затемнение как в макете (сверху + снизу) */}
          <div className="absolute inset-0 bg-linear-to-b from-zinc-900/75 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 -mt-8 relative">

          {/* Title */}
          <h2 className="text-white text-xl font-bold text-center mb-2">
            Фото себя за секунды: магия ИИ без студии и камеры
          </h2>

          {/* Subtitle */}
          <p className="text-zinc-400 text-sm text-center mb-6">
            Создавайте фото в любых стилях: загрузите снимок и откройте мир трендов
          </p>

          {/* Login prompt */}
          <p className="text-white text-center mb-4 font-medium">
            Войдите, чтобы продолжить
          </p>

          {/* OAuth Buttons */}
          <OAuthButtons
            agreed={agreed}
            onAgreementRequired={() => setAgreementError(true)}
          />

          {/* Agreement checkbox */}
          <div
            className={`mt-4 flex items-start gap-2 rounded-md border p-2 ${
              agreementError ? 'border-danger' : 'border-transparent'
            }`}
          >
            <input
              type="checkbox"
              id="agreement"
              checked={agreed}
              aria-invalid={agreementError}
              onChange={(e) => handleAgreementChange(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <label htmlFor="agreement" className="text-zinc-400 text-xs leading-relaxed">
              Я ознакомлен(а) и согласен(на) с{' '}
              <a href="/rules" className="text-blue-400 hover:underline">
                правилами использования сервиса
              </a>{' '}
              и{' '}
              <a href="/personal-data-policy" className="text-blue-400 hover:underline">
                политикой обработки персональных данных
              </a>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
