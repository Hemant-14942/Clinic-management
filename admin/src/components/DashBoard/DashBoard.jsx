import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../store/store';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const {
    userCount,
    doctors,
    appointments,
    fetchAppointments,
    fetchDoctors,
    getUserCount
  } = useContext(AdminContext);

  const [doctorPatientCounts, setDoctorPatientCounts] = useState({});
  const [topDoctors, setTopDoctors] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    getUserCount();
  }, []);

  useEffect(() => {
    if (appointments.length && doctors.length) {
      const counts = {};
      doctors.forEach(doc => {
        counts[doc._id] = 0;
      });

      appointments.forEach(appointment => {
        if (!appointment.cancelled && appointment.docId) {
          counts[appointment.docId] = (counts[appointment.docId] || 0) + 1;
        }
      });

      setDoctorPatientCounts(counts);

      const doctorsWithCounts = doctors.map(doctor => ({
        ...doctor,
        patientCount: counts[doctor._id] || 0
      }));

      const sorted = doctorsWithCounts.sort((a, b) => b.patientCount - a.patientCount);
      setTopDoctors(sorted);
    }
  }, [appointments, doctors]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    if (dateString.includes('_')) {
      const [day, month, year] = dateString.split('_');
      return `${day}/${month}/${year}`;
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month}, ${year}`;
    } catch (e) {
      return dateString; 
    }
  };

  return (
    <div className="h-screen w-full">      
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* <StatCard title="Total Users" value={userCount} color="blue" /> */}
          <StatCard title="Appointments" value={appointments.filter(item => !item.cancelled).length} color="green" />
          <StatCard title="Active Doctors" value={doctors.length} color="indigo" />
        </div>
        
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Appointments</h3>
            <Link to={'/all-appointments'}>
              <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="text-left py-3 px-2">Patient</th>
                  <th className="text-left py-3 px-2">Doctor</th>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Time</th>
                  <th className="text-left py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments
                  .filter(a => !a.cancelled)
                  .slice(0, 3)
                  .map((appointment, index) => (
                    <AppointmentRow
                      key={index}
                      name={appointment.patientName || "N/A"}
                      doctor={appointment.docData?.name || "N/A"}
                      date={formatDate(appointment.slotDate || appointment.date)}
                      time={appointment.slotTime || "N/A"}
                      status={appointment.status || "N/A"}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Top Doctors */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Top Doctors</h3>
            <Link onClick={() => scrollTo(0, 0)} to={'/doctor-list'}>
              <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topDoctors.slice(0, 3).map((doctor, index) => (
              <DoctorCard
                key={index}
                name={doctor.name}
                specialty={doctor.specialty || doctor.speciality || "General physician"}
                patients={doctor.patientCount}
                image={doctor.image}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

/* -------------------
   StatCard Component
------------------- */
const StatCard = ({ title, value, color }) => {
  const colorMap = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    indigo: "bg-indigo-600"
  };

  return (
    <div className="rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className={`${colorMap[color]} h-2`}></div>
      <div className="p-6 bg-white">
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1 text-gray-800">{value || 0}</p>
      </div>
    </div>
  );
};

/* -------------------
   AppointmentRow Component
------------------- */
const AppointmentRow = ({ name, doctor, date, time, status }) => {
  const statusColor =
    status === 'Completed'
      ? 'bg-green-100 text-green-700'
      : 'bg-blue-100 text-blue-700';

  return (
    <tr className="border-b hover:bg-gray-50 text-gray-700">
      <td className="py-3 px-2">{name}</td>
      <td className="py-3 px-2">{doctor}</td>
      <td className="py-3 px-2">{date}</td>
      <td className="py-3 px-2">{time}</td>
      <td className="py-3 px-2">
        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

/* -------------------
   DoctorCard Component
------------------- */
const DoctorCard = ({ name, specialty, patients, image, rank }) => {
  const getInitial = () => {
    if (!name) return "D";
    const parts = name.split(' ');
    return parts.length > 1 ? parts[1][0] : parts[0][0];
  };

  // Rank badge colors
  const rankColors = {
    1: "bg-yellow-500",
    2: "bg-gray-400",
    3: "bg-amber-600",
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow relative border border-gray-200">
      {rank <= 3 && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 ${rankColors[rank] || "bg-blue-500"} rounded-full flex items-center justify-center text-white text-xs font-bold shadow`}>
          {rank}
        </div>
      )}
      <div className="flex items-center mb-3">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-12 h-12 rounded-full object-cover mr-3" 
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium mr-3">
            {getInitial()}
          </div>
        )}
        <div>
          <div className="font-medium text-gray-800">{name}</div>
          <p className="text-sm text-gray-500">{specialty}</p>
        </div>
      </div>
      <div className="flex items-center text-sm">
        <span className="text-gray-500">Total Patients:</span>
        <span className="ml-1 font-medium text-gray-800">{patients}</span>
      </div>
    </div>
  );
};

export default Dashboard;
