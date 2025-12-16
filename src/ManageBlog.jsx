import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageBlog() {
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
  const [totalBlogs, setTotalBlogs] = useState(0);

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.post("https://emc-backend.onrender.com/api/blogs", {
        page,
        limit
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(response.data)

      setBlogs(response.data.blogs || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalBlogs(response.data.totalBlogs || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (blog) => {
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
      await axios.delete(`https://emc-backend.onrender.com/api/blogs/${blogToDelete.blogId}`);
      
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
      : `https://emc-backend.onrender.com${blog.thumbnail}`;
  };

  const handleEditBlog = (blogId) => {
    navigate(`/edit-blog/${blogId}`);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-20">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{blogToDelete?.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={deletingId}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Blog</h1>
            <p className="text-gray-600 mt-1">
              {totalBlogs > 0 ? `${totalBlogs} blog${totalBlogs !== 1 ? 's' : ''} found` : 'Create, edit, or remove blog posts'}
            </p>
          </div>
          <button
            onClick={() => navigate('/add-blog')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto text-center flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add New Blog
          </button>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs yet</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first blog post.</p>
              <button
                onClick={() => navigate('/add-blog')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Create Your First Blog
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => {
                const thumbnail = getThumbnail(blog);
                return (
                  <div key={blog.blogId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Blog Image */}
                    <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Blog Content */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                            {blog.title}
                          </h3>
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Calendar size={14} />
                            <span>{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                      <button
  onClick={() => navigate(`/manage-blog/${blog.blogId}`)}
  className="bg-gray-300 px-3 py-1 rounded"
>
  View
</button>
                        <button
                          onClick={() => handleEditBlog(blog.blogId)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(blog)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10">
                <div className="text-sm text-gray-600">
                  Showing {blogs.length} of {totalBlogs} blog{totalBlogs !== 1 ? 's' : ''}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrev}
                    disabled={page === 1}
                    className={`p-2 rounded-lg border ${
                      page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300'
                    } transition-colors`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[40px] h-10 px-3 rounded-lg border text-sm font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    {/* Ellipsis for many pages */}
                    {totalPages > 5 && page < totalPages - 2 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    
                    {/* Show last page if not in visible range */}
                    {totalPages > 5 && page < totalPages - 1 && (
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`min-w-[40px] h-10 px-3 rounded-lg border text-sm font-medium transition-colors ${
                          page === totalPages
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNext}
                    disabled={page === totalPages}
                    className={`p-2 rounded-lg border ${
                      page === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300'
                    } transition-colors`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}