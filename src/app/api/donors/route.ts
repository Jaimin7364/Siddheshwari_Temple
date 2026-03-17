import { ADMIN_PASSWORD } from "@/lib/admin-config";
import { makeId, readTempleData, writeTempleData } from "@/lib/data-store";
import { Donor } from "@/types/temple";
import { NextRequest, NextResponse } from "next/server";

function hasValidAdminPassword(request: NextRequest): boolean {
  return request.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET() {
  const data = await readTempleData();
  const donors = [...data.donors].sort((a, b) => b.amount - a.amount);
  return NextResponse.json(donors);
}

export async function POST(request: NextRequest) {
  try {
    if (!hasValidAdminPassword(request)) {
      return NextResponse.json({ message: "Invalid admin password" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<Donor>;

    if (!body.name || !body.city || !body.amount || !body.donationType || !body.timing) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (body.donationType === "event" && !body.eventId) {
      return NextResponse.json(
        { message: "Event donation requires eventId" },
        { status: 400 },
      );
    }

    const data = await readTempleData();

    const donor: Donor = {
      id: makeId("donor"),
      name: body.name,
      city: body.city,
      address: body.address,
      mobile: body.mobile,
      amount: Number(body.amount),
      donationType: body.donationType,
      eventId: body.eventId,
      timing: body.timing,
      notes: body.notes,
      donatedAt: new Date().toISOString(),
    };

    data.donors.push(donor);
    await writeTempleData(data);

    return NextResponse.json(donor, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save donor";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!hasValidAdminPassword(request)) {
      return NextResponse.json({ message: "Invalid admin password" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<Donor>;

    if (!body.id || !body.name || !body.city || !body.amount || !body.donationType || !body.timing) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (body.donationType === "event" && !body.eventId) {
      return NextResponse.json(
        { message: "Event donation requires eventId" },
        { status: 400 },
      );
    }

    const data = await readTempleData();
    const donorIndex = data.donors.findIndex((donor) => donor.id === body.id);

    if (donorIndex === -1) {
      return NextResponse.json({ message: "Donor not found" }, { status: 404 });
    }

    data.donors[donorIndex] = {
      ...data.donors[donorIndex],
      name: body.name,
      city: body.city,
      address: body.address,
      mobile: body.mobile,
      amount: Number(body.amount),
      donationType: body.donationType,
      eventId: body.donationType === "event" ? body.eventId : undefined,
      timing: body.donationType === "event" ? body.timing : "general",
      notes: body.notes,
    };

    await writeTempleData(data);

    return NextResponse.json(data.donors[donorIndex]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update donor";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!hasValidAdminPassword(request)) {
      return NextResponse.json({ message: "Invalid admin password" }, { status: 401 });
    }

    const body = (await request.json()) as { id?: string };

    if (!body.id) {
      return NextResponse.json({ message: "Donor id is required" }, { status: 400 });
    }

    const data = await readTempleData();
    const beforeCount = data.donors.length;
    data.donors = data.donors.filter((donor) => donor.id !== body.id);

    if (data.donors.length === beforeCount) {
      return NextResponse.json({ message: "Donor not found" }, { status: 404 });
    }

    await writeTempleData(data);
    return NextResponse.json({ message: "Donor deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete donor";
    return NextResponse.json({ message }, { status: 500 });
  }
}
