import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hostName: "",
    episodeNumber: "",
    hostVideoLink: "",
    videoCategoryId: "",
  });

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/episode");
        const allCategories = res.data.categories || [];
        setCategories(allCategories);

        // ✅ Auto-select “Marketing” or “Market Insight”
        const defaultCategory = allCategories.find(
          (cat) =>
            cat.name.toLowerCase().includes("marketing") ||
            cat.name.toLowerCase().includes("market insight")
        );

        if (defaultCategory) {
          setSelectedCategory(defaultCategory.videoCategoryId);
          setFormData((prev) => ({
            ...prev,
            videoCategoryId: defaultCategory.videoCategoryId,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch videos for selected category
  useEffect(() => {
    const fetchVideos = async () => {
      if (!selectedCategory) return;
      try {
        const res = await axios.get("http://localhost:8000/api/episode", {
          params: { categoryId: selectedCategory, page, limit: 8 },
        });
        setVideos(res.data.videos);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVideos();
  }, [selectedCategory, page]);

  // Handle Add Episode form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEpisode = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/add/episode-video", formData);
      alert("Episode added successfully!");
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        hostName: "",
        episodeNumber: "",
        hostVideoLink: "",
        videoCategoryId: selectedCategory,
      });
      // Refresh videos list
      const res = await axios.get("http://localhost:8000/api/episode", {
        params: { categoryId: selectedCategory, page, limit: 8 },
      });
      setVideos(res.data.videos);
    } catch (err) {
      console.error("Error adding episode:", err);
      alert("Failed to add episode.");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Episodes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Add Episode
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-6 border-b pb-2">
        <button className="text-purple-600 font-medium border-b-2 border-purple-600">
          Video
        </button>
        <button className="text-gray-500 hover:text-gray-700">Shorts</button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.videoCategoryId}
            className={`px-4 py-2 rounded-full border transition ${
              selectedCategory === cat.videoCategoryId
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => {
              setSelectedCategory(cat.videoCategoryId);
              setPage(1);
            }}
          >
            {cat.name}
          </button>
        ))}
        <button className="px-4 py-2 rounded-full border bg-gray-100 text-gray-800 hover:bg-gray-200">
          + Add
        </button>
      </div>

      {/* Video Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div
            key={video.videoId}
            className="relative bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-48 object-cover"
            />

            {/* Hover buttons */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex justify-center items-center gap-2 opacity-0 hover:opacity-100 transition">
              <button className="px-3 py-1 bg-blue-600 text-white rounded">
                Edit
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded">
                Delete
              </button>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {video.description}
              </p>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {video.categoryName || "Marketing"}
                </span>
                <span className="text-xs text-gray-500">
                  Episode {video.episodeNumber}
                </span>
              </div>

              <div className="flex items-center">
               
                <h1 className="text-sm text-gray-700">
                  {video.hostName}
                </h1>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Episode Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Episode</h2>
            <form onSubmit={handleAddEpisode} className="space-y-3">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="hostName"
                placeholder="Host Name"
                value={formData.hostName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                name="episodeNumber"
                placeholder="Episode Number"
                value={formData.episodeNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="hostVideoLink"
                placeholder="Video Link"
                value={formData.hostVideoLink}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <select
                name="videoCategoryId"
                value={formData.videoCategoryId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option
                    key={cat.videoCategoryId}
                    value={cat.videoCategoryId}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
