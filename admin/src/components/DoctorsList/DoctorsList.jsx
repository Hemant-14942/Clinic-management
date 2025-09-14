import React, { useContext, useEffect, useState, useMemo } from "react";
import { AdminContext } from "../../store/store";
import { Mail, Calendar, Edit2, Search, User } from "lucide-react";
import axios from "axios";

const DoctorsList = () => {
  const { loading, fetchDoctors, error, doctors, backendUrl, token } =
    useContext(AdminContext);

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    speciality: "",
    available: true,
    fees: "",
    experience: "",
  });

  // 🔹 Filters state
  const [filters, setFilters] = useState({
    speciality: "all",
    availability: "all",
    search: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleEditClick = (doctor) => {
    setEditingDoctor(doctor);
    setEditForm({
      name: doctor.name || "",
      speciality: doctor.speciality || "",
      available: doctor.available || false,
      fees: doctor.fees || "",
      experience: doctor.experience || "",
    });
  };

  const handleSave = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/edit-doctor`,
        { docId: editingDoctor._id, ...editForm },
        { headers: { token } }
      );

      if (data.success) {
        fetchDoctors();
        setEditingDoctor(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update doctor.");
    }
  };

  // 🔹 Unique specialities for dropdown
  const specialities = useMemo(() => {
    const set = new Set(doctors.map((d) => d.speciality));
    return ["all", ...Array.from(set)];
  }, [doctors]);

  // 🔹 Filter doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      if (
        filters.speciality !== "all" &&
        doctor.speciality !== filters.speciality
      )
        return false;
      if (
        filters.availability !== "all" &&
        doctor.available !== (filters.availability === "true")
      )
        return false;
      if (
        filters.search &&
        !doctor.name.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [doctors, filters]);

  return (
    <div className="w-full p-8">
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">👨‍⚕️ Our Doctors</h2>

        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-56 pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Speciality */}
          <select
            value={filters.speciality}
            onChange={(e) =>
              setFilters({ ...filters, speciality: e.target.value })
            }
            className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            {specialities.map((spec, i) => (
              <option key={i} value={spec}>
                {spec === "all" ? "All Specialities" : spec}
              </option>
            ))}
          </select>

          {/* Availability */}
          <select
            value={filters.availability}
            onChange={(e) =>
              setFilters({ ...filters, availability: e.target.value })
            }
            className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="flex justify-center items-center min-h-64 text-gray-500">
          Loading doctors...
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col"
          >
            {/* Doctor Image */}
            <div className="relative">
              <img
                src={doctor.image || "/api/placeholder/400/300"}
                alt={doctor.name}
                className="w-full h-40 object-contain rounded-t-2xl"
                onError={(e) => {
                  e.target.src = "/api/placeholder/400/300";
                }}
              />
              <div className="absolute top-3 right-3 flex gap-2 items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    doctor.available
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {doctor.available ? "Available" : "Unavailable"}
                </span>
                <button
                  onClick={() => handleEditClick(doctor)}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="p-5 flex-grow">
              <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
              <p className="text-blue-600 font-medium">{doctor.speciality}</p>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {doctor.email || "contact@medical.com"}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {doctor.experience
                    ? `${doctor.experience} year${
                        doctor.experience > 1 ? "s" : ""
                      } of experience`
                    : "Experience not provided"}
                </div>

                {doctor.fees && (
                  <div className="font-medium text-gray-800">
                    Fees:{" "}
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(doctor.fees)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingDoctor && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={() => setEditingDoctor(null)} // close when clicking overlay
        >
          <div
            className="bg-white p-6 rounded-xl w-96 shadow-lg"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              ✏️ Edit Doctor Info
            </h3>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-gray-600">Name</span>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Speciality</span>
                <input
                  type="text"
                  value={editForm.speciality}
                  onChange={(e) =>
                    setEditForm({ ...editForm, speciality: e.target.value })
                  }
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Fees</span>
                <input
                  type="number"
                  value={editForm.fees}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fees: e.target.value })
                  }
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Experience</span>
                <input
                  type="text"
                  value={editForm.experience}
                  onChange={(e) =>
                    setEditForm({ ...editForm, experience: e.target.value })
                  }
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Availability</span>
                <select
                  value={editForm.available}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      available: e.target.value === "true",
                    })
                  }
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditingDoctor(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
