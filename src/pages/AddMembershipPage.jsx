import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function AddMembershipPage() {

  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [packageName, setPackageName] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {

    try {

      const response = await axios.get(
        "http://localhost:8080/members"
      );

      console.log(response.data);
      setMembers(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  const createMembership = async () => {

    try {

      await axios.post(
        "http://localhost:8080/memberships",
        {
          memberId,
          packageName,
          amountPaid
        }
      );

      toast.success("Membership created!");

      setMemberId("");
      setPackageName("");
      setAmountPaid("");

    } catch (error) {

      console.error(error);

      toast.success("Failed to create membership");
    }
  };

  return (
    <div className="min-h-screen text-black p-8">

      <div className="max-w-2xl mx-auto">

        <h1 className="text-5xl font-bold mb-10">
          Add Membership for a trooper
        </h1>

        <div className="space-y-5">

          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="
              w-full
              p-5
              rounded-2xl
              text-black
              text-2xl
              bg-white
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
            onChange={(e) => setPackageName(e.target.value)}
            className="
              w-full
              p-5
              rounded-2xl
              text-black
              text-2xl
              bg-white
            "
          >

            <option value="">
              Select Package
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

          <input
            placeholder="Amount Paid"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="
              w-full
              p-5
              rounded-2xl
              text-black
              text-2xl
              bg-white
            "
          />

            <button
            onClick={createMembership}
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
            Create Membership
          </button>

        </div>

      </div>

    </div>
  )
}

export default AddMembershipPage;