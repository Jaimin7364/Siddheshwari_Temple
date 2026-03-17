import { ADMIN_PASSWORD } from "@/lib/admin-config";
import { makeId, readTempleData, writeTempleData } from "@/lib/data-store";
import { AartiTime } from "@/types/temple";
import { NextRequest, NextResponse } from "next/server";

function hasValidAdminPassword(request: NextRequest): boolean {
  return request.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET() {
  const data = await readTempleData();
  return NextResponse.json(data.aartiTimes);
}

export async function POST(request: NextRequest) {
  if (!hasValidAdminPassword(request)) {
    return NextResponse.json({ message: "Invalid admin password" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<AartiTime>;

  if (!body.name || !body.time) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const data = await readTempleData();

  const aartiTime: AartiTime = {
    id: makeId("aarti"),
    name: body.name,
    time: body.time,
    notes: body.notes,
  };

  data.aartiTimes.push(aartiTime);
  await writeTempleData(data);

  return NextResponse.json(aartiTime, { status: 201 });
}
