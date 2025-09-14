import React, { useState, useContext } from 'react'
import axios from "axios";
import { AdminContext } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setToken } = useContext(AdminContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${backendUrl}/api/admin/login`, formData)
      console.log("response----->", response.data);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        toast.success("Login successful 🎉", { position: "top-right" });
        setTimeout(() => navigate('/admin-dashboard'), 1500); // navigate after toast
      } else {
        toast.error(response.data.message || "Login failed ❌", { position: "top-right" });
      }
    } catch (error) {
      console.log("Login error:", error);
      toast.error(error.response?.data?.message || "Something went wrong 😢", { position: "top-right" });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              placeholder="Enter admin email"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              placeholder="Enter admin password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/50 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
      {/* Toast container must be inside your component tree */}
      <ToastContainer />
    </div>
  )
}

export default Login
