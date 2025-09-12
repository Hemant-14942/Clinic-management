import React, { useContext } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { assets } from '../../assets/assets_admin/assets.js';
import { AdminContext } from '../../store/store.jsx';

const Navbar = () => {
  const { setToken } = useContext(AdminContext);

  const logoutHandler = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <div className="shadow-md border-b border-gray-200 bg-white fixed top-0 left-0 w-full z-20">
      <div className="max-w-7xl mx-auto px-6 flex justify-between h-16  items-center">
        <img className="h-[7em] " src={assets.admin_logo} alt="Admin Logo" />
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-600">
            <FaUserCircle className="text-2xl" />
            <span className="font-medium">Admin</span>
          </div>
          <button 
            onClick={logoutHandler}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
