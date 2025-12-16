import React, { useState, useEffect } from 'react';

import { FaXTwitter } from "react-icons/fa6";
import { RiThreadsFill } from "react-icons/ri";
import { FiInstagram } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ManageGuest() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [formData, setFormData] = useState({
    guestName: '',
    guestRole: '',
    guestImage: '',
    instagram: '',
    twitter: '',
    threads: ''
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/manage-guest');
      const data = await response.json();
      setGuests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching guests:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const navigate = useNavigate();

  const handleAddGuest = () => {
    navigate("/guest"); // 👈 redirects to Add Guest page
  };


  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setFormData({
      guestName: guest.guestName,
      guestRole: guest.guestRole,
      guestImage: guest.guestImage,
      instagram: guest.instagram || '',
      twitter: guest.twitter || '',
      threads: guest.threads || ''
    });
    setShowModal(true);
  };

  const handleSaveGuest = async () => {
    try {
      if (editingGuest) {
        const response = await fetch(`http://localhost:8000/api/manage-guest/${editingGuest.guest_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          fetchGuests();
          setShowModal(false);
        }
      } else {
        const response = await fetch('http://localhost:8000/api/manage-guest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          fetchGuests();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving guest:', error);
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/manage-guest/${guestId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchGuests();
        }
      } catch (error) {
        console.error('Error deleting guest:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Guest</h1>
          <button
            onClick={handleAddGuest}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add Guest
          </button>
        </div>

        <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 ">
          {guests.map((guest) => (
            <div key={guest.guest_id} className="bg-[#f7f7f7] px-6 py-6 rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-200 h-72 rounded-lg flex items-center justify-center">
                <img
                  src={guest.guestImage}
                  alt={guest.guestName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              </div>

              <div className="py-4 ">
                <div className='flex justify-between items-center'>
                <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {guest.guestName}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{guest.guestRole}</p>
                </div>

                <div className="flex gap-3 mb-4">
                  {guest.twitter && (
                    <a
                      href={guest.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <FaXTwitter size={20} />
                    </a>
                  )}
                  {guest.instagram && (
                    <a
                      href={guest.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                     <FiInstagram size={20} />
                    </a>
                  )}
                  {guest.threads && (
                    <a
                      href={guest.threads}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <RiThreadsFill size={22} />
                    </a>
                  )}
       
                </div>
                </div>

                <div className="flex gap-2">
                  
                  <button
                    onClick={() => handleEditGuest(guest)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGuest(guest.guest_id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>

        {guests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No guests found. Add your first guest!</p>
          </div>
        )}
      </div>

      {/* {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingGuest ? 'Edit Guest' : 'Add Guest'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  name="guestRole"
                  value={formData.guestRole}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="guestImage"
                  value={formData.guestImage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter URL
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Threads URL
                </label>
                <input
                  type="url"
                  name="threads"
                  value={formData.threads}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGuest}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
              >
                {editingGuest ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}