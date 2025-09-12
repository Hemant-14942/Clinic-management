import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUserMd, FaUserPlus } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="w-72 h-full py-32 px-4 bg-white border-r border-gray-200 fixed">
      <div className="flex flex-col gap-2">
        <NavLink 
          to="/admin-dashboard" 
          className={({ isActive }) => `
            flex items-center gap-3 p-2 rounded-md transition-colors
            ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}
          `}
        >
          <FaHome />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/all-appointments" 
          className={({ isActive }) => `
            flex items-center gap-3 p-2 rounded-md transition-colors
            ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}
          `}
        >
          <FaCalendarAlt />
          <span>Appointments</span>
        </NavLink>

        <NavLink 
          to="/add-doctor" 
          className={({ isActive }) => `
            flex items-center gap-3 p-2 rounded-md transition-colors
            ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}
          `}
        >
          <FaUserPlus />
          <span>Add Doctor</span>
        </NavLink>

        <NavLink 
          to="/doctor-list" 
          className={({ isActive }) => `
            flex items-center gap-3 p-2 rounded-md transition-colors
            ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}
          `}
        >
          <FaUserMd />
          <span>Doctors List</span>
        </NavLink>

        <NavLink 
          to="/book-appointment" 
          className={({ isActive }) => `
            flex items-center gap-3 p-2 rounded-md transition-colors
            ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}
          `}
        >
          <FaUserMd />
          <span>Book Appointment</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
