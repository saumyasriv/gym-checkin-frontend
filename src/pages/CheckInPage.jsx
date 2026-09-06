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

  const [currentTime, setCurrentTime] = useState(
    new Date()
  );

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

    const filteredMembers =
      allMembers.filter(member =>
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

      toast.error(
        "Failed to load members"
      );

    }

  };


  const getTimingMinutes = (timing) => {

    const [time, period] =
      timing.split(" ");

    let [hours, minutes] =
      time.split(":").map(Number);

    if (period === "AM") {

      if (hours === 12) {
        hours = 0;
      }

    } else {

      if (hours !== 12) {
        hours += 12;
      }

    }

    return (
      hours * 60 +
      minutes
    );

  };


  const isTimingDisabled = (timing) => {

    const currentMinutes =
      currentTime.getHours() * 60 +
      currentTime.getMinutes();

    const classMinutes =
      getTimingMinutes(timing);

    /*
      Session is available from the class start
      until 30 minutes after the class.

      Example:
      6:00 PM
      Available: 6:00 PM - 6:30 PM
      Disabled after 6:30 PM
    */

    return (
      currentMinutes < classMinutes ||
      currentMinutes > classMinutes + 30
    );

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

        toast.success(
          "Checked in!"
        );

      } else {

        toast.success(
          "No show marked!"
        );

      }


      setMembers(prevMembers =>
        prevMembers.map(member => {

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


      setAllMembers(prevMembers =>
        prevMembers.map(member => {

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


      setSelectedTimings(prev => {

        const updated = {
          ...prev
        };

        delete updated[memberId];

        return updated;

      });


    } catch (error) {

      console.error(error);

      const message =
        error.response?.data;


      if (
        message === "Credits expired"
      ) {

        toast.error(
          "Credits expired!"
        );

      } else {

        toast.error(
          "No Credits!"
        );

      }

    }

  };


  const deleteMember = async (
    memberId
  ) => {

    const confirmed =
      window.confirm(
        "Delete this member permanently?"
      );

    if (!confirmed) {
      return;
    }


    try {

      await axios.delete(
        `${API_BASE_URL}/members/${memberId}`
      );

      toast.success(
        "Member deleted"
      );


      setMembers(currentMembers =>
        currentMembers.filter(
          member =>
            member.id !== memberId
        )
      );


      setAllMembers(currentMembers =>
        currentMembers.filter(
          member =>
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


  const formattedDate =
    currentTime.toLocaleDateString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        day: "numeric",
        month: "long",
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

      <div
        className="
          max-w-5xl
          mx-auto
        "
      >


        {/* HEADER */}

        <div
          className="
            mb-10
            relative
          "
        >

          <h1
            className="
              text-6xl
              font-bold
              tracking-tight
            "
          >
            Member Check-In
          </h1>


          <p
            className="
              text-black
              text-xl
              mt-3
            "
          >
            Group class check-ins
          </p>


          {/* SMALL DATE + TIME */}

          <div
            className="
              absolute
              right-0
              top-1
              text-right
              text-sm
              font-medium
              leading-tight
            "
          >

            <div>
              {formattedDate}
            </div>

            <div
              className="
                mt-1
                text-black/60
              "
            >
              {formattedTime}
            </div>

          </div>

        </div>


        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search member..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          onClick={(e) =>
            e.stopPropagation()
          }
          className="
            w-full
            p-6
            rounded-3xl
            bg-white
            text-black
            text-3xl
            outline-none
            shadow-2xl
          "
        />


        {/* MEMBERS */}

        <div
          className="
            mt-10
            space-y-4
          "
        >

          {members.map(member => {

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
                  border
                  border-black/10
                  px-5
                  py-4
                  rounded-3xl
                  flex
                  items-center
                  shadow-xl
                  cursor-pointer
                "
              >


                {/* MEMBER INFO */}

                <div
                  className="
                    flex-1
                    min-w-0
                  "
                >

                  <div
                    className="
                      text-3xl
                      font-semibold
                      text-white
                    "
                  >
                    {member.name}
                  </div>


                  <div
                    className={`
                      text-xl
                      mt-1
                      ${
                        member.totalRemainingCredits <= 4
                          ? "text-red-500 font-bold"
                          : "text-zinc-400"
                      }
                    `}
                  >
                    {member.totalRemainingCredits}
                    {" "}
                    credits remaining
                  </div>

                </div>


                {/* COMPACT CONTROLS */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    flex-shrink-0
                  "
                >


                  {/* SESSION */}

                  <select
                    value={selectedTiming}
                    onChange={(e) => {

                      e.stopPropagation();

                      setSelectedTimings(
                        prev => ({
                          ...prev,
                          [member.id]:
                            e.target.value
                        })
                      );

                    }}
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                    className="
                      h-12
                      w-[145px]
                      bg-white
                      text-black
                      px-4
                      rounded-2xl
                      text-lg
                      font-bold
                      outline-none
                      cursor-pointer
                    "
                  >

                    <option value="">
                      Session
                    </option>

                    {classTimings.map(
                      timing => (

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
                    onClick={(e) => {

                      e.stopPropagation();

                      processAttendance(
                        member.id,
                        "CHECKIN"
                      );

                    }}
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
                      onClick={(e) => {

                        e.stopPropagation();

                        processAttendance(
                          member.id,
                          "NO_SHOW"
                        );

                      }}
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
                      onClick={(e) => {

                        e.stopPropagation();

                        deleteMember(
                          member.id
                        );

                      }}
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