"use client";

import { authClient } from "@/lib/auth-client";

type OAuthProvider = "yandex" | "mailru";

interface OAuthButtonsProps {
  agreed: boolean;
  onAgreementRequired: () => void;
}

export function OAuthButtons({
  agreed,
  onAgreementRequired,
}: OAuthButtonsProps) {
  const postAuthRedirectUrl =
      `${process.env.NEXT_PUBLIC_APP_URL}/app/create`;

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    if (!agreed) {
      onAgreementRequired();
      return;
    }

    await authClient.signIn.oauth2({
      providerId: provider,
      callbackURL: postAuthRedirectUrl,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => void handleOAuthLogin("yandex")}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FC3F1D] text-white rounded-xl font-medium"
      >
        Яндекс
      </button>
      <button
        onClick={() => void handleOAuthLogin("mailru")}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#005FF9] text-white rounded-xl font-medium"
      >
        Mail
      </button>
    </div>
  );
}
