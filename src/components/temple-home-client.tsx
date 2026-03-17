"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Donor, Event, Announcement, AartiTime, TempleSettings } from "@/types/temple";

type TempleHomeClientProps = {
  upcomingEvents: Event[];
  allEvents: Event[];
  generalDonors: Donor[];
  eventDonors: Donor[];
  announcements: Announcement[];
  aartiTimes: AartiTime[];
  settings: TempleSettings;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTiming(value: string) {
  if (value === "before") return "Before Event";
  if (value === "after") return "After Event";
  return "General";
}

export default function TempleHomeClient({
  upcomingEvents,
  allEvents,
  generalDonors,
  eventDonors,
  announcements,
  aartiTimes,
  settings,
}: TempleHomeClientProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(upcomingEvents[0]?.id ?? "");
  const [donorView, setDonorView] = useState<"general" | "event">("general");

  const selectedEvent = useMemo(
    () => upcomingEvents.find((event) => event.id === selectedEventId) ?? null,
    [selectedEventId, upcomingEvents],
  );

  const selectedEventDonors = useMemo(() => {
    if (!selectedEventId) return [];
    return eventDonors
      .filter((donor) => donor.eventId === selectedEventId)
      .sort((a, b) => b.amount - a.amount);
  }, [eventDonors, selectedEventId]);

  const donationTotal = useMemo(
    () => [...generalDonors, ...eventDonors].reduce((sum, donor) => sum + donor.amount, 0),
    [eventDonors, generalDonors],
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#fffbf2_0%,#fff2dd_38%,#fff8ee_100%)] text-stone-900">
      <div className="pointer-events-none absolute inset-0 opacity-75">
        <svg className="float-orbit absolute -left-12 top-20 h-64 w-64 text-amber-200" viewBox="0 0 200 200" fill="none">
          <path d="M100 10L123 77L194 77L136 118L158 186L100 145L42 186L64 118L6 77L77 77L100 10Z" fill="currentColor" />
        </svg>
        <svg className="float-orbit-delayed absolute right-[-40px] top-1/3 h-48 w-48 text-rose-200" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="20" />
          <circle cx="100" cy="100" r="45" fill="currentColor" />
        </svg>
      </div>

      <section className="relative overflow-hidden border-b border-amber-200 bg-[radial-gradient(circle_at_12%_20%,_#f43f5e2a_0%,_transparent_34%),radial-gradient(circle_at_85%_20%,_#f59e0b40_0%,_transparent_38%),linear-gradient(180deg,_#fff7ed_0%,_#ffedd5_100%)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr] md:px-8 md:py-20">
          <div className="animate-rise opacity-0 [animation-delay:120ms]">
            <p className="inline-block rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
              Rampura
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-6xl">Siddheshwari Mataji Temple</h1>
            <p className="mt-5 max-w-2xl text-lg text-stone-700">
              Prasang updates, event donors, live links, announcements and aarti timings in one vibrant temple hub.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#prasang"
                className="shine-sweep rounded-full bg-rose-700 px-5 py-2 text-sm font-semibold text-white transition hover:scale-[1.03] hover:bg-rose-800"
              >
                Explore Prasang
              </a>
              <a
                href="#aarti"
                className="rounded-full border border-rose-700 px-5 py-2 text-sm font-semibold text-rose-700 transition hover:scale-[1.03] hover:bg-rose-50"
              >
                View Aarti Time
              </a>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-amber-200 bg-white/90 p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-rose-700">{upcomingEvents.length}</p>
                <p className="text-xs text-stone-600">Upcoming Prasang</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white/90 p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-rose-700">{generalDonors.length + eventDonors.length}</p>
                <p className="text-xs text-stone-600">Total Donors</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white/90 p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-rose-700">Rs. {donationTotal.toLocaleString("en-IN")}</p>
                <p className="text-xs text-stone-600">Total Seva</p>
              </div>
            </div>
          </div>

          <div className="animate-rise relative opacity-0 [animation-delay:280ms]">
            <div className="absolute -left-4 -top-4 h-full w-full rounded-3xl bg-gradient-to-br from-amber-300 to-rose-300 blur-[1px]" />
            <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-xl">
              <Image
                src="/image.png"
                alt="Mataji Temple"
                width={960}
                height={720}
                className="h-80 w-full bg-amber-50 object-contain object-top md:h-[24rem]"
                priority
              />
              <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-4 py-1 text-sm font-semibold text-rose-700 backdrop-blur">
                Jay Mataji
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="announcements" className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {announcements.length === 0 ? (
            <p className="rounded-xl border border-amber-200 bg-white p-4 text-sm text-stone-600">No announcement yet.</p>
          ) : (
            announcements.map((announcement, idx) => (
              <article
                key={announcement.id}
                className="animate-rise rounded-2xl border border-amber-200 bg-white p-4 shadow-sm opacity-0"
                style={{ animationDelay: `${90 + idx * 90}ms` }}
              >
                <h3 className="text-lg font-semibold text-rose-800">{announcement.title}</h3>
                <p className="mt-2 text-stone-700">{announcement.message}</p>
                <p className="mt-3 text-xs text-stone-500">{formatDate(announcement.createdAt)}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section id="prasang" className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <h2 className="text-2xl font-bold">Upcoming Prasang</h2>
        <p className="mt-2 text-sm text-stone-600">Click any card to open full details and event-specific donors.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.length === 0 ? (
            <p className="rounded-xl border border-amber-200 bg-white p-4 text-sm text-stone-600">No upcoming prasang scheduled yet.</p>
          ) : (
            upcomingEvents.map((event, idx) => {
              const donorCount = eventDonors.filter((donor) => donor.eventId === event.id).length;
              const active = selectedEventId === event.id;
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEventId(event.id)}
                  className={`animate-rise group rounded-2xl border p-5 text-left opacity-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                    active
                      ? "border-rose-400 bg-gradient-to-br from-rose-50 to-amber-50 ring-2 ring-rose-300"
                      : "border-amber-200 bg-white"
                  }`}
                  style={{ animationDelay: `${120 + idx * 80}ms` }}
                >
                  <p className="text-sm font-semibold text-rose-700">{formatDate(event.date)}</p>
                  <h3 className="mt-2 text-xl font-bold">{event.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">Location: {event.location}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-stone-700">{event.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                    <span>{donorCount} donors</span>
                    <span className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-700 group-hover:bg-rose-200">
                      {active ? "Opened" : "Open Details"}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {selectedEvent ? (
          <article className="animate-rise mt-8 grid gap-6 rounded-3xl border border-amber-300 bg-white p-5 shadow-lg md:grid-cols-[1.1fr_0.9fr] md:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Selected Prasang</p>
              <h3 className="mt-2 text-3xl font-bold">{selectedEvent.name}</h3>
              <p className="mt-2 text-stone-700">
                {formatDate(selectedEvent.date)} | {selectedEvent.location}
              </p>
              <p className="mt-4 text-stone-700">{selectedEvent.description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                {selectedEvent.liveVideoUrl ? (
                  <a
                    href={selectedEvent.liveVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
                  >
                    Watch Live
                  </a>
                ) : (
                  <span className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600">Live link not added yet</span>
                )}
                <a href="#donors" className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
                  View All Donors
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:sticky md:top-4 md:h-fit">
              <h4 className="text-lg font-bold text-rose-800">Donors for this Event</h4>
              <div className="mt-3 space-y-2">
                {selectedEventDonors.length === 0 ? (
                  <p className="text-sm text-stone-600">No donors added for this event yet.</p>
                ) : (
                  selectedEventDonors.map((donor) => (
                    <div key={donor.id} className="rounded-xl border border-amber-200 bg-white px-3 py-2">
                      <p className="font-semibold text-stone-800">{donor.name}</p>
                      <p className="text-xs text-stone-600">{donor.city}</p>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="font-semibold text-rose-700">Rs. {donor.amount.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-stone-500">{formatTiming(donor.timing)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        ) : null}
      </section>

      <section id="aarti" className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <h2 className="text-2xl font-bold">Aarti Time</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {aartiTimes.map((aarti, idx) => (
            <article
              key={aarti.id}
              className="animate-rise rounded-2xl border border-amber-200 bg-white p-4 opacity-0 shadow-sm transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg"
              style={{ animationDelay: `${100 + idx * 90}ms` }}
            >
              <h3 className="text-lg font-semibold">{aarti.name}</h3>
              <p className="mt-1 text-rose-700">{aarti.time}</p>
              {aarti.notes ? <p className="mt-2 text-sm text-stone-600">{aarti.notes}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section id="donors" className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Donors</h2>
          <div className="inline-flex rounded-full border border-amber-300 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setDonorView("general")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                donorView === "general" ? "bg-rose-700 text-white" : "text-stone-700 hover:bg-amber-50"
              }`}
            >
              General Donors
            </button>
            <button
              type="button"
              onClick={() => setDonorView("event")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                donorView === "event" ? "bg-rose-700 text-white" : "text-stone-700 hover:bg-amber-50"
              }`}
            >
              Event Donors
            </button>
          </div>
        </div>

        {donorView === "general" ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-amber-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-amber-100 text-stone-700">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">City / Village</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {generalDonors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-stone-500">No general donors yet.</td>
                  </tr>
                ) : (
                  generalDonors.map((donor) => (
                    <tr key={donor.id} className="border-t border-amber-100 transition hover:bg-amber-50/70">
                      <td className="px-4 py-3">{donor.name}</td>
                      <td className="px-4 py-3">{donor.city}</td>
                      <td className="px-4 py-3">Rs. {donor.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {eventDonors.length === 0 ? (
              <p className="rounded-xl border border-amber-200 bg-white p-4 text-sm text-stone-600">No event donors yet.</p>
            ) : (
              eventDonors.map((donor, idx) => {
                const event = allEvents.find((item) => item.id === donor.eventId);
                return (
                  <article
                    key={donor.id}
                    className="animate-rise rounded-2xl border border-amber-200 bg-white p-4 opacity-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    style={{ animationDelay: `${80 + idx * 70}ms` }}
                  >
                    <h3 className="text-lg font-semibold">{donor.name}</h3>
                    <p className="text-sm text-stone-600">{donor.city}</p>
                    <p className="mt-2 text-rose-700">Rs. {donor.amount.toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-sm text-stone-600">For: {event?.name ?? "Unknown Event"}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">{formatTiming(donor.timing)} donation</p>
                  </article>
                );
              })
            )}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-2 md:px-8">
        <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="text-2xl font-bold">Donate via UPI</h2>
          <p className="mt-2 text-sm text-stone-600">You can send donation directly to below UPI IDs.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {settings.upiIds.map((upiId, index) => (
              <div key={`upi-${index}`} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-stone-500">UPI ID {index + 1}</p>
                <p className="mt-1 font-semibold text-rose-700">{upiId}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-2 md:px-8">
        <div className="rounded-3xl border border-amber-200 bg-white/90 p-5 shadow-sm md:p-7">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">Temple Message</p>
          <p className="mt-3 text-center text-lg text-stone-700 md:text-xl">
            &ldquo;Bhakti, Seva, and Satsang connect every devotee to Mataji with peace and strength.&rdquo;
          </p>
        </div>
      </section>
    </main>
  );
}
