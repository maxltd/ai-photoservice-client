export const NAV_LINKS = [
  { label: 'ИИ фотосессии', index: 1 },
  { label: 'Стили фотосессий', index: 4 },
  { label: 'Идеи фотосессий', index: 2 },
  { label: 'Инструменты', index: 12 },
  { label: 'NanoBanana', index: 13 },
  { label: 'Блог', index: 11 },
  { label: 'Отзывы', index: 8 },
  { label: 'FAQ', index: 10 },
];

export const STYLES_DATA = [
  { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop', title: 'В красном неоне', subtitle: '320 стилей', badge: 'Новинка', badgeColor: 'bg-green-600' },
  { image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop', title: 'Аля-текс красоты', subtitle: '185 стилей' },
  { image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop', title: 'На веранде', subtitle: '240 стилей' },
  { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop', title: 'В красном неоне', subtitle: '156 стилей' },
  { image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop', title: 'В красном неоне', subtitle: '203 стиля' },
  { image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=500&fit=crop', title: 'Сказка Dreamworks', subtitle: '98 стилей' },
  { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop', title: 'Натуральная красота', subtitle: '312 стилей' },
  { image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop', title: 'Самураи', subtitle: '145 стилей' },
  { image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop', title: 'Как в фильме', subtitle: '267 стилей' },
  { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop', title: 'В красном неоне', subtitle: '189 стилей' },
];

export const IDEAS_DATA = [
  { image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop', title: 'Съемка в цвете бордо', count: '4 фото', isHit: true },
  { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop', title: 'На качелях', count: '6 фото' },
  { image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=400&fit=crop', title: 'В красном неоне', count: '8 фото', isHit: true },
  { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop', title: 'Снег', count: '5 фото' },
  { image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop', title: 'День рождения 1990', count: '4 фото' },
];

export const TESTIMONIALS_DATA = [
  { name: 'Ирина М.', nickname: '@irina_photo', text: 'Сервис просто удивил. Фото вышли реалистичнее, чем я ожидала.' },
  { name: 'Максим', nickname: '@max_dev', text: 'Очень удобный формат работы. Всё происходит онлайн.' },
  { name: 'Дмитрий К.', nickname: '@dmitry_k', text: 'Качество генераций порадовало. Сходство отличное.' },
  { name: 'EmilyArt23', nickname: '@emily_art', text: 'Работает быстро и стабильно. Рекомендую!' },
];

export const FAQ_DATA = [
  { question: 'Сколько фото нужно для нейросети?', answer: 'Для создания качественных AI-фотосессий рекомендуем загрузить от 10 до 15 фотографий. Чем больше разнообразных ракурсов и выражений лица, тем лучше результат.' },
  { question: 'Сколько фото нужно загрузить?', answer: 'Минимум 10 фотографий для базового обучения модели. Оптимально — 15-20 снимков с разным освещением и ракурсами.' },
  { question: 'Нужно ли что-то устанавливать?', answer: 'Нет, весь процесс происходит онлайн в браузере. Не требуется установка дополнительного программного обеспечения.' },
  { question: 'Сколько времени занимает генерация?', answer: 'Обычно генерация занимает от 2 до 10 минут в зависимости от выбранного стиля и текущей нагрузки на сервер.' },
  { question: 'Можно ли попробовать бесплатно?', answer: 'Да, первые 5 генераций полностью бесплатны. Это позволит вам оценить качество и подобрать подходящий стиль.' },
];

export const EDITOR_FEATURES = [
  { title: 'Удаление фона', icon: 'Layers' },
  { title: 'Качество 4K', icon: 'Sparkles' },
  { title: 'Ретушь лица', icon: 'Wand2' },
  { title: 'Стилизация', icon: 'Image' },
];