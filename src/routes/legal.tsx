import { createFileRoute } from "@tanstack/react-router";
import { CONSENT_VERSION } from "@/lib/graffar-data";
import { useGraffarStore } from "@/lib/store";

export const Route = createFileRoute("/legal")({ component: LegalPage });

function LegalPage() {
  const settings = useGraffarStore((s) => s.settings);
  const { legal } = settings;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Юридическая информация и соответствие 152-ФЗ (РФ, 2026)
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
          Политика обработки персональных данных и реквизиты
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Перед публикацией сайта владелец студии «{settings.brandShort}» должен заполнить поля с
          фактическими регистрационными реквизитами в админ-панели (раздел «Реквизиты 152-ФЗ»)
          и сверить текст документов с юристом.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#13161C]">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
          1. Сведения об операторе и реквизиты
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-[#0B0C10]">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Наименование ЮЛ / ИП</dt>
            <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
              {legal.entityName}
            </dd>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-[#0B0C10]">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">ИНН / ОГРН (ОГРНИП)</dt>
            <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
              {legal.inn} · {legal.ogrn}
            </dd>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-[#0B0C10]">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">
              Юридический / почтовый адрес
            </dt>
            <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
              {legal.legalAddress}
            </dd>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-[#0B0C10]">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Адрес оказания услуг и связь</dt>
            <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
              {settings.address} · {settings.phone} · {legal.email}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-300">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
          2. Политика обработки персональных данных (ст. 18.1 № 152-ФЗ)
        </h2>
        <p>
          <strong>2.1. Точные цели обработки:</strong> приём и обработка заявок на расчёт стоимости
          услуг автосвета и детейлинга, обратная связь с пользователем по телефону или в выбранном
          мессенджере, подготовка предварительной оценки работ.
        </p>
        <p>
          <strong>2.2. Категории собираемых данных (минимизация по ч. 5 ст. 5 № 152-ФЗ):</strong>{" "}
          имя, номер телефона или идентификатор в мессенджере, марка/модель и класс автомобиля,
          комментарий по задаче, технические метаданные фиксации согласия (дата, время, версия
          согласия). Избыточные данные через сайт не запрашиваются.
        </p>
        <p>
          <strong>2.3. Правовые основания:</strong> Федеральный закон № 152-ФЗ «О персональных
          данных», добровольное отдельное согласие субъекта персональных данных, а также
          необходимость рассмотрения обращения клиента.
        </p>
        <p>
          <strong>2.4. Категории субъектов:</strong> физические лица — посетители сайта и
          автовладельцы, направившие заявку через калькулятор стоимости или обратившиеся в студию.
        </p>
        <p>
          <strong>2.5. Порядок, локализация и сроки уничтожения:</strong> при размещении на сервере в
          РФ базы данных размещаются на российских площадках (ч. 5 ст. 18 № 152-ФЗ). Данные хранятся
          до достижения целей обработки либо до отзыва согласия субъектом, после чего подлежат
          удалению в установленный законом срок (до 30 дней по обращению на email оператора).
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-300">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
          3. Согласие на обработку ПДн (версия {CONSENT_VERSION})
        </h2>
        <p>
          Чекбоксы согласия в формах сайта всегда пусты по умолчанию и не объединяются с текстом
          публичной оферты. Пользователь самостоятельно отмечает согласие на обработку данных для
          ответа по заявке. Согласие на получение информационных и рекламных сообщений (ст. 18
          Закона «О рекламе») вынесено в отдельный необязательный чекбокс.
        </p>
        <p>
          Для отзыва согласия направьте обращение на адрес электронной почты оператора (
          {legal.email}) или по телефону студии {settings.phone}.
        </p>
      </section>

      <section
        id="cookies"
        className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-300"
      >
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
          4. Политика использования файлов Cookie и локального хранилища
        </h2>
        <p>
          На сайте не подключены зарубежные системы аналитики и рекламные трекеры (Google Analytics,
          Google Tag Manager, Meta Pixel). Шрифты подключены локально без обращений к внешним
          шрифтовым CDN.
        </p>
        <p>
          Используются только технические данные браузера (<code>localStorage</code>) для сохранения
          выбранной темы оформления, состояния калькулятора и факта выбора в cookie-баннере. Вы
          можете в любой момент очистить данные сайта или отключить cookie в настройках браузера.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-[#13161C] dark:text-zinc-300">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
          5. Информация об услугах и предварительном расчёте
        </h2>
        <p className="mt-2">
          Материалы, размещённые на сайте (описания направлений, расчёты калькулятора, примеры работ),
          носят информационный характер и не являются публичной офертой по смыслу ст. 437 ГК РФ.
          Окончательная стоимость и сроки выполнения работ определяются мастером после осмотра
          автомобиля.
        </p>
      </section>
    </div>
  );
}
