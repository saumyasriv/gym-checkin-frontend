import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../config";

export default function MemberDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [member, setMember] = useState(null);
    const [openMemberships, setOpenMemberships] = useState({});

    useEffect(() => {
        fetchMember();
    }, [id]);

    const fetchMember = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/members/${id}`
            );

            setMember(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load member details");
        }
    };

    const toggleMembership = (membershipId) => {
        setOpenMemberships((prev) => ({
            ...prev,
            [membershipId]: !prev[membershipId],
        }));
    };

    const formatCheckinTime = (dateTime) => {
        if (!dateTime) return "";

        const date = new Date(dateTime);

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isToday =
            date.toDateString() === today.toDateString();

        const isYesterday =
            date.toDateString() === yesterday.toDateString();

        const time = date.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
        });

        if (isToday) {
            return `Today, ${time}`;
        }

        if (isYesterday) {
            return `Yesterday, ${time}`;
        }

        const formattedDate = date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        });

        return `${formattedDate}, ${time}`;
    };

    const getToday = () => {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const saveNotes = async () => {
        try {
            await axios.put(
                `${API_BASE_URL}/members/${id}/notes`,
                {
                    notes: member.notes || "",
                }
            );

            toast.success("Notes saved");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save notes");
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(`${date}T00:00:00`);

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getMembershipStartDate = (membership) => {
        if (membership.startDate) {
            return membership.startDate;
        }

        // Safety fallback for any old data
        if (!membership.expiryDate || !membership.packageName) {
            return null;
        }

        const weeksByPackage = {
            "8 Sessions": 5,
            "12 Sessions": 5,
            "24 Sessions": 10,
            "36 Sessions": 15,
        };

        const weeks =
            weeksByPackage[membership.packageName];

        if (!weeks) return null;

        const expiryDate = new Date(
            `${membership.expiryDate}T00:00:00`
        );

        expiryDate.setDate(
            expiryDate.getDate() - weeks * 7
        );

        return expiryDate
            .toISOString()
            .split("T")[0];
    };

    const isActiveMembership = (membership) => {
        if (!membership.remainingCredits) {
            return false;
        }

        if (!membership.expiryDate) {
            return false;
        }

        const today = getToday();

        return (
            membership.remainingCredits > 0 &&
            membership.expiryDate >= today
        );
    };

    if (!member) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-zinc-500">
                    Loading member...
                </div>
            </div>
        );
    }

    const sortedMemberships = [...(member.memberships || [])].sort(
        (a, b) => {
            const dateA =
                getMembershipStartDate(a) || "";
            const dateB =
                getMembershipStartDate(b) || "";

            return dateB.localeCompare(dateA);
        }
    );

    return (
        <div className="min-h-screen bg-black text-white px-6 py-10">
            <div className="max-w-5xl mx-auto">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 text-zinc-400 hover:text-white transition flex items-center gap-2"
                >
                    ← Back
                </button>

                {/* Member Header */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">

                        <div>
                            <h1 className="text-4xl font-black tracking-tight">
                                {member.name}
                            </h1>

                            <div className="mt-3 space-y-1 text-zinc-400">
                                {member.phone && (
                                    <div>
                                        {member.phone}
                                    </div>
                                )}

                                {member.email && (
                                    <div>
                                        {member.email}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total Active Credits */}
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl px-6 py-5 min-w-[210px]">
                            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                                Active Credits
                            </div>

                            <div className="text-3xl font-black text-yellow-400 mt-1">
                                {member.totalRemainingCredits ?? 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Memberships */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-black">
                            Memberships
                        </h2>

                        <div className="text-sm text-zinc-500">
                            {sortedMemberships.length}{" "}
                            {sortedMemberships.length === 1
                                ? "membership"
                                : "memberships"}
                        </div>
                    </div>

                    <div className="space-y-5">
                        {sortedMemberships.map(
                            (membership, index) => {
                                const membershipId =
                                    membership.id;

                                const membershipCheckins =
                                    (member.checkins || []).filter(
                                        (checkin) =>
                                            String(
                                                checkin.membershipId
                                            ) ===
                                            String(
                                                membershipId
                                            )
                                    );

                                const isOpen =
                                    openMemberships[
                                        membershipId
                                    ];

                                const active =
                                    isActiveMembership(
                                        membership
                                    );

                                return (
                                    <div
                                        key={
                                            membershipId ??
                                            `${membership.packageName}-${index}`
                                        }
                                        className="bg-zinc-950 border border-white/10 rounded-3xl p-6"
                                    >
                                        {/* Membership top row */}
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                                            <div>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-2xl font-black">
                                                        {
                                                            membership.packageName
                                                        }
                                                    </h3>

                                                    {active ? (
                                                        <span className="px-3 py-1 rounded-full bg-yellow-400/15 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                                            Expired
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                                                    Remaining
                                                </div>

                                                <div
                                                    className={`text-3xl font-black mt-1 ${
                                                        active
                                                            ? "text-yellow-400"
                                                            : "text-zinc-500"
                                                    }`}
                                                >
                                                    {membership.remainingCredits ??
                                                        0}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                                            <div className="bg-white/[0.04] rounded-2xl px-5 py-4">
                                                <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                                                    Started
                                                </div>

                                                <div className="mt-1 font-bold">
                                                    {formatDate(
                                                        getMembershipStartDate(
                                                            membership
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-white/[0.04] rounded-2xl px-5 py-4">
                                                <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                                                    Expires
                                                </div>

                                                <div className="mt-1 font-bold">
                                                    {formatDate(
                                                        membership.expiryDate
                                                    )}
                                                </div>

                                                {!active &&
                                                    membership.expiryDate && (
                                                        <div className="text-sm text-zinc-500 mt-1">
                                                            Expired:{" "}
                                                            {formatDate(
                                                                membership.expiryDate
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        {/* Check-ins dropdown */}
                                        <button
                                            onClick={() =>
                                                toggleMembership(
                                                    membershipId
                                                )
                                            }
                                            className="mt-6 w-full flex items-center justify-between bg-white/[0.05] hover:bg-white/[0.08] border border-white/5 rounded-2xl px-5 py-4 transition text-left"
                                        >
                                            <div>
                                                <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                                                    Check-ins
                                                </div>

                                                <div className="text-base font-bold mt-1">
                                                    {
                                                        membershipCheckins.length
                                                    }{" "}
                                                    {membershipCheckins.length ===
                                                    1
                                                        ? "check-in"
                                                        : "check-ins"}
                                                </div>
                                            </div>

                                            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-yellow-400 font-bold">
                                                {isOpen
                                                    ? "▲"
                                                    : "▼"}
                                            </div>
                                        </button>

                                        {/* Check-ins list */}
                                        {isOpen && (
                                            <div className="mt-3 space-y-3">
                                                {membershipCheckins.length ===
                                                0 ? (
                                                    <div className="bg-white/[0.03] rounded-2xl px-5 py-5 text-sm text-zinc-500 text-center">
                                                        No check-ins recorded
                                                        for this membership.
                                                    </div>
                                                ) : (
                                                    membershipCheckins.map(
                                                        (
                                                            checkin,
                                                            checkinIndex
                                                        ) => {
                                                            const isNoShow =
                                                                checkin.type ===
                                                                "NO_SHOW";

                                                            return (
                                                                <div
                                                                    key={
                                                                        checkin.id ??
                                                                        checkinIndex
                                                                    }
                                                                    className="bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                                                                >
                                                                    <div>
                                                                        <div className="font-bold">
                                                                            {formatCheckinTime(
                                                                                checkin.checkinTime
                                                                            )}
                                                                        </div>

                                                                        {checkin.classTiming && (
                                                                            <div className="text-sm text-zinc-500 mt-1">
                                                                                Class:{" "}
                                                                                {
                                                                                    checkin.classTiming
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div>
                                                                        {isNoShow ? (
                                                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider">
                                                                                No Show
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-yellow-400/10 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                                                                                ✓ Check In
                                                                            </span>
                                                                        )}
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

                    {sortedMemberships.length === 0 && (
                        <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 text-center text-zinc-500">
                            No memberships found.
                        </div>
                    )}
                </section>

                {/* Notes */}
                <section className="mt-10">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-black">
                            Notes
                        </h2>
                    </div>

                    <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6">
                        <textarea
                            value={member.notes || ""}
                            onChange={(e) =>
                                setMember({
                                    ...member,
                                    notes: e.target.value,
                                })
                            }
                            placeholder="Add notes about this member..."
                            rows={5}
                            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 outline-none focus:border-yellow-400/50 resize-none"
                        />

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={saveNotes}
                                className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-3 rounded-xl transition"
                            >
                                Save Notes
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}