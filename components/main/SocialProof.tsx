import Image from "next/image";
import { cn } from "@/lib/utils";
import { CornLeftIcon, CornRightIcon, GreenStarIcon } from "./icons";

// Массив локальных аватарок
const AVATAR_IMAGES = [
  '/images/landing/hero/img_avatar_01.webp',
  '/images/landing/hero/img_avatar_02.webp',
  '/images/landing/hero/img_avatar_03.webp',
  '/images/landing/hero/img_avatar_04.webp',
];

interface SocialProofAvatar {
  src: string;
  alt: string;
}

interface SocialProofClassNames {
  root?: string;
  leftCorn?: string;
  avatarsWrap?: string;
  avatar?: string;
  textWrap?: string;
  text?: string;
  separator?: string;
  starWrap?: string;
  ratingWrap?: string;
  ratingText?: string;
  rightCorn?: string;
}

interface SocialProofProps {
  text: string;
  rating?: string;
  showRating?: boolean;
  showAvatarsOnMobile?: boolean;
  className?: string;
  classNames?: SocialProofClassNames;
}

export function SocialProof({
  text,
  rating,
  showRating = true,
  showAvatarsOnMobile = false,
  className,
  classNames,
}: SocialProofProps) {
  const avatarImages:SocialProofAvatar[] = AVATAR_IMAGES.map((src) => ({ src, alt: '' }))
  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2 md:gap-[8.14px] w-[343px] md:w-auto h-[52.88px] justify-center overflow-visible",
        classNames?.root,
        className,
      )}
    >
      <div className={cn("w-[16.27px] h-[52.88px] shrink-0 flex items-center justify-center", classNames?.leftCorn)}>
        <CornLeftIcon />
      </div>

      <div
        className={cn(
          "flex flex-row items-center w-[113.9px] h-[40.68px] shrink-0",
          showAvatarsOnMobile ? "" : "hidden md:flex",
          classNames?.avatarsWrap,
        )}
      >
        {avatarImages.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={cn(
              "w-[40.68px] h-[40.68px] rounded-full bg-zinc-600 border-2 border-[#0a0a0a] overflow-hidden shrink-0",
              classNames?.avatar,
            )}
            style={{ marginLeft: index > 0 ? "-16.27px" : "0" }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={40.68}
              height={40.68}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className={cn("w-[214px] h-[36px] md:h-[40px] flex items-center justify-center shrink-0", classNames?.textWrap)}>
        <span
          className={cn(
            "text-white/80 text-[12px] md:text-[14px] leading-[18px] md:leading-[20px] font-normal text-center md:text-left line-clamp-2",
            classNames?.text,
          )}
        >
          {text}
        </span>
      </div>

      {showRating && rating ? (
        <>
          <div className={cn("w-[36px] h-0 border border-white/[0.08] rotate-90 shrink-0", classNames?.separator)} />

          <div className={cn("w-6 h-6 shrink-0 flex items-center justify-center", classNames?.starWrap)}>
            <GreenStarIcon />
          </div>

          <div className={cn("w-[25px] md:w-[31px] h-6 md:h-[28px] flex items-center justify-center shrink-0", classNames?.ratingWrap)}>
            <span className={cn("text-white text-[16px] md:text-[20px] leading-6 md:leading-[28px] font-medium text-center", classNames?.ratingText)}>
              {rating}
            </span>
          </div>
        </>
      ) : null}

      <div className={cn("w-[16.27px] h-[52.88px] shrink-0 flex items-center justify-center", classNames?.rightCorn)}>
        <CornRightIcon />
      </div>
    </div>
  );
}
