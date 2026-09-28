import Image from 'next/image';

export const MobileImagesStrip = () => {
  const mobileImages = [
    '/images/landing/hero/leonardo/image_01_1x.webp',
    '/images/landing/hero/leonardo/image_02_1x.webp',
    '/images/landing/hero/leonardo/image_03_1x.webp',
    '/images/landing/hero/leonardo/image_04_1x.webp',
    '/images/landing/hero/leonardo/image_05_1x.webp',
    '/images/landing/hero/leonardo/image_06_1x.webp',
    '/images/landing/hero/leonardo/image_07_1x.webp',
    '/images/landing/hero/leonardo/image_08_1x.webp',
    '/images/landing/hero/leonardo/image_09_1x.webp',
    '/images/landing/hero/leonardo/image_10_1x.webp',
    '/images/landing/hero/leonardo/image_11_1x.webp',
    '/images/landing/hero/leonardo/image_12_1x.webp',
    '/images/landing/hero/leonardo/image_13_1x.webp',
    '/images/landing/hero/leonardo/image_14_1x.webp',
    '/images/landing/hero/leonardo/image_15_1x.webp',
    '/images/landing/hero/leonardo/image_16_1x.webp',
  ];

  return (
    // md:hidden: скрываем на ПК (там работает ScrollAcceleratedScatter)
    // overflow-hidden: скрываем выходящие за пределы картинки
    <div className="flex w-full flex-row overflow-hidden px-2 mb-2 md:hidden">
      {/* animate-marquee: применяем нашу анимацию */}
      <div className="flex gap-4 animate-marquee whitespace-nowrap">
        {/* Дублируем массив [...mobileImages, ...mobileImages], чтобы строка была бесконечной */}
        {[...mobileImages, ...mobileImages].map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={`preview-${i}`}
            width={104}
            height={128}
            className="h-auto aspect-[104/128] w-[calc((100vw-80px)/3)] max-w-[104px] shrink-0 rounded-[8px] object-cover"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
};