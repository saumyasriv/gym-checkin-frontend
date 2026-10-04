import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";

import CheckInTypePage from "./pages/CheckInTypePage";
import CheckInPage from "./pages/CheckInPage";
import PTCheckInPage from "./pages/PTCheckInPage";
import AddMemberPage from "./pages/AddMemberPage";
import AddMembershipPage from "./pages/AddMembershipPage";
import UpdateExistingMemberPage from "./pages/UpdateExistingMemberPage";
import MemberDetailsPage from "./pages/MemberDetailsPage";
import LoginPage from "./pages/LoginPage";

import logo from "./assets/gorilla-logo.jpg";

function FigmaNavbar({ isAdmin }) {
  const [membersOpen, setMembersOpen] = useState(false);
  const membersMenuRef = useRef(null);

  useEffect(() => {
    if (!membersOpen) {
      return;
    }

    const handleOutsideClick = (event) => {
      if (
        membersMenuRef.current &&
        !membersMenuRef.current.contains(event.target)
      ) {
        setMembersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [membersOpen]);

  return (
    <div className="fixed right-0 top-[18px] z-50 w-[65vw] bg-white">
      <div className="flex h-[72px] items-center justify-end gap-8 px-6 sm:px-10 lg:px-14">
        <Link
          to="/check-in/group"
          className="relative py-2 text-sm font-medium text-black"
        >
          Check-In
          <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-yellow-400" />
        </Link>

        {isAdmin && (
          <div ref={membersMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setMembersOpen((open) => !open)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-black"
              aria-expanded={membersOpen}
            >
              Members
              <span
                aria-hidden="true"
                className={`mt-[-3px] h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-black transition-transform ${
                  membersOpen ? "translate-y-[2px] rotate-[225deg]" : ""
                }`}
              />
            </button>

            {membersOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-black bg-white shadow-[0_8px_25px_rgba(0,0,0,0.16)]">
                <Link
                  to="/add-member"
                  onClick={() => setMembersOpen(false)}
                  className="block px-5 py-3 text-sm font-medium hover:bg-yellow-400"
                >
                  New Member
                </Link>
                <Link
                  to="/add-membership"
                  onClick={() => setMembersOpen(false)}
                  className="block px-5 py-3 text-sm font-medium hover:bg-yellow-400"
                >
                  Add New Membership
                </Link>
                <Link
                  to="/update-existing-member"
                  onClick={() => setMembersOpen(false)}
                  className="block px-5 py-3 text-sm font-medium hover:bg-yellow-400"
                >
                  Update Existing Member
                </Link>
              </div>
            )}
          </div>
        )}

        {isAdmin ? (
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("isAdmin");
              window.location.href = "/";
            }}
            className="h-12 rounded-[10px] border border-black bg-white px-5 text-sm font-medium text-black transition hover:bg-black hover:text-white"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/admin"
            className="flex h-12 items-center rounded-[10px] border border-black bg-white px-5 text-sm font-medium text-black transition hover:bg-black hover:text-white"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}

function ExistingNavbar({ isAdmin, isLoginPage }) {
  return (
    <div className="flex h-[88px] items-center bg-black px-7 text-white">
      <div className="flex items-center">
        <Link
          to="/"
          className="flex items-center gap-3 pr-8 text-2xl font-bold whitespace-nowrap transition hover:opacity-80"
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 text-2xl font-black text-black">
            ✓
          </div>
          <span>Check-In</span>
        </Link>

        {isAdmin && !isLoginPage && (
          <>
            <div className="mx-4 h-10 w-px bg-white/20" />

            <div className="ml-4 flex items-center gap-4">
              <Link
                to="/add-member"
                className="flex h-12 items-center justify-center rounded-xl bg-white/[0.08] px-6 text-lg font-semibold whitespace-nowrap transition-all hover:bg-white/[0.16]"
              >
                New Member
              </Link>

              <Link
                to="/add-membership"
                className="flex h-12 items-center justify-center rounded-xl bg-white/[0.08] px-6 text-lg font-semibold whitespace-nowrap transition-all hover:bg-white/[0.16]"
              >
                Add New Membership
              </Link>

              <Link
                to="/update-existing-member"
                className="flex h-12 items-center justify-center rounded-xl bg-white/[0.08] px-6 text-lg font-semibold whitespace-nowrap transition-all hover:bg-white/[0.16]"
              >
                Update Existing Member
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center">
        {!isAdmin && !isLoginPage && (
          <Link
            to="/admin"
            className="flex h-12 items-center gap-2 rounded-xl border border-white/30 px-6 text-lg font-bold whitespace-nowrap transition-all hover:bg-white hover:text-black"
          >
            Login <span>→</span>
          </Link>
        )}

        {isAdmin && !isLoginPage && (
          <button
            onClick={() => {
              localStorage.removeItem("isAdmin");
              window.location.href = "/";
            }}
            className="flex h-12 items-center justify-center rounded-xl border border-white/30 px-6 text-lg font-bold whitespace-nowrap transition-all hover:bg-white hover:text-black"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const isLoginPage = location.pathname === "/admin";
  const isFigmaCheckInPage =
    location.pathname === "/check-in/group" ||
    location.pathname === "/check-in/pt";

  return (
    <>
      <Toaster
        position="top-center"
        containerStyle={{
          top: "50%",
          transform: "translateY(-50%)",
        }}
        toastOptions={{
          duration: 2200,
          style: {
            background: "#000",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            padding: "18px 28px",
            borderRadius: "14px",
            minWidth: "320px",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
          },
        }}
      />

      {isFigmaCheckInPage && (
        <div className="fixed inset-x-0 top-0 z-[60] h-[18px] bg-yellow-400" />
      )}

      <div
        className={
          isFigmaCheckInPage
            ? "min-h-screen bg-white"
            : "relative min-h-screen overflow-hidden bg-yellow-400"
        }
      >
        {!isFigmaCheckInPage && (
          <img
            src={logo}
            alt="Logo"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[700px] -translate-x-1/2 -translate-y-1/2 opacity-[0.5]"
          />
        )}

        <div className={isFigmaCheckInPage ? "" : "relative z-10"}>
          {!isFigmaCheckInPage && (
            <ExistingNavbar
              isAdmin={isAdmin}
              isLoginPage={isLoginPage}
            />
          )}

          {isFigmaCheckInPage && <FigmaNavbar isAdmin={isAdmin} />}

          <Routes>
            <Route path="/" element={<CheckInTypePage />} />
            <Route path="/check-in/group" element={<CheckInPage />} />
            <Route path="/check-in/pt" element={<PTCheckInPage />} />

            {isAdmin && (
              <>
                <Route path="/add-member" element={<AddMemberPage />} />
                <Route path="/add-membership" element={<AddMembershipPage />} />
                <Route
                  path="/update-existing-member"
                  element={<UpdateExistingMemberPage />}
                />
                <Route path="/members/:id" element={<MemberDetailsPage />} />
              </>
            )}

            <Route path="/admin" element={<LoginPage />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
