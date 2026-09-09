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

  /*
   * PT timings:
   * 6:00 AM
   * 6:30 AM
   * 7:00 AM
   * ...
   * 8:00 PM
   * 8:30 PM
   */
  const ptTimings = [];

  for (
    let minutes = 6 * 60;
    minutes <= 20 * 60 + 30;
    minutes += 30
  ) {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const period =
      hour24 >= 12 ? "PM" : "AM";

    const hour12 =
      hour24 === 0
        ? 12
        : hour24 > 12
        ? hour24 - 12
        : hour24;

    const formattedMinute =
      minute === 0 ? "00" : "30";

    ptTimings.push(
      `${hour12}:${formattedMinute} ${period}`
    );
  }

  useEffect(() => {
    fetchAllMembers();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setMembers([]);
      return;
    }

    const filteredMembers =
      allMembers.filter((member) =>
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
      toast.error(
        "Failed to delete member"
      );
    }
  };

  return (

    <div
      className="
        min-h-screen
        text-black
        px-8
        py-10
      "
      onClick={() => {
        setMembers([]);
        setQuery("");
      }}
    >

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">

          <h1
            className="
              text-5xl
              md:text-6xl
              font-black
              tracking-tight
              leading-none
            "
          >
            PT Check-In
          </h1>

          <p
            className="
              text-lg
              md:text-xl
              mt-3
              text-black/60
              font-medium
            "
          >
            Search for your name to check in
          </p>

        </div>

        {/* SEARCH BAR */}
        <div
          className="
            relative
            group
          "
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
              transition
              group-focus-within:scale-110
            "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
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
              h-24
              pl-20
              pr-8
              rounded-[28px]
              bg-white
              text-black
              text-3xl
              font-medium
              outline-none
              shadow-[0_12px_35px_rgba(0,0,0,0.14)]
              border-2
              border-transparent
              focus:border-black
              transition
              placeholder:text-black/40
            "
          />

        </div>

        {/* MEMBER RESULTS */}
        <div className="mt-10 space-y-5">

          {members.map((member) => {

            const selectedTime =
              selectedTimes[member.id] || "";

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
                  bg-black
                  border
                  border-black/10
                  p-6
                  rounded-[28px]
                  flex
                  items-center
                  shadow-[0_12px_30px_rgba(0,0,0,0.20)]
                  cursor-pointer
                  transition
                  hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]
                "
              >

                {/* MEMBER INFORMATION */}
                <div className="flex-1 min-w-0">

                  <div
                    className="
                      text-3xl
                      md:text-4xl
                      font-bold
                      tracking-tight
                      text-white
                    "
                  >
                    {member.name}
                  </div>

                  <div
                    className={`
                      text-xl
                      mt-2
                      font-medium
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
                    gap-3
                    flex-shrink-0
                  "
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  {/* PT TIMING DROPDOWN */}
                  <div
                    className="
                      relative
                      h-12
                      flex-shrink-0
                    "
                    style={{
                      width: "140px"
                    }}
                  >

                    <select
                      value={selectedTime}
                      onChange={(e) => {

                        setSelectedTimes(
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
                        w-full
                        h-12
                        rounded-2xl
                        text-lg
                        font-bold
                        outline-none
                        cursor-pointer
                        pl-4
                        pr-10
                        border-2
                        border-transparent
                        hover:border-black/20
                        focus:border-black
                        transition
                      "
                    >

                      <option value="">
                        PT Time
                      </option>

                      {ptTimings.map(
                        (timing) => (
                          <option
                            key={timing}
                            value={timing}
                          >
                            {timing}
                          </option>
                        )
                      )}

                    </select>

                    {/* DROPDOWN ARROW */}
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
                    disabled={!selectedTime}
                    onClick={() =>
                      processAttendance(
                        member.id,
                        "CHECKIN"
                      )
                    }
                    className={`
                      h-12
                      px-6
                      rounded-2xl
                      text-lg
                      font-bold
                      whitespace-nowrap
                      transition-all
                      ${
                        selectedTime
                          ? `
                            bg-yellow-400
                            text-black
                            shadow-md
                            hover:bg-yellow-300
                            active:scale-95
                            cursor-pointer
                          `
                          : `
                            bg-white/30
                            text-white/40
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
                      disabled={!selectedTime}
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
                        transition-all
                        ${
                          selectedTime
                            ? `
                              bg-zinc-700
                              text-white
                              hover:bg-zinc-600
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
                        hover:bg-red-500
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