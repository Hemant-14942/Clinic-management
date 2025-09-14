import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AdminContext } from "../../store/store";
import { toast, ToastContainer } from "react-toastify";
import DatePicker from "react-datepicker";

import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

const DoctorAppointmentBooking = () => {
  const [patientName, setPatientName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const { token, backendUrl, fetchDoctors, doctors } = useContext(AdminContext);

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, [backendUrl, token]);

  // Auto select first doctor if none selected
  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctor) {
      setSelectedDoctor(doctors[0]);
    }
  }, [doctors, selectedDoctor]);

  // Filter available doctors only
  const availableDoctors = doctors.filter((doc) => doc.available);
  useEffect(() => {
    if (availableDoctors.length > 0 && !selectedDoctor) {
      setSelectedDoctor(availableDoctors[0]);
    }
  }, [availableDoctors, selectedDoctor]);

  // Generate time slots (15-min intervals from 9 AM - 6 PM)
  const generateSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let min of [0, 15, 30, 45]) {
        const time = `${hour.toString().padStart(2, "0")}:${min
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const handleBook = async () => {
    if (!patientName || !description || !selectedDate || !selectedTime) {
      toast.error("⚠️ Please fill all fields and select date & time");
      return;
    }
    if (!selectedDoctor) {
      toast.error("⚠️ Please select a doctor");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${backendUrl}/api/admin/book-appointment`,
        {
          patientName,
          description,
          docId: selectedDoctor._id,
          slotDate: selectedDate.toISOString().split("T")[0], // formatted date
          slotTime: selectedTime,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      if (res.data.success) {
        setConfirmation(res.data);
        toast.success("✅ Appointment booked successfully!");

        // Reset form
        setPatientName("");
        setDescription("");
        setSelectedDate(null);
        setSelectedTime(null);
      } else {
        toast.error(`❌ ${res.data.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Error booking appointment. Please try again.");
    }

    setLoading(false);
  };

  const slots = generateSlots();

  return (
    <div className="flex justify-center items-start py-10 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-5xl p-6 bg-white shadow-md rounded-2xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Doctor Info */}
          <div className="col-span-1 border-r border-gray-200 pr-4">
            <div className="flex flex-col items-center text-center">
              {selectedDoctor ? (
                <>
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-28 h-28 rounded-full border-2 border-blue-200 shadow-sm"
                  />
                  <h2 className="text-xl font-semibold text-gray-800 mt-3">
                    {selectedDoctor.name}
                  </h2>
                  <p className="text-gray-500">{selectedDoctor.speciality}</p>
                  <div className="mt-4 text-sm text-gray-600 space-y-2">
                    <p>⏱️ Duration: 20 mins</p>
                    <p>💰 Fees: ₹{selectedDoctor.fees}</p>
                    <p>🎓 {selectedDoctor.degree}</p>
                    <p>🧑‍⚕️ {selectedDoctor.experience} yrs experience</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-400">Loading doctor info...</p>
              )}

              {/* Doctor Dropdown */}
              <select
                onChange={(e) =>
                  setSelectedDoctor(
                    availableDoctors.find((doc) => doc._id === e.target.value)
                  )
                }
                value={selectedDoctor?._id || ""}
                className="mt-6 px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
              >
                {availableDoctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Form + Calendar & Slots */}
          <div className="col-span-2 flex flex-col space-y-5">
            {/* Patient Details */}
            <h3 className="font-semibold text-lg text-gray-800">
              Patient Details
            </h3>
            <input
              type="text"
              placeholder="Enter Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <textarea
              placeholder="Describe your health issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-lg p-3 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            {/* Date Picker */}
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Select Date
              </h3>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                className="border rounded-lg p-2 w-52 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholderText="Choose a date"
              />
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Select Time
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {slots.map((time) => (
                  <button
                    key={time}
                    className={`p-2 rounded-lg border text-sm transition ${
                      selectedTime === time
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 hover:bg-blue-50 text-gray-700"
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Book Button */}
            <button
              className="mt-6 w-44 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              onClick={handleBook}
              disabled={loading}
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>

            {/* Confirmation */}
            {confirmation && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                ✅ Appointment booked successfully! <br />
                Queue Number:{" "}
                <span className="font-semibold">
                  {confirmation.queueNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentBooking;
