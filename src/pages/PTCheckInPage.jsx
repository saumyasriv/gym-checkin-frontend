import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";
import troopGym from "../assets/troop-gym.jpg";
import logo from "../assets/troop-logo-white.png";

function PTCheckInPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [checkedInMembers, setCheckedInMembers] = useState({});

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const ptTimings = [];
  for (let minutes = 6 * 60; minutes <= 20 * 60 + 30; minutes += 30) {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24;
    ptTimings.push(`${hour12}:${minute === 0 ? "00" : "30"} ${period}`);
  }

  useEffect(() => {
    fetchAllMembers();
  }, []);

  useEffect(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      setMembers([]);
      return;
    }

    setMembers(
      allMembers.filter(
        (member) =>
          member.memberType === "PT" &&
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
    const hasUsable = hasUsableMembership(member);

    return (
      !hasUsable &&
      memberships.some(
        (membership) =>
          membership.paused === true && membership.remainingCredits > 0
      )
    );
  };

  const processAttendance = async (memberId, type) => {
    const member = allMembers.find((item) => item.id === memberId);

    if (member && !hasUsableMembership(member)) {
      toast.error(
        hasPausedMembershipOnly(member)
          ? "Membership is paused."
          : "No active membership."
      );
      return;
    }

    const selectedTime = selectedTimes[memberId];

    if (!selectedTime) {
      toast.error("Please select a PT timing first.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/checkins`, {
        memberId,
        type,
        classTiming: selectedTime,
        memberType: "PT",
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

      const updateCredits = (previous) =>
        previous.map((memberItem) =>
          memberItem.id === memberId
            ? {
                ...memberItem,
                totalRemainingCredits:
                  Number(memberItem.totalRemainingCredits) - 1,
              }
            : memberItem
        );

      setMembers(updateCredits);
      setAllMembers(updateCredits);

      setSelectedTimes((previous) => {
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
    if (!window.confirm("Delete this member permanently?")) return;

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
    <div className="min-h-screen bg-white text-black">
      <div className="min-h-screen lg:ml-[35vw]">
        <aside className="fixed bottom-0 left-0 top-[18px] hidden w-[35vw] overflow-hidden bg-black lg:block">
          <img
            src={troopGym}
            alt="Gym"
            className="absolute inset-0 h-full w-full object-cover object-center grayscale"
          />

          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute left-10 top-10 z-10 h-24 w-24 overflow-hidden">
            <img
              src={logo}
              alt="TROOP"
              className="h-full w-full object-contain mix-blend-screen"
            />
          </div>
        </aside>

        <main className="min-h-screen bg-white">
          <section className="mx-auto w-full max-w-[1100px] px-6 pb-16 pt-[120px] sm:px-10 lg:px-14">
            <div className="flex flex-wrap gap-5">
              <button
                type="button"
                onClick={() => navigate("/check-in/group")}
                className="rounded-2xl border-2 border-black bg-white px-7 py-3 text-base font-bold shadow-[0_4px_0_#111] transition hover:bg-[#FFC800] active:translate-y-[2px]"
              >
                Group Class
              </button>

              <button
                type="button"
                onClick={() => navigate("/check-in/pt")}
                className="rounded-2xl border-2 border-black bg-[#FFC800] px-7 py-3 text-base font-bold shadow-[0_4px_0_#111] transition hover:bg-[#FFC800] active:translate-y-[2px]"
              >
                Personal Training
              </button>
            </div>

            <div className="mt-14 flex w-full gap-3">
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
                  placeholder="Search PT member..."
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") clearSearch();
                  }}
                  className="h-14 w-full rounded-xl border border-black bg-white pl-12 pr-4 text-base italic outline-none transition focus:ring-2 focus:ring-[#FFC800]"
                />
              </div>

              <button
                type="button"
                onClick={() => setQuery(query.trim())}
                className="h-14 shrink-0 rounded-xl bg-[#171722] px-8 text-sm font-semibold text-white transition hover:bg-black"
              >
                Search
              </button>
            </div>

            <div className="mt-7 space-y-4">
              {members.map((member) => {
                const selectedTime = selectedTimes[member.id] || "";
                const usable = hasUsableMembership(member);
                const paused = hasPausedMembershipOnly(member);
                const isCheckedIn = checkedInMembers[member.id];
                const disabled = !usable || isCheckedIn;

                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      if (isAdmin) navigate(`/members/${member.id}`);
                    }}
                    className="rounded-2xl border border-black bg-white px-5 py-5 shadow-[0_3px_0_#FFC800] sm:px-6"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="break-words text-xl font-medium leading-snug">
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
                            Credits Remaining: {member.totalRemainingCredits}
                          </div>
                        )}
                      </div>

                      <div
                        className="flex shrink-0 flex-wrap items-center justify-end gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <select
                          value={selectedTime}
                          disabled={disabled}
                          onChange={(event) =>
                            setSelectedTimes((previous) => ({
                              ...previous,
                              [member.id]: event.target.value,
                            }))
                          }
                          className={`h-12 min-w-[150px] rounded-xl border border-black bg-white px-4 text-sm outline-none ${
                            disabled
                              ? "cursor-not-allowed opacity-40"
                              : "cursor-pointer"
                          }`}
                        >
                          <option value="">
                            {isCheckedIn
                              ? "Checked In"
                              : paused
                                ? "Paused"
                                : "Select PT Time"}
                          </option>

                          {!disabled &&
                            ptTimings.map((timing) => (
                              <option key={timing} value={timing}>
                                {timing}
                              </option>
                            ))}
                        </select>

                        <button
                          type="button"
                          disabled={disabled || !selectedTime}
                          onClick={() =>
                            processAttendance(member.id, "CHECKIN")
                          }
                          className={`h-12 rounded-xl px-5 text-sm font-semibold transition ${
                            disabled || !selectedTime
                              ? "cursor-not-allowed border border-black/10 bg-zinc-100 text-zinc-400"
                              : "bg-[#FFC800] text-black hover:bg-[#f0bc00]"
                          }`}
                        >
                          {isCheckedIn ? "Checked In" : "Check In"}
                        </button>

                        {isAdmin && !isCheckedIn && (
                          <>
                            <button
                              type="button"
                              disabled={disabled || !selectedTime}
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
  );
}

export default PTCheckInPage;
