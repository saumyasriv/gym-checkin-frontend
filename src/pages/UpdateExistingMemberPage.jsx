import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

function UpdateExistingMemberPage() {

  const [members, setMembers] = useState([]);

  const [memberId, setMemberId] =
    useState("");

  const [packageName, setPackageName] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [expiryDate, setExpiryDate] =
    useState("");

  const [totalCredits, setTotalCredits] =
    useState("");

  const [
    remainingCredits,
    setRemainingCredits
  ] = useState("");

  const [amountPaid, setAmountPaid] =
    useState("");


  useEffect(() => {
    fetchMembers();
  }, []);


  useEffect(() => {

    if (!packageName || !startDate) {
      return;
    }

    const start = new Date(startDate);

    const today = new Date();

    let weeks = 0;
    let credits = 0;


    if (packageName === "8 Sessions") {
      weeks = 5;
      credits = 8;
    }

    if (packageName === "12 Sessions") {
      weeks = 5;
      credits = 12;
    }

    if (packageName === "24 Sessions") {
      weeks = 10;
      credits = 24;
    }

    if (packageName === "36 Sessions") {
      weeks = 15;
      credits = 36;
    }


    // Expiry date

    const expiry = new Date(start);

    expiry.setDate(
      expiry.getDate() + (weeks * 7)
    );


    // Total credits

    setTotalCredits(credits);


    // Calculate actual Mon/Wed/Fri sessions

    let usedCredits = 0;


    if (packageName === "8 Sessions") {

      const diffInDays = Math.floor(
        (today - start) /
        (1000 * 60 * 60 * 24)
      );

      const completedWeeks =
        Math.floor(diffInDays / 7);

      const daysIntoCurrentWeek =
        diffInDays % 7;

      usedCredits =
        completedWeeks * 2;


      if (daysIntoCurrentWeek >= 4) {
        usedCredits += 2;
      }

    } else {

      const currentDate = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );

      const normalizedToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );


      while (
        currentDate <= normalizedToday
      ) {

        const day =
          currentDate.getDay();

        if (
          day === 1 ||
          day === 3 ||
          day === 5
        ) {
          usedCredits++;
        }

        currentDate.setDate(
          currentDate.getDate() + 1
        );
      }
    }


    const calculatedRemaining =
      Math.max(
        credits - usedCredits,
        0
      );


    setRemainingCredits(
      calculatedRemaining
    );


    // Expiry date

    setExpiryDate(
      expiry.toISOString().split("T")[0]
    );

  }, [packageName, startDate]);


  const fetchMembers = async () => {

    try {

      const response = await axios.get(
        `${API_BASE_URL}/members`
      );

      console.log(
        "Members loaded:",
        response.data
      );

      setMembers(response.data);

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to load members"
      );

    }
  };


  const addMembership = async () => {

    try {

      await axios.post(
        `${API_BASE_URL}/memberships`,
        {
          memberId,
          packageName,
          totalCredits,
          remainingCredits,
          amountPaid,
          startDate,
          expiryDate
        }
      );

      toast.success(
        "Existing membership added!"
      );

      setMemberId("");
      setPackageName("");
      setStartDate("");
      setExpiryDate("");
      setTotalCredits("");
      setRemainingCredits("");
      setAmountPaid("");

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to add membership"
      );

    }
  };


  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

  };


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

      <div className="max-w-3xl mx-auto">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-10">

          <div
            className="
              text-sm
              uppercase
              tracking-[0.25em]
              font-black
              text-black/50
              mb-3
            "
          >
            Existing Member
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
            Update Membership
          </h1>

          <p
            className="
              text-lg
              md:text-xl
              text-black/55
              mt-4
              font-medium
            "
          >
            Add a membership to an existing trooper.
          </p>

        </div>


        {/* ================================================= */}
        {/* FORM CARD */}
        {/* ================================================= */}

        <div
          className="
            bg-black
            rounded-[32px]
            p-6
            md:p-8
            shadow-[0_18px_45px_rgba(0,0,0,0.20)]
          "
        >

          <div className="space-y-6">


            {/* ================================================= */}
            {/* MEMBER */}
            {/* ================================================= */}

            <div>

              <label
                className="
                  block
                  text-sm
                  uppercase
                  tracking-wider
                  font-bold
                  text-zinc-400
                  mb-2
                  ml-1
                "
              >
                Member
              </label>

              <select
                value={memberId}
                onChange={(e) =>
                  setMemberId(e.target.value)
                }
                className="
                  w-full
                  h-16
                  px-5
                  rounded-2xl
                  text-xl
                  font-medium
                  bg-white
                  text-black
                  outline-none
                  border-2
                  border-transparent
                  focus:border-yellow-400
                  transition
                  cursor-pointer
                "
              >

                <option value="">
                  Select Member
                </option>

                {members.map(member => (

                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.name}
                  </option>

                ))}

              </select>

            </div>


            {/* ================================================= */}
            {/* PACKAGE */}
            {/* ================================================= */}

            <div>

              <label
                className="
                  block
                  text-sm
                  uppercase
                  tracking-wider
                  font-bold
                  text-zinc-400
                  mb-2
                  ml-1
                "
              >
                Package
              </label>

              <select
                value={packageName}
                onChange={(e) =>
                  setPackageName(e.target.value)
                }
                className="
                  w-full
                  h-16
                  px-5
                  rounded-2xl
                  text-xl
                  font-medium
                  bg-white
                  text-black
                  outline-none
                  border-2
                  border-transparent
                  focus:border-yellow-400
                  transition
                  cursor-pointer
                "
              >

                <option value="">
                  Select Package
                </option>

                <option value="8 Sessions">
                  8 Sessions
                </option>

                <option value="12 Sessions">
                  12 Sessions
                </option>

                <option value="24 Sessions">
                  24 Sessions
                </option>

                <option value="36 Sessions">
                  36 Sessions
                </option>

              </select>

            </div>


            {/* ================================================= */}
            {/* START DATE */}
            {/* ================================================= */}

            <div>

              <label
                className="
                  block
                  text-sm
                  uppercase
                  tracking-wider
                  font-bold
                  text-zinc-400
                  mb-2
                  ml-1
                "
              >
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className="
                  w-full
                  h-16
                  px-5
                  rounded-2xl
                  text-xl
                  bg-white
                  text-black
                  outline-none
                  border-2
                  border-transparent
                  focus:border-yellow-400
                  transition
                  cursor-pointer
                "
              />

            </div>


            {/* ================================================= */}
            {/* CALCULATED DETAILS */}
            {/* ================================================= */}

            <div
              className="
                bg-white/[0.06]
                rounded-3xl
                p-5
                border
                border-white/10
              "
            >

              <div
                className="
                  text-sm
                  uppercase
                  tracking-[0.18em]
                  font-bold
                  text-zinc-500
                  mb-4
                "
              >
                Membership Details
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                {/* TOTAL CREDITS */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-bold
                      text-zinc-500
                      mb-2
                    "
                  >
                    Total Credits
                  </label>

                  <input
                    type="number"
                    value={totalCredits}
                    readOnly
                    className="
                      w-full
                      h-14
                      px-4
                      rounded-xl
                      text-xl
                      font-bold
                      bg-zinc-900
                      text-white
                      outline-none
                      border
                      border-white/10
                    "
                  />

                </div>


                {/* EXPIRY */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-bold
                      text-zinc-500
                      mb-2
                    "
                  >
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    value={expiryDate}
                    readOnly
                    className="
                      w-full
                      h-14
                      px-4
                      rounded-xl
                      text-xl
                      font-bold
                      bg-zinc-900
                      text-white
                      outline-none
                      border
                      border-white/10
                    "
                  />

                </div>

              </div>

            </div>


            {/* ================================================= */}
            {/* REMAINING CREDITS */}
            {/* ================================================= */}

            <div>

              <label
                className="
                  block
                  text-sm
                  uppercase
                  tracking-wider
                  font-bold
                  text-zinc-400
                  mb-2
                  ml-1
                "
              >
                Remaining Credits
              </label>

              <div
                className="
                  relative
                "
              >

                <input
                  type="number"
                  value={remainingCredits}
                  onChange={(e) =>
                    setRemainingCredits(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    h-16
                    px-5
                    rounded-2xl
                    text-xl
                    font-bold
                    bg-yellow-400
                    text-black
                    outline-none
                    border-2
                    border-yellow-400
                    focus:border-black
                    transition
                  "
                />

              </div>

              <div
                className="
                  text-sm
                  text-zinc-500
                  mt-2
                  ml-1
                "
              >
                Automatically calculated, but you can adjust it if needed.
              </div>

            </div>


            {/* ================================================= */}
            {/* AMOUNT PAID */}
            {/* ================================================= */}

            <div>

              <label
                className="
                  block
                  text-sm
                  uppercase
                  tracking-wider
                  font-bold
                  text-zinc-400
                  mb-2
                  ml-1
                "
              >
                Amount Paid
              </label>

              <div className="relative">

                <span
                  className="
                    absolute
                    left-5
                    top-1/2
                    -translate-y-1/2
                    text-xl
                    font-bold
                    text-black/40
                  "
                >
                  ₹
                </span>

                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    h-16
                    pl-11
                    pr-5
                    rounded-2xl
                    text-xl
                    bg-white
                    text-black
                    outline-none
                    border-2
                    border-transparent
                    focus:border-yellow-400
                    transition
                    placeholder:text-black/35
                  "
                />

              </div>

            </div>


            {/* ================================================= */}
            {/* SAVE BUTTON */}
            {/* ================================================= */}

            <button
              onClick={addMembership}
              className="
                w-full
                h-16
                bg-yellow-400
                text-black
                rounded-2xl
                text-xl
                font-black
                shadow-lg
                mt-2
                hover:bg-yellow-300
                active:scale-[0.99]
                transition-all
              "
            >
              Save Existing Membership
            </button>

          </div>

        </div>


        {/* FOOTER */}

        <div
          className="
            text-center
            text-sm
            text-black/40
            font-medium
            mt-5
          "
        >
          Membership dates and credits are calculated automatically.
        </div>

      </div>

    </div>

  );
}

export default UpdateExistingMemberPage;