"use client";

import { X } from "lucide-react";
import { useOptionalMainPageContext } from "./MainPageContext";

export function PromoBannerCloseButton({
  onClose,
}: {
  onClose?: () => void;
}): React.JSX.Element {
  const context = useOptionalMainPageContext();
  const closeBanner = onClose ?? context?.closeBanner ?? (() => undefined);

  return (
    <button
      onClick={closeBanner}
      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#101010] hover:text-white transition-colors shrink-0 z-10"
    >
      <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
    </button>
  );
}
