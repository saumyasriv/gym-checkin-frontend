import { useNavigate } from "react-router-dom";

function CheckInTypePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-black p-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-16">
          <h1 className="text-6xl font-bold tracking-tight">
            Check In
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* GROUP CLASS */}
          <button
            onClick={() => navigate("/check-in/group")}
            className="
              bg-black
              text-white
              rounded-3xl
              p-12
              min-h-[280px]
              text-4xl
              font-bold
              shadow-2xl
              transition
              active:scale-95
              hover:bg-zinc-800
            "
          >
            Group Class
            <br />
            Check In
          </button>

          {/* PT */}
          <button
            onClick={() => navigate("/check-in/pt")}
            className="
              bg-black
              text-white
              rounded-3xl
              p-12
              min-h-[280px]
              text-4xl
              font-bold
              shadow-2xl
              transition
              active:scale-95
              hover:bg-zinc-800
            "
          >
            PT
            <br />
            Check In
          </button>

        </div>

      </div>
    </div>
  );
}

export default CheckInTypePage;