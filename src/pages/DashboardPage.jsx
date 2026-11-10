
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/dashboard`
      );

      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard loading error:", error);
      toast.error("Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "-";

    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const attendanceTrend =
    dashboard?.attendanceTrend || [];

  const maxCheckins = Math.max(
    ...attendanceTrend.map((item) => item.checkins || 0),
    1
  );

  const metricCards = [
    {
      title: "Total Members",
      value: dashboard?.totalMembers ?? 0,
      description: "Registered members",
    },
    {
      title: "Active Memberships",
      value: dashboard?.activeMemberships ?? 0,
      description: "Currently active",
    },
    {
      title: "Today's Check-ins",
      value: dashboard?.todayCheckins ?? 0,
      description: "Actual attendance",
    },
    {
      title: "Low-Credit Members",
      value: dashboard?.lowCreditMembers ?? 0,
      description: "3 or fewer active credits",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-xl font-bold text-black">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl border-2 border-black bg-white p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold">
            Unable to load dashboard
          </h2>

          <button
            onClick={fetchDashboard}
            className="mt-5 rounded-xl bg-black px-6 py-3 font-bold text-white hover:bg-zinc-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-28 sm:px-8 lg:px-12">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-black/60">
            The Troop
          </p>

          <h1 className="mt-1 text-3xl font-black text-black sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm font-medium text-black/70">
            Here's what's happening at your gym.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="rounded-xl border-2 border-black bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric, index) => (
          <div
            key={metric.title}
            className={`rounded-2xl border-2 border-black p-6 shadow-md ${
              index === 2
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                index === 2 ? "text-white/70" : "text-black/60"
              }`}
            >
              {metric.title}
            </p>

            <p className="mt-3 text-4xl font-black">
              {metric.value}
            </p>

            <p
              className={`mt-2 text-xs font-medium ${
                index === 2 ? "text-white/60" : "text-black/50"
              }`}
            >
              {metric.description}
            </p>
          </div>
        ))}
      </div>

      {/* Attendance Overview */}
      <div className="mb-8 rounded-2xl border-2 border-black bg-white p-6 shadow-md">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-black">
              Attendance Overview
            </h2>

            <p className="mt-1 text-sm text-black/60">
              Daily check-ins over the last 7 days
            </p>
          </div>

          <span className="rounded-lg bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
            LAST 7 DAYS
          </span>
        </div>

        <div className="flex h-52 items-end justify-between gap-2 sm:gap-5">
          {attendanceTrend.map((item) => {
            const height =
              item.checkins > 0
                ? Math.max(
                    (item.checkins / maxCheckins) * 100,
                    8
                  )
                : 3;

            return (
              <div
                key={item.date}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 text-sm font-black text-black">
                  {item.checkins}
                </span>

                <div className="flex h-[75%] w-full items-end justify-center">
                  <div
                    className={`w-full max-w-12 rounded-t-lg ${
                      item.checkins > 0
                        ? "bg-yellow-400"
                        : "bg-zinc-200"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>

                <span className="mt-3 text-xs font-bold text-black/60">
                  {formatDate(item.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Check-ins */}
      <div className="mb-8 overflow-hidden rounded-2xl border-2 border-black bg-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-black">
              Today's Check-ins
            </h2>

            <p className="mt-1 text-sm text-black/60">
              Members who attended today
            </p>
          </div>

          <span className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-black text-black">
            {dashboard.todayCheckins} CHECK-INS
          </span>
        </div>

        {dashboard.todayCheckinsList?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left">
              <thead className="bg-zinc-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase text-black/60">
                    Member
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase text-black/60">
                    Session
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase text-black/60">
                    Timing
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase text-black/60">
                    Check-in Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {dashboard.todayCheckinsList.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-zinc-200"
                  >
                    <td className="px-6 py-4 font-bold text-black">
                      {item.memberName}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-bold ${
                          item.memberType === "GROUP"
                            ? "bg-yellow-400 text-black"
                            : "bg-black text-white"
                        }`}
                      >
                        {item.sessionType || item.memberType}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-black/70">
                      {item.classTiming || "-"}
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-black">
                      {formatTime(item.checkinTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="font-bold text-black/60">
              No check-ins recorded today.
            </p>
          </div>
        )}
      </div>

      {/* Membership Alerts */}
      <div className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-md">
        <div className="border-b-2 border-black px-6 py-5">
          <h2 className="text-xl font-black text-black">
            Membership Alerts
          </h2>

          <p className="mt-1 text-sm text-black/60">
            Memberships expiring within the next 7 days
          </p>
        </div>

        {dashboard.membershipAlerts?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left">
              <thead className="bg-zinc-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase text-black/60">
                    Member
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase text-black/60">
                    Package
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase text-black/60">
                    Credits Left
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase text-black/60">
                    Expiry Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {dashboard.membershipAlerts.map((item) => (
                  <tr
                    key={item.membershipId}
                    className="border-t border-zinc-200"
                  >
                    <td className="px-6 py-4 font-bold text-black">
                      {item.memberName}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-black/70">
                      {item.packageName}
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-black">
                      {item.remainingCredits}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-yellow-400 px-3 py-1 text-sm font-bold text-black">
                        {formatDate(item.expiryDate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="font-bold text-black/60">
              No memberships expiring in the next 7 days.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default DashboardPage;
