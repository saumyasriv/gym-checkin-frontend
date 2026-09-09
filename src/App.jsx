import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

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

function Layout() {

  const location = useLocation();

  const isAdmin =
    localStorage.getItem("isAdmin") === "true";

  const isLoginPage =
    location.pathname === "/admin";

  return (

    <>

      <Toaster
        position="top-center"
        containerStyle={{
          top: "50%",
          transform: "translateY(-50%)"
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#000",
            color: "#fff",
            fontSize: "24px",
            fontWeight: "bold",
            padding: "28px 40px",
            borderRadius: "24px",
            minWidth: "420px",
            textAlign: "center",
            boxShadow:
              "0 10px 40px rgba(0, 0, 0, 0.4)"
          }
        }}
      />

      <div className="min-h-screen bg-yellow-400 relative overflow-hidden">

        {/* Watermark */}
        <img
          src={logo}
          alt="Logo"
          className="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-[700px]
            opacity-[0.5]
            pointer-events-none
          "
        />

        <div className="relative z-10">

          {/* Navbar */}
          <div className="bg-black text-white px-6 py-4 flex items-center">

            {/* Left Side */}
            <div className="flex items-center gap-4">

              {/* CHECK-IN HOME */}
              <Link
                to="/"
                className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-2
                  rounded-2xl
                  text-2xl
                  font-bold
                  transition
                  hover:bg-white/10
                "
              >

                {/* Checkmark Icon */}
                <div
                  className="
                    w-9
                    h-9
                    rounded-full
                    bg-yellow-400
                    text-black
                    flex
                    items-center
                    justify-center
                    font-bold
                  "
                >
                  ✓
                </div>

                <span>
                  Check-In
                </span>

              </Link>

              {isAdmin && !isLoginPage && (

                <>

                  <Link
                    to="/add-member"
                    className="
                      px-4
                      py-2
                      rounded-2xl
                      text-xl
                      font-semibold
                      transition
                      hover:bg-white/10
                    "
                  >
                    New Member
                  </Link>

                  <Link
                    to="/add-membership"
                    className="
                      px-4
                      py-2
                      rounded-2xl
                      text-xl
                      font-semibold
                      transition
                      hover:bg-white/10
                    "
                  >
                    Add New Membership
                  </Link>

                  <Link
                    to="/update-existing-member"
                    className="
                      px-4
                      py-2
                      rounded-2xl
                      text-xl
                      font-semibold
                      transition
                      hover:bg-white/10
                    "
                  >
                    Update Existing Member
                  </Link>

                </>

              )}

            </div>

            {/* Right Side */}
            <div className="ml-auto">

              {!isAdmin && !isLoginPage && (

                <Link
                  to="/admin"
                  className="
                    flex
                    items-center
                    gap-2
                    px-5
                    py-2
                    rounded-2xl
                    border
                    border-white/30
                    text-xl
                    font-semibold
                    transition
                    hover:bg-white
                    hover:text-black
                  "
                >
                  Login

                  <span className="text-lg">
                    →
                  </span>

                </Link>

              )}

              {isAdmin && !isLoginPage && (

                <button
                  onClick={() => {

                    localStorage.removeItem(
                      "isAdmin"
                    );

                    window.location.href = "/";
                  }}
                  className="
                    px-5
                    py-2
                    rounded-2xl
                    border
                    border-white/30
                    text-xl
                    font-semibold
                    transition
                    hover:bg-white
                    hover:text-black
                  "
                >
                  Logout
                </button>

              )}

            </div>

          </div>

          {/* Routes */}
          <Routes>

            {/* Check-In Type Selection */}
            <Route
              path="/"
              element={<CheckInTypePage />}
            />

            {/* Group Class Check-In */}
            <Route
              path="/check-in/group"
              element={<CheckInPage />}
            />

            {/* PT Check-In */}
            <Route
              path="/check-in/pt"
              element={<PTCheckInPage />}
            />

            {/* Admin Routes */}
            {isAdmin && (

              <>

                <Route
                  path="/add-member"
                  element={<AddMemberPage />}
                />

                <Route
                  path="/add-membership"
                  element={<AddMembershipPage />}
                />

                <Route
                  path="/update-existing-member"
                  element={
                    <UpdateExistingMemberPage />
                  }
                />

                <Route
                  path="/members/:id"
                  element={<MemberDetailsPage />}
                />

              </>

            )}

            {/* Admin Login */}
            <Route
              path="/admin"
              element={<LoginPage />}
            />

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