import { ADMIN_PASSWORD } from "@/lib/admin-config";
import { defaultTempleSettings, readTempleData, writeTempleData } from "@/lib/data-store";
import { TempleSettings } from "@/types/temple";
import { NextRequest, NextResponse } from "next/server";

function hasValidAdminPassword(request: NextRequest): boolean {
  return request.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET() {
  const data = await readTempleData();
  return NextResponse.json(data.settings ?? defaultTempleSettings);
}

export async function PUT(request: NextRequest) {
  try {
    if (!hasValidAdminPassword(request)) {
      return NextResponse.json({ message: "Invalid admin password" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<TempleSettings>;
    const upiIds = (body.upiIds ?? []).map((upi) => upi.trim()).filter(Boolean);

    if (upiIds.length === 0) {
      return NextResponse.json({ message: "At least one UPI ID is required" }, { status: 400 });
    }

    const data = await readTempleData();
    data.settings = {
      ...defaultTempleSettings,
      ...data.settings,
      ...body,
      upiIds,
    };

    await writeTempleData(data);
    return NextResponse.json(data.settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ message }, { status: 500 });
  }
}
