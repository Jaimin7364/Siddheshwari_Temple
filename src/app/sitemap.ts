import type { MetadataRoute } from "next";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { readTempleData } from "@/lib/data-store";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

const PAGE_FILE_RE = /^page\.(tsx|ts|jsx|js|mdx)$/;

async function collectPageRoutes(directory: string, routes: Set<string>): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await collectPageRoutes(fullPath, routes);
      continue;
    }

    if (!entry.isFile() || !PAGE_FILE_RE.test(entry.name)) {
      continue;
    }

    const relativeDirectory = path.relative(path.join(process.cwd(), "src", "app"), directory);
    const rawSegments = relativeDirectory === "" ? [] : relativeDirectory.split(path.sep);

    const hasDynamicSegment = rawSegments.some((segment) => segment.startsWith("["));
    if (hasDynamicSegment) {
      continue;
    }

    const segments = rawSegments.filter(
      (segment) =>
        segment !== "api" &&
        !segment.startsWith("(") &&
        !segment.startsWith("@") &&
        !segment.startsWith("_"),
    );

    const route = segments.length === 0 ? "/" : `/${segments.join("/")}`;
    routes.add(route);
  }
}

async function getAllPageRoutes(): Promise<string[]> {
  const appDirectory = path.join(process.cwd(), "src", "app");
  const routes = new Set<string>();

  await collectPageRoutes(appDirectory, routes);

  return [...routes].sort((a, b) => {
    if (a === "/") {
      return -1;
    }
    if (b === "/") {
      return 1;
    }
    return a.localeCompare(b);
  });
}

async function resolveLastModified(): Promise<Date> {
  const data = await readTempleData();
  const timestamps: number[] = [];

  for (const event of data.events) {
    const createdAtTs = Date.parse(event.createdAt);
    if (!Number.isNaN(createdAtTs)) {
      timestamps.push(createdAtTs);
    }

    const eventDateTs = Date.parse(event.date);
    if (!Number.isNaN(eventDateTs)) {
      timestamps.push(eventDateTs);
    }
  }

  for (const announcement of data.announcements) {
    const createdAtTs = Date.parse(announcement.createdAt);
    if (!Number.isNaN(createdAtTs)) {
      timestamps.push(createdAtTs);
    }
  }

  if (timestamps.length === 0) {
    return new Date();
  }

  return new Date(Math.max(...timestamps));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [lastModified, routes] = await Promise.all([resolveLastModified(), getAllPageRoutes()]);

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
