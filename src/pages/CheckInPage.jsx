import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";
import troopGym from "../assets/troop-gym.jpg";
import logo from "../assets/gorilla-logo.jpg";

function CheckInPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTimings, setSelectedTimings] = useState({});
  const [checkedInMembers, setCheckedInMembers] = useState({});
  const [loading, setLoading] = useState(false);

  const classTimings = [
    "6:00 AM",
    "7:00 AM",
    "8:15 AM",
    "6:00 PM",
  ];

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    fetchAllMembers();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setMembers([]);
      return;
    }

    const search = query.trim().toLowerCase();

    setMembers(
      allMembers.filter(
        (member) =>
          member.memberType === "GROUP" &&
          member.name?.toLowerCase().includes(search)
      )
    );
  }, [query, allMembers]);

  const fetchAllMembers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/members`);
      setAllMembers(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load members");
    }
  };

  const hasUsableMembership = (member) => {
    const today = new Date().toISOString().split("T")[0];

    return (member.memberships || []).some(
      (membership) =>
        !membership.paused &&
        membership.remainingCredits > 0 &&
        (membership.expiryRemoved ||
          (membership.expiryDate && membership.expiryDate >= today))
    );
  };

  const hasPausedMembershipOnly = (member) => {
    const memberships = member.memberships || [];

    if (memberships.length === 0) {
      return false;
    }

    const hasUsable = hasUsableMembership(member);

    const hasPausedWithCredits = memberships.some(
      (membership) =>
        membership.paused === true && membership.remainingCredits > 0
    );

    return !hasUsable && hasPausedWithCredits;
  };

  const processAttendance = async (memberId, type) => {
    const member = allMembers.find((item) => item.id === memberId);

    if (member && !hasUsableMembership(member)) {
      if (hasPausedMembershipOnly(member)) {
        toast.error("Membership is paused.");
      } else {
        toast.error("No active membership.");
      }
      return;
    }

    const classTiming = selectedTimings[memberId];

    if (!classTiming) {
      toast.error("Please select a class timing first.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/checkins`, {
        memberId,
        type,
        classTiming,
        memberType: "GROUP",
      });

      if (type === "CHECKIN") {
        toast.success("Checked in!");
        setCheckedInMembers((previous) => ({
          ...previous,
          [memberId]: true,
        }));
      } else {
        toast.success("No show marked!");
      }

      setMembers((previous) =>
        previous.map((item) =>
          item.id === memberId
            ? {
                ...item,
                totalRemainingCredits:
                  Number(item.totalRemainingCredits) - 1,
              }
            : item
        )
      );

      setAllMembers((previous) =>
        previous.map((item) =>
          item.id === memberId
            ? {
                ...item,
                totalRemainingCredits:
                  Number(item.totalRemainingCredits) - 1,
              }
            : item
        )
      );

      setSelectedTimings((previous) => {
        const updated = { ...previous };
        delete updated[memberId];
        return updated;
      });
    } catch (error) {
      console.error(error);

      const message = error.response?.data;

      if (message === "Credits expired") {
        toast.error("Credits expired!");
      } else if (message === "Membership is paused") {
        toast.error("Membership is paused.");
      } else {
        toast.error("No Credits!");
      }
    }
  };

  const deleteMember = async (memberId) => {
    const confirmed = window.confirm("Delete this member permanently?");

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/members/${memberId}`);

      toast.success("Member deleted");

      setMembers((current) =>
        current.filter((member) => member.id !== memberId)
      );

      setAllMembers((current) =>
        current.filter((member) => member.id !== memberId)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete member");
    }
  };

  const clearSearch = () => {
    setMembers([]);
    setQuery("");
  };

  return (
    <div
      className="min-h-screen bg-white text-black"
      onClick={clearSearch}
    >
      {/* Figma-inspired yellow top bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-[18px] bg-[#FFC800]" />

      <div className="min-h-screen pt-[18px]">
        <div className="grid min-h-[calc(100vh-18px)] grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* LEFT IMAGE PANEL */}
          <aside className="relative hidden overflow-hidden bg-black lg:block">
            <img
              src={troopGym}
              alt="Gym"
              className="absolute inset-0 h-full w-full object-cover grayscale"
            />

            <div className="absolute inset-0 bg-black/35" />

            <div className="absolute left-8 top-8 z-10">
              <img
                src={logo}
                alt="Troop"
                className="h-20 w-20 object-contain mix-blend-screen"
              />
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <main
            className="relative min-w-0 bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            {/* TOP NAV */}
            <header className="flex items-center justify-end gap-7 px-7 py-8 sm:px-10">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="relative pb-2 text-sm font-medium"
              >
                Check-In
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#FFC800]" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/members")}
                className="text-sm font-medium"
              >
                Members <span className="text-xs">⌄</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("isAdmin");
                  navigate("/admin");
                }}
                className="rounded-xl border border-black px-5 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
              >
                Logout
              </button>
            </header>

            <section className="mx-auto w-full max-w-[720px] px-6 pb-16 pt-16 sm:px-10 lg:pt-20">
              {/* GROUP / PT SWITCH */}
              <div className="flex flex-wrap gap-5">
                <button
                  type="button"
                  onClick={() => navigate("/check-in/group")}
                  className="rounded-2xl border-2 border-black bg-[#FFC800] px-7 py-3 text-base font-bold shadow-[0_4px_0_#111] transition active:translate-y-[2px] active:shadow-[0_2px_0_#111]"
                >
                  Group Class
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/check-in/pt")}
                  className="rounded-2xl border-2 border-black bg-white px-7 py-3 text-base font-bold shadow-[0_4px_0_#111] transition hover:bg-zinc-50 active:translate-y-[2px] active:shadow-[0_2px_0_#111]"
                >
                  Personal Training
                </button>
              </div>

              {/* SEARCH */}
              <div className="mt-16 flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <svg
                    className="pointer-events-none absolute left-4 top-1/2 h-7 w-7 -translate-y-1/2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                  </svg>

                  <input
                    type="text"
                    value={query}
                    placeholder="Search member..."
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        clearSearch();
                      }
                    }}
                    className="h-12 w-full rounded-xl border border-black bg-white pl-12 pr-4 text-base italic outline-none transition focus:ring-2 focus:ring-[#FFC800]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setQuery(query.trim())}
                  className="h-12 rounded-xl bg-[#171722] px-6 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Search
                </button>
              </div>

              {/* RESULTS */}
              <div className="mt-7 space-y-4">
                {members.map((member) => {
                  const selectedTiming = selectedTimings[member.id] || "";
                  const usable = hasUsableMembership(member);
                  const paused = hasPausedMembershipOnly(member);
                  const isCheckedIn = checkedInMembers[member.id];
                  const attendanceDisabled = !usable || isCheckedIn;

                  return (
                    <div
                      key={member.id}
                      onClick={() => {
                        if (isAdmin) {
                          navigate(`/members/${member.id}`);
                        }
                      }}
                      className="rounded-2xl border border-black bg-white px-4 py-4 shadow-[0_3px_0_#FFC800] sm:px-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        {/* MEMBER INFO */}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xl font-medium">
                            {member.name}
                          </div>

                          {paused ? (
                            <div className="mt-1 text-xs font-bold uppercase tracking-wide text-orange-600">
                              Membership Paused
                            </div>
                          ) : (
                            <div
                              className={`mt-1 text-xs font-bold uppercase tracking-wide ${
                                Number(member.totalRemainingCredits) <= 4
                                  ? "text-red-600"
                                  : "text-black"
                              }`}
                            >
                              Credits Remaining:{" "}
                              {member.totalRemainingCredits}
                            </div>
                          )}
                        </div>

                        {/* CONTROLS */}
                        <div
                          className="flex flex-wrap items-center justify-end gap-2"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <select
                            value={selectedTiming}
                            disabled={attendanceDisabled}
                            onChange={(event) =>
                              setSelectedTimings((previous) => ({
                                ...previous,
                                [member.id]: event.target.value,
                              }))
                            }
                            className={`h-12 min-w-[150px] rounded-xl border border-black bg-white px-4 text-sm outline-none ${
                              attendanceDisabled
                                ? "cursor-not-allowed opacity-40"
                                : "cursor-pointer"
                            }`}
                          >
                            <option value="">
                              {isCheckedIn
                                ? "Checked In"
                                : paused
                                  ? "Paused"
                                  : "Select a Time Slot"}
                            </option>

                            {!attendanceDisabled &&
                              classTimings.map((timing) => (
                                <option key={timing} value={timing}>
                                  {timing}
                                </option>
                              ))}
                          </select>

                          <button
                            type="button"
                            disabled={attendanceDisabled || !selectedTiming}
                            onClick={() =>
                              processAttendance(member.id, "CHECKIN")
                            }
                            className={`h-12 rounded-xl px-5 text-sm font-semibold transition ${
                              attendanceDisabled || !selectedTiming
                                ? "cursor-not-allowed border border-black/10 bg-zinc-100 text-zinc-400"
                                : "bg-[#FFC800] text-black hover:bg-[#f0bc00] active:scale-[0.98]"
                            }`}
                          >
                            {isCheckedIn ? "Checked In" : "Check In"}
                          </button>

                          {isAdmin && !isCheckedIn && (
                            <>
                              <button
                                type="button"
                                disabled={
                                  attendanceDisabled || !selectedTiming
                                }
                                onClick={() =>
                                  processAttendance(member.id, "NO_SHOW")
                                }
                                className="h-12 rounded-xl bg-[#171722] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                No Show
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteMember(member.id)}
                                className="h-12 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default CheckInPage;
