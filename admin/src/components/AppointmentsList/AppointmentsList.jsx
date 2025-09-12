import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../store/store";

const AppointmentsList = () => {
  const { token, backendUrl, loading, appointments, fetchAppointments } =
    useContext(AdminContext);

  useEffect(() => {
    fetchAppointments();
  }, [backendUrl, token]);

  const formatDate = (dateString) => {
    return dateString.replace(/_/g, "/");
  };

  const activeAppointments = appointments.filter(
    (appointment) => !appointment.cancelled
  );

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Active Appointments
        </h2>
        <div className="text-sm text-gray-500">
          {activeAppointments.length} appointments available
        </div>
      </div>

      {activeAppointments && activeAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeAppointments.map((appointment, index) => {
            const doctor = appointment.docData || {};
            const patient = appointment.userData || {};

            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Doctor Image */}
                <div className="relative">
                  {doctor.image && (
                    <img
                      src={doctor.image}
                      alt={doctor.name || "Doctor"}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="absolute top-3 right-3 bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Active
                  </div>
                </div>

                {/* Appointment Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {doctor.name || "Unknown Doctor"}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium">
                        {doctor.speciality || "Specialist"}
                      </p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-sm font-medium px-2.5 py-1 rounded">
                      ₹{appointment.amount || doctor.fees}
                    </span>
                  </div>

                  {/* Date / Time / Payment */}
                  <div className="mt-4 flex justify-between text-sm">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium text-gray-800">
                        {formatDate(appointment.slotDate || "N/A")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-medium text-gray-800">
                        {appointment.slotTime || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment</p>
                      <p
                        className={`font-medium ${
                          appointment.payment
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {appointment.payment ? "Paid" : "Pending"}
                      </p>
                    </div>
                  </div>

                  {/* Patient Info */}
                  {patient.name && (
                    <div className="mt-4 pt-3 border-t border-gray-200 text-sm">
                      <p>
                        <span className="text-gray-500">Patient: </span>
                        {patient.name}
                      </p>
                      {patient.email && (
                        <p className="truncate">
                          <span className="text-gray-500">Email: </span>
                          {patient.email}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
          <p className="text-gray-500">No active appointments found</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
