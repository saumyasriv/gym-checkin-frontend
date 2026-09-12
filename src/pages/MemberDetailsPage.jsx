import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

function MemberDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [openMemberships, setOpenMemberships] = useState({});

  useEffect(() => {
    fetchMember();
  }, [id]);

  // ============================================================
  // FETCH MEMBER
  // ============================================================

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

  // ============================================================
  // MEMBERSHIP CHECK-IN DROPDOWN
  // ============================================================

  const toggleMembership = (membershipId) => {
    setOpenMemberships((prev) => ({
      ...prev,
      [membershipId]: !prev[membershipId],
    }));
  };

  // ============================================================
  // DATE / TIME HELPERS
  // ============================================================

  const formatCheckinTime = (time) => {
    if (!time) return "";

    const date = new Date(time);

    const formattedTime = date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const dateInIndia = date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const todayInIndia = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const yesterdayInIndia =
      yesterdayDate.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

    if (dateInIndia === todayInIndia) {
      return `Today • ${formattedTime}`;
    }

    if (dateInIndia === yesterdayInIndia) {
      return `Yesterday • ${formattedTime}`;
    }

    const formattedDate = date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
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

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // MEMBERSHIP HELPERS
  // ============================================================

  const getMembershipStartDate = (membership) => {
    // All new memberships have a stored start date.
    if (membership.startDate) {
      return membership.startDate;
    }

    // Fallback for any old membership without a start date.
    if (!membership.expiryDate || !membership.packageName) {
      return null;
    }

    const weeksByPackage = {
      "8 Sessions": 5,
      "12 Sessions": 5,
      "24 Sessions": 10,
      "36 Sessions": 15,
    };

    const weeks = weeksByPackage[membership.packageName];

    if (!weeks) {
      return null;
    }

    const expiryDate = new Date(
      `${membership.expiryDate}T00:00:00`
    );

    expiryDate.setDate(
      expiryDate.getDate() - weeks * 7
    );

    return expiryDate.toISOString().split("T")[0];
  };

  const isMembershipExpired = (membership) => {
    return membership.expiryDate < getToday();
  };

  const isMembershipActive = (membership) => {
    return (
      !isMembershipExpired(membership) &&
      membership.remainingCredits > 0
    );
  };

  const getMembershipCheckins = (membership) => {
    return (member.checkins || []).filter(
      (checkin) =>
        String(checkin.membershipId) ===
        String(membership.id)
    );
  };

  // ============================================================
  // NOTES
  // ============================================================

  const saveNotes = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/members/${id}/notes`,
        {
          notes: member.notes || "",
        }
      );

      toast.success("Notes saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save notes.");
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

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

  // ============================================================
  // SORT MEMBERSHIPS
  // ============================================================

  const sortedMemberships = [...(member.memberships || [])].sort(
    (a, b) => {
      const aStartDate = getMembershipStartDate(a);
      const bStartDate = getMembershipStartDate(b);

      if (!aStartDate) return 1;
      if (!bStartDate) return -1;

      return (
        new Date(bStartDate) -
        new Date(aStartDate)
      );
    }
  );

  // ============================================================
  // PAGE
  // ============================================================

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

        {/* ================================================== */}
        {/* BACK */}
        {/* ================================================== */}

        <button
          onClick={() => navigate(-1)}
          className="
            mb-8
            text-black/50
            hover:text-black
            transition
            flex
            items-center
            gap-2
            text-lg
          "
        >
          ← Back
        </button>

        {/* ================================================== */}
        {/* MEMBER HEADER */}
        {/* ================================================== */}

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
            <div
              className="
                flex
                flex-col
                md:flex-row
                md:items-end
                md:justify-between
                gap-8
              "
            >

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

              {/* TOTAL ACTIVE CREDITS */}

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

        {/* ================================================== */}
        {/* MEMBERSHIPS */}
        {/* ================================================== */}

        <div className="mb-16">

          {/* SECTION HEADER */}

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

          {/* MEMBERSHIP CARDS */}

          <div className="space-y-5">

            {sortedMemberships.map(
              (membership, index) => {
                const membershipId = membership.id;

                const isExpired =
                  isMembershipExpired(membership);

                const isCurrent =
                  isMembershipActive(membership);

                const membershipCheckins =
                  getMembershipCheckins(membership);

                const isOpen =
                  openMemberships[membershipId];

                return (
                  <div
                    key={
                      membershipId ||
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

                    {/* ---------------------------------------- */}
                    {/* MEMBERSHIP SUMMARY */}
                    {/* ---------------------------------------- */}

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

                      {/* PACKAGE + DATES */}

                      <div>
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            mb-3
                            flex-wrap
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

                        {getMembershipStartDate(
                          membership
                        ) && (
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
                              getMembershipStartDate(
                                membership
                              )
                            )}
                          </div>
                        )}

                        {/* EXPIRY DATE */}

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
                              : "Expires:"}
                          </span>{" "}
                          {formatDate(
                            membership.expiryDate
                          )}
                        </div>
                      </div>

                      {/* REMAINING CREDITS */}

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

                    {/* ---------------------------------------- */}
                    {/* CHECK-INS DROPDOWN */}
                    {/* ---------------------------------------- */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleMembership(
                          membershipId
                        )
                      }
                      className="
                        mt-7
                        w-full
                        flex
                        items-center
                        justify-between
                        gap-4
                        bg-white/[0.08]
                        hover:bg-white/[0.12]
                        rounded-2xl
                        px-5
                        py-4
                        text-left
                        transition
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
                          Check-ins
                        </div>

                        <div
                          className="
                            text-lg
                            font-bold
                            mt-1
                          "
                        >
                          {membershipCheckins.length}{" "}
                          {membershipCheckins.length === 1
                            ? "check-in"
                            : "check-ins"}
                        </div>
                      </div>

                      <div
                        className="
                          w-10
                          h-10
                          rounded-full
                          bg-black
                          flex
                          items-center
                          justify-center
                          text-yellow-400
                          text-lg
                          font-black
                          shrink-0
                        "
                      >
                        {isOpen ? "▲" : "▼"}
                      </div>
                    </button>

                    {/* ---------------------------------------- */}
                    {/* CHECK-INS LIST */}
                    {/* ---------------------------------------- */}

                    {isOpen && (
                      <div className="mt-4 space-y-3">

                        {membershipCheckins.length === 0 ? (
                          <div
                            className="
                              bg-white/[0.05]
                              rounded-2xl
                              px-5
                              py-5
                              text-center
                              text-zinc-500
                            "
                          >
                            No check-ins recorded
                            for this membership.
                          </div>
                        ) : (
                          membershipCheckins.map(
                            (checkin, checkinIndex) => {
                              const isNoShow =
                                checkin.type ===
                                "NO_SHOW";

                              return (
                                <div
                                  key={checkinIndex}
                                  className="
                                    bg-zinc-900
                                    rounded-2xl
                                    px-5
                                    py-4
                                    flex
                                    flex-col
                                    md:flex-row
                                    md:items-center
                                    md:justify-between
                                    gap-4
                                  "
                                >

                                  {/* DATE + CLASS */}

                                  <div>
                                    <div
                                      className="
                                        text-xl
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

                                  {/* TYPE */}

                                  <div
                                    className={`
                                      px-4
                                      py-2
                                      rounded-full
                                      text-base
                                      font-bold
                                      whitespace-nowrap
                                      self-start
                                      md:self-auto
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
                                      : "✓ Check In"}
                                  </div>

                                </div>
                              );
                            }
                          )
                        )}

                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>

          {/* NO MEMBERSHIPS */}

          {sortedMemberships.length === 0 && (
            <div
              className="
                bg-black
                text-white
                rounded-[28px]
                p-8
                text-center
              "
            >
              No memberships found.
            </div>
          )}

        </div>

        {/* ================================================== */}
        {/* NOTES */}
        {/* ================================================== */}

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
                setMember((prev) => ({
                  ...prev,
                  notes: e.target.value,
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

      </div>
    </div>
  );
}

export default MemberDetailsPage;