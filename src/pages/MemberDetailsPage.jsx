import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

function MemberDetailsPage() {

  const { id } = useParams();

  const [member, setMember] = useState(null);

  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    fetchMember();
  }, []);

  const fetchMember = async () => {

    try {

      const response = await axios.get(
        `${API_BASE_URL}/members/${id}`
      );

      setMember(response.data);

    } catch (error) {

      console.error(error);
      toast.error("Failed to load member");

    }
  };

  const formatCheckinTime = (time) => {

    const date = new Date(time);

    const formattedTime =
      date.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

    const dateInIndia =
      date.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });

    const todayInIndia =
      new Date().toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });

    const yesterdayDate = new Date();

    yesterdayDate.setDate(
      yesterdayDate.getDate() - 1
    );

    const yesterdayInIndia =
      yesterdayDate.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });

    if (dateInIndia === todayInIndia) {
      return `Today • ${formattedTime}`;
    }

    if (dateInIndia === yesterdayInIndia) {
      return `Yesterday • ${formattedTime}`;
    }

    const formattedDate =
      date.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric"
      });

    return `${formattedDate} • ${formattedTime}`;
  };


  const getToday = () => {

    const today = new Date();

    return `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
  };


  const saveNotes = async () => {

    try {

      await axios.put(
        `${API_BASE_URL}/members/${id}/notes`,
        JSON.stringify({
          notes: member.notes || ""
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      toast.success(
        "Notes saved successfully!"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to save notes."
      );
    }
  };


  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };


  if (!member) {

    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          text-3xl
          font-bold
        "
      >
        Loading...
      </div>
    );

  }


  /*
   * Sort memberships by expiry date.
   *
   * Latest expiry = top
   * Oldest expiry = bottom
   *
   * Later, when startDate is added to the backend,
   * we can switch this to startDate sorting.
   */
  const sortedMemberships = [
    ...(member.memberships || [])
  ].sort((a, b) => {

    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;

    return (
      new Date(b.expiryDate) -
      new Date(a.expiryDate)
    );

  });


  return (

    <div
      className="
        min-h-screen
        text-black
        px-8
        py-10
        pb-20
      "
    >

      <div className="max-w-5xl mx-auto">


        {/* ================================================= */}
        {/* MEMBER HEADER */}
        {/* ================================================= */}

        <div className="mb-12">

          <div
            className="
              bg-black
              text-white
              rounded-[32px]
              p-8
              md:p-10
              shadow-[0_16px_40px_rgba(0,0,0,0.20)]
            "
          >

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">

              {/* MEMBER INFO */}
              <div>

                <div
                  className="
                    text-sm
                    uppercase
                    tracking-[0.2em]
                    text-yellow-400
                    font-bold
                    mb-3
                  "
                >
                  Member
                </div>

                <h1
                  className="
                    text-5xl
                    md:text-6xl
                    font-black
                    tracking-tight
                    leading-none
                  "
                >
                  {member.name}
                </h1>

                <div
                  className="
                    text-xl
                    text-zinc-400
                    mt-5
                  "
                >
                  {member.phone}
                </div>

                {member.email && (
                  <div
                    className="
                      text-xl
                      text-zinc-400
                      mt-1
                    "
                  >
                    {member.email}
                  </div>
                )}

              </div>


              {/* CREDITS */}
              <div
                className="
                  bg-yellow-400
                  text-black
                  rounded-3xl
                  px-7
                  py-5
                  min-w-[220px]
                "
              >

                <div
                  className="
                    text-sm
                    uppercase
                    tracking-wider
                    font-bold
                    opacity-70
                  "
                >
                  Credits
                </div>

                <div
                  className={`
                    text-4xl
                    font-black
                    mt-1
                    ${
                      member.totalRemainingCredits <= 4
                        ? "text-red-600"
                        : "text-black"
                    }
                  `}
                >
                  {member.totalRemainingCredits}
                </div>

                <div
                  className="
                    text-base
                    font-semibold
                    opacity-70
                  "
                >
                  Remaining
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* MEMBERSHIPS */}
        {/* ================================================= */}

        <div className="mb-16">

          <div
            className="
              flex
              items-end
              justify-between
              mb-6
            "
          >

            <div>

              <h2
                className="
                  text-4xl
                  md:text-5xl
                  font-black
                  tracking-tight
                "
              >
                Memberships
              </h2>

              <p
                className="
                  text-lg
                  text-black/50
                  mt-2
                  font-medium
                "
              >
                Latest membership first
              </p>

            </div>

            <div
              className="
                hidden
                md:block
                text-sm
                uppercase
                tracking-wider
                font-bold
                text-black/40
              "
            >
              {sortedMemberships.length}{" "}
              {sortedMemberships.length === 1
                ? "Membership"
                : "Memberships"}
            </div>

          </div>


          <div className="space-y-5">

            {sortedMemberships.map(
              (membership, index) => {

                const isExpired =
                  membership.expiryDate <
                  getToday();

                const isCurrent =
                  !isExpired &&
                  membership.remainingCredits > 0;

                return (

                  <div
                    key={
                      membership.id ||
                      `${membership.packageName}-${membership.expiryDate}-${index}`
                    }
                    className="
                      bg-black
                      text-white
                      rounded-[28px]
                      p-7
                      md:p-8
                      shadow-[0_12px_30px_rgba(0,0,0,0.18)]
                      transition
                      hover:shadow-[0_16px_40px_rgba(0,0,0,0.24)]
                    "
                  >

                    <div
                      className="
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-6
                      "
                    >

                      {/* PACKAGE */}
                      <div>

                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            mb-3
                          "
                        >

                          <h3
                            className="
                              text-3xl
                              md:text-4xl
                              font-black
                            "
                          >
                            {membership.packageName}
                          </h3>

                          {isCurrent && (
                            <span
                              className="
                                bg-yellow-400
                                text-black
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                font-bold
                                uppercase
                              "
                            >
                              Active
                            </span>
                          )}

                          {isExpired && (
                            <span
                              className="
                                bg-red-500
                                text-white
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                font-bold
                                uppercase
                              "
                            >
                              Expired
                            </span>
                          )}

                        </div>


                        {/* START DATE */}
                        {membership.startDate && (

                          <div
                            className="
                              text-lg
                              text-zinc-400
                              mt-2
                            "
                          >
                            <span className="text-zinc-500">
                              Started:
                            </span>{" "}
                            {formatDate(
                              membership.startDate
                            )}
                          </div>

                        )}


                        {/* EXPIRY */}
                        <div
                          className="
                            text-lg
                            text-zinc-400
                            mt-1
                          "
                        >

                          <span className="text-zinc-500">
                            {isExpired
                              ? "Expired:"
                              : "Expires:"
                            }
                          </span>{" "}

                          {formatDate(
                            membership.expiryDate
                          )}

                        </div>

                      </div>


                      {/* CREDITS */}
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          bg-white/[0.08]
                          rounded-2xl
                          px-5
                          py-4
                          self-start
                          md:self-auto
                        "
                      >

                        <div>

                          <div
                            className="
                              text-sm
                              uppercase
                              tracking-wider
                              text-zinc-500
                              font-bold
                            "
                          >
                            Remaining
                          </div>

                          <div
                            className="
                              text-3xl
                              font-black
                            "
                          >
                            {membership.remainingCredits}
                          </div>

                        </div>

                        <div
                          className="
                            text-lg
                            text-zinc-500
                          "
                        >
                          credits
                        </div>

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </div>


        {/* ================================================= */}
        {/* NOTES */}
        {/* ================================================= */}

        <div className="mb-16">

          <div className="mb-6">

            <h2
              className="
                text-4xl
                md:text-5xl
                font-black
                tracking-tight
              "
            >
              Notes
            </h2>

            <p
              className="
                text-lg
                text-black/50
                mt-2
                font-medium
              "
            >
              Internal notes about this member
            </p>

          </div>


          <div
            className="
              bg-black
              rounded-[28px]
              p-6
              shadow-[0_12px_30px_rgba(0,0,0,0.18)]
            "
          >

            <textarea
              value={member.notes || ""}
              onChange={(e) =>
                setMember(prev => ({
                  ...prev,
                  notes: e.target.value
                }))
              }
              placeholder="Add notes about this member..."
              className="
                w-full
                min-h-[220px]
                p-5
                rounded-2xl
                bg-zinc-900
                text-white
                text-xl
                outline-none
                resize-y
                border
                border-white/10
                focus:border-yellow-400
                transition
                placeholder:text-zinc-600
              "
            />

            <button
              onClick={saveNotes}
              className="
                mt-4
                bg-yellow-400
                text-black
                px-7
                py-3
                rounded-2xl
                text-lg
                font-black
                shadow-md
                hover:bg-yellow-300
                active:scale-95
                transition
              "
            >
              Save Notes
            </button>

          </div>

        </div>


        {/* ================================================= */}
        {/* RECENT CHECK-INS */}
        {/* ================================================= */}

        <div>

          <div className="mb-6">

            <h2
              className="
                text-4xl
                md:text-5xl
                font-black
                tracking-tight
              "
            >
              Recent Check-Ins
            </h2>

            <p
              className="
                text-lg
                text-black/50
                mt-2
                font-medium
              "
            >
              Attendance history
            </p>

          </div>


          <div className="space-y-4">

            {member.checkins
              .slice(0, visibleCount)
              .map((checkin, index) => {

                const isNoShow =
                  checkin.type === "NO_SHOW";

                return (

                  <div
                    key={index}
                    className="
                      bg-black
                      text-white
                      p-5
                      md:p-6
                      rounded-[24px]
                      shadow-[0_8px_20px_rgba(0,0,0,0.14)]
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-6
                      "
                    >

                      {/* DATE / TIME */}
                      <div>

                        <div
                          className="
                            text-xl
                            md:text-2xl
                            font-bold
                          "
                        >
                          {formatCheckinTime(
                            checkin.checkinTime
                          )}
                        </div>

                        <div
                          className="
                            text-base
                            md:text-lg
                            text-zinc-500
                            mt-2
                          "
                        >
                          Class:{" "}
                          <span className="text-zinc-300">
                            {checkin.classTiming ||
                              "Not recorded"}
                          </span>
                        </div>

                      </div>


                      {/* CHECK-IN TYPE */}
                      <div
                        className={`
                          px-4
                          py-2
                          rounded-full
                          text-base
                          md:text-lg
                          font-bold
                          whitespace-nowrap
                          ${
                            isNoShow
                              ? `
                                bg-red-500/15
                                text-red-400
                              `
                              : `
                                bg-yellow-400
                                text-black
                              `
                          }
                        `}
                      >
                        {isNoShow
                          ? "⚠ No Show"
                          : "✓ Check In"
                        }
                      </div>

                    </div>

                  </div>

                );

              })}

          </div>


          {/* LOAD / COLLAPSE */}
          <div className="flex items-center gap-3">

            {visibleCount <
              member.checkins.length && (

              <button
                onClick={() =>
                  setVisibleCount(
                    prev => prev + 5
                  )
                }
                className="
                  mt-6
                  bg-black
                  text-white
                  px-6
                  py-3
                  rounded-2xl
                  text-lg
                  font-bold
                  hover:bg-zinc-800
                  active:scale-95
                  transition
                "
              >
                Load More
              </button>

            )}

            {visibleCount >=
              member.checkins.length &&
              member.checkins.length > 5 && (

              <button
                onClick={() =>
                  setVisibleCount(5)
                }
                className="
                  mt-6
                  bg-zinc-700
                  text-white
                  px-6
                  py-3
                  rounded-2xl
                  text-lg
                  font-bold
                  hover:bg-zinc-600
                  active:scale-95
                  transition
                "
              >
                Collapse
              </button>

            )}

          </div>

        </div>

      </div>

    </div>

  );
}

export default MemberDetailsPage;