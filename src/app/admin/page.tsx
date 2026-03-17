"use client";

import jsPDF from "jspdf";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ADMIN_PASSWORD } from "@/lib/admin-config";
import { Donor, Event, TempleSettings } from "@/types/temple";

type DonationType = "event" | "general";
type DonationTiming = "before" | "after" | "general";

type ReceiptData = {
  receiptNo: string;
  name: string;
  address: string;
  city: string;
  mobile: string;
  amount: number;
  donationType: DonationType;
  timing: DonationTiming;
  eventName?: string;
  upiId: string;
  date: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return sessionStorage.getItem("admin-unlocked") === "yes";
  });
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [editingEventId, setEditingEventId] = useState("");
  const [editingDonorId, setEditingDonorId] = useState("");
  const [settings, setSettings] = useState<TempleSettings>({
    upiIds: ["ravaly950@oksbi"],
    templeName: "Siddheshwari Mataji Temple Rampura",
    templeAddress: "Rampura, Gujarat, India",
    thankYouNote:
      "Thank you for your valuable donation. May Siddheshwari Mataji bless you and your family.",
  });
  const [receiptForm, setReceiptForm] = useState({
    name: "",
    address: "",
    city: "",
    mobile: "",
    amount: "",
    donationType: "general" as DonationType,
    eventId: "",
    timing: "general" as DonationTiming,
    upiId: "ravaly950@oksbi",
  });
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);

  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    location: "Rampura",
    description: "",
    liveVideoUrl: "",
  });

  const [donorForm, setDonorForm] = useState({
    name: "",
    city: "",
    amount: "",
    donationType: "general" as DonationType,
    eventId: "",
    timing: "general" as DonationTiming,
    notes: "",
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
  });

  const [aartiForm, setAartiForm] = useState({
    name: "",
    time: "",
    notes: "",
  });

  const fetchEvents = useCallback(async () => {
    const response = await fetch("/api/events");
    const data = (await response.json()) as Event[];
    setEvents(data);
  }, []);

  const fetchDonors = useCallback(async () => {
    const response = await fetch("/api/donors");
    const data = (await response.json()) as Donor[];
    setDonors(data);
  }, []);

  const fetchSettings = useCallback(async () => {
    const response = await fetch("/api/settings");
    const data = (await response.json()) as TempleSettings;
    setSettings(data);
    setReceiptForm((previous) => ({
      ...previous,
      upiId: previous.upiId || data.upiIds[0] || "ravaly950@oksbi",
    }));
  }, []);

  useEffect(() => {
    if (unlocked) {
      fetchEvents();
      fetchDonors();
      fetchSettings();
    }
  }, [fetchDonors, fetchEvents, fetchSettings, unlocked]);

  function handleUnlock(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      sessionStorage.setItem("admin-unlocked", "yes");
      setMessage("Admin panel unlocked.");
      fetchEvents();
      fetchDonors();
      fetchSettings();
      return;
    }

    setMessage("Wrong password.");
  }

  async function requestWithFeedback(method: "POST" | "PUT" | "DELETE", url: string, payload: object) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": ADMIN_PASSWORD,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        try {
          const error = (await response.json()) as { message?: string };
          return { ok: false, message: error.message ?? "Request failed." };
        } catch {
          const text = await response.text();
          return { ok: false, message: text || "Request failed." };
        }
      }

      return { ok: true, message: "Success" };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          ok: false,
          message: "Request timed out. Check Vercel server logs/storage setup.",
        };
      }

      return { ok: false, message: "Network error. Please try again." };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function saveRecord(method: "POST" | "PUT", url: string, payload: object) {
    setMessage("Saving...");

    const result = await requestWithFeedback(method, url, payload);
    if (!result.ok) {
      setMessage(result.message);
      return false;
    }

    setMessage("Saved successfully.");
    return true;
  }

  function resetReceiptForm() {
    setReceiptForm((previous) => ({
      ...previous,
      name: "",
      address: "",
      city: "",
      mobile: "",
      amount: "",
      donationType: "general",
      eventId: "",
      timing: "general",
    }));
  }

  function generateReceiptPdf(receipt: ReceiptData) {
    const doc = new jsPDF();
    let y = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(settings.templeName, 105, y, { align: "center" });
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(settings.templeAddress, 105, y, { align: "center" });
    y += 10;

    doc.setDrawColor(180, 80, 80);
    doc.line(15, y, 195, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Donation Receipt", 15, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Receipt No: ${receipt.receiptNo}`, 15, y);
    doc.text(`Date: ${receipt.date}`, 140, y);
    y += 8;

    doc.text(`Donor Name: ${receipt.name}`, 15, y);
    y += 7;
    doc.text(`Mobile: ${receipt.mobile}`, 15, y);
    y += 7;
    doc.text(`Address: ${receipt.address}`, 15, y);
    y += 7;
    doc.text(`City/Village: ${receipt.city}`, 15, y);
    y += 10;

    doc.text(`Amount: Rs. ${receipt.amount.toLocaleString("en-IN")}`, 15, y);
    y += 7;
    doc.text(
      `Donation Type: ${receipt.donationType === "event" ? "Event Donation" : "General Donation"}`,
      15,
      y,
    );
    y += 7;
    doc.text(`Timing: ${receipt.timing}`, 15, y);
    y += 7;
    if (receipt.eventName) {
      doc.text(`Event: ${receipt.eventName}`, 15, y);
      y += 7;
    }
    doc.text(`UPI ID: ${receipt.upiId}`, 15, y);
    y += 12;

    const wrappedThankYou = doc.splitTextToSize(settings.thankYouNote, 180);
    doc.text(wrappedThankYou, 15, y);
    y += wrappedThankYou.length * 6 + 12;

    doc.setFont("helvetica", "italic");
    doc.text("With blessings from Siddheshwari Mataji Temple", 15, y);

    doc.save(`receipt-${receipt.receiptNo}.pdf`);
  }

  function formatWhatsappNumber(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    return digits;
  }

  function shareReceiptOnWhatsapp() {
    if (!lastReceipt) return;

    const mobile = formatWhatsappNumber(lastReceipt.mobile);
    if (!mobile) {
      setMessage("Invalid mobile number for WhatsApp sharing.");
      return;
    }

    const text = [
      `${settings.templeName}`,
      `Receipt No: ${lastReceipt.receiptNo}`,
      `Donor: ${lastReceipt.name}`,
      `Amount: Rs. ${lastReceipt.amount.toLocaleString("en-IN")}`,
      `Donation Type: ${lastReceipt.donationType === "event" ? "Event" : "General"}`,
      lastReceipt.eventName ? `Event: ${lastReceipt.eventName}` : "",
      settings.thankYouNote,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${mobile}?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function saveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = {
      ...settings,
      upiIds: settings.upiIds.map((item) => item.trim()).filter(Boolean),
    };

    const ok = await saveRecord("PUT", "/api/settings", payload);
    if (!ok) return;

    await fetchSettings();
  }

  async function generateReceiptAndAddDonor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!receiptForm.name || !receiptForm.address || !receiptForm.city || !receiptForm.mobile || !receiptForm.amount) {
      setMessage("Please fill all receipt fields.");
      return;
    }

    if (receiptForm.donationType === "event" && !receiptForm.eventId) {
      setMessage("Please select event for event donation.");
      return;
    }

    const selectedEvent = events.find((event) => event.id === receiptForm.eventId);
    const amount = Number(receiptForm.amount);
    const receiptNo = `SMT-${Date.now()}`;

    const donorPayload = {
      name: receiptForm.name,
      city: receiptForm.city,
      address: receiptForm.address,
      mobile: receiptForm.mobile,
      amount,
      donationType: receiptForm.donationType,
      eventId: receiptForm.donationType === "event" ? receiptForm.eventId : undefined,
      timing: receiptForm.donationType === "event" ? receiptForm.timing : "general",
      notes: `Receipt ${receiptNo}`,
    };

    const ok = await saveRecord("POST", "/api/donors", donorPayload);
    if (!ok) return;

    await fetchDonors();

    const receiptData: ReceiptData = {
      receiptNo,
      name: receiptForm.name,
      address: receiptForm.address,
      city: receiptForm.city,
      mobile: receiptForm.mobile,
      amount,
      donationType: receiptForm.donationType,
      timing: receiptForm.donationType === "event" ? receiptForm.timing : "general",
      eventName: selectedEvent?.name,
      upiId: receiptForm.upiId,
      date: new Date().toLocaleString("en-IN"),
    };

    generateReceiptPdf(receiptData);
    setLastReceipt(receiptData);
    resetReceiptForm();
    setMessage("Receipt generated and donor added successfully.");
  }

  async function deleteRecord(url: string, payload: object, successMessage: string) {
    setMessage("Deleting...");

    const result = await requestWithFeedback("DELETE", url, payload);
    if (!result.ok) {
      setMessage(result.message);
      return false;
    }

    setMessage(successMessage);
    return true;
  }

  async function submitEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = editingEventId ? { id: editingEventId, ...eventForm } : eventForm;
    const method = editingEventId ? "PUT" : "POST";
    const ok = await saveRecord(method, "/api/events", payload);
    if (!ok) return;

    setEditingEventId("");
    setEventForm({ name: "", date: "", location: "Rampura", description: "", liveVideoUrl: "" });
    await fetchEvents();
  }

  async function submitDonor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = {
      ...donorForm,
      amount: Number(donorForm.amount),
      eventId: donorForm.donationType === "event" ? donorForm.eventId : undefined,
      timing: donorForm.donationType === "event" ? donorForm.timing : "general",
    };

    const method = editingDonorId ? "PUT" : "POST";
    const donorPayload = editingDonorId ? { id: editingDonorId, ...payload } : payload;

    const ok = await saveRecord(method, "/api/donors", donorPayload);
    if (!ok) return;

    setEditingDonorId("");
    setDonorForm({
      name: "",
      city: "",
      amount: "",
      donationType: "general",
      eventId: "",
      timing: "general",
      notes: "",
    });
    await fetchDonors();
  }

  async function submitAnnouncement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ok = await saveRecord("POST", "/api/announcements", announcementForm);
    if (!ok) return;

    setAnnouncementForm({ title: "", message: "" });
  }

  async function submitAarti(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ok = await saveRecord("POST", "/api/aarti-times", aartiForm);
    if (!ok) return;

    setAartiForm({ name: "", time: "", notes: "" });
  }

  const eventOptions = useMemo(
    () => events.map((event) => ({ id: event.id, label: `${event.name} (${event.date})` })),
    [events],
  );

  function startEditEvent(event: Event) {
    setEditingEventId(event.id);
    setEventForm({
      name: event.name,
      date: event.date,
      location: event.location,
      description: event.description,
      liveVideoUrl: event.liveVideoUrl ?? "",
    });
  }

  function cancelEditEvent() {
    setEditingEventId("");
    setEventForm({ name: "", date: "", location: "Rampura", description: "", liveVideoUrl: "" });
  }

  function startEditDonor(donor: Donor) {
    setEditingDonorId(donor.id);
    setDonorForm({
      name: donor.name,
      city: donor.city,
      amount: String(donor.amount),
      donationType: donor.donationType,
      eventId: donor.eventId ?? "",
      timing: donor.timing,
      notes: donor.notes ?? "",
    });
  }

  function cancelEditDonor() {
    setEditingDonorId("");
    setDonorForm({
      name: "",
      city: "",
      amount: "",
      donationType: "general",
      eventId: "",
      timing: "general",
      notes: "",
    });
  }

  async function removeEvent(event: Event) {
    const confirmed = window.confirm(
      `Delete event "${event.name}"? This will also remove its event donors.`,
    );
    if (!confirmed) return;

    const ok = await deleteRecord(
      "/api/events",
      { id: event.id, removeRelatedDonors: true },
      "Event deleted successfully.",
    );
    if (!ok) return;

    if (editingEventId === event.id) {
      cancelEditEvent();
    }

    await fetchEvents();
    await fetchDonors();
  }

  async function removeDonor(donor: Donor) {
    const confirmed = window.confirm(`Delete donor "${donor.name}"?`);
    if (!confirmed) return;

    const ok = await deleteRecord("/api/donors", { id: donor.id }, "Donor deleted successfully.");
    if (!ok) return;

    if (editingDonorId === donor.id) {
      cancelEditDonor();
    }

    await fetchDonors();
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto mt-20 max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="mt-2 text-sm text-slate-600">Enter password to open hidden admin panel.</p>
          <form className="mt-4 space-y-3" onSubmit={handleUnlock}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
            <button className="w-full rounded-lg bg-rose-700 px-3 py-2 font-semibold text-white" type="submit">
              Open Panel
            </button>
          </form>
          {message ? <p className="mt-3 text-sm text-rose-700">{message}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Siddheshwari Mataji Temple Admin</h1>
        {message ? <p className="rounded-lg bg-white p-3 text-sm text-slate-700">{message}</p> : null}

        <section className="grid gap-6 md:grid-cols-2">
          <form onSubmit={submitEvent} className="space-y-3 rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">
              {editingEventId ? "Edit Prasang (Event)" : "Add Prasang (Event)"}
            </h2>
            <input className="w-full rounded border px-3 py-2" placeholder="Event Name" value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} required />
            <input className="w-full rounded border px-3 py-2" type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} required />
            <input className="w-full rounded border px-3 py-2" placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} required />
            <textarea className="w-full rounded border px-3 py-2" placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} required />
            <input className="w-full rounded border px-3 py-2" placeholder="Live Video URL (optional)" value={eventForm.liveVideoUrl} onChange={(e) => setEventForm({ ...eventForm, liveVideoUrl: e.target.value })} />
            <div className="flex gap-2">
              <button type="submit" className="rounded bg-rose-700 px-4 py-2 font-semibold text-white">
                {editingEventId ? "Update Event" : "Save Event"}
              </button>
              {editingEventId ? (
                <button type="button" onClick={cancelEditEvent} className="rounded border border-slate-300 px-4 py-2 font-semibold text-slate-700">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <form onSubmit={submitDonor} className="space-y-3 rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">{editingDonorId ? "Edit Donor" : "Add Donor"}</h2>
            <input className="w-full rounded border px-3 py-2" placeholder="Donor Name" value={donorForm.name} onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })} required />
            <input className="w-full rounded border px-3 py-2" placeholder="City / Village" value={donorForm.city} onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })} required />
            <input className="w-full rounded border px-3 py-2" type="number" min="1" placeholder="Amount" value={donorForm.amount} onChange={(e) => setDonorForm({ ...donorForm, amount: e.target.value })} required />
            <select className="w-full rounded border px-3 py-2" value={donorForm.donationType} onChange={(e) => setDonorForm({ ...donorForm, donationType: e.target.value as DonationType })}>
              <option value="general">General Donation</option>
              <option value="event">Event Donation</option>
            </select>

            {donorForm.donationType === "event" ? (
              <>
                <select className="w-full rounded border px-3 py-2" value={donorForm.eventId} onChange={(e) => setDonorForm({ ...donorForm, eventId: e.target.value })} required>
                  <option value="">Select Event</option>
                  {eventOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <select className="w-full rounded border px-3 py-2" value={donorForm.timing} onChange={(e) => setDonorForm({ ...donorForm, timing: e.target.value as DonationTiming })}>
                  <option value="before">Before Event</option>
                  <option value="after">After Event</option>
                  <option value="general">General / Unknown</option>
                </select>
              </>
            ) : null}

            <input className="w-full rounded border px-3 py-2" placeholder="Notes (optional)" value={donorForm.notes} onChange={(e) => setDonorForm({ ...donorForm, notes: e.target.value })} />
            <div className="flex gap-2">
              <button type="submit" className="rounded bg-rose-700 px-4 py-2 font-semibold text-white">
                {editingDonorId ? "Update Donor" : "Save Donor"}
              </button>
              {editingDonorId ? (
                <button type="button" onClick={cancelEditDonor} className="rounded border border-slate-300 px-4 py-2 font-semibold text-slate-700">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <form onSubmit={saveSettings} className="space-y-3 rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">UPI & Receipt Settings</h2>
            {settings.upiIds.map((upiId, index) => (
              <div key={`upi-${index}`} className="flex gap-2">
                <input
                  className="w-full rounded border px-3 py-2"
                  placeholder="UPI ID"
                  value={upiId}
                  onChange={(e) => {
                    const copy = [...settings.upiIds];
                    copy[index] = e.target.value;
                    setSettings({ ...settings, upiIds: copy });
                  }}
                  required
                />
                {settings.upiIds.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const copy = settings.upiIds.filter((_, itemIndex) => itemIndex !== index);
                      setSettings({ ...settings, upiIds: copy });
                    }}
                    className="rounded bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-800"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}

            <button
              type="button"
              onClick={() => setSettings({ ...settings, upiIds: [...settings.upiIds, ""] })}
              className="rounded border border-slate-300 px-4 py-2 font-semibold text-slate-700"
            >
              Add Another UPI
            </button>

            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Temple Name"
              value={settings.templeName}
              onChange={(e) => setSettings({ ...settings, templeName: e.target.value })}
              required
            />
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Temple Address"
              value={settings.templeAddress}
              onChange={(e) => setSettings({ ...settings, templeAddress: e.target.value })}
              required
            />
            <textarea
              className="w-full rounded border px-3 py-2"
              placeholder="Thank you note"
              value={settings.thankYouNote}
              onChange={(e) => setSettings({ ...settings, thankYouNote: e.target.value })}
              required
            />
            <button type="submit" className="rounded bg-rose-700 px-4 py-2 font-semibold text-white">
              Save Settings
            </button>
          </form>

          <form onSubmit={generateReceiptAndAddDonor} className="space-y-3 rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Generate Donation Receipt</h2>
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Donor Name"
              value={receiptForm.name}
              onChange={(e) => setReceiptForm({ ...receiptForm, name: e.target.value })}
              required
            />
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Address"
              value={receiptForm.address}
              onChange={(e) => setReceiptForm({ ...receiptForm, address: e.target.value })}
              required
            />
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="City / Village"
              value={receiptForm.city}
              onChange={(e) => setReceiptForm({ ...receiptForm, city: e.target.value })}
              required
            />
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Mobile Number"
              value={receiptForm.mobile}
              onChange={(e) => setReceiptForm({ ...receiptForm, mobile: e.target.value })}
              required
            />
            <input
              className="w-full rounded border px-3 py-2"
              type="number"
              min="1"
              placeholder="Amount"
              value={receiptForm.amount}
              onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
              required
            />
            <select
              className="w-full rounded border px-3 py-2"
              value={receiptForm.donationType}
              onChange={(e) =>
                setReceiptForm({
                  ...receiptForm,
                  donationType: e.target.value as DonationType,
                  timing: e.target.value === "general" ? "general" : receiptForm.timing,
                })
              }
            >
              <option value="general">General Donation</option>
              <option value="event">Event Donation</option>
            </select>

            {receiptForm.donationType === "event" ? (
              <>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={receiptForm.eventId}
                  onChange={(e) => setReceiptForm({ ...receiptForm, eventId: e.target.value })}
                  required
                >
                  <option value="">Select Event</option>
                  {eventOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={receiptForm.timing}
                  onChange={(e) => setReceiptForm({ ...receiptForm, timing: e.target.value as DonationTiming })}
                >
                  <option value="before">Before Event</option>
                  <option value="after">After Event</option>
                  <option value="general">General / Unknown</option>
                </select>
              </>
            ) : null}

            <select
              className="w-full rounded border px-3 py-2"
              value={receiptForm.upiId}
              onChange={(e) => setReceiptForm({ ...receiptForm, upiId: e.target.value })}
            >
              {settings.upiIds.map((upiId, index) => (
                <option key={`receipt-upi-${index}`} value={upiId}>
                  {upiId}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button type="submit" className="rounded bg-rose-700 px-4 py-2 font-semibold text-white">
                Generate Receipt PDF
              </button>
              {lastReceipt ? (
                <button
                  type="button"
                  onClick={shareReceiptOnWhatsapp}
                  className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white"
                >
                  Share on WhatsApp
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Existing Events</h2>
            <div className="mt-3 space-y-2">
              {events.length === 0 ? <p className="text-sm text-slate-500">No events yet.</p> : null}
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
                  <div>
                    <p className="font-semibold text-slate-800">{event.name}</p>
                    <p className="text-xs text-slate-600">{event.date} | {event.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEditEvent(event)} className="rounded bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                      Edit
                    </button>
                    <button type="button" onClick={() => removeEvent(event)} className="rounded bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-800">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Existing Donors</h2>
            <div className="mt-3 space-y-2">
              {donors.length === 0 ? <p className="text-sm text-slate-500">No donors yet.</p> : null}
              {donors.map((donor) => (
                <div key={donor.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
                  <div>
                    <p className="font-semibold text-slate-800">{donor.name}</p>
                    <p className="text-xs text-slate-600">
                      {donor.city} | Rs. {donor.amount} | {donor.donationType}
                    </p>
                    {donor.mobile ? <p className="text-xs text-slate-500">Mobile: {donor.mobile}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEditDonor(donor)} className="rounded bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                      Edit
                    </button>
                    <button type="button" onClick={() => removeDonor(donor)} className="rounded bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-800">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <form onSubmit={submitAnnouncement} className="space-y-3 rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Add Announcement</h2>
            <input className="w-full rounded border px-3 py-2" placeholder="Announcement Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required />
            <textarea className="w-full rounded border px-3 py-2" placeholder="Message" value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} required />
            <button type="submit" className="rounded bg-rose-700 px-4 py-2 font-semibold text-white">Save Announcement</button>
          </form>

          <form onSubmit={submitAarti} className="space-y-3 rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Add Aarti Time</h2>
            <input className="w-full rounded border px-3 py-2" placeholder="Aarti Name" value={aartiForm.name} onChange={(e) => setAartiForm({ ...aartiForm, name: e.target.value })} required />
            <input className="w-full rounded border px-3 py-2" placeholder="Time (e.g. 07:00 PM)" value={aartiForm.time} onChange={(e) => setAartiForm({ ...aartiForm, time: e.target.value })} required />
            <input className="w-full rounded border px-3 py-2" placeholder="Notes" value={aartiForm.notes} onChange={(e) => setAartiForm({ ...aartiForm, notes: e.target.value })} />
            <button type="submit" className="rounded bg-rose-700 px-4 py-2 font-semibold text-white">Save Aarti Time</button>
          </form>
        </section>
      </div>
    </main>
  );
}
