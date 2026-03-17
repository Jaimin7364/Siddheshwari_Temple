import { promises as fs } from "node:fs";
import path from "node:path";
import { kv } from "@vercel/kv";
import { Redis } from "@upstash/redis";
import { TempleData, TempleSettings } from "@/types/temple";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "temple-data.json");
const KV_DATA_KEY = "temple:data";
const isVercelRuntime = process.env.VERCEL === "1";
const hasKvConfig = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const hasUpstashConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const upstashRedis = hasUpstashConfig ? Redis.fromEnv() : null;

export const defaultTempleSettings: TempleSettings = {
  upiIds: ["ravaly950@oksbi"],
  templeName: "Siddheshwari Mataji Temple Rampura",
  templeAddress: "Rampura, Gujarat, India",
  thankYouNote:
    "Thank you for your valuable donation. May Siddheshwari Mataji bless you and your family.",
};

function createEmptyData(): TempleData {
  return {
    events: [],
    donors: [],
    announcements: [],
    aartiTimes: [],
    settings: defaultTempleSettings,
  };
}

function normalizeTempleData(input: TempleData): TempleData {
  return {
    ...input,
    events: input.events ?? [],
    donors: input.donors ?? [],
    announcements: input.announcements ?? [],
    aartiTimes: input.aartiTimes ?? [],
    settings: {
      ...defaultTempleSettings,
      ...(input.settings ?? {}),
      upiIds:
        input.settings?.upiIds && input.settings.upiIds.length > 0
          ? input.settings.upiIds
          : defaultTempleSettings.upiIds,
    },
  };
}

export async function readTempleData(): Promise<TempleData> {
  if (hasKvConfig) {
    const data = await kv.get<TempleData>(KV_DATA_KEY);
    return data ? normalizeTempleData(data) : createEmptyData();
  }

  if (upstashRedis) {
    const data = await upstashRedis.get<TempleData>(KV_DATA_KEY);
    return data ? normalizeTempleData(data) : createEmptyData();
  }

  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return normalizeTempleData(JSON.parse(fileContent) as TempleData);
  } catch {
    return createEmptyData();
  }
}

export async function writeTempleData(data: TempleData): Promise<void> {
  if (hasKvConfig) {
    await kv.set(KV_DATA_KEY, data);
    return;
  }

  if (upstashRedis) {
    await upstashRedis.set(KV_DATA_KEY, data);
    return;
  }

  if (isVercelRuntime) {
    throw new Error(
      "Persistent storage is not configured. Add Vercel Redis/KV integration and set env vars.",
    );
  }

  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function makeId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${randomPart}`;
}
