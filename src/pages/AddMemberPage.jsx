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

      await axios.post(
        `${API_BASE_URL}/members`,
        {
          name,
          phone,
          email,
          notes,
        }
      );

      toast.success("Member added!");

      setName("");
      setPhone("");
      setEmail("");
      setNotes("");

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to add member!"
      );

    } finally {

      setIsSubmitting(false);

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
            New Member
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
            Add a New Trooper
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
            Add the member's basic details below.
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


            {/* NAME */}
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
                Name
              </label>

              <input
                placeholder="Enter member name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="
                  w-full
                  h-16
                  px-5
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


            {/* PHONE */}
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
                Phone
              </label>

              <input
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="
                  w-full
                  h-16
                  px-5
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


            {/* EMAIL */}
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
                Email
              </label>

              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="
                  w-full
                  h-16
                  px-5
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


            {/* NOTES */}
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
                Notes
              </label>

              <textarea
                placeholder="Anything you'd like to remember about this member..."
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                className="
                  w-full
                  min-h-[180px]
                  p-5
                  rounded-2xl
                  text-black
                  text-xl
                  bg-white
                  outline-none
                  border-2
                  border-transparent
                  focus:border-yellow-400
                  transition
                  resize-y
                  placeholder:text-black/35
                "
              />

            </div>


            {/* SUBMIT */}
            <button
              onClick={addMember}
              disabled={isSubmitting}
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
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >

              {isSubmitting
                ? "Adding..."
                : "Add Member"
              }

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
          You can add memberships after creating the member.
        </div>

      </div>

    </div>

  );
}

export default AddMemberPage;