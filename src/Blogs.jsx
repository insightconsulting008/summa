import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const navigate = useNavigate();
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8000/api/blogs", {
        page,
        limit
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setBlogs(response.data.blogs || []);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (e, blog) => {
    e.stopPropagation();
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBlogToDelete(null);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      setDeletingId(blogToDelete.blogId);
      await axios.delete(`http://localhost:8000/api/blogs/${blogToDelete.blogId}`);
      
      // Remove blog from state
      setBlogs(prev => prev.filter(blog => blog.blogId !== blogToDelete.blogId));
      
      // If current page becomes empty and it's not page 1, go to previous page
      if (blogs.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        fetchBlogs();
      }
      
      closeDeleteModal();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete blog');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getThumbnail = (blog) => {
    if (!blog.thumbnail) return null;
    
    // If thumbnail is relative path, prepend backend URL
    return blog.thumbnail.startsWith('http') 
      ? blog.thumbnail 
      : `http://localhost:8000${blog.thumbnail}`;
  };

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading blogs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Blog</h1>
          <button
            onClick={() => navigate('/add-blog')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Blog
          </button>
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blogs found. Create your first blog!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => {
                const thumbnail = getThumbnail(blog);
                return (
                  <div
                    key={blog.blogId}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group relative"
                  
                    onClick={() => navigate(`/blog/${blog.blogId}`)}
                  >
                    {/* Delete Button */}
                    <button
                      onClick={(e) => openDeleteModal(e, blog)}
                      disabled={deletingId === blog.blogId}
                      className="absolute top-3 right-3 z-10 bg-red-500 hover:bg-red-600 cursor-pointer text-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      title="Delete blog"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="relative h-64 bg-gray-800 overflow-hidden">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h2 className="text-white font-semibold text-lg line-clamp-2 mb-1">
                          {blog.title}
                        </h2>
                        <div className="flex items-center gap-4 text-white text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className={`px-4 py-1 rounded-lg border ${
                  page === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                Prev
              </button>

              <span className="text-gray-700 font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className={`px-4 py-1 rounded-lg border ${
                  page === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in duration-200">
            {/* Close button */}
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <Trash2 size={32} className="text-red-600" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Blog
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "<span className="font-semibold">{blogToDelete?.title}</span>"? This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deletingId}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}