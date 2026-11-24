import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import { useGraffarStore } from "@/lib/store";

export const Route = createFileRoute("/contacts")({ component: ContactsPage });

function ContactsPage() {
  const settings = useGraffarStore((s) => s.settings);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {settings.district} · {settings.metro}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
          Контакты студии «{settings.brandShort}»
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Принимаем автомобили в студии на Гранитной улице, 51 по предварительной договорённости.
          Уточнить стоимость или свободное время осмотра можно по телефону, в мессенджерах или
          через онлайн-калькулятор.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#13161C]">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Адрес</p>
                <p className="mt-1 text-base font-bold text-zinc-950 dark:text-white">
                  {settings.address}
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {settings.district}, ориентир — {settings.metro}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <Phone className="mt-1 size-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Телефоны</p>
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="mt-1 block text-lg font-bold text-zinc-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                >
                  {settings.phone}
                </a>
                {settings.secondaryPhones.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {settings.secondaryPhones.map((num) => (
                      <a
                        key={num}
                        href={`tel:${num.replace(/[^\d+]/g, "")}`}
                        className="hover:text-zinc-950 dark:hover:text-white"
                      >
                        {num}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <Clock className="mt-1 size-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">График работы</p>
                <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {settings.workHours}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <a
                href={settings.vkUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-zinc-300 px-4 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                ВКонтакте
                <ArrowUpRight className="size-3.5" />
              </a>
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-zinc-300 px-4 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Telegram
                <ArrowUpRight className="size-3.5" />
              </a>
              <a
                href={settings.maxUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-zinc-300 px-4 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                MAX
                <ArrowUpRight className="size-3.5" />
              </a>
              <Link
                to="/calculator"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Рассчитать стоимость
              </Link>
            </div>
          </article>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:col-span-7 dark:border-zinc-800 dark:bg-[#13161C]">
          <iframe
            title="Карта проезда — ГрафФар, Гранитная улица, 51"
            src="https://yandex.ru/map-widget/v1/?ll=30.430458%2C59.925331&z=15&pt=30.430458%2C59.925331%2Cpm2rdm"
            width="100%"
            height="420"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-full min-h-[360px] w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
