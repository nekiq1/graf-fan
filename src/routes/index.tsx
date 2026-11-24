import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Clock,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { useMemo } from "react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { PWAInstallButton } from "@/components/PWAInstall";
import { REVIEWS_YANDEX, formatRub } from "@/lib/graffar-data";
import { useGraffarStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: HomePage });

function FiveStarSticker({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-label="Оценка 5 из 5 звёзд"
      className={`inline-flex items-center gap-0.5 ${
        compact ? "" : "rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1"
      }`}
    >
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star
          key={idx}
          className={`${compact ? "size-3.5" : "size-4"} fill-amber-400 text-amber-400`}
        />
      ))}
    </span>
  );
}

function HomePage() {
  const settings = useGraffarStore((s) => s.settings);
  const rawServices = useGraffarStore((s) => s.services);
  const portfolio = useGraffarStore((s) => s.portfolio);
  const rawPromos = useGraffarStore((s) => s.promos);

  const services = useMemo(
    () => rawServices.filter((item) => item.active),
    [rawServices],
  );
  const promos = useMemo(
    () => (rawPromos ?? []).filter((p) => p.active),
    [rawPromos],
  );

  const featuredCase = portfolio[0];
  const secondaryCase = portfolio[1];
  const pricedServices = services.filter((s) => s.price > 0);
  const minPrice = pricedServices.length
    ? Math.min(...pricedServices.map((s) => s.price))
    : 0;

  return (
    <div className="space-y-12 sm:space-y-14">
      <section className="space-y-4">
        <div className="grid items-stretch gap-4 lg:grid-cols-12">
          <div className="group order-first aspect-[16/10] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 sm:aspect-[16/9] lg:order-last lg:col-span-6 lg:aspect-auto lg:min-h-[380px] dark:border-zinc-800/90">
            <img
              src={settings.heroImage}
              alt="BMW M5 Touring в студии автосвета и детейлинга ГрафФар"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${settings.heroScale ?? 1}) translate(${settings.heroX ?? 0}%, ${settings.heroY ?? 0}%)`,
              }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 sm:p-8 lg:col-span-6 dark:border-zinc-800/90 dark:bg-[#141416]">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                СПб · Гранитная, 51 · {settings.metro}
              </p>
              <h1 className="mt-2.5 text-2xl leading-[1.15] font-extrabold tracking-tight text-balance text-zinc-950 sm:text-4xl dark:text-white">
                {settings.heroTitle}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-600 sm:text-[15px] dark:text-zinc-300">
                {settings.heroSubtitle}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3">
                <Link
                  to="/calculator"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold whitespace-nowrap text-white shadow-sm shadow-blue-600/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98] sm:px-5"
                >
                  <Calculator className="size-4 shrink-0" />
                  <span>Рассчитать цену</span>
                </Link>
                <Link
                  to="/works"
                  className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-semibold whitespace-nowrap text-zinc-900 transition-all duration-150 hover:bg-zinc-100 active:scale-[0.98] sm:px-5 dark:border-zinc-700/80 dark:bg-[#1C1C1F] dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  <span>Портфолио</span>
                  <ArrowUpRight className="size-4 shrink-0" />
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-zinc-200 pt-4 text-xs dark:border-zinc-800">
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
              >
                <Phone className="size-3.5 text-amber-500" />
                {settings.phone}
              </a>
              <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <Clock className="size-3.5 text-zinc-400" />
                {settings.workHours}
              </span>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-zinc-800 dark:border-zinc-800/90 dark:bg-[#141416]">
          <a
            href={settings.yandexMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-[#1A1A1E]"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tabular-nums text-zinc-950 dark:text-white">
                  {settings.ratingScore}
                </span>
                <FiveStarSticker compact />
              </div>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {settings.ratingCount} оценок · Яндекс Карты
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-zinc-400" />
          </a>

          <Link
            to="/services"
            className="flex items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-[#1A1A1E]"
          >
            <div>
              <p className="text-xl font-bold tabular-nums text-zinc-950 dark:text-white">
                {services.length}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {settings.cardServiceLabel}
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-zinc-400" />
          </Link>

          <Link
            to="/calculator"
            className="flex items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-[#1A1A1E]"
          >
            <div>
              <p className="text-xl font-bold tabular-nums text-zinc-950 dark:text-white">
                {minPrice > 0 ? formatRub(minPrice) : "По расчёту"}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {settings.cardPriceLabel}
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-blue-500" />
          </Link>
        </div>

        <div className="empty:hidden md:hidden">
          <PWAInstallButton variant="full" />
        </div>
      </section>

      {promos.length > 0 ? (
        <section className="grid gap-3 md:grid-cols-2">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-5"
            >
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Акция студии
                </p>
                <h2 className="mt-1 text-base font-bold text-zinc-950 dark:text-white">
                  {promo.title}
                </h2>
                {promo.text ? (
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{promo.text}</p>
                ) : null}
              </div>
              <Link
                to="/calculator"
                className="inline-flex h-9 items-center gap-1 self-start rounded-xl bg-amber-500/15 px-3.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-500/25 dark:text-amber-300"
              >
                Рассчитать со скидкой
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </section>
      ) : null}

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
            Услуги студии
          </h2>
          <Link
            to="/services"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-semibold whitespace-nowrap text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#141416] dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Все услуги
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service, idx) => (
            <article
              key={service.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-150 hover:border-blue-500/40 dark:border-zinc-800 dark:bg-[#13161C] dark:hover:border-blue-500/40"
            >
              <div>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  {String(idx + 1).padStart(2, "0")} · {service.category}
                </p>
                <h3 className="mt-2 text-base font-bold text-zinc-950 dark:text-white">
                  {service.name}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {service.blurb}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3.5 dark:border-zinc-800">
                <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatRub(service.price)}
                </span>
                <Link
                  to="/calculator"
                  search={{ service: service.id }}
                  className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-blue-600/10 px-3.5 text-xs font-semibold whitespace-nowrap text-blue-600 transition-colors hover:bg-blue-600 hover:text-white active:scale-[0.98] dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
                >
                  Выбрать
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {featuredCase ? (
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
              Работы «До и После»
            </h2>
            <Link
              to="/works"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-semibold whitespace-nowrap text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#141416] dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Все работы
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {[featuredCase, secondaryCase].filter(Boolean).map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#13161C]"
              >
                <BeforeAfterSlider
                  beforeImage={item.beforeImage}
                  afterImage={item.afterImage}
                  beforeAlt={`${item.title} — до`}
                  afterAlt={`${item.title} — после`}
                  beforeCaption={item.beforeCaption}
                  afterCaption={item.afterCaption}
                  isPlaceholder={item.isPlaceholder}
                />
                <div className="mt-4">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.category} · {item.carModel}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-zinc-950 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
            Отзывы клиентов
          </h2>
          <a
            href={settings.yandexMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 transition-colors hover:bg-amber-500/15"
          >
            <FiveStarSticker compact />
            <span className="text-sm font-bold tabular-nums text-zinc-950 dark:text-white">
              {settings.ratingScore}
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-300">
              {settings.ratingCount} оценок
            </span>
            <ArrowUpRight className="size-3.5 text-amber-500" />
          </a>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {REVIEWS_YANDEX.map((review) => (
            <article
              key={review.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-amber-500/35 dark:border-zinc-800 dark:bg-[#13161C]"
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <FiveStarSticker />
                  <span className="text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                    5,0
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  «{review.text}»
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
                <p className="font-semibold text-zinc-900 dark:text-white">{review.author}</p>
                <p className="text-zinc-500 dark:text-zinc-400">{review.date}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-8 lg:grid-cols-12 dark:border-zinc-800 dark:bg-[#13161C]">
        <div className="flex flex-col justify-between lg:col-span-5">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {settings.district} · {settings.metro}
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
              {settings.address}
            </h2>
            <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-300">{settings.workHours}</p>
            <div className="mt-4 space-y-1">
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                className="block text-lg font-bold text-zinc-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
              >
                {settings.phone}
              </a>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {settings.secondaryPhones.join(" · ")}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <a
              href={settings.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Telegram
              <ArrowUpRight className="size-3.5" />
            </a>
            <a
              href={settings.vkUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              ВКонтакте
              <ArrowUpRight className="size-3.5" />
            </a>
            <a
              href={settings.maxUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              MAX
              <ArrowUpRight className="size-3.5" />
            </a>
            <a
              href={settings.yandexMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98]"
            >
              <MapPin className="size-3.5" />
              Яндекс Карты
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 lg:col-span-7 dark:border-zinc-800">
          <iframe
            title="ГрафФар на карте — Санкт-Петербург, Гранитная улица, 51"
            src="https://yandex.ru/map-widget/v1/?ll=30.430458%2C59.925331&z=15&pt=30.430458%2C59.925331%2Cpm2rdm"
            width="100%"
            height="300"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[250px] w-full border-0 sm:h-[300px]"
          />
        </div>
      </section>
    </div>
  );
}
