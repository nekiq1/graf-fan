import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Calculator, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CALCULATOR_OPTIONS,
  CAR_CLASSES,
  CONSENT_VERSION,
  SERVICE_CATEGORIES,
  formatExactRub,
  normalizeDigits,
  type QuoteRequest,
  type ServiceCategory,
} from "@/lib/graffar-data";
import { submitQuoteRequest } from "@/lib/notify";
import { useGraffarStore } from "@/lib/store";

export const Route = createFileRoute("/calculator")({
  validateSearch: (search: Record<string, unknown>): { service?: string } => ({
    service: typeof search.service === "string" ? search.service : undefined,
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const { service: initialServiceId } = Route.useSearch();
  const rawServices = useGraffarStore((s) => s.services);
  const services = useMemo(
    () => rawServices.filter((item) => item.active),
    [rawServices],
  );
  const settings = useGraffarStore((s) => s.settings);
  const addRequest = useGraffarStore((s) => s.addRequest);

  const initialService =
    services.find((s) => s.id === initialServiceId) ?? services[0];

  const [category, setCategory] = useState<ServiceCategory | "Все">(
    initialService?.category ?? "Все",
  );
  const [serviceId, setServiceId] = useState<string>(initialService?.id ?? "");
  const [carModel, setCarModel] = useState("");
  const [carClassId, setCarClassId] = useState<string>(CAR_CLASSES[0].id);
  const [selectedOptIds, setSelectedOptIds] = useState<string[]>([]);

  const [clientName, setClientName] = useState("");
  const [contactMethod, setContactMethod] =
    useState<QuoteRequest["contactMethod"]>("Телефон");
  const [contactValue, setContactValue] = useState("");
  const [comment, setComment] = useState("");

  const [consentPersonalData, setConsentPersonalData] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submittedRequest, setSubmittedRequest] = useState<QuoteRequest | null>(null);

  const categoryServices = useMemo(
    () =>
      category === "Все" ? services : services.filter((s) => s.category === category),
    [services, category],
  );

  const activeService =
    categoryServices.find((s) => s.id === serviceId) ??
    categoryServices[0] ??
    services[0];

  const carClass = CAR_CLASSES.find((c) => c.id === carClassId) ?? CAR_CLASSES[0];

  const selectedOptions = CALCULATOR_OPTIONS.filter((opt) =>
    selectedOptIds.includes(opt.id),
  );

  const estimatedPrice = useMemo(() => {
    if (!activeService || activeService.price <= 0) return 0;
    const base = Math.round(activeService.price * carClass.multiplier);
    const extras = selectedOptions.reduce((sum, opt) => sum + opt.addPrice, 0);
    return base + extras;
  }, [activeService, carClass, selectedOptions]);

  function toggleOption(id: string) {
    setSelectedOptIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleCategoryChange(nextCategory: ServiceCategory | "Все") {
    setCategory(nextCategory);
    const list =
      nextCategory === "Все"
        ? services
        : services.filter((s) => s.category === nextCategory);
    if (list[0]) {
      setServiceId(list[0].id);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!activeService) {
      setError("Выберите услугу для расчёта.");
      return;
    }
    if (carModel.trim().length < 2) {
      setError("Укажите марку и модель автомобиля (например, BMW F30 или Kia Sportage).");
      return;
    }
    if (clientName.trim().length < 2) {
      setError("Укажите ваше имя.");
      return;
    }
    if (contactMethod === "Телефон" && normalizeDigits(contactValue).length < 10) {
      setError("Введите корректный номер телефона (не менее 10 цифр).");
      return;
    }
    if (contactMethod !== "Телефон" && contactValue.trim().length < 3) {
      setError("Укажите ник, ссылку или номер для связи в выбранном мессенджере.");
      return;
    }
    if (!consentPersonalData) {
      setError("Для отправки заявки необходимо отметить согласие на обработку персональных данных.");
      return;
    }

    setBusy(true);
    try {
      const now = new Date().toISOString();
      const request: QuoteRequest = {
        id: `GF-${Date.now().toString(36).toUpperCase()}`,
        serviceId: activeService.id,
        serviceName: activeService.name,
        category: activeService.category,
        carModel: carModel.trim(),
        carClassLabel: carClass.label,
        selectedOptions: selectedOptions.map((o) => o.label),
        estimatedPrice,
        clientName: clientName.trim(),
        contactValue: contactValue.trim(),
        contactMethod,
        comment: comment.trim(),
        status: "новая",
        consentPersonalData: true,
        consentMarketing,
        consentVersion: CONSENT_VERSION,
        consentTimestamp: now,
        createdAt: now,
      };

      await submitQuoteRequest({ data: request });
      addRequest(request);
      setSubmittedRequest(request);
      setConsentPersonalData(false);
      setConsentMarketing(false);
    } catch {
      setError("Не удалось сохранить заявку на сервере. Повторите попытку или позвоните нам.");
    } finally {
      setBusy(false);
    }
  }

  if (submittedRequest) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-[#13161C]">
        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-7 shrink-0" />
          <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white">
            Заявка на расчёт отправлена
          </h1>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Запрос сохранён в системе студии под номером{" "}
          <span className="font-mono font-semibold text-zinc-950 dark:text-white">
            {submittedRequest.id}
          </span>
          . Мастер изучит задачу и свяжется с вами выбранным способом для уточнения стоимости.
        </p>

        <dl className="mt-6 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-[#0B0C10]">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500 dark:text-zinc-400">Услуга</dt>
            <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">
              {submittedRequest.serviceName}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500 dark:text-zinc-400">Автомобиль</dt>
            <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">
              {submittedRequest.carModel} ({submittedRequest.carClassLabel})
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500 dark:text-zinc-400">Предварительный расчёт</dt>
            <dd className="text-right font-bold tabular-nums text-zinc-950 dark:text-white">
              {submittedRequest.estimatedPrice > 0
                ? `~ ${formatExactRub(submittedRequest.estimatedPrice)}`
                : "По запросу после осмотра"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500 dark:text-zinc-400">Контакт</dt>
            <dd className="text-right text-zinc-900 dark:text-zinc-100">
              {submittedRequest.clientName} · {submittedRequest.contactMethod}:{" "}
              {submittedRequest.contactValue}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSubmittedRequest(null)}
            className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Сделать новый расчёт
          </button>
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-lg border border-zinc-300 px-5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Калькулятор стоимости · {settings.address}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
          Расчёт стоимости работ «ГрафФар»
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Выберите направление, укажите автомобиль и дополнительные работы. Итоговая смета зависит от
          конструкции фар и состояния автомобиля и подтверждается специалистом после осмотра.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#13161C]">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
              01. Категория и услуга
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange("Все")}
                className={`h-9 shrink-0 rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-colors ${
                  category === "Все"
                    ? "bg-blue-600 text-white"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-300"
                }`}
              >
                Все
              </button>
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`h-9 shrink-0 rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-colors ${
                    category === cat
                      ? "bg-blue-600 text-white"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Конкретная услуга
              <select
                value={activeService?.id ?? ""}
                onChange={(e) => setServiceId(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-[#0B0C10] dark:text-zinc-100"
              >
                {categoryServices.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name} ({svc.price > 0 ? formatExactRub(svc.price) : "по запросу"})
                  </option>
                ))}
              </select>
            </label>

            {activeService ? (
              <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {activeService.blurb}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#13161C]">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
              02. Данные автомобиля и доп. параметры
            </h2>

            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Марка, модель и год выпуска
                <input
                  type="text"
                  required
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="Например: BMW 3 Series F30, 2017"
                  className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-[#0B0C10] dark:text-zinc-100"
                />
              </label>

              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Тип кузова / объём работ
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {CAR_CLASSES.map((cls) => {
                    const active = cls.id === carClassId;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setCarClassId(cls.id)}
                        className={`rounded-xl border px-3 py-3 text-left text-xs font-medium transition-colors ${
                          active
                            ? "border-blue-600 bg-blue-600/10 text-blue-700 dark:bg-blue-600/20 dark:text-blue-300"
                            : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#0B0C10] dark:text-zinc-300"
                        }`}
                      >
                        <span className="block font-semibold">{cls.label}</span>
                        <span className="mt-1 block text-[11px] text-zinc-500 dark:text-zinc-400">
                          коэфф. {cls.multiplier.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Дополнительные работы (при необходимости)
                </p>
                <div className="mt-2 space-y-2">
                  {CALCULATOR_OPTIONS.map((opt) => {
                    const checked = selectedOptIds.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                          checked
                            ? "border-blue-600 bg-blue-600/5 dark:bg-blue-600/15"
                            : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#0B0C10]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOption(opt.id)}
                          className="mt-1 size-4 accent-blue-600"
                        />
                        <div className="text-xs">
                          <span className="block font-semibold text-zinc-900 dark:text-zinc-100">
                            {opt.label}
                          </span>
                          <span className="mt-0.5 block text-zinc-500 dark:text-zinc-400">
                            {opt.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="sticky top-24 space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#13161C]"
          >
            <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <Calculator className="size-4 text-blue-500" />
                Предварительная оценка
              </div>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-zinc-950 dark:text-white">
                {estimatedPrice > 0 ? `~ ${formatExactRub(estimatedPrice)}` : "По запросу"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                Расчёт является предварительным. Окончательная стоимость определяется специалистом
                после оценки автомобиля и конструкции оптики.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                03. Отправить заявку на уточнение стоимости
              </h2>

              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Ваше имя *
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Алексей"
                  className="mt-1.5 h-11 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-[#0B0C10] dark:text-zinc-100"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Способ связи
                  <select
                    value={contactMethod}
                    onChange={(e) =>
                      setContactMethod(e.target.value as QuoteRequest["contactMethod"])
                    }
                    className="mt-1.5 h-11 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-[#0B0C10] dark:text-zinc-100"
                  >
                    <option value="Телефон">Телефон</option>
                    <option value="Telegram">Telegram</option>
                    <option value="MAX">MAX</option>
                    <option value="ВКонтакте">ВКонтакте</option>
                  </select>
                </label>

                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {contactMethod === "Телефон" ? "Номер телефона *" : "Контакт в мессенджере *"}
                  <input
                    type={contactMethod === "Телефон" ? "tel" : "text"}
                    required
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={
                      contactMethod === "Телефон" ? "+7 (921) 000-00-00" : "@username или ссылка"
                    }
                    className="mt-1.5 h-11 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-[#0B0C10] dark:text-zinc-100"
                  />
                </label>
              </div>

              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Комментарий к задаче
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Опишите проблему (запотевание, слабый ближний свет, сколы, нужна полировка и т. д.)"
                  className="mt-1.5 w-full resize-none rounded-xl border border-zinc-300 bg-zinc-50 p-3.5 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-[#0B0C10] dark:text-zinc-100"
                />
              </label>
            </div>

            <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={consentPersonalData}
                  onChange={(e) => setConsentPersonalData(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-blue-600"
                />
                <span>
                  Я даю согласие на обработку указанных персональных данных для расчёта стоимости и
                  обратной связи по заявке в соответствии с{" "}
                  <Link
                    to="/legal"
                    className="font-medium text-blue-600 underline underline-offset-2 dark:text-blue-400"
                  >
                    Политикой обработки ПДн
                  </Link>{" "}
                  и{" "}
                  <Link
                    to="/legal"
                    className="font-medium text-blue-600 underline underline-offset-2 dark:text-blue-400"
                  >
                    Согласием на обработку данных
                  </Link>
                  .
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-blue-600"
                />
                <span>
                  Отдельно соглашаюсь получать информационные и рекламные сообщения о спецпредложениях
                  (необязательно).
                </span>
              </label>
            </div>

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="flex h-12 w-full items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? "Отправка…" : "Отправить заявку на расчёт"}
            </button>

            <p className="text-center text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Нажимая кнопку, вы подтверждаете ознакомление с{" "}
              <Link
                to="/legal"
                className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                Политикой обработки ПДн
              </Link>{" "}
              и{" "}
              <Link
                to="/legal"
                className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                реквизитами оператора
              </Link>
              . Расчёт не является публичной офертой.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
