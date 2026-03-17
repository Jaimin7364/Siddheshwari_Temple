import { promises as fs } from "node:fs";
import path from "node:path";
import { kv } from "@vercel/kv";
import { Redis } from "@upstash/redis";
import { TempleData } from "@/types/temple";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "temple-data.json");
const KV_DATA_KEY = "temple:data";
const isVercelRuntime = process.env.VERCEL === "1";
const hasKvConfig = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const hasUpstashConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const upstashRedis = hasUpstashConfig ? Redis.fromEnv() : null;

function createEmptyData(): TempleData {
  return {
    events: [],
    donors: [],
    announcements: [],
    aartiTimes: [],
  };
}

export async function readTempleData(): Promise<TempleData> {
  if (hasKvConfig) {
    const data = await kv.get<TempleData>(KV_DATA_KEY);
    return data ?? createEmptyData();
  }

  if (upstashRedis) {
    const data = await upstashRedis.get<TempleData>(KV_DATA_KEY);
    return data ?? createEmptyData();
  }

  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(fileContent) as TempleData;
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
