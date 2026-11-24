import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  SERVICE_CATEGORIES,
  formatRub,
  type ServiceCategory,
} from "@/lib/graffar-data";
import { useGraffarStore } from "@/lib/store";

export const Route = createFileRoute("/services")({ component: ServicesPage });

function ServicesPage() {
  const rawServices = useGraffarStore((s) => s.services);
  const services = useMemo(
    () => rawServices.filter((item) => item.active),
    [rawServices],
  );
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "Все">("Все");
  const [query, setQuery] = useState("");

  const filtered = services.filter((item) => {
    const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.blurb.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Направления студии «ГрафФар»
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Услуги автосвета и детейлинга
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Точная стоимость зависит от конструкции оптики, модели автомобиля и состояния элементов.
            Для оценки выберите нужную услугу и перейдите в калькулятор.
          </p>
        </div>

        <label className="relative w-full md:w-72">
          <span className="sr-only">Поиск услуги</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по услугам…"
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pr-4 pl-10 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-100"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("Все")}
          className={`h-9 shrink-0 rounded-lg px-3.5 text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === "Все"
              ? "bg-blue-600 text-white"
              : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          Все направления
        </button>
        {SERVICE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`h-9 shrink-0 rounded-lg px-3.5 text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-400">
          По вашему запросу услуги не найдены. Попробуйте сбросить фильтр или уточнить задачу в
          калькуляторе.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((service) => (
            <article
              key={service.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#13161C]"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {service.category} · {service.durationLabel}
                    </p>
                    <h2 className="mt-1.5 text-lg font-bold text-zinc-950 dark:text-white">
                      {service.name}
                    </h2>
                  </div>
                  <span className="shrink-0 text-base font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatRub(service.price)}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {service.blurb}
                </p>

                {service.includes.length > 0 ? (
                  <ul className="mt-4 space-y-1.5 border-t border-zinc-200 pt-4 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                    {service.includes.map((point) => (
                      <li key={point}>· {point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="mt-6 flex items-center justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <Link
                  to="/calculator"
                  search={{ service: service.id }}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-blue-700"
                >
                  Рассчитать стоимость
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
