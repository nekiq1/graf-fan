import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { QuoteRequest, RequestStatus } from "@/lib/graffar-data";

export type NotifyResult = {
  delivered: boolean;
  channel: string;
  reason?: string;
};

type QuoteRequestRow = {
  id: string;
  service_id: string;
  service_name: string;
  category: string;
  car_model: string;
  car_class_label: string;
  selected_options: unknown;
  estimated_price: number;
  client_name: string;
  contact_value: string;
  contact_method: string;
  comment: string;
  status: string;
  consent_personal_data: boolean;
  consent_marketing: boolean;
  consent_version: string;
  consent_timestamp: string | Date;
  created_at: string | Date;
};

const globalAuthRef = globalThis as typeof globalThis & {
  __graffarSessionSecret__?: string;
};

function notifyChannel(): "telegram" | "vk" | "both" {
  const raw = (process.env.NOTIFY_CHANNEL || "telegram").toLowerCase();
  if (raw === "vk" || raw === "both" || raw === "telegram") return raw;
  return "telegram";
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendTelegram(text: string): Promise<NotifyResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chat = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chat) {
    return { delivered: false, channel: "telegram", reason: "telegram_env_missing" };
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chat,
      text: escapeHtml(text),
      parse_mode: "HTML",
    }),
  });
  if (!res.ok) return { delivered: false, channel: "telegram", reason: "telegram_failed" };
  return { delivered: true, channel: "telegram" };
}

async function sendVk(text: string): Promise<NotifyResult> {
  const token = process.env.VK_ACCESS_TOKEN?.trim();
  const peer = process.env.VK_PEER_ID?.trim();
  if (!token || !peer) return { delivered: false, channel: "vk", reason: "vk_env_missing" };
  const body = new URLSearchParams({
    access_token: token,
    peer_id: peer,
    random_id: String(Date.now()),
    message: text,
    v: process.env.VK_API_VERSION || "5.199",
  });
  const res = await fetch("https://api.vk.com/method/messages.send", { method: "POST", body });
  const json = (await res.json()) as { error?: { error_msg?: string } };
  if (!res.ok || json.error) return { delivered: false, channel: "vk", reason: "vk_failed" };
  return { delivered: true, channel: "vk" };
}

async function dispatchNotify(title: string, lines: string[]): Promise<NotifyResult> {
  const text = [title, ...lines].join("\n");
  const mode = notifyChannel();
  try {
    if (mode === "vk") return await sendVk(text);
    if (mode === "both") {
      const tg = await sendTelegram(text);
      const vk = await sendVk(text);
      return {
        delivered: tg.delivered || vk.delivered,
        channel: "both",
        reason: tg.delivered || vk.delivered ? undefined : tg.reason || vk.reason,
      };
    }
    return await sendTelegram(text);
  } catch {
    return { delivered: false, channel: mode, reason: "network" };
  }
}

async function sessionSecret(): Promise<string> {
  const envSecret = process.env.SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) return envSecret;
  if (!globalAuthRef.__graffarSessionSecret__) {
    const crypto = await import("node:crypto");
    globalAuthRef.__graffarSessionSecret__ = crypto.randomBytes(32).toString("hex");
  }
  return globalAuthRef.__graffarSessionSecret__;
}

async function signAdminToken(username: string): Promise<string> {
  const crypto = await import("node:crypto");
  const secret = await sessionSecret();
  const payloadB64 = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + 12 * 3600_000 }),
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

async function verifyAdminToken(token: string): Promise<{ username: string }> {
  const crypto = await import("node:crypto");
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("Unauthorized");
  const [payloadB64, sig] = parts;
  const secret = await sessionSecret();
  const expectedSig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Unauthorized");
  }
  const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
    u?: string;
    exp?: number;
  };
  if (!parsed.u || !parsed.exp || parsed.exp <= Date.now()) {
    throw new Error("Unauthorized");
  }
  return { username: parsed.u };
}

async function scryptHex(password: string, saltHex: string): Promise<string> {
  const crypto = await import("node:crypto");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, Buffer.from(saltHex, "hex"), 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
}

function mapRow(row: QuoteRequestRow): QuoteRequest {
  const opts = Array.isArray(row.selected_options)
    ? row.selected_options.map(String)
    : typeof row.selected_options === "string"
      ? (JSON.parse(row.selected_options) as string[])
      : [];
  const method =
    row.contact_method === "Telegram" ||
    row.contact_method === "MAX" ||
    row.contact_method === "ВКонтакте"
      ? row.contact_method
      : "Телефон";
  const status: RequestStatus =
    row.status === "в работе" || row.status === "завершена" ? row.status : "новая";
  return {
    id: row.id,
    serviceId: row.service_id,
    serviceName: row.service_name,
    category: row.category,
    carModel: row.car_model,
    carClassLabel: row.car_class_label,
    selectedOptions: opts,
    estimatedPrice: Number(row.estimated_price) || 0,
    clientName: row.client_name,
    contactValue: row.contact_value,
    contactMethod: method,
    comment: row.comment || "",
    status,
    consentPersonalData: true,
    consentMarketing: Boolean(row.consent_marketing),
    consentVersion: row.consent_version,
    consentTimestamp: new Date(row.consent_timestamp).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export const getAdminGateStatus = createServerFn({ method: "GET" }).handler(async () => {
  const hasEnvAdmin = Boolean(
    process.env.ADMIN_USERNAME?.trim() && process.env.ADMIN_PASSWORD?.trim(),
  );
  let dbUsername: string | undefined;
  if (!hasEnvAdmin) {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      const rows = await sql.query<{ username: string }>(
        "SELECT username FROM admin_credentials WHERE id = 1",
      );
      dbUsername = rows[0]?.username;
    } catch {
      dbUsername = undefined;
    }
  }
  return {
    mode: hasEnvAdmin ? ("env" as const) : dbUsername ? ("db" as const) : ("setup" as const),
    channel: notifyChannel(),
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim()),
    vk: Boolean(process.env.VK_ACCESS_TOKEN?.trim() && process.env.VK_PEER_ID?.trim()),
  };
});

const claimSchema = z.object({
  username: z.string().trim().min(2).max(80),
  password: z.string().min(6).max(160),
});

export const claimAdminAccount = createServerFn({ method: "POST" })
  .validator((data: unknown) => claimSchema.parse(data))
  .handler(async ({ data }) => {
    if (process.env.ADMIN_USERNAME?.trim() && process.env.ADMIN_PASSWORD?.trim()) {
      return { ok: false as const, error: "Учётная запись задаётся через переменные окружения." };
    }
    const crypto = await import("node:crypto");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const existing = await sql.query<{ id: number }>("SELECT id FROM admin_credentials WHERE id = 1");
    if (existing.length > 0) {
      return { ok: false as const, error: "Администратор уже создан. Выполните вход." };
    }
    const saltHex = crypto.randomBytes(16).toString("hex");
    const hashHex = await scryptHex(data.password, saltHex);
    await sql.query(
      "INSERT INTO admin_credentials (id, username, salt_hex, hash_hex) VALUES (1, $1, $2, $3) ON CONFLICT (id) DO NOTHING",
      [data.username, saltHex, hashHex],
    );
    const token = await signAdminToken(data.username);
    return { ok: true as const, token };
  });

const loginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(160),
});

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const crypto = await import("node:crypto");
    const envUser = process.env.ADMIN_USERNAME?.trim();
    const envPass = process.env.ADMIN_PASSWORD?.trim();

    if (envUser && envPass) {
      const userMatch = crypto.timingSafeEqual(
        crypto.createHash("sha256").update(data.username).digest(),
        crypto.createHash("sha256").update(envUser).digest(),
      );
      const passMatch = crypto.timingSafeEqual(
        crypto.createHash("sha256").update(data.password).digest(),
        crypto.createHash("sha256").update(envPass).digest(),
      );
      if (!userMatch || !passMatch) return { ok: false as const };
      const token = await signAdminToken(envUser);
      return { ok: true as const, token };
    }

    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ username: string; salt_hex: string; hash_hex: string }>(
      "SELECT username, salt_hex, hash_hex FROM admin_credentials WHERE id = 1",
    );
    const row = rows[0];
    if (!row) return { ok: false as const };
    const userMatch = crypto.timingSafeEqual(
      crypto.createHash("sha256").update(data.username).digest(),
      crypto.createHash("sha256").update(row.username).digest(),
    );
    const derived = await scryptHex(data.password, row.salt_hex);
    const passMatch = crypto.timingSafeEqual(
      Buffer.from(derived, "hex"),
      Buffer.from(row.hash_hex, "hex"),
    );
    if (!userMatch || !passMatch) return { ok: false as const };
    const token = await signAdminToken(row.username);
    return { ok: true as const, token };
  });

const submitQuoteSchema = z.object({
  id: z.string().min(3).max(40),
  serviceId: z.string().min(1).max(80),
  serviceName: z.string().min(1).max(180),
  category: z.string().min(1).max(120),
  carModel: z.string().min(2).max(160),
  carClassLabel: z.string().min(1).max(120),
  selectedOptions: z.array(z.string().max(180)).max(20),
  estimatedPrice: z.number().int().min(0).max(5_000_000),
  clientName: z.string().min(2).max(120),
  contactValue: z.string().min(3).max(180),
  contactMethod: z.enum(["Телефон", "Telegram", "MAX", "ВКонтакте"]),
  comment: z.string().max(1000),
  status: z.enum(["новая", "в работе", "завершена"]).optional(),
  consentPersonalData: z.literal(true),
  consentMarketing: z.boolean(),
  consentVersion: z.string().min(3).max(80),
  consentTimestamp: z.string().min(10).max(60),
  createdAt: z.string().min(10).max(60),
});

export const submitQuoteRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => submitQuoteSchema.parse(data))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query(
      `INSERT INTO quote_requests (
        id, service_id, service_name, category, car_model, car_class_label,
        selected_options, estimated_price, client_name, contact_value, contact_method,
        comment, status, consent_personal_data, consent_marketing, consent_version,
        consent_timestamp, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      ON CONFLICT (id) DO NOTHING`,
      [
        data.id,
        data.serviceId,
        data.serviceName,
        data.category,
        data.carModel,
        data.carClassLabel,
        JSON.stringify(data.selectedOptions),
        data.estimatedPrice,
        data.clientName,
        data.contactValue,
        data.contactMethod,
        data.comment,
        data.status ?? "новая",
        true,
        data.consentMarketing,
        data.consentVersion,
        data.consentTimestamp,
        data.createdAt,
      ],
    );

    const notify = await dispatchNotify(
      `Новая заявка «ГрафФар» · ${data.id}`,
      [
        `Услуга: ${data.serviceName}`,
        `Авто: ${data.carModel} (${data.carClassLabel})`,
        `Ориентир: ${data.estimatedPrice > 0 ? `${data.estimatedPrice} ₽` : "По запросу"}`,
        `Клиент: ${data.clientName} · ${data.contactMethod}: ${data.contactValue}`,
        data.comment ? `Комментарий: ${data.comment}` : "",
      ].filter(Boolean),
    );

    return { ok: true as const, id: data.id, notify };
  });

const authTokenSchema = z.object({ token: z.string().min(10).max(1000) });

export const listQuoteRequests = createServerFn({ method: "POST" })
  .validator((data: unknown) => authTokenSchema.parse(data))
  .handler(async ({ data }): Promise<QuoteRequest[]> => {
    await verifyAdminToken(data.token);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<QuoteRequestRow>(
      "SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 200",
    );
    return rows.map(mapRow);
  });

const updateStatusSchema = z.object({
  token: z.string().min(10).max(1000),
  id: z.string().min(3).max(40),
  status: z.enum(["новая", "в работе", "завершена"]),
});

export const updateQuoteRequestStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateStatusSchema.parse(data))
  .handler(async ({ data }) => {
    await verifyAdminToken(data.token);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query("UPDATE quote_requests SET status = $1 WHERE id = $2", [
      data.status,
      data.id,
    ]);
    return { ok: true as const };
  });

const deleteRequestSchema = z.object({
  token: z.string().min(10).max(1000),
  id: z.string().min(3).max(40),
});

export const deleteQuoteRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => deleteRequestSchema.parse(data))
  .handler(async ({ data }) => {
    await verifyAdminToken(data.token);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query("DELETE FROM quote_requests WHERE id = $1", [data.id]);
    return { ok: true as const };
  });

export const testNotify = createServerFn({ method: "POST" })
  .validator((data: unknown) => authTokenSchema.parse(data))
  .handler(async ({ data }): Promise<NotifyResult> => {
    await verifyAdminToken(data.token);
    return dispatchNotify("ГрафФар · Проверка уведомлений", [
      "Канал уведомлений для заявок с сайта работает корректно.",
    ]);
  });
