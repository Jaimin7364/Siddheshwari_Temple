import { promises as fs } from "node:fs";
import path from "node:path";
import { kv } from "@vercel/kv";
import { TempleData } from "@/types/temple";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "temple-data.json");
const KV_DATA_KEY = "temple:data";
const isVercelRuntime = process.env.VERCEL === "1";
const hasKvConfig = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

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

  if (isVercelRuntime) {
    throw new Error(
      "Persistent storage is not configured. Add Vercel KV to this project.",
    );
  }

  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function makeId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${randomPart}`;
}
