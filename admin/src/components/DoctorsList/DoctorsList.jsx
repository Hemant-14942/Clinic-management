import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../store/store'
import { Mail, Calendar } from 'lucide-react'

const DoctorsList = () => {
  const { loading, fetchDoctors, error, doctors } = useContext(AdminContext)

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="w-full p-6 flex justify-center items-center min-h-64">
        <div className="animate-pulse text-blue-600 font-medium">Loading doctors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        <button 
          onClick={fetchDoctors}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Medical Specialists</h2>
        <div className="text-sm text-gray-500">{doctors.length} doctors available</div>
      </div>
      
      {doctors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="relative bg-blue-50">
                <img 
                  src={doctor.image || "/api/placeholder/400/300"} 
                  alt={doctor.name}
                  className="w-full h-56 object-contain"
                  onError={(e) => { e.target.src = "/api/placeholder/400/300"; }}
                />
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doctor.available 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {doctor.available ? "Available" : "Unavailable"}
                  </div>
                </div>
              </div>
              
              <div className="p-5 flex-grow">
                <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                <p className="text-blue-600 font-medium mt-1">{doctor.speciality}</p>
                
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{doctor.email || "contact@medical.com"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{doctor.experience || "5+ years experience"}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorsList
