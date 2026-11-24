import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Lock,
  LogOut,
  MapPin,
  Plus,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Stamp,
  Trash2,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CAR_CLASSES,
  CONSENT_VERSION,
  SERVICE_CATEGORIES,
  formatExactRub,
  type PortfolioCase,
  type PromoItem,
  type QuoteRequest,
  type RequestStatus,
  type ServiceCategory,
  type ServiceItem,
} from "@/lib/graffar-data";
import {
  claimAdminAccount,
  deleteQuoteRequest,
  getAdminGateStatus,
  listQuoteRequests,
  loginAdmin,
  submitQuoteRequest,
  testNotify,
  updateQuoteRequestStatus,
} from "@/lib/notify";
import { useGraffarStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type AdminPanelId =
  | "add-request"
  | "hours"
  | "contacts"
  | "cards"
  | "services"
  | "logo"
  | "hero"
  | "portfolio"
  | "promos"
  | "legal"
  | "backup"
  | null;

type GateInfo = {
  mode: "env" | "db" | "setup";
  channel: string;
  telegram: boolean;
  vk: boolean;
};

function AdminPage() {
  const store = useGraffarStore();
  const token = store.adminSessionToken;
  const unlocked = Boolean(token);

  const [gateInfo, setGateInfo] = useState<GateInfo | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [activePanel, setActivePanel] = useState<AdminPanelId>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "все">("все");
  const [notifyToast, setNotifyToast] = useState("");

  useEffect(() => {
    void getAdminGateStatus()
      .then((info) => setGateInfo(info))
      .catch(() => setGateInfo({ mode: "setup", channel: "telegram", telegram: false, vk: false }));
  }, []);

  useEffect(() => {
    if (!token) return;
    void listQuoteRequests({ data: { token } })
      .then((rows) => {
        useGraffarStore.getState().setRequests(rows);
      })
      .catch(() => {
        useGraffarStore.getState().setAdminSessionToken(null);
      });
  }, [token]);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    if (username.trim().length < 2) {
      setAuthError("Укажите логин администратора (не короче 2 символов).");
      return;
    }
    if (password.length < 6) {
      setAuthError("Задайте пароль не короче 6 символов.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Пароли не совпадают.");
      return;
    }
    setAuthBusy(true);
    try {
      const res = await claimAdminAccount({ data: { username: username.trim(), password } });
      if (!res.ok) {
        setAuthError(res.error);
        return;
      }
      store.setAdminSessionToken(res.token);
      setPassword("");
      setConfirmPassword("");
      setGateInfo((prev) => (prev ? { ...prev, mode: "db" } : prev));
    } catch {
      setAuthError("Не удалось сохранить учётную запись на сервере.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthBusy(true);
    try {
      const res = await loginAdmin({ data: { username: username.trim(), password } });
      if (!res.ok) {
        setAuthError("Неверный логин или пароль.");
        return;
      }
      store.setAdminSessionToken(res.token);
      setPassword("");
    } catch {
      setAuthError("Ошибка проверки доступа на сервере.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleStatusChange(id: string, nextStatus: RequestStatus) {
    store.setRequestStatus(id, nextStatus);
    if (!token) return;
    try {
      await updateQuoteRequestStatus({ data: { token, id, status: nextStatus } });
    } catch {
      // ignore if offline
    }
  }

  async function handleDeleteRequest(id: string) {
    store.removeRequest(id);
    if (!token) return;
    try {
      await deleteQuoteRequest({ data: { token, id } });
    } catch {
      // ignore if offline
    }
  }

  async function handleTestNotify() {
    if (!token) return;
    setNotifyToast("Отправка проверки…");
    try {
      const res = await testNotify({ data: { token } });
      setNotifyToast(
        res.delivered
          ? `Тест отправлен (${res.channel}).`
          : `Канал ${res.channel} не настроен в .env (${res.reason ?? "missing_env"}).`,
      );
    } catch {
      setNotifyToast("Ошибка проверки канала уведомлений.");
    }
  }

  if (!unlocked) {
    const needsSetup = gateInfo?.mode === "setup";
    return (
      <div className="mx-auto max-w-md space-y-6 rounded-[24px] border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800/90 dark:bg-[#141416]">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-blue-600/15 text-blue-500">
            <Lock className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-950 dark:text-white">
              {needsSetup ? "Первичная настройка доступа" : "Вход в админ-панель"}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Серверное управление заявками, услугами и портфолио «ГрафФар»
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          <p className="font-semibold">
            {needsSetup
              ? "Задайте логин и пароль владельца"
              : gateInfo?.mode === "env"
                ? "Включён доступ по переменным окружения (.env)"
                : "Защищённый вход администратора"}
          </p>
          <p className="mt-1">
            Учётные данные проверяются на сервере (scrypt + HMAC-сессия без хранения паролей в
            коде или браузере). Для продакшена задайте{" "}
            <code className="font-mono">ADMIN_USERNAME</code>,{" "}
            <code className="font-mono">ADMIN_PASSWORD</code> и{" "}
            <code className="font-mono">SESSION_SECRET</code>.
          </p>
        </div>

        <form onSubmit={needsSetup ? handleSetup : handleLogin} className="space-y-3">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Логин
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="mt-1.5 h-12 w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100"
            />
          </label>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {needsSetup ? "Новый пароль (от 6 символов)" : "Пароль"}
            <input
              type="password"
              autoComplete={needsSetup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 h-12 w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100"
            />
          </label>
          {needsSetup ? (
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Повторите пароль
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 h-12 w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100"
              />
            </label>
          ) : null}
          {authError ? <p className="text-xs text-red-500">{authError}</p> : null}
          <button
            type="submit"
            disabled={authBusy || !gateInfo}
            className="h-12 w-full rounded-full bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {needsSetup ? "Создать доступ и войти" : "Войти в панель"}
          </button>
        </form>
      </div>
    );
  }

  const newCount = store.requests.filter((r) => r.status === "новая").length;
  const workCount = store.requests.filter((r) => r.status === "в работе").length;
  const doneCount = store.requests.filter((r) => r.status === "завершена").length;
  const visibleRequests =
    statusFilter === "все"
      ? store.requests
      : store.requests.filter((r) => r.status === statusFilter);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Управление студией
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {store.settings.brandShort} · {store.settings.district}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestNotify}
            className="grid size-11 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#141416] dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Проверить Telegram/VK уведомления"
            title="Проверить уведомления"
          >
            <Bell className="size-4" />
          </button>
          <Link
            to="/"
            className="grid size-11 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#141416] dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="На витрину"
            title="Перейти на витрину"
          >
            <LogOut className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => store.setAdminSessionToken(null)}
            className="h-11 rounded-full border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#141416] dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Заблокировать
          </button>
        </div>
      </div>

      {notifyToast ? (
        <p className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs text-blue-600 dark:text-blue-300">
          {notifyToast}
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-2.5">
        <StatCard label="Новые" value={String(newCount)} />
        <StatCard label="В работе" value={String(workCount)} />
        <StatCard label="Завершены" value={String(doneCount)} />
      </div>

      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <ActionTile
            accent
            icon={<Plus className="size-4" />}
            label="Добавить заявку"
            onClick={() => setActivePanel("add-request")}
          />
          <ActionTile
            icon={<Clock className="size-4" />}
            label="Часы работы"
            onClick={() => setActivePanel("hours")}
          />
          <ActionTile
            icon={<MapPin className="size-4" />}
            label="Контакты"
            onClick={() => setActivePanel("contacts")}
          />
          <ActionTile
            icon={<SlidersHorizontal className="size-4" />}
            label="Карточки витрины"
            onClick={() => setActivePanel("cards")}
          />
          <ActionTile
            icon={<Wrench className="size-4" />}
            label="Услуги и цены"
            onClick={() => setActivePanel("services")}
          />
          <ActionTile
            icon={<Stamp className="size-4" />}
            label="Логотип"
            onClick={() => setActivePanel("logo")}
          />
          <ActionTile
            icon={<ImageIcon className="size-4" />}
            label="Главное фото"
            onClick={() => setActivePanel("hero")}
          />
          <ActionTile
            icon={<Upload className="size-4" />}
            label="Работы До/После"
            onClick={() => setActivePanel("portfolio")}
          />
        </div>

        <button
          type="button"
          onClick={() => setActivePanel("promos")}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800/90 dark:bg-[#141416] dark:text-zinc-100 dark:hover:bg-[#1C1C1F]"
        >
          <Sparkles className="size-4" />
          Акции ({(store.promos ?? []).filter((p) => p.active).length})
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <ActionTile
            icon={<FileText className="size-4" />}
            label="Реквизиты 152-ФЗ"
            onClick={() => setActivePanel("legal")}
          />
          <ActionTile
            icon={<Download className="size-4" />}
            label="JSON / Сброс"
            onClick={() => setActivePanel("backup")}
          />
        </div>
      </div>

      <section className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Заявки ({store.requests.length})
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {(["все", "новая", "в работе", "завершена"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`h-8 rounded-full px-3.5 text-xs font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-blue-600 text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#141416] dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {visibleRequests.length === 0 ? (
          <div className="rounded-[20px] border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800/90 dark:bg-[#141416] dark:text-zinc-400">
            Заявок с таким статусом пока нет. Нажмите «Добавить заявку» выше или отправьте расчёт со
            страницы калькулятора.
          </div>
        ) : (
          <div className="space-y-3">
            {visibleRequests.map((req) => (
              <article
                key={req.id}
                className="rounded-[20px] border border-zinc-200 bg-white p-5 dark:border-zinc-800/90 dark:bg-[#141416]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {req.id} · {new Date(req.createdAt).toLocaleString("ru-RU")}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-zinc-950 dark:text-white">
                      {req.serviceName}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      Авто: <strong>{req.carModel}</strong> ({req.carClassLabel})
                    </p>
                    {req.selectedOptions.length > 0 ? (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Доп. работы: {req.selectedOptions.join(", ")}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={req.status}
                      onChange={(e) =>
                        void handleStatusChange(req.id, e.target.value as RequestStatus)
                      }
                      aria-label="Статус заявки"
                      className="h-9 rounded-full border border-zinc-300 bg-zinc-50 px-3 text-xs font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-[#0B0C10] dark:text-zinc-100"
                    >
                      <option value="новая">новая</option>
                      <option value="в работе">в работе</option>
                      <option value="завершена">завершена</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void handleDeleteRequest(req.id)}
                      aria-label="Удалить заявку"
                      className="grid size-9 place-items-center rounded-full border border-zinc-200 text-zinc-500 hover:border-red-500/40 hover:text-red-500 dark:border-zinc-800"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 border-t border-zinc-200 pt-3 text-xs text-zinc-600 sm:grid-cols-3 dark:border-zinc-800 dark:text-zinc-300">
                  <div>
                    Клиент: <strong>{req.clientName}</strong>
                  </div>
                  <div>
                    {req.contactMethod}: <strong>{req.contactValue}</strong>
                  </div>
                  <div className="tabular-nums">
                    Ориентир:{" "}
                    <strong>
                      {req.estimatedPrice > 0 ? formatExactRub(req.estimatedPrice) : "По запросу"}
                    </strong>
                  </div>
                </div>

                {req.comment ? (
                  <p className="mt-2.5 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-[#0B0C10] dark:text-zinc-300">
                    Комментарий: {req.comment}
                  </p>
                ) : null}

                <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Согласие ПДн: {req.consentVersion} ·{" "}
                  {new Date(req.consentTimestamp).toLocaleString("ru-RU")} · Рассылка:{" "}
                  {req.consentMarketing ? "да" : "нет"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {activePanel ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={PANEL_TITLE[activePanel]}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center"
        >
          <div className="max-h-[88dvh] w-full max-w-xl overflow-y-auto rounded-[24px] border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-[#141416]">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                {PANEL_TITLE[activePanel]}
              </h2>
              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <X className="size-3.5" />
                Закрыть
              </button>
            </div>

            {activePanel === "add-request" ? (
              <AddRequestPanel onDone={() => setActivePanel(null)} />
            ) : null}
            {activePanel === "hours" ? <HoursPanel /> : null}
            {activePanel === "contacts" ? <ContactsPanel /> : null}
            {activePanel === "cards" ? <CardsPanel /> : null}
            {activePanel === "services" ? <ServicesPanel /> : null}
            {activePanel === "logo" ? <LogoPanel /> : null}
            {activePanel === "hero" ? <HeroPanel /> : null}
            {activePanel === "portfolio" ? <PortfolioPanel /> : null}
            {activePanel === "promos" ? <PromosPanel /> : null}
            {activePanel === "legal" ? <LegalPanel /> : null}
            {activePanel === "backup" ? <BackupPanel /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const PANEL_TITLE: Record<Exclude<AdminPanelId, null>, string> = {
  "add-request": "Новая заявка",
  hours: "Часы работы студии",
  contacts: "Контакты и ссылки",
  cards: "Карточки витрины",
  services: "Услуги и цены калькулятора",
  logo: "Логотип и бренд",
  hero: "Главное фото витрины",
  portfolio: "Портфолио «До и После»",
  promos: "Акции и спецпредложения",
  legal: "Реквизиты 152-ФЗ и SEO",
  backup: "Экспорт, импорт и сброс",
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-zinc-200 bg-white px-3 py-3.5 text-center dark:border-zinc-800/90 dark:bg-[#141416]">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-950 dark:text-white">{value}</p>
    </div>
  );
}

function ActionTile({
  accent,
  icon,
  label,
  onClick,
}: {
  accent?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-14 items-center justify-center gap-2 rounded-full px-3.5 py-2 text-center text-sm font-medium transition-colors ${
        accent
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800/90 dark:bg-[#141416] dark:text-zinc-100 dark:hover:bg-[#1C1C1F]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const inputCls =
  "mt-1.5 h-11 w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100";

const textareaCls =
  "mt-1.5 w-full rounded-2xl border border-zinc-300 bg-zinc-50 p-3.5 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-100";

function AddRequestPanel({ onDone }: { onDone: () => void }) {
  const rawServices = useGraffarStore((s) => s.services);
  const services = useMemo(
    () => rawServices.filter((item) => item.active),
    [rawServices],
  );
  const addRequest = useGraffarStore((s) => s.addRequest);

  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [carModel, setCarModel] = useState("");
  const [carClassId, setCarClassId] = useState(CAR_CLASSES[0].id);
  const [clientName, setClientName] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const svc = services.find((s) => s.id === serviceId);
    const carClass = CAR_CLASSES.find((c) => c.id === carClassId) ?? CAR_CLASSES[0];
    if (!svc || carModel.trim().length < 2 || clientName.trim().length < 2 || !contactValue.trim()) {
      setError("Заполните услугу, модель авто, имя и телефон клиента.");
      return;
    }
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const estimatedPrice = svc.price > 0 ? Math.round(svc.price * carClass.multiplier) : 0;
      const req: QuoteRequest = {
        id: `GF-${Date.now().toString(36).toUpperCase()}`,
        serviceId: svc.id,
        serviceName: svc.name,
        category: svc.category,
        carModel: carModel.trim(),
        carClassLabel: carClass.label,
        selectedOptions: [],
        estimatedPrice,
        clientName: clientName.trim(),
        contactValue: contactValue.trim(),
        contactMethod: "Телефон",
        comment: comment.trim() || "Добавлено администратором вручную",
        status: "в работе",
        consentPersonalData: true,
        consentMarketing: false,
        consentVersion: CONSENT_VERSION,
        consentTimestamp: now,
        createdAt: now,
      };
      await submitQuoteRequest({ data: req });
      addRequest(req);
      onDone();
    } catch {
      setError("Не удалось сохранить заявку в базе данных.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Услуга
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputCls}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Класс авто
        <select
          value={carClassId}
          onChange={(e) => setCarClassId(e.target.value)}
          className={inputCls}
        >
          {CAR_CLASSES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <input
        value={carModel}
        onChange={(e) => setCarModel(e.target.value)}
        placeholder="Марка и модель авто (например: BMW F30)"
        className={inputCls}
      />
      <input
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        placeholder="Имя клиента"
        className={inputCls}
      />
      <input
        value={contactValue}
        onChange={(e) => setContactValue(e.target.value)}
        placeholder="Телефон или @telegram"
        className={inputCls}
      />
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Примечание по работам"
        className={textareaCls}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="h-11 w-full rounded-full bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Сохранение…" : "Создать заявку"}
      </button>
    </form>
  );
}

function HoursPanel() {
  const settings = useGraffarStore((s) => s.settings);
  const updateSettings = useGraffarStore((s) => s.updateSettings);
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        График отображается в шапке витрины, футере и на странице контактов.
      </p>
      <Field
        label="Текстовый график работы"
        value={settings.workHours}
        onChange={(v) => updateSettings({ workHours: v })}
      />
      <Field
        label="Ориентир / метро"
        value={settings.metro}
        onChange={(v) => updateSettings({ metro: v })}
      />
    </div>
  );
}

function ContactsPanel() {
  const settings = useGraffarStore((s) => s.settings);
  const updateSettings = useGraffarStore((s) => s.updateSettings);
  return (
    <div className="space-y-3">
      <Field label="Район" value={settings.district} onChange={(v) => updateSettings({ district: v })} />
      <Field label="Адрес" value={settings.address} onChange={(v) => updateSettings({ address: v })} />
      <Field
        label="Основной телефон"
        value={settings.phone}
        onChange={(v) => updateSettings({ phone: v })}
      />
      <Field
        label="Доп. телефоны (через запятую)"
        value={settings.secondaryPhones.join(", ")}
        onChange={(v) =>
          updateSettings({
            secondaryPhones: v
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
      />
      <Field label="ВКонтакте" value={settings.vkUrl} onChange={(v) => updateSettings({ vkUrl: v })} />
      <Field
        label="Telegram"
        value={settings.telegramUrl}
        onChange={(v) => updateSettings({ telegramUrl: v })}
      />
      <Field label="MAX" value={settings.maxUrl} onChange={(v) => updateSettings({ maxUrl: v })} />
      <Field
        label="Ссылка Яндекс Карт"
        value={settings.yandexMapsUrl}
        onChange={(v) => updateSettings({ yandexMapsUrl: v })}
      />
    </div>
  );
}

function CardsPanel() {
  const settings = useGraffarStore((s) => s.settings);
  const updateSettings = useGraffarStore((s) => s.updateSettings);
  return (
    <div className="space-y-3">
      <Field
        label="Заголовок карточки 1 (рейтинг)"
        value={settings.cardRatingLabel}
        onChange={(v) => updateSettings({ cardRatingLabel: v })}
      />
      <Field
        label="Заголовок карточки 2 (услуги)"
        value={settings.cardServiceLabel}
        onChange={(v) => updateSettings({ cardServiceLabel: v })}
      />
      <Field
        label="Заголовок карточки 3 (бюджет)"
        value={settings.cardPriceLabel}
        onChange={(v) => updateSettings({ cardPriceLabel: v })}
      />
      <Field
        label="Главный заголовок Hero"
        value={settings.heroTitle}
        onChange={(v) => updateSettings({ heroTitle: v })}
      />
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Подзаголовок Hero
        <textarea
          rows={3}
          value={settings.heroSubtitle}
          onChange={(e) => updateSettings({ heroSubtitle: e.target.value })}
          className={textareaCls}
        />
      </label>
    </div>
  );
}

function LogoPanel() {
  const settings = useGraffarStore((s) => s.settings);
  const updateSettings = useGraffarStore((s) => s.updateSettings);

  return (
    <div className="space-y-3">
      <Field
        label="Монограмма (до 4 символов)"
        value={settings.monogram}
        onChange={(v) => updateSettings({ monogram: v.slice(0, 4).toUpperCase() })}
      />
      <Field
        label="Короткое название в шапке"
        value={settings.brandShort}
        onChange={(v) => updateSettings({ brandShort: v })}
      />
      <Field
        label="Полное название"
        value={settings.brandFull}
        onChange={(v) => updateSettings({ brandFull: v })}
      />
      <FilePickerButton
        label="Загрузить свой логотип (PNG/JPG/SVG)"
        onPick={(dataUrl) => updateSettings({ logoImage: dataUrl })}
      />
      {settings.logoImage ? (
        <button
          type="button"
          onClick={() => updateSettings({ logoImage: "" })}
          className="h-11 w-full rounded-full border border-zinc-300 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Вернуть фирменный знак «ГрафФар»
        </button>
      ) : null}
    </div>
  );
}

function HeroPanel() {
  const settings = useGraffarStore((s) => s.settings);
  const updateSettings = useGraffarStore((s) => s.updateSettings);
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
        <img
          src={settings.heroImage}
          alt="Предпросмотр главного фото"
          style={{
            transform: `scale(${settings.heroScale ?? 1}) translate(${settings.heroX ?? 0}%, ${settings.heroY ?? 0}%)`,
          }}
          className="h-44 w-full object-cover"
        />
      </div>
      <FilePickerButton
        label="Загрузить новое главное фото"
        onPick={(dataUrl) => updateSettings({ heroImage: dataUrl, heroImageIsPlaceholder: false })}
      />
      <Field
        label="Путь или URL фото"
        value={settings.heroImage}
        onChange={(v) => updateSettings({ heroImage: v })}
      />
      <RangeSlider
        label={`Масштаб (${(settings.heroScale ?? 1).toFixed(2)}×)`}
        min={1}
        max={1.8}
        step={0.01}
        value={settings.heroScale ?? 1}
        onChange={(heroScale) => updateSettings({ heroScale })}
      />
      <RangeSlider
        label={`Сдвиг по X (${settings.heroX ?? 0}%)`}
        min={-25}
        max={25}
        step={1}
        value={settings.heroX ?? 0}
        onChange={(heroX) => updateSettings({ heroX })}
      />
      <RangeSlider
        label={`Сдвиг по Y (${settings.heroY ?? 0}%)`}
        min={-25}
        max={25}
        step={1}
        value={settings.heroY ?? 0}
        onChange={(heroY) => updateSettings({ heroY })}
      />
      <Field
        label="Надпись-бейдж на фото"
        value={settings.heroBadge}
        onChange={(v) => updateSettings({ heroBadge: v })}
      />
      <Field
        label="Подпись на фото"
        value={settings.heroCaption}
        onChange={(v) => updateSettings({ heroCaption: v })}
      />
    </div>
  );
}

function ServicesPanel() {
  const services = useGraffarStore((s) => s.services);
  const upsertService = useGraffarStore((s) => s.upsertService);
  const removeService = useGraffarStore((s) => s.removeService);
  const toggleServiceActive = useGraffarStore((s) => s.toggleServiceActive);

  function addBlankService() {
    upsertService({
      id: `svc-${Date.now()}`,
      category: SERVICE_CATEGORIES[0],
      name: "Новая услуга студии",
      price: 0,
      durationLabel: "По согласованию при осмотре",
      blurb: "Описание работ и особенностей выполнения.",
      includes: [],
      active: true,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Цена 0 ₽ отображается как «По запросу». Любое число автоматически учитывается в калькуляторе.
        </p>
        <button
          type="button"
          onClick={addBlankService}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-3.5" />
          Добавить
        </button>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <ServiceEditorCard
            key={service.id}
            service={service}
            onSave={upsertService}
            onToggle={() => toggleServiceActive(service.id)}
            onDelete={() => removeService(service.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceEditorCard({
  service,
  onSave,
  onToggle,
  onDelete,
}: {
  service: ServiceItem;
  onSave: (s: ServiceItem) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(service);
  const [savedFlag, setSavedFlag] = useState(false);

  function save() {
    onSave(draft);
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 1400);
  }

  return (
    <div className="space-y-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#0B0C10]">
      <div className="flex items-center justify-between gap-2">
        <select
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value as ServiceCategory })}
          className="h-9 rounded-full border border-zinc-300 bg-white px-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-[#141416] dark:text-zinc-100"
        >
          {SERVICE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-9 items-center gap-1 rounded-full border border-zinc-300 px-3 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
          >
            {service.active ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {service.active ? "Активна" : "Скрыта"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Удалить услугу"
            className="grid size-9 place-items-center rounded-full border border-zinc-300 text-zinc-500 hover:text-red-500 dark:border-zinc-700"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <input
        type="text"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        placeholder="Название услуги"
        className={inputCls}
      />

      <div className="grid grid-cols-2 gap-2">
        <label className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Цена (₽, 0 = По запросу)
          <input
            type="number"
            min={0}
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: Math.max(0, Number(e.target.value)) })}
            className={inputCls}
          />
        </label>
        <label className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Срок выполнения
          <input
            type="text"
            value={draft.durationLabel}
            onChange={(e) => setDraft({ ...draft, durationLabel: e.target.value })}
            className={inputCls}
          />
        </label>
      </div>

      <textarea
        rows={2}
        value={draft.blurb}
        onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
        className={textareaCls}
      />

      <button
        type="button"
        onClick={save}
        className="h-10 w-full rounded-full bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
      >
        {savedFlag ? "Сохранено" : "Сохранить услугу"}
      </button>
    </div>
  );
}

function PortfolioPanel() {
  const portfolio = useGraffarStore((s) => s.portfolio);
  const upsertCase = useGraffarStore((s) => s.upsertCase);
  const removeCase = useGraffarStore((s) => s.removeCase);

  function addCase() {
    upsertCase({
      id: `case-${Date.now()}`,
      category: SERVICE_CATEGORIES[0],
      title: "Новый кейс «До и После»",
      carModel: "Марка и модель авто",
      description: "Краткое описание выполненной работы.",
      beforeImage: "/images/portfolio/biled-before.svg",
      afterImage: "/images/portfolio/biled-after.svg",
      beforeCaption: "До",
      afterCaption: "После",
      isPlaceholder: true,
      publishedAt: "Добавлено администратором",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Загружайте пары фотографий «До» и «После» для слайдера на сайте.
        </p>
        <button
          type="button"
          onClick={addCase}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-3.5" />
          Добавить кейс
        </button>
      </div>

      <div className="space-y-3">
        {portfolio.map((item) => (
          <CaseEditorCard
            key={item.id}
            item={item}
            onSave={upsertCase}
            onDelete={() => removeCase(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CaseEditorCard({
  item,
  onSave,
  onDelete,
}: {
  item: PortfolioCase;
  onSave: (c: PortfolioCase) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(item);
  const [savedFlag, setSavedFlag] = useState(false);

  function save() {
    onSave(draft);
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 1400);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#0B0C10]">
      <div className="flex items-center justify-between gap-2">
        <select
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value as ServiceCategory })}
          className="h-9 rounded-full border border-zinc-300 bg-white px-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-[#141416] dark:text-zinc-100"
        >
          {SERVICE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Удалить кейс"
          className="grid size-9 place-items-center rounded-full border border-zinc-300 text-zinc-500 hover:text-red-500 dark:border-zinc-700"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1.5">
          <img
            src={draft.beforeImage}
            alt="До"
            className="aspect-[4/3] w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
          />
          <FilePickerButton
            label="Фото «До»"
            onPick={(url) =>
              setDraft((prev) => ({
                ...prev,
                beforeImage: url,
                isPlaceholder: false,
                placeholderNote: undefined,
              }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <img
            src={draft.afterImage}
            alt="После"
            className="aspect-[4/3] w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
          />
          <FilePickerButton
            label="Фото «После»"
            onPick={(url) =>
              setDraft((prev) => ({
                ...prev,
                afterImage: url,
                isPlaceholder: false,
                placeholderNote: undefined,
              }))
            }
          />
        </div>
      </div>

      <input
        type="text"
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder="Заголовок кейса"
        className={inputCls}
      />
      <input
        type="text"
        value={draft.carModel}
        onChange={(e) => setDraft({ ...draft, carModel: e.target.value })}
        placeholder="Модель авто"
        className={inputCls}
      />
      <textarea
        rows={2}
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        className={textareaCls}
      />
      <button
        type="button"
        onClick={save}
        className="h-10 w-full rounded-full bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
      >
        {savedFlag ? "Кейс сохранён" : "Сохранить кейс"}
      </button>
    </div>
  );
}

function PromosPanel() {
  const rawPromos = useGraffarStore((s) => s.promos);
  const promos = rawPromos ?? [];
  const upsertPromo = useGraffarStore((s) => s.upsertPromo);
  const removePromo = useGraffarStore((s) => s.removePromo);

  return (
    <div className="space-y-3">
      {promos.map((promo) => (
        <PromoEditorCard
          key={promo.id}
          promo={promo}
          onSave={upsertPromo}
          onDelete={() => removePromo(promo.id)}
        />
      ))}
      <button
        type="button"
        onClick={() =>
          upsertPromo({
            id: `promo-${Date.now()}`,
            title: "Новое спецпредложение",
            text: "",
            active: true,
          })
        }
        className="h-11 w-full rounded-full bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
      >
        Добавить акцию
      </button>
    </div>
  );
}

function PromoEditorCard({
  promo,
  onSave,
  onDelete,
}: {
  promo: PromoItem;
  onSave: (p: PromoItem) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(promo);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#0B0C10]">
      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder="Заголовок акции"
        className={inputCls}
      />
      <textarea
        rows={2}
        value={draft.text}
        onChange={(e) => setDraft({ ...draft, text: e.target.value })}
        placeholder="Условия предложения"
        className={textareaCls}
      />
      <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={draft.active}
          onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
          className="size-4 accent-blue-600"
        />
        Показывать баннер на главной странице
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            onSave(draft);
            setSaved(true);
            setTimeout(() => setSaved(false), 1400);
          }}
          className="h-10 rounded-full bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
        >
          {saved ? "Сохранено" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="h-10 rounded-full border border-zinc-300 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}

function LegalPanel() {
  const settings = useGraffarStore((s) => s.settings);
  const updateSettings = useGraffarStore((s) => s.updateSettings);
  const updateLegal = useGraffarStore((s) => s.updateLegal);

  return (
    <div className="space-y-3">
      <Field
        label="Наименование ЮЛ / ФИО ИП"
        value={settings.legal.entityName}
        onChange={(v) => updateLegal({ entityName: v })}
      />
      <Field label="ИНН" value={settings.legal.inn} onChange={(v) => updateLegal({ inn: v })} />
      <Field
        label="ОГРН / ОГРНИП"
        value={settings.legal.ogrn}
        onChange={(v) => updateLegal({ ogrn: v })}
      />
      <Field
        label="Юридический / почтовый адрес"
        value={settings.legal.legalAddress}
        onChange={(v) => updateLegal({ legalAddress: v })}
      />
      <Field
        label="Email для обращений по ПДн"
        value={settings.legal.email}
        onChange={(v) => updateLegal({ email: v })}
      />
      <Field
        label="Ответственное лицо"
        value={settings.legal.responsiblePerson}
        onChange={(v) => updateLegal({ responsiblePerson: v })}
      />
      <Field
        label="SEO Title страницы"
        value={settings.seoTitle}
        onChange={(v) => updateSettings({ seoTitle: v })}
      />
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        SEO Description
        <textarea
          rows={2}
          value={settings.seoDescription}
          onChange={(e) => updateSettings({ seoDescription: e.target.value })}
          className={textareaCls}
        />
      </label>
    </div>
  );
}

function BackupPanel() {
  const store = useGraffarStore();
  const [message, setMessage] = useState("");

  function exportJson() {
    const payload = {
      settings: store.settings,
      services: store.services,
      portfolio: store.portfolio,
      promos: store.promos,
      requests: store.requests,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graffar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Резервная копия JSON выгружена.");
  }

  function handleImport(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = store.importJsonState(String(reader.result));
      setMessage(res.ok ? "Данные успешно импортированы." : res.error || "Ошибка импорта.");
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        Выгружайте резервную копию всех услуг, портфолио, контактов и заявок в JSON или восстановите
        исходные данные «ГрафФар».
      </p>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={exportJson}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Download className="size-4" />
          Скачать JSON-бэкап
        </button>

        <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-zinc-300 px-4 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
          <Upload className="size-4" />
          Загрузить JSON
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => handleImport(e.target.files?.[0])}
          />
        </label>

        <button
          type="button"
          onClick={() => {
            store.resetToDefaults();
            setMessage("Услуги, портфолио и контакты сброшены к данным «ГрафФар».");
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-amber-500/40 px-4 text-xs font-semibold text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
        >
          <RotateCcw className="size-4" />
          Сбросить к данным «ГрафФар»
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-400">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <span>
          Сброс восстанавливает базовый каталог «ГрафФар», не удаляя поступившие заявки клиентов.
        </span>
      </div>

      {message ? <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{message}</p> : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-blue-600"
      />
    </label>
  );
}

function FilePickerButton({
  label,
  onPick,
}: {
  label: string;
  onPick: (dataUrl: string) => void;
}) {
  const [error, setError] = useState("");
  return (
    <label className="flex h-10 cursor-pointer items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
      {error || label}
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (file.size > 1_200_000) {
            setError("Файл больше 1,2 МБ");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            setError("");
            onPick(String(reader.result));
          };
          reader.readAsDataURL(file);
        }}
      />
    </label>
  );
}
