import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

const todayLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

function BackdatedCheckInPage() {
  const [allMembers, setAllMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [memberId, setMemberId] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [type, setType] = useState("GROUP");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("07:00");
  const [classTiming, setClassTiming] = useState("7:00 AM");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      window.location.replace("/admin");
      return;
    }
    axios.get(`${API_BASE_URL}/members`).then(({ data }) => setAllMembers(data || []))
      .catch(() => toast.error("Failed to load members"));
  }, []);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allMembers.filter((m) => !q || m.name?.toLowerCase().includes(q) || m.phone?.includes(q));
  }, [allMembers, query]);
  const selectedMember = allMembers.find((m) => String(m.id) === String(memberId));
  const memberships = selectedMember?.memberships || [];
  const selectedMembership = memberships.find((m) => String(m.id) === String(membershipId));

  useEffect(() => {
    setMembershipId("");
    if (selectedMember?.memberType) setType(selectedMember.memberType);
  }, [memberId]);

  const updateTime = (value) => {
    setSessionTime(value);
    const [hourText, minute] = value.split(":");
    const hour = Number(hourText);
    setClassTiming(`${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedMember || !selectedMembership || !sessionDate || !sessionTime) {
      toast.error("Select a member, membership, date, and session time.");
      return;
    }
    const checkinTime = `${sessionDate}T${sessionTime}:00`;
    if (new Date(checkinTime) >= new Date()) {
      toast.error("Choose a date and time in the past.");
      return;
    }
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/checkins/backdated`, {
        memberId: Number(memberId),
        membershipId: Number(membershipId),
        type,
        memberType: selectedMember.memberType,
        classTiming,
        checkinTime,
        enteredBy: "admin",
      }, { headers: { "X-Admin-User": "admin" } });
      toast.success(response.data || "Backdated check-in saved");
      setQuery(""); setMemberId(""); setMembershipId(""); setSessionDate("");
      const refreshed = await axios.get(`${API_BASE_URL}/members`);
      setAllMembers(refreshed.data || []);
    } catch (error) {
      toast.error(error.response?.data || "Failed to save backdated check-in");
    } finally { setSaving(false); }
  };

  const expired = (membership) => !membership.expiryRemoved && membership.expiryDate && membership.expiryDate < todayLocal();

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 pb-28">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-600">Admin</p>
        <h1 className="mt-2 text-4xl font-black text-black">Backdated Check-In</h1>
        <p className="mt-2 max-w-2xl text-zinc-700">Record a missed session against the exact membership used. One credit will be deducted from that membership.</p>
      </div>
      <form onSubmit={submit} className="space-y-6 rounded-2xl border border-black/10 bg-white p-6 shadow-lg sm:p-8">
        <div>
          <label className="mb-2 block font-bold text-black">Find member</label>
          <input value={query} onChange={(e) => { setQuery(e.target.value); setMemberId(""); }} placeholder="Search by member name or phone" className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-black outline-none focus:border-black" />
          {query.trim() && <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-zinc-200">{filteredMembers.map((m) => <button key={m.id} type="button" onClick={() => { setMemberId(String(m.id)); setQuery(`${m.name}${m.phone ? ` · ${m.phone}` : ""}`); }} className={`block w-full border-b border-zinc-100 px-4 py-3 text-left text-black last:border-0 hover:bg-yellow-100 ${String(m.id) === String(memberId) ? "bg-yellow-100" : "bg-white"}`}><span className="font-semibold">{m.name}</span><span className="ml-2 text-sm text-zinc-500">{m.memberType} · {m.phone || "No phone"}</span></button>)}</div>}
        </div>
        {selectedMember && <>
          <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700">Selected member: <strong className="text-black">{selectedMember.name}</strong> · {selectedMember.memberType}</div>
          <div>
            <label className="mb-2 block font-bold text-black">Membership to deduct from</label>
            <select required value={membershipId} onChange={(e) => setMembershipId(e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-black">
              <option value="">Choose exact membership</option>
              {memberships.map((m) => <option key={m.id} value={m.id} disabled={(m.remainingCredits ?? 0) <= 0}>{m.packageName || "Membership"} · {m.remainingCredits ?? 0} credits · {expired(m) ? "Expired Membership" : m.expiryRemoved ? "No expiry" : `Expires ${m.expiryDate || "—"}`}{m.paused ? " · Paused" : ""}</option>)}
            </select>
            {selectedMembership && <p className={`mt-2 text-sm font-semibold ${expired(selectedMembership) ? "text-amber-700" : "text-zinc-600"}`}>{expired(selectedMembership) ? "Expired Membership — a credit will be deducted from this selected membership." : "One credit will be deducted from this selected membership."} Remaining credits: {selectedMembership.remainingCredits ?? 0}.</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="mb-2 block font-bold text-black">Check-in type</label><select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-black"><option value="GROUP">Group</option><option value="PT">PT</option></select></div>
            <div><label className="mb-2 block font-bold text-black">Session date</label><input type="date" required max={todayLocal()} value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-black" /></div>
            <div><label className="mb-2 block font-bold text-black">Session time</label><input type="time" required value={sessionTime} onChange={(e) => updateTime(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-black" /></div>
            <div><label className="mb-2 block font-bold text-black">Session label</label><input required value={classTiming} onChange={(e) => setClassTiming(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-black" placeholder="e.g. 7:00 AM" /></div>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">This entry will be marked as a backdated check-in and will record the admin entry timestamp separately from the session date.</div>
          <button disabled={saving} type="submit" className="w-full rounded-xl bg-black px-5 py-4 font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50">{saving ? "Saving…" : "Save Backdated Check-In"}</button>
        </>}
      </form>
    </main>
  );
}
export default BackdatedCheckInPage;
