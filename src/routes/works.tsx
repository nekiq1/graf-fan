import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import {
  SERVICE_CATEGORIES,
  STUDIO_GALLERY_PHOTOS,
  type ServiceCategory,
} from "@/lib/graffar-data";
import { useGraffarStore } from "@/lib/store";

export const Route = createFileRoute("/works")({ component: WorksPage });

function WorksPage() {
  const portfolio = useGraffarStore((s) => s.portfolio);
  const settings = useGraffarStore((s) => s.settings);
  const [filter, setFilter] = useState<ServiceCategory | "Все">("Все");

  const items =
    filter === "Все" ? portfolio : portfolio.filter((item) => item.category === filter);

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Портфолио «ГрафФар» · {settings.address}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Работы студии «До и После»
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Интерактивное сравнение состояния оптики и кузова. Передвигайте ползунок на карточке
            или используйте кнопки переключения режимов.
          </p>
        </div>

        <a
          href={settings.yandexMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-lg border border-zinc-300 px-4 text-xs font-semibold whitespace-nowrap text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Профиль на Яндекс Картах
          <ArrowUpRight className="size-4" />
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("Все")}
          className={`h-9 shrink-0 rounded-lg px-3.5 text-xs font-medium whitespace-nowrap transition-colors ${
            filter === "Все"
              ? "bg-blue-600 text-white"
              : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          Все работы
        </button>
        {SERVICE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilter(category)}
            className={`h-9 shrink-0 rounded-lg px-3.5 text-xs font-medium whitespace-nowrap transition-colors ${
              filter === category
                ? "bg-blue-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-400">
          В выбранной категории пока нет кейсов. Вы можете добавить новые пары «До и После» через
          админ-панель.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#13161C]"
            >
              <div>
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
                    {item.category} · {item.carModel} · {item.publishedAt}
                  </p>
                  <h2 className="mt-1.5 text-lg font-bold text-zinc-950 dark:text-white">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                  {item.placeholderNote ? (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      {item.placeholderNote}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <Link
                  to="/calculator"
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold whitespace-nowrap text-white hover:bg-blue-700"
                >
                  Рассчитать похожую работу
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Фотогалерея бокса и выполненных проектов
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STUDIO_GALLERY_PHOTOS.map((photo) => (
            <figure
              key={photo.src}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#13161C]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-zinc-950">
                <img
                  src={photo.src}
                  alt={photo.caption}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
