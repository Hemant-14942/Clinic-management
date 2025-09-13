import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../store/store";
import { Calendar, Clock, User, Stethoscope } from "lucide-react";

const AppointmentsList = () => {
  const { token, backendUrl, loading, appointments, fetchAppointments } =
    useContext(AdminContext);

  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, [backendUrl, token]);

  const formatDate = (dateString) => dateString.replace(/_/g, "/");

  const doctorList = [
    ...new Set(appointments.map((a) => a.docData?.name || "Unknown")),
  ];

  const filteredAppointments = appointments.filter((appointment) => {
    if (appointment.cancelled) return false;
    if (filterDoctor !== "all" && appointment.docData?.name !== filterDoctor)
      return false;
    if (filterStatus === "active" && appointment.isCompleted) return false;
    if (filterStatus === "completed" && !appointment.isCompleted) return false;
    return true;
  });

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
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      appointment.isCompleted
                        ? "bg-gray-200 text-gray-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {appointment.isCompleted ? "Completed" : "Active"}
                  </span>
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
                          appointment.payment
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {appointment.payment ? "Paid" : "Pending"}
                      </span>
                    </p>
                    <span className="font-bold text-gray-900">
                      ₹{appointment.amount || doctor.fees}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t flex gap-3">
                  <button className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium">
                    Cancel
                  </button>
                  {!appointment.isCompleted && (
                    <button className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition text-sm font-medium">
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
    </div>
  );
};

export default AppointmentsList;
