import type { AppSettingResponse } from "@/lib/api/contract";

const CREATE_FLOW_MODE_TITLES: Record<string, string> = {
  PROMPT_AND_PHOTO: "Создание по промпту и фото",
  PROMPT_TO_PHOTO: "Создание фото по промпту",
  MERGE_TWO_PHOTOS: "Объединить два фото",
  PROMPT_TO_VIDEO: "Создание видео по промпту",
  ANIMATE_IMAGE: "Оживление изображения",
  MERGE_THREE_TO_FIVE_PHOTOS: "Объединить от 3 до 5 фото",
  BACKGROUND_REPLACE: "Замена фона",
};

const SETTING_LABELS: Record<string, string> = {
  max_upload_size_mb: "Максимальный размер загружаемого файла (МБ)",
  max_slots_per_session: "Максимальное количество слотов в фотосессии",
  maintenance_mode: "Режим технического обслуживания",
  generation_timeout_sec: "Таймаут запроса к fal.ai (секунды)",
  max_active_generation_orders:
    "Максимум активных заказов генерации на пользователя",

  generation_mode_prompt_and_photo_token_cost:
    "Стоимость режима «Создание по промпту и фото»",
  generation_mode_prompt_to_photo_token_cost:
    "Стоимость режима «Создание фото по промпту»",
  generation_mode_merge_two_photos_token_cost:
    "Стоимость режима «Объединить два фото»",
  generation_mode_prompt_to_video_token_cost:
    "Стоимость режима «Создание видео по промпту»",
  generation_mode_animate_image_token_cost:
    "Стоимость режима «Оживление изображения»",
  generation_mode_merge_three_to_five_photos_token_cost:
    "Стоимость режима «Объединить от 3 до 5 фото»",
  generation_mode_background_replace_token_cost:
    "Стоимость режима «Замена фона»",
};

function resolveCreateFlowModeTitle(settingKey: string): string | null {
  const match = settingKey.match(/^generation_mode_(.+)_token_cost$/);
  if (!match) {
    return null;
  }

  const modeCode = match[1]?.toUpperCase();
  if (!modeCode) {
    return null;
  }

  const modeTitle = CREATE_FLOW_MODE_TITLES[modeCode];
  return modeTitle ? `Стоимость режима «${modeTitle}»` : null;
}

export function getSettingDisplayName(
  setting: Pick<AppSettingResponse, "key" | "description">,
): string {
  const mappedName =
    SETTING_LABELS[setting.key] ?? resolveCreateFlowModeTitle(setting.key);

  if (mappedName) {
    return mappedName;
  }

  const description = setting.description?.trim();
  if (description) {
    return description;
  }

  return setting.key;
}
