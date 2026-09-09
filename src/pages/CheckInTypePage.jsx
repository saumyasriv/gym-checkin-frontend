import { useNavigate } from "react-router-dom";

function CheckInTypePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center px-8">

      <div className="w-full max-w-5xl">

        {/* TITLE */}
        <div className="text-center mb-12">

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Check-In
          </h1>

          <p className="text-xl mt-3 text-black/70 font-medium">
            Select your session type
          </p>

        </div>

        {/* OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* GROUP CLASS */}
          <button
            onClick={() => navigate("/check-in/group")}
            className="
              group
              bg-black
              text-white
              rounded-[32px]
              min-h-[260px]
              p-10
              flex
              flex-col
              items-center
              justify-center
              shadow-2xl
              transition-all
              duration-200
              hover:scale-[1.02]
              hover:bg-zinc-900
              active:scale-[0.98]
            "
          >

            {/* ICON */}
            <div
              className="
                w-16
                h-16
                rounded-full
                bg-white
                text-black
                flex
                items-center
                justify-center
                mb-7
                transition-transform
                duration-200
                group-hover:scale-110
              "
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="8" r="3" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                <path d="M14 15c2.8-.2 5 2 5 5" />
              </svg>
            </div>

            <div className="text-4xl font-bold">
              Group Class
            </div>

            <div className="text-lg text-zinc-400 mt-3">
              Join a scheduled class
            </div>

          </button>

          {/* ONE ON ONE */}
          <button
            onClick={() => navigate("/check-in/pt")}
            className="
              group
              bg-black
              text-white
              rounded-[32px]
              min-h-[260px]
              p-10
              flex
              flex-col
              items-center
              justify-center
              shadow-2xl
              transition-all
              duration-200
              hover:scale-[1.02]
              hover:bg-zinc-900
              active:scale-[0.98]
            "
          >

            {/* ICON */}
            <div
              className="
                w-16
                h-16
                rounded-full
                bg-white
                text-black
                flex
                items-center
                justify-center
                mb-7
                transition-transform
                duration-200
                group-hover:scale-110
              "
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="7" r="3.5" />
                <path d="M5 21c0-4 3-7 7-7s7 3 7 7" />
              </svg>
            </div>

            <div className="text-4xl font-bold">
              One on One
            </div>

            <div className="text-lg text-zinc-400 mt-3">
              Personal training session
            </div>

          </button>

        </div>

      </div>

    </div>
  );
}

export default CheckInTypePage;