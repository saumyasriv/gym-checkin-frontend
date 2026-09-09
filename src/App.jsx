import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import CheckInPage from "./pages/CheckInPage";
import CheckInTypePage from "./pages/CheckInTypePage";
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
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)"
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
          <div className="bg-black text-white p-5 flex items-center">

            {/* Left Side */}
            <div className="flex items-center gap-35">

              <Link
                to="/"
                className="text-2xl font-semibold"
              >
                Check-In
              </Link>

              {isAdmin && !isLoginPage && (

                <>

                  <Link
                    to="/add-member"
                    className="text-2xl font-semibold"
                  >
                    New Member
                  </Link>

                  <Link
                    to="/add-membership"
                    className="text-2xl font-semibold"
                  >
                    Add New Membership
                  </Link>

                  <Link
                    to="/update-existing-member"
                    className="text-2xl font-semibold"
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
                  className="text-2xl font-semibold"
                >
                  Login
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
                  className="text-2xl font-semibold"
                >
                  Logout
                </button>

              )}

            </div>

          </div>

          {/* Routes */}
          <Routes>

            {/* Check-In selection page */}
            <Route
              path="/"
              element={<CheckInTypePage />}
            />

            {/* Group Class Check-In */}
            <Route
              path="/check-in/group"
              element={<CheckInPage />}
            />

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