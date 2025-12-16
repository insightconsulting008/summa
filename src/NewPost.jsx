import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit2, X } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/blogs';

// Image Cropper Component
function ImageCropper({ imageUrl, onCropComplete, onCancel }) {
  const canvasRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [dragging, setDragging] = useState(false);
  const [dragType, setDragType] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('free');

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      const initialWidth = Math.min(img.width * 0.8, 400);
      const initialHeight = Math.min(img.height * 0.8, 300);
      setCrop({
        x: (img.width - initialWidth) / 2,
        y: (img.height - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image, 0, 0);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.clearRect(crop.x, crop.y, crop.width, crop.height);
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, crop.x, crop.y, crop.width, crop.height);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
    
    const handleSize = 10;
    ctx.fillStyle = '#fff';
    const corners = [
      { x: crop.x, y: crop.y },
      { x: crop.x + crop.width, y: crop.y },
      { x: crop.x, y: crop.y + crop.height },
      { x: crop.x + crop.width, y: crop.y + crop.height }
    ];
    corners.forEach(corner => {
      ctx.fillRect(corner.x - handleSize/2, corner.y - handleSize/2, handleSize, handleSize);
    });
  }, [image, crop]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const handleSize = 20;
    
    const corners = [
      { type: 'top-left', px: crop.x, py: crop.y },
      { type: 'top-right', px: crop.x + crop.width, py: crop.y },
      { type: 'bottom-left', px: crop.x, py: crop.y + crop.height },
      { type: 'bottom-right', px: crop.x + crop.width, py: crop.y + crop.height }
    ];
    
    for (const corner of corners) {
      if (Math.abs(x - corner.px) < handleSize && Math.abs(y - corner.py) < handleSize) {
        setDragging(true);
        setDragType(corner.type);
        setDragStart({ x, y, crop: { ...crop } });
        return;
      }
    }
    
    if (x >= crop.x && x <= crop.x + crop.width && y >= crop.y && y <= crop.y + crop.height) {
      setDragging(true);
      setDragType('move');
      setDragStart({ x, y, crop: { ...crop } });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    
    let newCrop = { ...crop };
    
    if (dragType === 'move') {
      newCrop.x = Math.max(0, Math.min(image.width - crop.width, dragStart.crop.x + dx));
      newCrop.y = Math.max(0, Math.min(image.height - crop.height, dragStart.crop.y + dy));
    } else if (dragType === 'top-left') {
      const maxDx = dragStart.crop.width - 50;
      const maxDy = dragStart.crop.height - 50;
      const constrainedDx = Math.max(-dragStart.crop.x, Math.min(maxDx, dx));
      const constrainedDy = Math.max(-dragStart.crop.y, Math.min(maxDy, dy));
      
      if (aspectRatio === 'free') {
        newCrop.x = dragStart.crop.x + constrainedDx;
        newCrop.y = dragStart.crop.y + constrainedDy;
        newCrop.width = dragStart.crop.width - constrainedDx;
        newCrop.height = dragStart.crop.height - constrainedDy;
      } else {
        const ratio = parseFloat(aspectRatio);
        const delta = Math.min(constrainedDx, constrainedDy * ratio);
        newCrop.x = dragStart.crop.x + delta;
        newCrop.y = dragStart.crop.y + delta / ratio;
        newCrop.width = dragStart.crop.width - delta;
        newCrop.height = dragStart.crop.height - delta / ratio;
      }
    } else if (dragType === 'top-right') {
      const maxDx = image.width - dragStart.crop.x - dragStart.crop.width;
      const maxDy = dragStart.crop.height - 50;
      const constrainedDx = Math.min(maxDx, Math.max(-dragStart.crop.width + 50, dx));
      const constrainedDy = Math.max(-dragStart.crop.y, Math.min(maxDy, dy));
      
      if (aspectRatio === 'free') {
        newCrop.y = dragStart.crop.y + constrainedDy;
        newCrop.width = dragStart.crop.width + constrainedDx;
        newCrop.height = dragStart.crop.height - constrainedDy;
      } else {
        const ratio = parseFloat(aspectRatio);
        const delta = Math.min(constrainedDx, -constrainedDy * ratio);
        newCrop.y = dragStart.crop.y - delta / ratio;
        newCrop.width = dragStart.crop.width + delta;
        newCrop.height = dragStart.crop.height + delta / ratio;
      }
    } else if (dragType === 'bottom-left') {
      const maxDx = dragStart.crop.width - 50;
      const maxDy = image.height - dragStart.crop.y - dragStart.crop.height;
      const constrainedDx = Math.max(-dragStart.crop.x, Math.min(maxDx, dx));
      const constrainedDy = Math.min(maxDy, Math.max(-dragStart.crop.height + 50, dy));
      
      if (aspectRatio === 'free') {
        newCrop.x = dragStart.crop.x + constrainedDx;
        newCrop.width = dragStart.crop.width - constrainedDx;
        newCrop.height = dragStart.crop.height + constrainedDy;
      } else {
        const ratio = parseFloat(aspectRatio);
        const delta = Math.min(-constrainedDx, constrainedDy * ratio);
        newCrop.x = dragStart.crop.x - delta;
        newCrop.width = dragStart.crop.width + delta;
        newCrop.height = dragStart.crop.height + delta / ratio;
      }
    } else if (dragType === 'bottom-right') {
      const maxDx = image.width - dragStart.crop.x - dragStart.crop.width;
      const maxDy = image.height - dragStart.crop.y - dragStart.crop.height;
      const constrainedDx = Math.min(maxDx, Math.max(-dragStart.crop.width + 50, dx));
      const constrainedDy = Math.min(maxDy, Math.max(-dragStart.crop.height + 50, dy));
      
      if (aspectRatio === 'free') {
        newCrop.width = dragStart.crop.width + constrainedDx;
        newCrop.height = dragStart.crop.height + constrainedDy;
      } else {
        const ratio = parseFloat(aspectRatio);
        const delta = Math.min(constrainedDx, constrainedDy * ratio);
        newCrop.width = dragStart.crop.width + delta;
        newCrop.height = dragStart.crop.height + delta / ratio;
      }
    }
    
    setCrop(newCrop);
  };

  const handleMouseUp = () => {
    setDragging(false);
    setDragType(null);
  };

  const handleCrop = () => {
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      crop.x, crop.y, crop.width, crop.height,
      0, 0, crop.width, crop.height
    );
    
    canvas.toBlob((blob) => {
      onCropComplete(blob);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Crop Image</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full max-h-[60vh] border border-gray-300 cursor-crosshair"
              style={{ touchAction: 'none' }}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ blog, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Delete Blog?</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "<strong>{blog.title}</strong>"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [view, setView] = useState('list');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  
  // Cropping state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const [cropperIndex, setCropperIndex] = useState(null);

  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(API_URL);
      setBlogs(response.data);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    }
  };

  const addBlock = (type) => {
    setBlocks([...blocks, { type, value: '', imageUrl: null, file: null }]);
  };

  const updateBlock = (index, field, value) => {
    const updated = [...blocks];
    updated[index][field] = value;
    setBlocks(updated);
  };

  const deleteBlock = (index) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCropperImage(event.target.result);
        setCropperIndex(index);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob) => {
    const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
    const updated = [...blocks];
    updated[cropperIndex].file = file;
    updated[cropperIndex].imageUrl = URL.createObjectURL(file);
    setBlocks(updated);
    setCropperOpen(false);
    setCropperImage(null);
    setCropperIndex(null);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (blocks.length === 0) {
      alert('Please add at least one content block');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      const blocksData = blocks.map(block => ({
        type: block.type,
        value: block.value || null,
        imageUrl: block.imageUrl && !block.file ? block.imageUrl : null
      }));

      formData.append('data', JSON.stringify({ 
        title, 
        userId: 'cmhn37g5d0000tzn4yl22gjk0',
        blocks: blocksData 
      }));
      
      blocks.forEach(block => {
        if (block.file) {
          formData.append('images', block.file);
        }
      });

      const url = editMode ? `${API_URL}/${selectedBlog.blogId}` : API_URL;
      const method = editMode ? 'put' : 'post';

      const response = await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(response.data.message || (editMode ? 'Blog updated successfully!' : 'Blog published successfully!'));
      setTitle('');
      setBlocks([]);
      setEditMode(false);
      setSelectedBlog(null);
      fetchBlogs();
      setView('list');
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.error || `Failed to ${editMode ? 'update' : 'create'} blog`;
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setTitle(blog.title);
    setBlocks(blog.blocks.map(block => ({
      ...block,
      file: null
    })));
    setEditMode(true);
    setView('create');
  };

  const handleDeleteClick = (blog, e) => {
    e.stopPropagation();
    setBlogToDelete(blog);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/${blogToDelete.blogId}`);
      alert('Blog deleted successfully!');
      fetchBlogs();
      setDeleteModal(false);
      setBlogToDelete(null);
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete blog';
      alert(errorMessage);
    }
  };

  const viewBlog = (blog) => {
    setSelectedBlog(blog);
    setView('view');
  };

  const getBlogThumbnail = (blog) => {
    if (blog.imageUrl) return blog.imageUrl;
    const imageBlock = blog.blocks?.find(b => b.type === 'image');
    return imageBlock?.imageUrl || null;
  };

  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        {deleteModal && blogToDelete && (
          <DeleteConfirmModal
            blog={blogToDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={() => {
              setDeleteModal(false);
              setBlogToDelete(null);
            }}
          />
        )}

        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">My Blogs</h1>
            <button
              onClick={() => {
                setEditMode(false);
                setSelectedBlog(null);
                setTitle('');
                setBlocks([]);
                setView('create');
              }}
              className="bg-[#5c30ff] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
            >
              Add Blog
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => {
              const thumbnail = getBlogThumbnail(blog);
              return (
                <div
                  key={blog.blogId}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition overflow-hidden"
                >
                  <div onClick={() => viewBlog(blog)} className="cursor-pointer">
                    {thumbnail && (
                      <div className="w-full h-60 overflow-hidden bg-gray-100">
                        <img 
                          src={thumbnail} 
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6 flex gap-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(blog, e)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {blogs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No blogs yet. Create your first one!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-white">
        {cropperOpen && (
          <ImageCropper
            imageUrl={cropperImage}
            onCropComplete={handleCropComplete}
            onCancel={() => {
              setCropperOpen(false);
              setCropperImage(null);
              setCropperIndex(null);
            }}
          />
        )}
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          
            <h1 className="text-4xl font-bold text-gray-900">
              {editMode ? 'Edit Post' : 'New Post'}
            </h1>

            <button
              onClick={() => {
                setSelectedBlog(null);
                setView('list');
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              ← Back to Blogs
            </button>
          </div>

          <div className="mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Post Title"
            />
          </div>

          <div className="flex gap-3 mb-8">
            <button
              onClick={() => addBlock('heading')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Add Heading
            </button>
            <button
              onClick={() => addBlock('paragraph')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Add Paragraph
            </button>
            <button
              onClick={() => addBlock('image')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Add Image
            </button>
          </div>

          <div className="space-y-6 mb-8">
            {blocks.map((block, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-gray-500">
                    {block.type === 'heading' ? 'Heading...' : block.type === 'paragraph' ? 'Paragraph...' : 'Image'}
                  </span>
                  <button
                    onClick={() => deleteBlock(index)}
                    className="text-gray-500 hover:text-red-600 transition"
                  >
                    Delete
                  </button>
                </div>

                {block.type === 'heading' ? (
                  <input
                    type="text"
                    value={block.value}
                    onChange={(e) => updateBlock(index, 'value', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Heading..."
                  />
                ) : block.type === 'paragraph' ? (
                  <textarea
                    value={block.value}
                    onChange={(e) => updateBlock(index, 'value', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    rows="5"
                    placeholder="Write paragraph..."
                  />
                ) : (
                  <div>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                          className="hidden"
                        />
                      </label>
                      <span className="text-gray-500">
                        {block.file ? block.file.name : block.imageUrl ? 'Current image' : 'No file chosen'}
                      </span>
                    </div>
                    {block.imageUrl && (
                      <div className="mt-4">
                        <img
                          src={block.imageUrl}
                          alt="Preview"
                          className="max-h-64 rounded-lg border border-gray-200 object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {blocks.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No content blocks yet. Click the buttons above to add content.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setView('list');
                setEditMode(false);
                setSelectedBlog(null);
                setTitle('');
                setBlocks([]);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={loading || !title || blocks.length === 0}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (editMode ? 'Updating...' : 'Publishing...') : (editMode ? 'Update' : 'Publish')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'view' && selectedBlog) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => {
                setSelectedBlog(null);
                setView('list');
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              ← Back to Blogs
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(selectedBlog)}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={(e) => handleDeleteClick(selectedBlog, e)}
                className="flex items-center gap-2 px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">{selectedBlog.title}</h1>
          <p className="text-gray-500 mb-12">
            Published on {new Date(selectedBlog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>

          <div className="space-y-8">
            {selectedBlog.blocks?.map((block, index) => (
              <div key={block.blockId}>
                {block.type === 'heading' ? (
                  <h2 className="text-3xl font-bold text-gray-900">{block.value}</h2>
                ) : block.type === 'paragraph' ? (
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{block.value}</p>
                ) : (
                  <img
                    src={block.imageUrl}
                    alt={`Block ${index + 1}`}
                    className="w-full rounded-lg shadow-sm object-cover"
                  />
                )}
              </div>
            ))}
          </div>

          {(!selectedBlog.blocks || selectedBlog.blocks.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">This blog has no content yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}