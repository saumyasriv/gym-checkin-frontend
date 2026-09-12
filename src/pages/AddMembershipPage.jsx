import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

function AddMembershipPage() {

  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [packageName, setPackageName] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();

    return `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
  });
  const [amountPaid, setAmountPaid] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {

    try {

      const response = await axios.get(
        `${API_BASE_URL}/members`
      );

      console.log(response.data);

      setMembers(response.data);

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to load members"
      );

    }
  };


  const createMembership = async () => {

    try {

      await axios.post(
        `${API_BASE_URL}/memberships`,
        {
          memberId,
          packageName,
          startDate,
          amountPaid
        }
      );

      toast.success(
        "Membership created!"
      );

      setMemberId("");
      setPackageName("");

      const today = new Date();

      setStartDate(
        `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(
          today.getDate()
        ).padStart(2, "0")}`
      );

      setAmountPaid("");

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to create membership"
      );

    }
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
            Membership
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
            Add a Membership
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
            Add a new membership package to a trooper.
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
                  text-black
                  text-xl
                  font-medium
                  bg-white
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
                  text-black
                  text-xl
                  font-medium
                  bg-white
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
                  text-black
                  text-xl
                  font-medium
                  bg-white
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
            {/* AMOUNT */}
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
                    setAmountPaid(e.target.value)
                  }
                  className="
                    w-full
                    h-16
                    pl-11
                    pr-5
                    rounded-2xl
                    text-black
                    text-xl
                    bg-white
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
            {/* CREATE BUTTON */}
            {/* ================================================= */}

            <button
              onClick={createMembership}
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
              Create Membership
            </button>

          </div>

        </div>


        {/* FOOTER HINT */}

        <div
          className="
            text-center
            text-sm
            text-black/40
            font-medium
            mt-5
          "
        >
          The membership will be added to the selected trooper.
        </div>

      </div>

    </div>

  );

}

export default AddMembershipPage;