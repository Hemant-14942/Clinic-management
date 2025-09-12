import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AdminContext } from "../../store/store";

const DoctorAppointmentBooking = () => {
  const [patientName, setPatientName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const { token, backendUrl, fetchDoctors, error, doctors } =
    useContext(AdminContext);

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
      return alert("Please fill all fields and select date & time");
    }
    if (!selectedDoctor) {
      return alert("Please select a doctor");
    }

    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/book-appointment`, {
        patientName,
        description,
        docId: selectedDoctor._id, // ✅ dynamically selected doctor
        slotDate: selectedDate,
        slotTime: selectedTime,
      });

      setConfirmation(res.data);
      // Reset form after booking
      setPatientName("");
      setDescription("");
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (err) {
      console.error(err);
      alert("Error booking appointment");
    }
    setLoading(false);
  };

  const slots = generateSlots();

  return (
    <div className="flex justify-center items-start py-10 bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl p-6 bg-white shadow-lg rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Doctor Info */}
          <div className="col-span-1 border-r pr-4 ">
            <div className="flex flex-col items-center text-center">
              {selectedDoctor ? (
                <>
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-24 h-24 rounded-full  border-2 border-gray-500"
                  />
                  <h2 className="text-lg font-semibold text-white">
                    {selectedDoctor.name}
                  </h2>
                  <p className="text-gray-400">{selectedDoctor.speciality}</p>
                  <div className="mt-4 text-sm text-gray-400 space-y-2">
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
                    doctors.find((doc) => doc._id === e.target.value)
                  )
                }
                value={selectedDoctor?._id || ""}
                className="mt-4 px-3 py-2 rounded bg-gray-800 text-gray-200"
              >
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Form + Calendar & Slots */}
          <div className="col-span-2 flex flex-col space-y-4">
            {/* Patient Details */}
            <h3 className="font-semibold text-lg">Patient Details</h3>
            <input
              type="text"
              placeholder="Enter Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="border rounded-lg p-2 w-full"
            />
            <textarea
              placeholder="Describe your health issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-lg p-2 w-full h-20"
            />

            {/* Date Picker */}
            <h3 className="font-semibold text-lg">Select Date</h3>
            <input
              type="date"
              className="border rounded-lg p-2 w-48"
              value={selectedDate || ""}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            {/* Time Slots */}
            <h3 className="font-semibold text-lg mt-4">Select Time</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {slots.map((time) => (
                <button
                  key={time}
                  className={`p-2 rounded-lg border text-sm ${
                    selectedTime === time
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 hover:bg-green-100"
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>

            {/* Book Button */}
            <button
              className="mt-6 w-40 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              onClick={handleBook}
              disabled={loading}
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>

            {/* Confirmation */}
            {confirmation && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                ✅ Appointment booked successfully! <br />
                Queue Number: <b>{confirmation.queueNumber}</b>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentBooking;
