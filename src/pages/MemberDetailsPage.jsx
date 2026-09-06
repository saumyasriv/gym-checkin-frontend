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

    }
  };

  const formatCheckinTime = (time) => {

    const date = new Date(time);

    const today = new Date();

    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const isToday =
      date.toDateString() === today.toDateString();

    const isYesterday =
      date.toDateString() === yesterday.toDateString();

    const formattedTime =
      date.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

    if (isToday) {
      return `Today • ${formattedTime}`;
    }

    if (isYesterday) {
      return `Yesterday • ${formattedTime}`;
    }

    return (
      date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }) +
      ` • ${formattedTime}`
    );
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

  if (!member) {

    return (
      <div className="p-10 text-3xl">
        Loading...
      </div>
    );

  }

  return (

    <div className="min-h-screen text-black p-8">

      <div className="max-w-5xl mx-auto">

        {/* Member Header */}

        <div className="mb-12">

          <h1 className="text-6xl font-bold">
            {member.name}
          </h1>

          <div className="text-2xl mt-4">
            {member.phone}
          </div>

          <div className="text-2xl mt-2">
            {member.email}
          </div>

          <div
            className={`
              text-3xl
              mt-6
              font-bold
              ${
                member.totalRemainingCredits <= 4
                  ? "text-red-500"
                  : "text-black"
              }
            `}
          >
            {member.totalRemainingCredits} Credits Remaining
          </div>

        </div>


        {/* Memberships */}

        <div className="mb-16">

          <h2 className="text-4xl font-bold mb-6">
            Memberships
          </h2>

          <div className="space-y-5">

            {member.memberships.map(membership => (

              <div
                key={membership.id}
                className="
                  bg-black/80
                  text-white
                  p-6
                  rounded-3xl
                "
              >

                <div className="text-3xl font-bold">
                  {membership.packageName}
                </div>

                <div className="text-2xl mt-3">
                  Remaining Credits:
                  {" "}
                  {membership.remainingCredits}
                </div>

                <div className="text-2xl mt-2">

                  {membership.expiryDate < getToday()
                    ? "Expired:"
                    : "Expiry:"
                  }

                  {" "}

                  {membership.expiryDate}

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* Notes */}

        <div className="mb-16">

          <h2 className="text-4xl font-bold mb-6">
            Notes
          </h2>

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
              p-6
              rounded-3xl
              bg-black/80
              text-white
              text-2xl
              outline-none
              shadow-xl
              resize-y
            "
          />

          <button
            onClick={saveNotes}
            className="
              mt-4
              bg-black
              text-white
              px-8
              py-4
              rounded-2xl
              text-xl
              font-bold
              active:scale-95
              transition
            "
          >
            Save Notes
          </button>

        </div>


        {/* Recent Checkins */}

        <div>

          <h2 className="text-4xl font-bold mb-6">
            Recent Check-Ins
          </h2>

          <div className="space-y-4">

            {member.checkins
              .slice(0, visibleCount)
              .map((checkin, index) => (

                <div
                  key={index}
                  className="
                    bg-black/80
                    text-white
                    p-5
                    rounded-2xl
                    text-2xl
                  "
                >

                  <div className="flex justify-between">

                    <div>
                      {formatCheckinTime(
                        checkin.checkinTime
                      )}

                      <div className="text-lg text-zinc-400 mt-1">
                        Class: {checkin.classTiming || "Not recorded"}
                      </div>
                    </div>

                    <div>

                      {checkin.type === "NO_SHOW"
                        ? "⚠ No Show"
                        : "✓ Check In"
                      }

                    </div>

                  </div>

                </div>

              ))}

          </div>


          {/* Buttons */}

          <div className="flex items-center">

            {visibleCount < member.checkins.length && (

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
                  py-4
                  rounded-2xl
                  text-xl
                  font-bold
                "
              >
                Load More
              </button>

            )}

            {visibleCount >= member.checkins.length &&
              member.checkins.length > 5 && (

                <button
                  onClick={() => setVisibleCount(5)}
                  className="
                    mt-6
                    ml-4
                    bg-zinc-700
                    text-white
                    px-6
                    py-4
                    rounded-2xl
                    text-xl
                    font-bold
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