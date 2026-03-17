import { readTempleData } from "@/lib/data-store";
import TempleHomeClient from "@/components/temple-home-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await readTempleData();
  const today = new Date().toISOString().slice(0, 10);

  const upcomingEvents = data.events
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const generalDonors = data.donors
    .filter((donor) => donor.donationType === "general")
    .sort((a, b) => b.amount - a.amount);

  const eventDonors = data.donors
    .filter((donor) => donor.donationType === "event")
    .sort((a, b) => b.amount - a.amount);

  return (
    <TempleHomeClient
      upcomingEvents={upcomingEvents}
      allEvents={data.events}
      generalDonors={generalDonors}
      eventDonors={eventDonors}
      announcements={data.announcements}
      aartiTimes={data.aartiTimes}
    />
  );
}
