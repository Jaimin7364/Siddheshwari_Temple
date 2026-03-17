import { ADMIN_PASSWORD } from "@/lib/admin-config";
import { makeId, readTempleData, writeTempleData } from "@/lib/data-store";
import { Announcement } from "@/types/temple";
import { NextRequest, NextResponse } from "next/server";

function hasValidAdminPassword(request: NextRequest): boolean {
  return request.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET() {
  const data = await readTempleData();
  const announcements = [...data.announcements].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return NextResponse.json(announcements);
}

export async function POST(request: NextRequest) {
  if (!hasValidAdminPassword(request)) {
    return NextResponse.json({ message: "Invalid admin password" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<Announcement>;

  if (!body.title || !body.message) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const data = await readTempleData();

  const announcement: Announcement = {
    id: makeId("announcement"),
    title: body.title,
    message: body.message,
    createdAt: new Date().toISOString(),
  };

  data.announcements = [...data.announcements, announcement]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-2);
  await writeTempleData(data);

  return NextResponse.json(announcement, { status: 201 });
}
