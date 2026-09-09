import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

function PTCheckInPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState({});

  const isAdmin =
    localStorage.getItem("isAdmin") === "true";

  const hours = Array.from(
    { length: 24 },
    (_, index) => index
  );

  const minutes = [
    "00",
    "05",
    "10",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
    "55"
  ];

  useEffect(() => {
    fetchAllMembers();
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

  const processAttendance = async (
    memberId,
    type
  ) => {
    const selectedTime =
      selectedTimes[memberId];

    if (!selectedTime) {
      toast.error(
        "Please select a PT timing first."
      );
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/checkins`,
        {
          memberId,
          type,
          classTiming: selectedTime
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

      setSelectedTimes((prev) => {
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

  const formatHour = (hour) => {
    if (hour === 0) return "12";
    if (hour > 12) return String(hour - 12);
    return String(hour);
  };

  const getPeriod = (hour) => {
    return hour >= 12 ? "PM" : "AM";
  };

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
            PT Check-In
          </h1>

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

            const selectedTime =
              selectedTimes[member.id] || {
                hour: "",
                minute: ""
              };

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

                  {/* HOUR */}
                  <select
                    value={selectedTime.hour}
                    onChange={(e) => {
                      setSelectedTimes(
                        (prev) => ({
                          ...prev,
                          [member.id]: {
                            hour: e.target.value,
                            minute:
                              prev[member.id]?.minute || ""
                          }
                        })
                      );
                    }}
                    className="
                      bg-white
                      text-black
                      h-12
                      w-24
                      rounded-2xl
                      text-lg
                      font-bold
                      outline-none
                      cursor-pointer
                      px-3
                    "
                  >
                    <option value="">
                      Hour
                    </option>

                    {hours.map((hour) => (
                      <option
                        key={hour}
                        value={hour}
                      >
                        {formatHour(hour)}{" "}
                        {getPeriod(hour)}
                      </option>
                    ))}
                  </select>

                  {/* MINUTES */}
                  <select
                    value={selectedTime.minute}
                    onChange={(e) => {
                      setSelectedTimes(
                        (prev) => ({
                          ...prev,
                          [member.id]: {
                            hour:
                              prev[member.id]?.hour || "",
                            minute: e.target.value
                          }
                        })
                      );
                    }}
                    className="
                      bg-white
                      text-black
                      h-12
                      w-24
                      rounded-2xl
                      text-lg
                      font-bold
                      outline-none
                      cursor-pointer
                      px-3
                    "
                  >
                    <option value="">
                      Min
                    </option>

                    {minutes.map((minute) => (
                      <option
                        key={minute}
                        value={minute}
                      >
                        :{minute}
                      </option>
                    ))}
                  </select>

                  {/* CHECK IN */}
                  <button
                    disabled={
                      !selectedTime.hour ||
                      !selectedTime.minute
                    }
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
                        selectedTime.hour &&
                        selectedTime.minute
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
                      disabled={
                        !selectedTime.hour ||
                        !selectedTime.minute
                      }
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
                          selectedTime.hour &&
                          selectedTime.minute
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

export default PTCheckInPage;