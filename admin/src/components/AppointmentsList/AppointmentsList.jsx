import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../store/store";
import { Calendar, Clock, User, Stethoscope, Pencil } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import axios from "axios";

// -------------------------
// Edit Modal Component
// -------------------------

const AppointmentEditModal = ({ open, onClose, appointment, onSave }) => {
  const [formData, setFormData] = useState(appointment || {});

  useEffect(() => {
    setFormData(appointment || {});
  }, [appointment]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const normalizedData = {
      ...formData,
      status: formData.status?.toLowerCase(), // 🔽 normalize
      paymentStatus: formData.paymentStatus?.toLowerCase(), // 🔽 normalize
    };
    console.log(formData.paymentStatus);

    onSave(normalizedData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          Reschedule Appointment
        </h2>

        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date
            </label>
            <DatePicker
              selected={formData.slotDate ? new Date(formData.slotDate) : null}
              onChange={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  slotDate: date ? date.toISOString().split("T")[0] : "", // always string "YYYY-MM-DD"
                }))
              }
              dateFormat="yyyy-MM-dd"
              className="w-full border rounded-lg px-3 py-2"
              placeholderText="Select a date"
              minDate={new Date()} // prevent past dates
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Time
            </label>
            <input
              type="time"
              name="slotTime"
              value={formData.slotTime || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              name="paymentStatus" //
              value={formData.paymentStatus || "unpaid"}
              onChange={handleChange}
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          {/* {status} */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Status
            </label>
            <select
              name="status"
              value={formData.status || "pending"}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="checked-in">Checked-in</option>
              <option value="in-progress">In-progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------
// Main Appointment List
// -------------------------
const AppointmentsList = () => {
  const {
    token,
    backendUrl,
    loading,
    appointments,
    fetchAppointments,
    doctors,
  } = useContext(AdminContext);

  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // 🔹 new state for edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [backendUrl, token]);

  const formatDate = (dateString) => dateString.replace(/_/g, "/");

  const doctorList = [
    ...new Set(appointments.map((a) => a.docData?.name || "Unknown")),
  ];

  const filteredAppointments = appointments.filter((appointment) => {
    if (appointment.status === "cancelled") return false;
    if (filterDoctor !== "all" && appointment.docData?.name !== filterDoctor)
      return false;
    if (filterStatus === "active" && appointment.status !== "pending")
      return false;
    if (filterStatus === "completed" && appointment.status !== "completed")
      return false;
    return true;
  });

  // 🔹 open modal with selected appointment
  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setEditModalOpen(true);
  };

  // 🔹 save updated appointment
  const handleSave = async (updatedData) => {
    try {
      const res = await fetch(
        `${backendUrl}/api/admin/update-appointment/${updatedData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token,
          },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchAppointments(); // refresh after update
        setEditModalOpen(false);
      } else {
        alert(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🏥 Front Desk Appointments
        </h2>
        <div className="flex gap-3">
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Doctors</option>
            {doctorList.map((doc, idx) => (
              <option key={idx} value={doc}>
                {doc}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment, index) => {
            const doctor = appointment.docData || {};

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col"
              >
                {/* Header */}
                <div className="p-4 border-b bg-blue-50 rounded-t-2xl flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Queue #{appointment.queueNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        appointment.status === "completed"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                    {/* 🔹 edit button */}
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <User size={18} className="text-blue-500" />
                      {appointment.patientName}
                    </h3>
                    <p className="text-sm text-gray-500">Patient</p>
                  </div>

                  {/* Doctor */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-5">
                    <p className="text-sm font-bold text-blue-800 flex items-center gap-2">
                      <Stethoscope size={16} />
                      Dr. {doctor.name || "Unknown"}
                    </p>
                    <p className="text-xs text-blue-600">
                      {doctor.speciality || "Specialist"}
                    </p>
                  </div>

                  {/* Date / Time */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(appointment.slotDate || "N/A")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-medium text-gray-800">
                          {appointment.slotTime || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="flex justify-between items-center text-sm border-t pt-4">
                    <p>
                      <span className="text-gray-500">Payment: </span>
                      <span
                        className={`font-semibold ${
                          appointment.paymentStatus === "paid"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {appointment.paymentStatus === "paid"
                          ? "Paid"
                          : "Pending"}
                      </span>
                    </p>
                    <span className="font-bold text-gray-900">
                      ₹{appointment.amount || doctor.fees}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t flex gap-3">
                  <button
                    onClick={async () => {
                      if (
                        !window.confirm(
                          "Are you sure you want to cancel this appointment?"
                        )
                      )
                        return;

                      try {
                        const deleteRes = await axios.delete(
                          `${backendUrl}/api/admin/delete-appointment/${appointment._id}`,
                          {
                            headers: {
                              token: token, // 👈 match backend (req.headers.token)
                            },
                          }
                        );
                        console.log(deleteRes.data);

                        fetchAppointments(); // 🔄 refresh list after deletion
                      } catch (err) {
                        console.error(err);
                        alert("Failed to cancel appointment");
                      }
                    }}
                    className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                  {appointment.status !== "completed" && (
                    <button
                      onClick={() =>
                        handleSave({
                          ...appointment,
                          status: "completed", // 🔽 directly overwrite status
                        })
                      }
                      className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center shadow-sm">
          <p className="text-gray-500 text-lg">No appointments found</p>
        </div>
      )}

      {/* 🔹 edit modal */}
      <AppointmentEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        appointment={selectedAppointment}
        onSave={handleSave}
      />
    </div>
  );
};

export default AppointmentsList;
