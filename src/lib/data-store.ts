import { promises as fs } from "node:fs";
import path from "node:path";
import { TempleData } from "@/types/temple";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "temple-data.json");

const emptyData: TempleData = {
  events: [],
  donors: [],
  announcements: [],
  aartiTimes: [],
};

export async function readTempleData(): Promise<TempleData> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(fileContent) as TempleData;
  } catch {
    return emptyData;
  }
}

export async function writeTempleData(data: TempleData): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function makeId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${randomPart}`;
}
