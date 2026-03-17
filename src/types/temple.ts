export type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  liveVideoUrl?: string;
  createdAt: string;
};

export type DonationTiming = "before" | "after" | "general";

export type Donor = {
  id: string;
  name: string;
  city: string;
  amount: number;
  donationType: "event" | "general";
  eventId?: string;
  timing: DonationTiming;
  notes?: string;
  donatedAt: string;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

export type AartiTime = {
  id: string;
  name: string;
  time: string;
  notes?: string;
};

export type TempleData = {
  events: Event[];
  donors: Donor[];
  announcements: Announcement[];
  aartiTimes: AartiTime[];
};
