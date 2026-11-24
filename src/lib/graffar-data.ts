export type ServiceCategory =
  | "Автосвет и Bi-LED"
  | "Полировка и защита фар"
  | "Ремонт и герметизация оптики"
  | "Детейлинг и полировка кузова"
  | "Шумоизоляция и дооснащение";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Автосвет и Bi-LED",
  "Полировка и защита фар",
  "Ремонт и герметизация оптики",
  "Детейлинг и полировка кузова",
  "Шумоизоляция и дооснащение",
];

export type ServiceItem = {
  id: string;
  category: ServiceCategory;
  name: string;
  price: number;
  durationLabel: string;
  blurb: string;
  includes: string[];
  active: boolean;
};

export type PortfolioCase = {
  id: string;
  category: ServiceCategory;
  title: string;
  carModel: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  beforeCaption: string;
  afterCaption: string;
  isPlaceholder: boolean;
  placeholderNote?: string;
  publishedAt: string;
};

export type RequestStatus = "новая" | "в работе" | "завершена";

export type QuoteRequest = {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  carModel: string;
  carClassLabel: string;
  selectedOptions: string[];
  estimatedPrice: number;
  clientName: string;
  contactValue: string;
  contactMethod: "Телефон" | "Telegram" | "MAX" | "ВКонтакте";
  comment: string;
  status: RequestStatus;
  consentPersonalData: true;
  consentMarketing: boolean;
  consentVersion: string;
  consentTimestamp: string;
  createdAt: string;
};

export type LegalRequisites = {
  entityName: string;
  inn: string;
  ogrn: string;
  legalAddress: string;
  email: string;
  responsiblePerson: string;
};

export type PromoItem = {
  id: string;
  title: string;
  text: string;
  active: boolean;
};

export type StudioSettings = {
  brandShort: string;
  brandFull: string;
  monogram: string;
  logoImage: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  address: string;
  district: string;
  metro: string;
  phone: string;
  secondaryPhones: string[];
  workHours: string;
  yandexMapsUrl: string;
  vkUrl: string;
  telegramUrl: string;
  maxUrl: string;
  seoTitle: string;
  seoDescription: string;
  heroImage: string;
  heroScale: number;
  heroX: number;
  heroY: number;
  heroBadge: string;
  heroCaption: string;
  heroImageIsPlaceholder: boolean;
  cardServiceLabel: string;
  cardRatingLabel: string;
  cardPriceLabel: string;
  ratingScore: string;
  ratingCount: number;
  reviewCount: number;
  legal: LegalRequisites;
};

export type CarClassOption = {
  id: string;
  label: string;
  multiplier: number;
};

export const CAR_CLASSES: CarClassOption[] = [
  { id: "sedan", label: "Седан / хэтчбек", multiplier: 1.0 },
  { id: "crossover", label: "Кроссовер / универсал", multiplier: 1.15 },
  { id: "suv", label: "Внедорожник / коммерческий авто", multiplier: 1.25 },
];

export type CalculatorOption = {
  id: string;
  label: string;
  description: string;
  addPrice: number;
};

export const CALCULATOR_OPTIONS: CalculatorOption[] = [
  {
    id: "opt-stand",
    label: "Регулировка света фар после работ",
    description: "Выставление светотеневой границы на оборудовании",
    addPrice: 0,
  },
  {
    id: "opt-armour",
    label: "Бронирование стёкол фар антигравийной плёнкой",
    description: "Защита поликарбоната от пескоструя, сколов и реагентов",
    addPrice: 0,
  },
  {
    id: "opt-dismount",
    label: "Снятие / установка переднего бампера",
    description: "При необходимости демонтажа фар со снятием бампера",
    addPrice: 0,
  },
  {
    id: "opt-antichrome",
    label: "Антихром / покраска масок оптики",
    description: "Окрашивание внутренних масок и хромированных элементов",
    addPrice: 0,
  },
];

export const CONSENT_VERSION = "pd-consent-graffar-2026-v1";

export type StudioData = {
  settings: StudioSettings;
  services: ServiceItem[];
  portfolio: PortfolioCase[];
  promos: PromoItem[];
  requests: QuoteRequest[];
};

export const REVIEWS_YANDEX = [
  {
    id: "rev-denis",
    author: "Денис",
    date: "Яндекс Карты · 5,0",
    text: "Обратился к ребятам с проблемой ужасного света, убитых фар и ПТФ. Решили проблему в максимально короткие сроки и за приятный прайс: установили Bi-LED модули, заменили стёкла и выполнили шлифовку ПТФ в лучшем виде. Стали как с завода.",
  },
  {
    id: "rev-artem-s",
    author: "Артём Сороков",
    date: "Яндекс Карты · 5,0",
    text: "Потела фара. Позвонил, всё объяснили, записали в тот же день. Предложили решить проблему разными способами — выбрал с сохранением всего родного. Запаяли трещину, отшлифовали стёкла и нанесли защитную плёнку. Проблема ушла.",
  },
  {
    id: "rev-artem-z",
    author: "Artem Zverev",
    date: "Яндекс Карты · 5,0",
    text: "Обращался на установку Bi-LED линз вместо штатного ксенона на BMW F30, попутно заменили стёкла на фарах. Сделали оперативно и аккуратно, фары выглядят как новые, не потеют и отлично светят.",
  },
] as const;

export const STUDIO_GALLERY_PHOTOS = [
  {
    src: "/images/graffar/photo-07.jpg",
    caption: "BMW M5 Touring — оптика с жёлтыми ДХО в боксе ГрафФар",
  },
  {
    src: "/images/graffar/photo-10.jpg",
    caption: "Крупный план оптики BMW после доработки в студии",
  },
  {
    src: "/images/graffar/photo-09.jpg",
    caption: "Honda CR-V — установленный линзованный модуль",
  },
  {
    src: "/images/graffar/photo-02.jpg",
    caption: "Chevrolet Tahoe — восстановление и настройка оптики",
  },
  {
    src: "/images/graffar/photo-05.jpg",
    caption: "BMW X3 — полировка капота и оптики",
  },
  {
    src: "/images/graffar/photo-03.jpg",
    caption: "Химчистка и детейлинг салона BMW",
  },
  {
    src: "/images/graffar/photo-19.jpg",
    caption: "Hyundai Elantra — стайлинг и оклейка крыши плёнкой",
  },
  {
    src: "/images/graffar/photo-16.jpg",
    caption: "Студия ГрафФар — свет фар и ПТФ после обслуживания",
  },
] as const;

export const defaultStudioData = (): StudioData => ({
  settings: {
    brandShort: "ГрафФар",
    brandFull: "ГрафФар — студия автосвета и детейлинга",
    monogram: "ГФ",
    logoImage: "",
    tagline:
      "Ремонт и тюнинг автомобильной оптики, установка Bi-LED модулей, полировка, антигравийная плёнка, детейлинг и шумоизоляция в Санкт-Петербурге.",
    heroTitle: "Автосвет и детейлинг «ГрафФар»",
    heroSubtitle:
      "Bi-LED линзы, ремонт и герметизация оптики, полировка и защитная плёнка на Гранитной, 51.",
    address: "Санкт-Петербург, Гранитная улица, 51",
    district: "Красногвардейский район",
    metro: "м. Ладожская / м. Новочеркасская",
    phone: "+7 (921) 557-02-83",
    secondaryPhones: ["+7 (911) 826-91-96", "+7 (981) 914-22-64"],
    workHours: "Пн–Пт 11:00–20:00 · Сб 11:00–18:00",
    yandexMapsUrl:
      "https://yandex.ru/maps/org/graffar/31266706879?si=rty3cx5dam4fxdpttyhujm1t9m",
    vkUrl: "https://vk.ru/graffarspb",
    telegramUrl: "https://t.me/graffarspb",
    maxUrl: "https://max.ru/u/f9LHodD0cOJROfBAdDpxApBUO971SFtsIL7yY9tDXIeHgbVOm3OHXyCCqiY",
    seoTitle: "ГрафФар — Студия автосвета и детейлинга в Санкт-Петербурге",
    seoDescription:
      "Студия автосвета и детейлинга ГрафФар (Санкт-Петербург, Гранитная ул., 51): установка Bi-LED линз, ремонт и полировка фар, антигравийная плёнка, шумоизоляция, калькулятор стоимости.",
    heroImage: "/images/graffar/hero-bmw-clean.jpg",
    heroScale: 1,
    heroX: 0,
    heroY: 0,
    heroBadge: "Бокс ГрафФар",
    heroCaption: "Гранитная улица, 51",
    heroImageIsPlaceholder: false,
    cardServiceLabel: "услуг в студии",
    cardRatingLabel: "на Яндекс Картах",
    cardPriceLabel: "расчёт по авто",
    ratingScore: "5,0",
    ratingCount: 40,
    reviewCount: 38,
    legal: {
      entityName: "[Заполнить владельцу: ИП / ООО «...»]",
      inn: "[Заполнить владельцу: ИНН]",
      ogrn: "[Заполнить владельцу: ОГРНИП / ОГРН]",
      legalAddress: "[Заполнить владельцу: юридический / почтовый адрес]",
      email: "[Заполнить владельцу: email для обращений по ПДн]",
      responsiblePerson: "[Заполнить владельцу: ответственное лицо]",
    },
  },
  services: [
    {
      id: "svc-biled",
      category: "Автосвет и Bi-LED",
      name: "Установка Bi-LED линз и замена штатных модулей",
      price: 0,
      durationLabel: "По согласованию при осмотре",
      blurb:
        "Замена выгоревших штатных отражателей и ксеноновых линз на современные светодиодные Bi-LED модули с сохранением корректора.",
      includes: [
        "Разбор и чистка внутренних элементов фар",
        "Монтаж Bi-LED модулей и замена стёкол при необходимости",
        "Сборка на герметик и настройка светотеневой границы",
      ],
      active: true,
    },
    {
      id: "svc-lamps",
      category: "Автосвет и Bi-LED",
      name: "Тюнинг ДХО, замена ламп и установка доп. оборудования",
      price: 0,
      durationLabel: "По согласованию при осмотре",
      blurb:
        "Восстановление и дооснащение дневных ходовых огней, замена ламп, блоков розжига и настройка оптики.",
      includes: [
        "Диагностика штатной проводки и блоков",
        "Замена источников света и восстановление ДХО",
      ],
      active: true,
    },
    {
      id: "svc-polish-ppf",
      category: "Полировка и защита фар",
      name: "Глубокая шлифовка и полировка фар + бронеплёнка",
      price: 0,
      durationLabel: "По согласованию при осмотре",
      blurb:
        "Восстановление прозрачности мутных и отпескоструенных стёкол фар и ПТФ с последующей защитой антигравийной плёнкой.",
      includes: [
        "Многоступенчатая шлифовка и полировка поликарбоната",
        "Оклейка защитной антигравийной плёнкой",
      ],
      active: true,
    },
    {
      id: "svc-antichrome",
      category: "Полировка и защита фар",
      name: "Антихром и окрашивание масок оптики / элементов",
      price: 0,
      durationLabel: "По согласованию при осмотре",
      blurb:
        "Удаление хрома и оформление масок фар, шильдиков и молдингов в чёрный глянец или мат.",
      includes: [
        "Аккуратный разбор элементов оптики или кузова",
        "Подготовка поверхности и стойкое окрашивание / оклейка",
      ],
      active: true,
    },
    {
      id: "svc-fogging",
      category: "Ремонт и герметизация оптики",
      name: "Устранение запотевания, запайка трещин и ремонт фар",
      price: 0,
      durationLabel: "По согласованию при осмотре",
      blurb:
        "Поиск причины попадания влаги, запайка трещин корпуса, удаление конденсата, чистка изнутри и полная перегерметизация.",
      includes: [
        "Диагностика шва, корпуса и клапанов вентиляции",
        "Запайка повреждений корпуса и замена герметика",
      ],
      active: true,
    },
    {
      id: "svc-body-polish",
      category: "Детейлинг и полировка кузова",
      name: "Полировка кузова, ремонт царапин и полировка стекла",
      price: 0,
      durationLabel: "По согласованию при осмотре",
      blurb:
        "Удаление паутинки, голограмм и локальных царапин лакокрасочного покрытия, полировка стёкол и нанесение защитных составов.",
      includes: [
        "Оценка состояния ЛКП и подбор паст",
        "Восстановительная полировка и защита кузова",
      ],
      active: true,
    },
    {
      id: "svc-ppf-vinyl",
      category: "Детейлинг и полировка кузова",
      name: "Антигравийная плёнка, автовинил и тонировка",
      price: 0,
      durationLabel: "По согласованию при осмотре",
      blurb:
        "Защита зон риска полиуретановой плёнкой, оклейка деталей кузова винилом, тонировка стёкол и притемнение задних фонарей.",
      includes: [
        "Подготовка и обезжиривание оклеиваемых поверхностей",
        "Оклейка с аккуратным подворотом краёв",
      ],
      active: true,
    },
    {
      id: "svc-interior",
      category: "Детейлинг и полировка кузова",
      name: "Химчистка салона и озонирование",
      price: 0,
      durationLabel: "По согласованию при осмотре",
      blurb:
        "Деликатная очистка кожи, текстиля, пластика и ковролина, а также озонирование салона для устранения запахов.",
      includes: [
        "Очистка сидений, карт дверей и труднодоступных зон",
        "Озонирование и обработка защитными составами",
      ],
      active: true,
    },
    {
      id: "svc-noise",
      category: "Шумоизоляция и дооснащение",
      name: "Шумоизоляция авто и удаление вмятин без покраски (PDR)",
      price: 0,
      durationLabel: "По согласованию при осмотре",
      blurb:
        "Комплексная или поэлементная шумоизоляция салона, а также беспокрасочное удаление вмятин с сохранением заводского ЛКП.",
      includes: [
        "Подбор материалов под задачи автомобиля",
        "Аккуратная разборка/сборка обшивок салона",
      ],
      active: true,
    },
  ],
  portfolio: [
    {
      id: "case-ptf-real",
      category: "Полировка и защита фар",
      title: "Восстановление и полировка противотуманных фар",
      carModel: "Реальный фотоотчёт «ГрафФар» (Гранитная ул., 51)",
      description:
        "Мутные, отпескоструенные противотуманные фары сняты, прошли глубокую многоэтапную шлифовку и полировку на верстаке студии до состояния нового стекла.",
      beforeImage: "/images/graffar/photo-13.jpg",
      afterImage: "/images/graffar/photo-15.jpg",
      beforeCaption: "До: матовые, отпескоструенные ПТФ",
      afterCaption: "После: прозрачное стекло и чёткий отражатель",
      isPlaceholder: false,
      publishedAt: "Яндекс Карты · ГрафФар",
    },
    {
      id: "case-octavia-real",
      category: "Автосвет и Bi-LED",
      title: "Восстановление головной оптики и линз Skoda Octavia",
      carModel: "Реальный фотоотчёт «ГрафФар» (Skoda Octavia)",
      description:
        "Сильно помутневшие стёкла фар со следами эксплуатации восстановлены; выполнена чистка оптики, работа с линзованными модулями и возвращена кристальная прозрачность.",
      beforeImage: "/images/graffar/photo-14.jpg",
      afterImage: "/images/graffar/photo-12.jpg",
      beforeCaption: "До: помутневшие стёкла на разборе",
      afterCaption: "После: чистая оптика на автомобиле",
      isPlaceholder: false,
      publishedAt: "Яндекс Карты · ГрафФар",
    },
    {
      id: "case-fog-bmw",
      category: "Ремонт и герметизация оптики",
      title: "Устранение запотевания фары BMW F30 (реальное фото «До»)",
      carModel: "BMW 3 Series (F30) · фото студии ГрафФар",
      description:
        "Обильный конденсат внутри фары из-за потери герметичности. На месте показана реальная фотография проблемы «До» из карточки ГрафФар; правый кадр «После» отмечен как макетная схема до загрузки ответного снимка владельцем.",
      beforeImage: "/images/graffar/photo-17.jpg",
      afterImage: "/images/portfolio/fog-after.svg",
      beforeCaption: "До (реальное фото ГрафФар): конденсат внутри фары",
      afterCaption: "После (макетная схема): перегерметизация",
      isPlaceholder: true,
      placeholderNote:
        "Для этого кейса фото «До» реальное (photo-17.jpg), а фото «После» нужно заменить на реальный итоговый снимок этой фары.",
      publishedAt: "Яндекс Карты · ГрафФар",
    },
    {
      id: "case-bmw-m5-optics",
      category: "Автосвет и Bi-LED",
      title: "BMW M5 Touring — тюнинг оптики и жёлтые ДХО",
      carModel: "BMW M5 Touring · фото бокса ГрафФар",
      description:
        "Реальные фотографии автомобиля в студии ГрафФар после работ с оптикой, установки жёлтых дневных ходовых огней и детейлинга передней части.",
      beforeImage: "/images/portfolio/biled-before.svg",
      afterImage: "/images/graffar/photo-10.jpg",
      beforeCaption: "До (макетная схема): штатный вид",
      afterCaption: "После (реальное фото ГрафФар): оптика и жёлтые ДХО",
      isPlaceholder: true,
      placeholderNote:
        "Фото «После» реальное (photo-10.jpg), а фото «До» — временная схема (при наличии архивного снимка замените в админке).",
      publishedAt: "Яндекс Карты · ГрафФар",
    },
    {
      id: "case-x3-polish",
      category: "Детейлинг и полировка кузова",
      title: "Полировка кузова и оптики BMW X3",
      carModel: "BMW X3 · фото студии ГрафФар",
      description:
        "Глубокий зеркальный глянец капота и прозрачные стёкла головной оптики после полировочных работ в студии на Гранитной, 51.",
      beforeImage: "/images/portfolio/detailing-before.svg",
      afterImage: "/images/graffar/photo-05.jpg",
      beforeCaption: "До (макетная схема): риски и паутинка",
      afterCaption: "После (реальное фото ГрафФар): зеркальный блеск",
      isPlaceholder: true,
      placeholderNote:
        "Фото «После» реальное (photo-05.jpg), фото «До» — временная схема для сравнения.",
      publishedAt: "Яндекс Карты · ГрафФар",
    },
  ],
  promos: [
    {
      id: "promo-inspection",
      title: "Бесплатная диагностика света при осмотре в студии",
      text: "Подскажем оптимальный вариант восстановления или замены модулей под ваш автомобиль на Гранитной, 51.",
      active: false,
    },
  ],
  requests: [],
});

export function formatRub(price: number): string {
  if (!price || price <= 0) return "По запросу";
  return `от ${new Intl.NumberFormat("ru-RU").format(price)} ₽`;
}

export function formatExactRub(price: number): string {
  if (!price || price <= 0) return "По запросу";
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`;
}

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}
