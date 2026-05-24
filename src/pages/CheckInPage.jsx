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

  useEffect(() => {
    fetchAllMembers();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setMembers([]);
      return;
    }

    const filteredMembers = allMembers.filter(member =>
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
    try {
      await axios.post(
        `${API_BASE_URL}/checkins`,
        {
          memberId,
          type
        }
      );

      if (type === "CHECKIN") {
        toast.success("Checked in!");
      } else {
        toast.success("No show marked!");
      }

      setMembers(prevMembers =>
        prevMembers.map(member => {
          if (member.id === memberId) {
            return {
              ...member,
              totalRemainingCredits:
                Number(member.totalRemainingCredits) - 1
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
                Number(member.totalRemainingCredits) - 1
            };
          }

          return member;
        })
      );

    } catch (error) {
      console.error(error);
      toast.error("No Credits!");
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

      setMembers(currentMembers =>
        currentMembers.filter(
          member => member.id !== memberId
        )
      );

      setAllMembers(currentMembers =>
        currentMembers.filter(
          member => member.id !== memberId
        )
      );

    } catch (error) {
      console.error(error);
      toast.error("Failed to delete member");
    }
  };

  const isAdmin =
    localStorage.getItem("isAdmin") === "true";

  return (
    <div
      className="min-h-screen text-black p-8"
      onClick={() => {
        setMembers([]);
        setQuery("");
      }}
    >
      <div className="max-w-5xl mx-auto">

        <div className="mb-12">
          <h1 className="text-6xl font-bold tracking-tight">
            Member Check-In
          </h1>

          <p className="text-black text-xl mt-3">
            Group class check-ins
          </p>
        </div>

        <input
          type="text"
          placeholder="Search member..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={(e) => e.stopPropagation()}
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

        <div className="mt-10 space-y-5">

          {members.map(member => (

            <div
              key={member.id}
              onClick={(e) => {
                e.stopPropagation();

                if (isAdmin) {
                  navigate(`/members/${member.id}`);
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

              <div className="flex-1">

                <div className="text-4xl font-semibold text-white">
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
                  {member.totalRemainingCredits} credits remaining
                </div>

              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    processAttendance(
                      member.id,
                      "CHECKIN"
                    );
                  }}
                  className="
                    bg-white
                    text-black
                    px-5
                    py-3
                    rounded-2xl
                    text-xl
                    font-bold
                    active:scale-95
                    transition
                  "
                >
                  Check In
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    processAttendance(
                      member.id,
                      "NO_SHOW"
                    );
                  }}
                  className="
                    bg-red-500
                    text-white
                    px-5
                    py-3
                    rounded-2xl
                    text-xl
                    font-bold
                    active:scale-95
                    transition
                  "
                >
                  No Show
                </button>

                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMember(member.id);
                    }}
                    className="
                      bg-zinc-700
                      text-white
                      px-4
                      py-3
                      rounded-2xl
                      text-xl
                      font-bold
                      active:scale-95
                      transition
                    "
                    title="Delete Member"
                  >
                    🗑️
                  </button>
                )}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default CheckInPage;