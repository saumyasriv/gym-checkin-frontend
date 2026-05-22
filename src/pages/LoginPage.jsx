import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const login = () => {

    if (
  username === "admin" &&
  password === "admin"
) {

  localStorage.setItem(
    "isAdmin",
    "true"
  );

  toast.success("Admin login successful");

  window.location.href = "/";
}else {

      toast.error("Wrong credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <h1 className="text-6xl font-bold text-black mb-10 text-center">
          Admin Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="
            w-full
            p-5
            rounded-2xl
            text-2xl
            outline-none
            bg-white
            text-black
            mb-5
            shadow-xl
          "
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full
            p-5
            rounded-2xl
            text-2xl
            outline-none
            bg-white
            text-black
            shadow-xl
          "
        />

            <button
            onClick={login}
            className="
              w-full
              bg-black
              text-white
              py-5
              rounded-2xl
              text-2xl
              font-bold
              mt-4
            "
          >
          Login
        </button>

      </div>

    </div>
  )
}

export default LoginPage;