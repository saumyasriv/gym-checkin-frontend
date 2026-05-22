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

    // expiry date
    const expiry = new Date(start);

    expiry.setDate(
      expiry.getDate() + (weeks * 7)
    );

    // total credits
    setTotalCredits(credits);

    // calculate actual Mon/Wed/Fri sessions
    let usedCredits = 0;

    // normalize dates
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

      // Monday = 1
      // Wednesday = 3
      // Friday = 5

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

    const calculatedRemaining =
      Math.max(
        credits - usedCredits,
        0
      );

    setRemainingCredits(
      calculatedRemaining
    );

    // expiry date
    setExpiryDate(
      expiry.toISOString().split("T")[0]
    );

  }, [packageName, startDate]);

  const fetchMembers = async () => {

    try {

      const response = await axios.get(
        "${API_BASE_URL}/members"
      );

      setMembers(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  const addMembership = async () => {

    try {

      await axios.post(
        "http://localhost:8080/memberships",
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

  return (

    <div className="min-h-screen p-8 text-black">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-6xl font-bold mb-10">
          Update Existing Member
        </h1>

        <div className="space-y-5">

          <select
            value={memberId}
            onChange={(e) =>
              setMemberId(e.target.value)
            }
            className="
              w-full
              p-5
              rounded-2xl
              text-2xl
              bg-white
              shadow-xl
              outline-none
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

          <select
            value={packageName}
            onChange={(e) =>
              setPackageName(e.target.value)
            }
            className="
              w-full
              p-5
              rounded-2xl
              text-2xl
              bg-white
              shadow-xl
              outline-none
            "
          >

            <option value="">
              Select Package
            </option>

            <option>
              12 Sessions
            </option>

            <option>
              24 Sessions
            </option>

            <option>
              36 Sessions
            </option>

          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            className="
              w-full
              p-5
              rounded-2xl
              text-2xl
              bg-white
              shadow-xl
              outline-none
            "
          />

          <input
            type="number"
            placeholder="Total Credits"
            value={totalCredits}
            readOnly
            className="
              w-full
              p-5
              rounded-2xl
              text-2xl
              bg-zinc-100
              shadow-xl
              outline-none
            "
          />

          {/* Remaining Credits */}
          <div>

            <div className="
              text-xl
              font-bold
              mb-2
              text-black
            ">
              Remaining Credits
            </div>

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
                p-5
                rounded-2xl
                text-2xl
                bg-yellow-100
                border-4
                border-black
                shadow-xl
                outline-none
              "
            />

          </div>

          <input
            type="number"
            placeholder="Amount Paid"
            value={amountPaid}
            onChange={(e) =>
              setAmountPaid(
                e.target.value
              )
            }
            className="
              w-full
              p-5
              rounded-2xl
              text-2xl
              bg-white
              shadow-xl
              outline-none
            "
          />

          <input
            type="date"
            value={expiryDate}
            readOnly
            className="
              w-full
              p-5
              rounded-2xl
              text-2xl
              bg-zinc-100
              shadow-xl
              outline-none
            "
          />

          <button
            onClick={addMembership}
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
            Save Existing Membership
          </button>

        </div>

      </div>

    </div>
  )
}

export default UpdateExistingMemberPage;