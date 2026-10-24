
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";
import troopGym from "../assets/troop-gym.jpg";
import logo from "../assets/troop-logo-white.png";

function CheckInPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [members, setMembers] = useState([]);

  const isAdmin = localStorage.getItem("isAdmin") === "true";

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
          member.memberType !== "PT" &&
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

  const processAttendance = async (memberId, type) => {
    try {
      await axios.post(`${API_BASE_URL}/checkins`, {
        memberId,
        type,
      });

      if (type === "CHECKIN") {
        toast.success("Checked in!");
      } else {
        toast.success("No show marked!");
      }

      const updateCredits = (previous) =>
        previous.map((member) =>
          member.id === memberId
            ? {
                ...member,
                totalRemainingCredits:
                  Number(member.totalRemainingCredits) - 1,
              }
            : member
        );

      setMembers(updateCredits);
      setAllMembers(updateCredits);
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
    <div className="min-h-screen bg-[#F5F5F2] text-[#171717]">
      <div className="min-h-screen sm:ml-[35vw]">
        {/* Gym image panel */}
        <aside className="relative h-[30vh] min-h-[180px] w-full overflow-hidden bg-[#111111] sm:fixed sm:bottom-0 sm:left-0 sm:top-0 sm:h-auto sm:min-h-0 sm:w-[35vw]">
          <img
            src={troopGym}
            alt="The Troop gym"
            className="absolute inset-0 h-full w-full object-cover object-center grayscale"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/90" />

          <div className="absolute left-5 top-5 z-10 h-16 w-16 overflow-hidden sm:left-10 sm:top-10 sm:h-24 sm:w-24">
            <img
              src={logo}
              alt="TROOP"
              className="h-full w-full object-contain mix-blend-screen"
            />
          </div>

          <div className="absolute bottom-6 left-5 right-5 z-10 sm:bottom-12 sm:left-10 sm:right-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FFC800]/60 bg-black/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#FFC800] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[#FFC800]" />
              Group class training
            </div>

            <h2 className="max-w-sm text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl lg:text-5xl">
              Show up.
              <br />
              Get stronger.
            </h2>

            <p className="mt-3 max-w-xs text-sm font-medium leading-relaxed text-white/70 sm:text-base">
              Train together. Get better together.
            </p>

            <div className="mt-5 h-1.5 w-16 rounded-full bg-[#FFC800]" />
          </div>
        </aside>

        {/* Main check-in area */}
        <main className="min-h-screen border-t-[6px] border-[#FFC800] bg-[#F5F5F2] sm:border-t-0">
          <section className="mx-auto w-full max-w-[1100px] px-5 pb-12 pt-8 sm:px-7 sm:pt-12 lg:px-10 lg:pt-16">
            {/* Page heading */}
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#777777]">
                <span className="h-2 w-2 rounded-full bg-[#FFC800]" />
                The Troop / Member Check-in
              </div>

              <h1 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl lg:text-5xl">
                Time to put
                <br className="sm:hidden" /> in work.
                <span className="text-[#D6A600]"> Let’s go.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-[#686868] sm:text-base">
                Select your training session, find your name, and get ready to
                move.
              </p>
            </div>

            {/* Session selection */}
            <div className="mb-8">
              <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#777777]">
                Choose your session
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("/check-in/group")}
                  className="flex min-h-[76px] items-center gap-3 rounded-xl border-2 border-[#171717] bg-[#FFC800] px-4 py-4 text-left shadow-[0_4px_0_#171717] transition hover:-translate-y-0.5 hover:bg-[#FFD633] active:translate-y-0 active:shadow-none sm:px-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-black text-[#FFC800]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <circle cx="9" cy="8" r="3" />
                      <path d="M3.5 19v-1.5a5.5 5.5 0 0 1 11 0V19" />
                      <path d="M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8V19" />
                    </svg>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black uppercase tracking-wide sm:text-base">
                      Group Class
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-black/65">
                      Train together
                    </span>
                  </span>

                  <span className="text-xl font-black">✓</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/check-in/pt")}
                  className="group flex min-h-[76px] items-center gap-3 rounded-xl border-2 border-[#222222] bg-white px-4 py-4 text-left transition duration-150 hover:-translate-y-0.5 hover:bg-[#FFF5CC] active:translate-y-0 sm:px-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EEEEEA] transition group-hover:bg-[#FFC800]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <path d="m6.5 6.5 11 11M4 9l5-5M15 20l5-5M2 11l9-9M13 22l9-9" />
                    </svg>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black uppercase tracking-wide sm:text-base">
                      One on One
                    </span>
                    <span className="mt-1 block text-xs font-medium text-[#777777]">
                      Personal training
                    </span>
                  </span>

                  <span className="text-xl font-black text-[#AAAAAA]">↗</span>
                </button>
              </div>
            </div>

            {/* Member search */}
            <div className="mb-7">
              <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#777777]">
                Find your profile
              </div>

              <form
                className="flex w-full flex-col gap-3 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  setQuery(query.trim());
                }}
              >
                <div className="relative min-w-0 flex-1">
                  <svg
                    className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#555555]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                  </svg>

                  <input
                    type="text"
                    value={query}
                    placeholder="Search member name..."
                    aria-label="Search member name"
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") clearSearch();
                    }}
                    className="h-14 w-full rounded-xl border-2 border-[#D1D1CC] bg-white pl-12 pr-4 text-base font-semibold outline-none transition placeholder:font-medium placeholder:italic placeholder:text-[#999999] focus:border-[#171717] focus:ring-2 focus:ring-[#FFC800]"
                  />
                </div>

                <button
                  type="submit"
                  className="h-14 shrink-0 rounded-xl border-2 border-[#171717] bg-[#171717] px-8 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#333333] active:translate-y-0.5 sm:min-w-[130px]"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Member results */}
            <div className="space-y-4">
              {members.map((member) => {
                const credits = Number(member.totalRemainingCredits ?? 0);

                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      if (isAdmin) navigate(`/members/${member.id}`);
                    }}
                    className="group overflow-hidden rounded-xl border-2 border-[#E0E0DB] bg-white transition duration-150 hover:border-[#C6A000] hover:shadow-[0_4px_0_#FFC800]"
                  >
                    <div className="h-1.5 bg-[#FFC800]" />

                    <div className="grid grid-cols-1 items-center gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
                      {/* Member information */}
                      <div className="min-w-0">
                        <div className="break-words text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl">
                          {member.name}
                        </div>

                        <div
                          className={`mt-3 inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wider ${
                            credits <= 4
                              ? "bg-red-50 text-red-600"
                              : "bg-[#FFF5CC] text-[#6E5600]"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              credits <= 4 ? "bg-red-500" : "bg-[#D5A600]"
                            }`}
                          />
                          <span className="break-words">
                            Credits Remaining: {credits}
                          </span>
                        </div>
                      </div>

                      {/* Group check-in actions */}
                      <div
                        className="flex flex-wrap items-end gap-2 lg:justify-end"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            processAttendance(member.id, "CHECKIN")
                          }
                          className="h-14 min-w-[120px] flex-1 rounded-xl border-2 border-[#171717] bg-[#FFC800] px-4 text-xs font-black uppercase tracking-wider text-[#171717] transition hover:bg-[#FFD633] active:translate-y-0.5 sm:flex-none"
                        >
                          Check In
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                processAttendance(member.id, "NO_SHOW")
                              }
                              className="h-14 rounded-xl border-2 border-[#171717] bg-[#171717] px-4 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#333333] active:translate-y-0.5"
                            >
                              No Show
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteMember(member.id)}
                              className="h-14 rounded-xl border-2 border-red-600 bg-white px-3 text-xs font-black uppercase tracking-wider text-red-600 transition hover:bg-red-600 hover:text-white"
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

            {/* Empty search state */}
            {query.trim() && members.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-[#D5D5CF] bg-white px-5 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0B3]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                  </svg>
                </div>

                <h3 className="text-base font-black uppercase tracking-wide">
                  No member found
                </h3>
                <p className="mt-1 text-sm font-medium text-[#777777]">
                  Check the spelling or try another name.
                </p>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-4 rounded-lg border-2 border-[#171717] px-4 py-2 text-xs font-black uppercase tracking-wider transition hover:bg-[#FFC800]"
                >
                  Clear Search
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default CheckInPage;
