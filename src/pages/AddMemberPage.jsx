import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

function AddMemberPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMember = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/members`, {
        name,
        phone,
        email,
        notes,
      });

      toast.success("Member added!");

      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add member!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold mb-10">
          Add a new Trooper
        </h1>

        <div className="space-y-5">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="
              w-full
              p-5
              rounded-2xl
              text-black
              text-2xl
              bg-white
            "
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="
              w-full
              p-5
              rounded-2xl
              text-black
              text-2xl
              bg-white
            "
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full
              p-5
              rounded-2xl
              text-black
              text-2xl
              bg-white
            "
          />

          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            onClick={addMember}
            disabled={isSubmitting}
            className="
              w-full
              bg-black
              text-white
              py-5
              rounded-2xl
              text-2xl
              font-bold
              mt-4
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {isSubmitting ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMemberPage;