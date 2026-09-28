"use client";

import { useState } from "react";
import { Navbar } from "@/components/main/Navbar";
import { PromoBanner } from "@/components/main/PromoBanner";
import { usePublicAuth } from "@/components/auth/public-auth-provider";

export function IdeaPageHeader() {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const publicAuth = usePublicAuth();

  return (
    <>
      {isBannerVisible ? (
        <div className="fixed inset-x-0 top-0 z-50">
          <PromoBanner onClose={() => setIsBannerVisible(false)} />
        </div>
      ) : null}
      <div
        className={`fixed inset-x-0 z-40 transition-all duration-300 ${
          isBannerVisible ? "top-[40px] sm:top-[52px]" : "top-0"
        }`}
      >
        <Navbar
          onNavigate={() => undefined}
          activeSection={-1}
          isBannerVisible={isBannerVisible}
          onLoginClick={() => publicAuth?.openLogin()}
        />
      </div>
    </>
  );
}
