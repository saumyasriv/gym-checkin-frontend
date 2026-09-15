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
  const [openPauseHistories, setOpenPauseHistories] = useState({});
  const [processingMembership, setProcessingMembership] = useState(null);
  const [, setTodayTick] = useState(0);

  useEffect(() => {
    fetchMember();
  }, [id]);

  // Refresh the current pause duration automatically as the date changes.
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayTick((value) => value + 1);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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

  const togglePauseHistory = (membershipId) => {
    setOpenPauseHistories((prev) => ({
      ...prev,
      [membershipId]: !prev[membershipId],
    }));
  };

  // ============================================================
  // PAUSE / UNPAUSE MEMBERSHIP
  // ============================================================

  const togglePauseMembership = async (membership) => {
    if (!membership?.id) {
      toast.error("Membership ID is missing.");
      return;
    }

    const membershipId = membership.id;

    try {
      setProcessingMembership(membershipId);

      if (membership.paused) {
        await axios.post(
          `${API_BASE_URL}/memberships/${membershipId}/unpause`
        );

        toast.success("Membership Unpaused successfully!", {
          duration: 1500,
        });
      } else {
        await axios.post(
          `${API_BASE_URL}/memberships/${membershipId}/pause`
        );

        toast.success("Membership paused successfully!", {
          duration: 1500,
        });
      }

      // Refresh everything from the backend so the UI
      // reflects the actual database values.
      await fetchMember();

    } catch (error) {
      console.error(error);

      const message =
        error.response?.data ||
        "Failed to update membership.";

      toast.error(message);
    } finally {
      setProcessingMembership(null);
    }
  };

  // ============================================================
  // REMOVE / RESTORE EXPIRY
  // ============================================================

  const toggleExpiry = async (membership) => {
    if (!membership?.id) {
      toast.error("Membership ID is missing.");
      return;
    }

    const membershipId = membership.id;

    try {
      setProcessingMembership(membershipId);

      if (membership.expiryRemoved) {
        await axios.post(
          `${API_BASE_URL}/memberships/${membershipId}/restore-expiry`
        );

        toast.success("Expiry restored successfully!", {
          duration: 1500,
        });
      } else {
        await axios.post(
          `${API_BASE_URL}/memberships/${membershipId}/remove-expiry`
        );

        toast.success("Expiry removed successfully!", {
          duration: 1500,
        });
      }

      // Refresh everything from the backend so the UI
      // reflects the actual database values.
      await fetchMember();
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data ||
        "Failed to update expiry.";

      toast.error(message);
    } finally {
      setProcessingMembership(null);
    }
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
    // A membership with expiry removed is never considered expired.
    if (membership.expiryRemoved) {
      return false;
    }

    if (!membership.expiryDate) {
      return false;
    }

    return membership.expiryDate < getToday();
  };

  const isMembershipActive = (membership) => {
    return (
      !membership.paused &&
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

  const getPauseHistory = (membership) => {
    return [...(membership.pauseHistory || [])].sort((a, b) => {
      const aIsCurrent = a.pauseEndDate == null;
      const bIsCurrent = b.pauseEndDate == null;

      // Always keep the currently active pause at the top.
      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;

      return (
        new Date(b.pauseStartDate) -
        new Date(a.pauseStartDate)
      );
    });
  };

  const getCurrentPauseDays = (pauseStartDate) => {
    if (!pauseStartDate) return 0;

    const start = new Date(`${pauseStartDate}T00:00:00`);
    const today = new Date(`${getToday()}T00:00:00`);

    const difference =
      Math.floor(
        (today.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
      );

    return Math.max(0, difference);
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

                const isPaused =
                  membership.paused === true;

                const isExpiryRemoved =
                  membership.expiryRemoved === true;

                const isCurrent =
                  isMembershipActive(membership);

                const membershipCheckins =
                  getMembershipCheckins(membership);

                const isOpen =
                  openMemberships[membershipId];

                const isProcessing =
                  processingMembership === membershipId;

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

                          {isPaused && (
                            <span
                              className="
                                bg-orange-400
                                text-black
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                font-bold
                                uppercase
                              "
                            >
                              Paused
                            </span>
                          )}

                          {!isPaused && isCurrent && (
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

                          {!isPaused && isExpiryRemoved && (
                            <span
                              className="
                                bg-green-400
                                text-black
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                font-bold
                                uppercase
                              "
                            >
                              No Expiry
                            </span>
                          )}

                          {!isPaused && isExpired && (
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
                          {isExpiryRemoved ? (
                            <>
                              <span className="text-zinc-500">
                                Expiry:
                              </span>{" "}
                              No Expiry
                            </>
                          ) : (
                            <>
                              <span className="text-zinc-500">
                                {isExpired
                                  ? "Expired:"
                                  : "Expires:"}
                              </span>{" "}
                              {formatDate(
                                membership.expiryDate
                              )}
                            </>
                          )}
                        </div>

                        {/* PAUSE START DATE */}

                        {isPaused &&
                          membership.pauseStartDate && (
                            <div
                              className="
                                text-lg
                                text-orange-300
                                mt-1
                              "
                            >
                              <span className="text-zinc-500">
                                Paused since:
                              </span>{" "}
                              {formatDate(
                                membership.pauseStartDate
                              )}
                            </div>
                          )}
                      </div>

                      {/* REMAINING CREDITS */}

                      <div
                        className="
                          w-full
                          md:w-[150px]
                          shrink-0
                          bg-white/[0.08]
                          rounded-2xl
                          px-5
                          py-4
                          flex
                          flex-col
                          items-center
                          justify-center
                          text-center
                        "
                      >
                        <div
                          className="
                            text-xs
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
                            leading-none
                            mt-2
                          "
                        >
                          {membership.remainingCredits}
                        </div>

                        <div
                          className="
                            text-sm
                            text-zinc-500
                            mt-1
                          "
                        >
                          credits
                        </div>
                      </div>

                    </div>

                    {/* ---------------------------------------- */}
                    {/* PAUSE / UNPAUSE + REMOVE / RESTORE EXPIRY */}
                    {/* ---------------------------------------- */}

                    {(!isExpired || isPaused) && (
                      <div className="mt-5 flex justify-end gap-3 flex-wrap">
                        {!isExpiryRemoved && (
                          <button
                            type="button"
                            onClick={() =>
                              togglePauseMembership(membership)
                            }
                            disabled={isProcessing}
                            className={`
                              px-5
                              py-2.5
                              rounded-xl
                              text-sm
                              font-bold
                              transition
                              active:scale-95
                              disabled:opacity-50
                              disabled:cursor-not-allowed
                              ${
                                isPaused
                                  ? `
                                    bg-yellow-400
                                    text-black
                                    hover:bg-yellow-300
                                  `
                                  : `
                                    bg-white/[0.08]
                                    text-zinc-300
                                    hover:bg-white/[0.14]
                                    hover:text-white
                                  `
                              }
                            `}
                          >
                            {isProcessing
                              ? "Updating..."
                              : isPaused
                                ? "Unpause Membership"
                                : "Pause Membership"}
                          </button>
                        )}

                        {!isPaused &&
                          (isCurrent || isExpiryRemoved) && (
                            <button
                              type="button"
                              onClick={() =>
                                toggleExpiry(membership)
                              }
                              disabled={isProcessing}
                              className={`
                                px-5
                                py-2.5
                                rounded-xl
                                text-sm
                                font-bold
                                transition
                                active:scale-95
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                ${
                                  isExpiryRemoved
                                    ? `
                                      bg-green-400
                                      text-black
                                      hover:bg-green-300
                                    `
                                    : `
                                      bg-white/[0.08]
                                      text-zinc-300
                                      hover:bg-white/[0.14]
                                      hover:text-white
                                    `
                                }
                              `}
                            >
                              {isProcessing
                                ? "Updating..."
                                : isExpiryRemoved
                                  ? "Restore Expiry"
                                  : "Remove Expiry"}
                            </button>
                          )}
                      </div>
                    )}

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

                    {/* ---------------------------------------- */}
                    {/* PAUSE HISTORY DROPDOWN */}
                    {/* ---------------------------------------- */}

                    {getPauseHistory(membership).length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            togglePauseHistory(membershipId)
                          }
                          className="
                            mt-4
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
                              Pause History
                            </div>

                            <div
                              className="
                                text-lg
                                font-bold
                                mt-1
                              "
                            >
                              {getPauseHistory(membership).length}{" "}
                              {getPauseHistory(membership).length === 1
                                ? "pause"
                                : "pauses"}{" "}
                              recorded
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
                              text-orange-300
                              text-lg
                              font-black
                              shrink-0
                            "
                          >
                            {openPauseHistories[membershipId]
                              ? "▲"
                              : "▼"}
                          </div>
                        </button>

                        {openPauseHistories[membershipId] && (
                          <div className="mt-4 space-y-3">
                            {getPauseHistory(membership).map(
                              (pause, pauseIndex) => {
                                const isCurrentPause =
                                  pause.pauseEndDate == null;

                                return (
                                  <div
                                    key={
                                      pause.id ||
                                      `${pause.pauseStartDate}-${pauseIndex}`
                                    }
                                    className="
                                      bg-white/[0.05]
                                      rounded-xl
                                      px-4
                                      py-4
                                      border
                                      border-white/[0.06]
                                    "
                                  >
                                    <div
                                      className="
                                        flex
                                        flex-col
                                        md:flex-row
                                        md:items-center
                                        md:justify-between
                                        gap-4
                                      "
                                    >
                                      <div>
                                        <div className="text-base font-bold">
                                          {isCurrentPause
                                            ? "Currently Paused"
                                            : `${formatDate(
                                                pause.pauseStartDate
                                              )} → ${formatDate(
                                                pause.pauseEndDate
                                              )}`}
                                        </div>

                                        <div className="text-sm text-zinc-500 mt-1">
                                          Started{" "}
                                          {formatDate(
                                            pause.pauseStartDate
                                          )}

                                          {isCurrentPause
                                            ? ` • Paused for ${getCurrentPauseDays(
                                                pause.pauseStartDate
                                              )} ${
                                                getCurrentPauseDays(
                                                  pause.pauseStartDate
                                                ) === 1
                                                  ? "day"
                                                  : "days"
                                              }`
                                            : ` • Ended ${formatDate(
                                                pause.pauseEndDate
                                              )}`}
                                        </div>
                                      </div>

                                      <div
                                        className="
                                          flex
                                          flex-wrap
                                          gap-2
                                          md:justify-end
                                        "
                                      >
                                        <div
                                          className="
                                            bg-white/[0.06]
                                            rounded-lg
                                            px-3
                                            py-2
                                            text-center
                                          "
                                        >
                                          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                                            Duration
                                          </div>

                                          <div className="text-sm font-bold mt-1">
                                            {isCurrentPause
                                              ? `${getCurrentPauseDays(
                                                  pause.pauseStartDate
                                                )} ${
                                                  getCurrentPauseDays(
                                                    pause.pauseStartDate
                                                  ) === 1
                                                    ? "day"
                                                    : "days"
                                                }`
                                              : `${pause.pausedDays ?? 0} ${
                                                  pause.pausedDays === 1
                                                    ? "day"
                                                    : "days"
                                                }`}
                                          </div>
                                        </div>

                                        {!isCurrentPause && (
                                          <div
                                            className="
                                              bg-yellow-400/10
                                              rounded-lg
                                              px-3
                                              py-2
                                              text-center
                                            "
                                          >
                                            <div className="text-[10px] uppercase tracking-wider text-yellow-500 font-bold">
                                              Expiry Added
                                            </div>

                                            <div className="text-sm font-bold text-yellow-300 mt-1">
                                              +{pause.daysAddedToExpiry ?? 0}{" "}
                                              {pause.daysAddedToExpiry === 1
                                                ? "day"
                                                : "days"}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </>
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