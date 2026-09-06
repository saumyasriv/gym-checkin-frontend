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
    "8:15 AM",
    "6:00 PM",
    "10:00 PM"
  ];

  const isAdmin =
    localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    fetchAllMembers();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

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
   * A session is available until 30 minutes
   * after its start time.
   *
   * Example:
   * 5:59 PM:
   * 5:00 PM -> disabled
   * 6:00 PM -> available
   * 7:00 PM -> available
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
   * Date and time are explicitly displayed
   * in Indian Standard Time.
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
        p-8
      "
      onClick={() => {
        setMembers([]);
        setQuery("");
      }}
    >
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 relative">

          <h1 className="text-6xl font-bold tracking-tight">
            Member Check-In
          </h1>

          <p className="text-black text-xl mt-3">
            Group class check-ins
          </p>

         {/* DAY + DATE + TIME */}
<div
  className="
    absolute
    right-0
    top-0
    text-right
    font-bold
    leading-tight
  "
>
  <div className="text-2xl">
    {formattedDate}
  </div>

  <div
    className="
      text-2xl
      mt-2
      text-black/70
      font-bold
    "
  >
    {formattedTime}
  </div>
</div>

        {/* SEARCH BAR */}
        <div
          className="relative"
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          {/* SEARCH ICON */}
          <svg
            className="
              absolute
              left-7
              top-1/2
              -translate-y-1/2
              w-8
              h-8
              text-black
              pointer-events-none
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
              p-6
              pl-20
              rounded-3xl
              bg-white
              text-black
              text-3xl
              outline-none
              shadow-2xl
            "
          />

        </div>

        {/* MEMBER RESULTS */}
        <div className="mt-10 space-y-5">

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
                  bg-black/80
                  backdrop-blur-md
                  border border-black/10
                  p-6
                  rounded-3xl
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
                      text-4xl
                      font-semibold
                      text-white
                    "
                  >
                    {member.name}
                  </div>

                  <div
                    className={`
                      text-2xl
                      mt-2
                      ${
                        member.totalRemainingCredits <= 4
                          ? "text-red-500 font-bold"
                          : "text-zinc-400"
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
                    gap-2
                    flex-shrink-0
                  "
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  {/* SESSION */}
                  <div
                    className="
                      relative
                      h-12
                      flex-shrink-0
                    "
                    style={{
                      width: "125px",
                      minWidth: "125px",
                      maxWidth: "125px"
                    }}
                  >

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
                        appearance-none
                        bg-white
                        text-black
                        h-12
                        rounded-2xl
                        text-lg
                        font-bold
                        outline-none
                        cursor-pointer
                        pl-4
                        pr-9
                      "
                      style={{
                        width: "125px",
                        minWidth: "125px",
                        maxWidth: "125px"
                      }}
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

                    {/* PROMINENT ARROW */}
                    <svg
                      className="
                        pointer-events-none
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        w-5
                        h-5
                        text-black
                      "
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>

                  </div>

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
                      h-12
                      px-5
                      rounded-2xl
                      text-lg
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
                            text-black/50
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
                        h-12
                        px-5
                        rounded-2xl
                        text-lg
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
                        h-12
                        px-5
                        rounded-2xl
                        text-lg
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