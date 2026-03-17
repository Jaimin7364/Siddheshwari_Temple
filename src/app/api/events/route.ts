import { ADMIN_PASSWORD } from "@/lib/admin-config";
import { makeId, readTempleData, writeTempleData } from "@/lib/data-store";
import { Event } from "@/types/temple";
import { NextRequest, NextResponse } from "next/server";

function hasValidAdminPassword(request: NextRequest): boolean {
  return request.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET() {
  const data = await readTempleData();
  const events = [...data.events].sort((a, b) => a.date.localeCompare(b.date));
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  try {
    if (!hasValidAdminPassword(request)) {
      return NextResponse.json({ message: "Invalid admin password" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<Event>;

    if (!body.name || !body.date || !body.location || !body.description) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const data = await readTempleData();
    const event: Event = {
      id: makeId("event"),
      name: body.name,
      date: body.date,
      location: body.location,
      description: body.description,
      liveVideoUrl: body.liveVideoUrl,
      createdAt: new Date().toISOString(),
    };

    data.events.push(event);
    await writeTempleData(data);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save event";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!hasValidAdminPassword(request)) {
      return NextResponse.json({ message: "Invalid admin password" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<Event>;

    if (!body.id || !body.name || !body.date || !body.location || !body.description) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const data = await readTempleData();
    const eventIndex = data.events.findIndex((event) => event.id === body.id);

    if (eventIndex === -1) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    data.events[eventIndex] = {
      ...data.events[eventIndex],
      name: body.name,
      date: body.date,
      location: body.location,
      description: body.description,
      liveVideoUrl: body.liveVideoUrl,
    };

    await writeTempleData(data);

    return NextResponse.json(data.events[eventIndex]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update event";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!hasValidAdminPassword(request)) {
      return NextResponse.json({ message: "Invalid admin password" }, { status: 401 });
    }

    const body = (await request.json()) as { id?: string; removeRelatedDonors?: boolean };

    if (!body.id) {
      return NextResponse.json({ message: "Event id is required" }, { status: 400 });
    }

    const data = await readTempleData();
    const beforeEventsCount = data.events.length;
    data.events = data.events.filter((event) => event.id !== body.id);

    if (data.events.length === beforeEventsCount) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    let removedDonors = 0;
    if (body.removeRelatedDonors) {
      const beforeDonorsCount = data.donors.length;
      data.donors = data.donors.filter((donor) => donor.eventId !== body.id);
      removedDonors = beforeDonorsCount - data.donors.length;
    }

    await writeTempleData(data);

    return NextResponse.json({
      message: "Event deleted",
      removedDonors,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete event";
    return NextResponse.json({ message }, { status: 500 });
  }
}
