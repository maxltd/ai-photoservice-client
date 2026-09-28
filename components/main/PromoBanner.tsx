import { TicketPromoBannerIcon } from './icons';
import { PromoBannerCloseButton } from './PromoBannerCloseButton';

export const PromoBanner = ({
  onClose,
}: {
  onClose?: () => void;
}): React.JSX.Element => {
  return (
    <div
      className="w-full h-[40px] sm:h-[52px] relative flex items-center justify-center px-4 sm:px-0"
      style={{
        background: 'linear-gradient(90deg, #FF5F53 0%, #EA5FA7 15.13%, #FFB56A 43.02%, #F59F47 76.99%, #F67F29 100%)'
      }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:flex flex-row items-center gap-3">
        <span className="text-[#101010] text-[16px] leading-[24px] font-normal whitespace-nowrap">
          Новым пользователям
        </span>

        <div className="flex flex-row justify-center items-center bg-[#101010] rounded-[8px] h-[32px] px-2 gap-2">
          <TicketPromoBannerIcon />
          <span className="text-white text-[16px] leading-[24px] font-normal whitespace-nowrap">
            100 тикетов
          </span>
        </div>

        <span className="text-[#101010] text-[16px] leading-[24px] font-normal whitespace-nowrap">
          для генераций бесплатно
        </span>
      </div>

      <div className="flex sm:hidden flex-row items-center gap-2 w-full justify-center">
        <div className="flex h-6 w-[105px] shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[#101010] px-1">
          <TicketPromoBannerIcon />
          <span className="text-white text-[12px] leading-[18px] font-normal whitespace-nowrap">
            100 тикетов
          </span>
        </div>

        <span className="text-[#101010] text-[12px] leading-[18px] font-normal whitespace-nowrap text-center">
          новым пользователям бесплатно
        </span>
      </div>

      <PromoBannerCloseButton onClose={onClose} />
    </div>
  );
};
