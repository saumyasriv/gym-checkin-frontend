import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

function CheckInPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedTimings, setSelectedTimings] = useState({});

  const [currentTime, setCurrentTime] = useState(new Date());

  const classTimings = [
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM"
  ];

  const isAdmin =
    localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    fetchAllMembers();
  }, []);

  /*
   * Keep the clock updated every minute.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  /*
   * Filter members when searching.
   */
  useEffect(() => {
    if (!query.trim()) {
      setMembers([]);
      return;
    }

    const filteredMembers = allMembers.filter((member) =>
      member.name
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    setMembers(filteredMembers);
  }, [query, allMembers]);

  const fetchAllMembers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/members`
      );

      setAllMembers(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load members");
    }
  };

  /*
   * Convert:
   * "6:00 AM" -> 360
   * "6:00 PM" -> 1080
   */
  const getTimingMinutes = (timing) => {
    const [time, period] = timing.split(" ");

    let [hours, minutes] = time
      .split(":")
      .map(Number);

    if (period === "AM") {
      if (hours === 12) {
        hours = 0;
      }
    } else {
      if (hours !== 12) {
        hours += 12;
      }
    }

    return hours * 60 + minutes;
  };

  /*
   * A class remains selectable from before its start
   * until 30 minutes after it starts.
   *
   * Example:
   *
   * 5:59 PM
   * 5:00 PM -> disabled
   * 6:00 PM -> enabled
   * 7:00 PM -> enabled
   *
   * 6:31 PM
   * 6:00 PM -> disabled
   */
  const isTimingDisabled = (timing) => {
    const currentMinutes =
      currentTime.getHours() * 60 +
      currentTime.getMinutes();

    const classMinutes =
      getTimingMinutes(timing);

    return currentMinutes > classMinutes + 30;
  };

  const processAttendance = async (
    memberId,
    type
  ) => {
    const classTiming =
      selectedTimings[memberId];

    if (!classTiming) {
      toast.error(
        "Please select a class timing first."
      );
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/checkins`,
        {
          memberId,
          type,
          classTiming
        }
      );

      if (type === "CHECKIN") {
        toast.success("Checked in!");
      } else {
        toast.success("No show marked!");
      }

      /*
       * Update the visible search results.
       */
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member.id === memberId) {
            return {
              ...member,
              totalRemainingCredits:
                Number(
                  member.totalRemainingCredits
                ) - 1
            };
          }

          return member;
        })
      );

      /*
       * Update the master member list as well.
       */
      setAllMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member.id === memberId) {
            return {
              ...member,
              totalRemainingCredits:
                Number(
                  member.totalRemainingCredits
                ) - 1
            };
          }

          return member;
        })
      );

      /*
       * Clear selected session after attendance.
       */
      setSelectedTimings((prev) => {
        const updated = { ...prev };

        delete updated[memberId];

        return updated;
      });
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data;

      if (message === "Credits expired") {
        toast.error("Credits expired!");
      } else {
        toast.error("No Credits!");
      }
    }
  };

  const deleteMember = async (memberId) => {
    const confirmed = window.confirm(
      "Delete this member permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/members/${memberId}`
      );

      toast.success("Member deleted");

      setMembers((currentMembers) =>
        currentMembers.filter(
          (member) =>
            member.id !== memberId
        )
      );

      setAllMembers((currentMembers) =>
        currentMembers.filter(
          (member) =>
            member.id !== memberId
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete member");
    }
  };

  /*
   * Date shown at top-right.
   */
  const formattedDate =
    currentTime.toLocaleDateString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );

  /*
   * Time shown at top-right.
   */
  const formattedTime =
    currentTime.toLocaleTimeString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }
    );

  return (
    <div
      className="
        min-h-screen
        text-black
        px-14
        py-6
      "
      onClick={() => {
        setMembers([]);
        setQuery("");
      }}
    >
      <div className="w-full">

        {/* HEADER */}
        <div className="relative mb-10">

          <h1
            className="
              text-[72px]
              leading-none
              font-bold
              tracking-tight
            "
          >
            Member Check-In
          </h1>

          <p
            className="
              text-[34px]
              leading-none
              mt-4
              text-black/80
            "
          >
            Group class check-ins
          </p>

          {/* DATE + TIME */}
          <div
            className="
              absolute
              right-2
              top-2
              text-right
            "
          >
            <div
              className="
                text-[30px]
                font-medium
                leading-tight
              "
            >
              {formattedDate}
            </div>

            <div
              className="
                text-[30px]
                font-medium
                leading-tight
                mt-3
              "
            >
              {formattedTime}
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div
          className="
            relative
            w-full
            mb-6
          "
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {/* SEARCH ICON */}
          <svg
            className="
              absolute
              left-8
              top-1/2
              -translate-y-1/2
              w-10
              h-10
              text-black
            "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />
            <line
              x1="16.65"
              y1="16.65"
              x2="21"
              y2="21"
            />
          </svg>

          <input
            type="text"
            placeholder="Search member..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            className="
              w-full
              h-[96px]
              pl-24
              pr-8
              rounded-[32px]
              bg-white
              text-black
              text-[32px]
              outline-none
              shadow-xl
            "
          />
        </div>

        {/* MEMBER RESULTS */}
        <div className="space-y-6">

          {members.map((member) => {
            const selectedTiming =
              selectedTimings[member.id] || "";

            return (
              <div
                key={member.id}
                onClick={(e) => {
                  e.stopPropagation();

                  if (isAdmin) {
                    navigate(
                      `/members/${member.id}`
                    );
                  }
                }}
                className="
                  w-full
                  min-h-[168px]
                  bg-black/80
                  backdrop-blur-md
                  px-9
                  py-7
                  rounded-[32px]
                  flex
                  items-center
                  shadow-xl
                  cursor-pointer
                "
              >

                {/* MEMBER INFORMATION */}
                <div className="flex-1 min-w-0">

                  <div
                    className="
                      text-[42px]
                      leading-tight
                      font-semibold
                      text-white
                    "
                  >
                    {member.name}
                  </div>

                  <div
                    className={`
                      text-[30px]
                      leading-tight
                      mt-3
                      ${
                        member.totalRemainingCredits <= 4
                          ? "text-red-500 font-bold"
                          : "text-zinc-300"
                      }
                    `}
                  >
                    {member.totalRemainingCredits}{" "}
                    credits remaining
                  </div>

                </div>

                {/* CONTROLS */}
                <div
                  className="
                    flex
                    items-center
                    gap-5
                    flex-shrink-0
                  "
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  {/* SESSION */}
                  <select
                    value={selectedTiming}
                    onChange={(e) => {
                      setSelectedTimings(
                        (prev) => ({
                          ...prev,
                          [member.id]:
                            e.target.value
                        })
                      );
                    }}
                    className="
                      h-[92px]
                      w-[218px]
                      bg-white
                      text-black
                      px-8
                      rounded-[24px]
                      text-[28px]
                      font-bold
                      outline-none
                      cursor-pointer
                    "
                  >
                    <option value="">
                      Session
                    </option>

                    {classTimings.map(
                      (timing) => (
                        <option
                          key={timing}
                          value={timing}
                          disabled={isTimingDisabled(
                            timing
                          )}
                        >
                          {timing}
                        </option>
                      )
                    )}
                  </select>

                  {/* CHECK IN */}
                  <button
                    disabled={!selectedTiming}
                    onClick={() =>
                      processAttendance(
                        member.id,
                        "CHECKIN"
                      )
                    }
                    className={`
                      h-[92px]
                      px-9
                      rounded-[24px]
                      text-[28px]
                      font-bold
                      whitespace-nowrap
                      transition
                      ${
                        selectedTiming
                          ? `
                            bg-white
                            text-black
                            active:scale-95
                            cursor-pointer
                          `
                          : `
                            bg-white/40
                            text-black/40
                            cursor-not-allowed
                          `
                      }
                    `}
                  >
                    Check In
                  </button>

                  {/* NO SHOW — ADMIN ONLY */}
                  {isAdmin && (
                    <button
                      disabled={!selectedTiming}
                      onClick={() =>
                        processAttendance(
                          member.id,
                          "NO_SHOW"
                        )
                      }
                      className={`
                        h-[92px]
                        px-9
                        rounded-[24px]
                        text-[28px]
                        font-bold
                        whitespace-nowrap
                        transition
                        ${
                          selectedTiming
                            ? `
                              bg-zinc-700
                              text-white
                              active:scale-95
                              cursor-pointer
                            `
                            : `
                              bg-zinc-700/40
                              text-white/40
                              cursor-not-allowed
                            `
                        }
                      `}
                    >
                      No Show
                    </button>
                  )}

                  {/* DELETE — ADMIN ONLY */}
                  {isAdmin && (
                    <button
                      onClick={() =>
                        deleteMember(
                          member.id
                        )
                      }
                      className="
                        h-[92px]
                        px-10
                        rounded-[24px]
                        text-[28px]
                        font-bold
                        whitespace-nowrap
                        bg-red-600
                        text-white
                        active:scale-95
                        transition
                        cursor-pointer
                      "
                    >
                      Delete
                    </button>
                  )}

                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

export default CheckInPage;