import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  Send,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CONSENT_VERSION, type QuoteRequest } from "@/lib/graffar-data";
import { submitQuoteRequest } from "@/lib/notify";
import { useGraffarStore } from "@/lib/store";
import { OfflineIndicator, PWAInstallButton } from "./PWAInstall";

const NAV_ITEMS = [
  { to: "/services", label: "Услуги" },
  { to: "/works", label: "Портфолио" },
  { to: "/calculator", label: "Калькулятор" },
  { to: "/contacts", label: "Контакты" },
] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const settings = useGraffarStore((s) => s.settings);
  const theme = useGraffarStore((s) => s.theme);
  const toggleTheme = useGraffarStore((s) => s.toggleTheme);
  const cookieConsent = useGraffarStore((s) => s.cookieConsent);
  const setCookieConsent = useGraffarStore((s) => s.setCookieConsent);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    void Promise.resolve(useGraffarStore.persist.rehydrate()).finally(() => {
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, hydrated]);

  useEffect(() => {
    document.title =
      settings.seoTitle || `${settings.brandShort} — Студия автосвета и детейлинга`;
  }, [settings.seoTitle, settings.brandShort]);

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 text-zinc-900 transition-colors dark:bg-[#050505] dark:text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#050505]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex shrink-0 items-center gap-3 rounded-xl text-left whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <img
              src={settings.logoImage || "/favicon.svg"}
              alt={`Логотип ${settings.brandShort}`}
              className="size-9 rounded-xl border border-zinc-300 object-cover dark:border-zinc-800"
            />
            <span className="shrink-0 text-lg font-bold tracking-tight whitespace-nowrap text-zinc-900 dark:text-zinc-100">
              {settings.brandShort}
            </span>
          </Link>

          <nav
            aria-label="Основная навигация"
            className="hidden items-center gap-7 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-400"
          >
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`shrink-0 py-1 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    active
                      ? "text-zinc-950 underline decoration-blue-600 decoration-2 underline-offset-8 dark:text-white"
                      : "hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
              title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
              className="grid size-9 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 active:scale-[0.97] dark:border-zinc-800 dark:bg-[#141416] dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            <Link
              to="/admin"
              aria-label="Кабинет администратора"
              title="Панель управления"
              className={`grid size-9 place-items-center rounded-xl border transition-colors active:scale-[0.97] ${
                pathname === "/admin"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#141416] dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <UserRound className="size-4" />
            </Link>

            <Link
              to="/calculator"
              className="hidden h-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-semibold whitespace-nowrap text-white shadow-sm shadow-blue-600/20 transition-all duration-150 hover:bg-blue-700 active:scale-[0.98] sm:inline-flex"
            >
              Рассчитать
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
              className="grid size-9 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-800 transition-transform active:scale-95 md:hidden dark:border-zinc-800 dark:bg-[#141416] dark:text-zinc-200"
            >
              {mobileMenuOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="animate-graffar-in border-t border-zinc-200 bg-zinc-50 px-4 py-4 md:hidden dark:border-zinc-800 dark:bg-[#0B0C10]">
            <nav aria-label="Мобильное меню" className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex h-11 items-center justify-between rounded-xl px-3.5 text-left text-sm font-medium transition-colors ${
                    pathname === item.to
                      ? "bg-zinc-200/70 text-zinc-950 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  {item.label}
                  <ArrowUpRight className="size-4 opacity-60" />
                </Link>
              ))}
              <Link
                to="/calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-all active:scale-[0.98]"
              >
                Рассчитать стоимость
              </Link>
              <div className="pt-1">
                <PWAInstallButton variant="full" />
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>

      <footer className="border-t border-zinc-200 bg-white/60 dark:border-zinc-800/90 dark:bg-[#090A0D]">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 sm:pb-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {settings.brandFull}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{settings.address}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{settings.workHours}</p>
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                className="mt-3 inline-block text-base font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
              >
                {settings.phone}
              </a>
              <div className="mt-4">
                <PWAInstallButton variant="compact" />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Разделы сайта
              </p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <Link to="/services" className="hover:text-zinc-950 dark:hover:text-white">
                    Услуги и направления
                  </Link>
                </li>
                <li>
                  <Link to="/works" className="hover:text-zinc-950 dark:hover:text-white">
                    Портфолио «До и После»
                  </Link>
                </li>
                <li>
                  <Link to="/calculator" className="hover:text-zinc-950 dark:hover:text-white">
                    Калькулятор стоимости
                  </Link>
                </li>
                <li>
                  <Link to="/contacts" className="hover:text-zinc-950 dark:hover:text-white">
                    Контакты и карта проезда
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Документы и реквизиты (152-ФЗ)
              </p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <Link
                    to="/legal"
                    className="underline decoration-zinc-400 underline-offset-4 hover:text-zinc-950 dark:hover:text-white"
                  >
                    Политика обработки персональных данных
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="hover:text-zinc-950 dark:hover:text-white">
                    Согласие на обработку ПДн и оферта
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="hover:text-zinc-950 dark:hover:text-white">
                    Политика использования файлов cookie
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-200 pt-6 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <p className="font-medium text-zinc-800 dark:text-zinc-300">
              Реквизиты оператора: {settings.legal.entityName} · ИНН: {settings.legal.inn} ·
              ОГРН/ОГРНИП: {settings.legal.ogrn} · Юр. адрес: {settings.legal.legalAddress} · Email:{" "}
              {settings.legal.email}
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} {settings.brandShort}. Информация на сайте носит
              справочный характер и не является публичной офертой. Итоговая стоимость работ
              определяется специалистом после осмотра автомобиля. Зарубежные сервисы аналитики
              (Google Analytics, Meta Pixel) на сайте не используются.
            </p>
          </div>
        </div>
      </footer>

      <QuickContactFab
        isAdmin={pathname === "/admin"}
        hidden={!hydrated || cookieConsent === "unset"}
        onOpenCalculator={() => void navigate({ to: "/calculator" })}
        onOpenLegal={() => void navigate({ to: "/legal" })}
      />
      <OfflineIndicator />

      {hydrated && cookieConsent === "unset" ? (
        <aside
          aria-label="Уведомление об использовании файлов cookie"
          className="fixed right-4 bottom-4 left-4 z-40 mx-auto max-w-3xl rounded-2xl border border-zinc-300 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-[#141416]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Использование технических файлов cookie
              </p>
              <p className="mt-1">
                Сайт использует локальное хранилище и технические cookie для сохранения выбранной
                темы и работы калькулятора. Подробнее в{" "}
                <Link
                  to="/legal"
                  className="font-medium text-blue-600 underline underline-offset-2 dark:text-blue-400"
                >
                  Политике использования файлов cookie
                </Link>
                .
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
              <button
                type="button"
                onClick={() => setCookieConsent("essential")}
                className="h-9 shrink-0 rounded-xl border border-zinc-300 px-3.5 text-xs font-medium whitespace-nowrap text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Только технические
              </button>
              <button
                type="button"
                onClick={() => setCookieConsent("all")}
                className="h-9 shrink-0 rounded-xl bg-blue-600 px-4 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-blue-700"
              >
                Принять
              </button>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

function QuickContactFab({
  isAdmin,
  hidden,
  onOpenCalculator,
  onOpenLegal,
}: {
  isAdmin: boolean;
  hidden: boolean;
  onOpenCalculator: () => void;
  onOpenLegal: () => void;
}) {
  const settings = useGraffarStore((s) => s.settings);
  const addRequest = useGraffarStore((s) => s.addRequest);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [question, setQuestion] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  if (hidden) return null;

  async function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg("");
    if (name.trim().length < 2 || phone.trim().length < 6 || question.trim().length < 3) {
      setStatusMsg("Укажите имя, телефон и краткий вопрос по автомобилю.");
      return;
    }
    if (!consent) {
      setStatusMsg("Необходимо отметить согласие на обработку персональных данных.");
      return;
    }
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const req: QuoteRequest = {
        id: `GF-${Date.now().toString(36).toUpperCase()}`,
        serviceId: "quick-message",
        serviceName: "Быстрый вопрос из виджета связи",
        category: "Автосвет и Bi-LED",
        carModel: "Уточнить по телефону",
        carClassLabel: "По запросу",
        selectedOptions: [],
        estimatedPrice: 0,
        clientName: name.trim(),
        contactValue: phone.trim(),
        contactMethod: "Телефон",
        comment: question.trim(),
        status: "новая",
        consentPersonalData: true,
        consentMarketing: false,
        consentVersion: CONSENT_VERSION,
        consentTimestamp: now,
        createdAt: now,
      };
      await submitQuoteRequest({ data: req });
      addRequest(req);
      setQuestion("");
      setConsent(false);
      setStatusMsg(`Обращение ${req.id} сохранено. Мастер свяжется с вами в рабочее время.`);
    } catch {
      setStatusMsg("Не удалось отправить обращение. Позвоните нам по телефону студии.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Связаться со студией ГрафФар"
        title="Связаться со студией"
        className={`fixed right-4 bottom-4 z-30 grid size-13 place-items-center rounded-2xl shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:right-5 sm:bottom-5 sm:size-14 ${
          isAdmin
            ? "bg-amber-500 text-zinc-950 shadow-amber-500/25"
            : "bg-blue-600 text-white shadow-blue-600/30"
        }`}
      >
        <MessageCircle className="size-6" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Быстрая связь со студией ГрафФар"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center"
        >
          <div className="animate-graffar-in w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-[#141416]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Связаться с «{settings.brandShort}»
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{settings.workHours}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть окно связи"
                className="grid size-9 place-items-center rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Telegram
              </a>
              <a
                href={settings.vkUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                ВКонтакте
              </a>
              <a
                href={settings.maxUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                MAX
              </a>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Phone className="size-3.5 text-amber-500" />
                Позвонить
              </a>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenCalculator();
                }}
                className="flex h-10 items-center justify-center rounded-xl border border-blue-600/30 bg-blue-600/10 text-xs font-semibold text-blue-600 hover:bg-blue-600/20 dark:text-blue-400"
              >
                Калькулятор цен
              </button>
            </div>

            <form
              onSubmit={handleQuickSubmit}
              className="mt-4 space-y-2.5 border-t border-zinc-200 pt-4 dark:border-zinc-800"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="h-11 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон для обратной связи"
                className="h-11 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100"
              />
              <textarea
                rows={2}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Марка авто и задача по свету или детейлингу"
                className="w-full resize-none rounded-xl border border-zinc-300 bg-zinc-50 p-3.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100"
              />
              <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-blue-600"
                />
                <span>
                  Согласен на обработку персональных данных для ответа по обращению согласно{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onOpenLegal();
                    }}
                    className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
                  >
                    Политике 152-ФЗ
                  </button>
                  .
                </span>
              </label>

              {statusMsg ? (
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{statusMsg}</p>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                <Send className="size-3.5" />
                {busy ? "Отправка…" : "Отправить вопрос"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
