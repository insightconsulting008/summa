import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Save, X, Trash2, Image, Upload, ChevronUp, ChevronDown, Crop, Check, RotateCcw, ArrowLeft, Type, AlignLeft, FileImage } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';

function EditBlog() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [confirmationModal, setConfirmationModal] = useState({
        show: false,
        type: '', // 'cancel' or 'success'
        message: '',
        onConfirm: null
    });

    const API_BASE_URL = 'http://localhost:8000';

    const [editTitle, setEditTitle] = useState('');
    const [editAuthor, setEditAuthor] = useState('');
    const [editContent, setEditContent] = useState([]);
    const [saving, setSaving] = useState(false);
    const [imageFiles, setImageFiles] = useState({});
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    // Cropping states
    const [cropModal, setCropModal] = useState({
        open: false,
        image: null,
        type: null,
        fileName: null,
        blockIndex: null
    });
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const showConfirmationModal = (type, message, onConfirm) => {
        setConfirmationModal({
            show: true,
            type,
            message,
            onConfirm
        });
    };

    const closeConfirmationModal = () => {
        setConfirmationModal({
            show: false,
            type: '',
            message: '',
            onConfirm: null
        });
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!id) {
                throw new Error('Blog ID not found');
            }

            const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Blog not found');
                }
                throw new Error(`Failed to fetch blog: ${response.status}`);
            }

            const data = await response.json();
            setBlog(data);
            setEditTitle(data.title || '');
            setEditAuthor(data.author || '');
            
            // Handle content as JSON array
            if (data.content && Array.isArray(data.content)) {
                setEditContent(data.content.map((block, index) => ({
                    ...block,
                    // Add temporary ID for React keys if not present
                    tempId: block.id || `block-${index}-${Date.now()}`
                })));
            } else {
                setEditContent([]);
            }
            
            setThumbnailPreview(getImageUrl(data.thumbnail));

        } catch (err) {
            console.error('Error fetching blog:', err);
            setError(err.message || 'Failed to fetch blog');
            showNotification(err.message || 'Failed to fetch blog', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Image cropping functions
    const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0, fileName) => {
        const image = new window.Image();
        image.src = imageSrc;

        await new Promise((resolve) => {
            image.onload = resolve;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        if (rotation !== 0) {
            ctx.translate(pixelCrop.width / 2, pixelCrop.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-pixelCrop.width / 2, -pixelCrop.height / 2);
        }

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }

                const file = new File([blob], fileName || `cropped-${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(file);
            }, 'image/jpeg', 0.95);
        });
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const openCropModal = (imageFile, type, fileName, blockIndex = null) => {
        const imageUrl = URL.createObjectURL(imageFile);
        setCropModal({
            open: true,
            image: imageUrl,
            type,
            fileName,
            blockIndex
        });
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    const closeCropModal = () => {
        setCropModal({ open: false, image: null, type: null, fileName: null, blockIndex: null });
        if (cropModal.image) {
            URL.revokeObjectURL(cropModal.image);
        }
    };

    const handleCropComplete = async () => {
        try {
            if (!cropModal.image || !croppedAreaPixels) {
                showNotification('No image or crop area selected', 'error');
                return;
            }

            const croppedImageFile = await getCroppedImg(
                cropModal.image,
                croppedAreaPixels,
                rotation,
                cropModal.fileName
            );

            if (!croppedImageFile) {
                throw new Error('Failed to create cropped image');
            }

            if (cropModal.type === 'thumbnail') {
                setThumbnailFile(croppedImageFile);
                setThumbnailPreview(URL.createObjectURL(croppedImageFile));
            } else if (cropModal.blockIndex !== null) {
                // For content block images
                setImageFiles(prev => ({ 
                    ...prev, 
                    [cropModal.blockIndex]: croppedImageFile 
                }));
            }

            closeCropModal();
            showNotification('Image cropped successfully!');
        } catch (error) {
            console.error('Error cropping image:', error);
            showNotification('Failed to crop image: ' + error.message, 'error');
        }
    };

    const handleImageSelect = (blockIndex, file) => {
        if (file && file.type.startsWith('image/')) {
            openCropModal(file, `block-${blockIndex}`, file.name, blockIndex);
        } else {
            showNotification('Please select a valid image file', 'error');
        }
    };

    const handleThumbnailSelect = (file) => {
        if (file && file.type.startsWith('image/')) {
            openCropModal(file, 'thumbnail', file.name);
        } else {
            showNotification('Please select a valid image file', 'error');
        }
    };

    const resetCrop = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Validate required fields
            if (!editTitle.trim()) {
                showNotification('Blog title is required', 'error');
                setSaving(false);
                return;
            }

            // Prepare FormData according to new backend structure
            const formData = new FormData();

            // Append text fields
            formData.append('title', editTitle.trim());
            formData.append('author', editAuthor.trim());
            formData.append('content', JSON.stringify(editContent));

            // Append thumbnail if exists
            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile);
            }

            // Append content images
            editContent.forEach((block, index) => {
                if (block.type === 'image' && imageFiles[index]) {
                    formData.append('images', imageFiles[index]);
                }
            });

            console.log('Saving blog with:', {
                title: editTitle,
                author: editAuthor,
                content: editContent,
                imageCount: Object.keys(imageFiles).length,
                hasThumbnail: !!thumbnailFile
            });

            // Make the API call
            const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
                method: 'PUT',
                body: formData
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Failed to update blog';

                try {
                    const errorData = await response.json();
                    console.error('Server error response:', errorData);
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }

            const updatedBlog = await response.json();
            console.log('Blog updated successfully:', updatedBlog);

            setBlog(updatedBlog);
            setImageFiles({});
            setThumbnailFile(null);

            // Show success notification and redirect after 3 seconds
            showNotification('Blog updated successfully! ✅');
            setTimeout(() => navigate('/manage-blog'), 3000);

        } catch (err) {
            console.error('Error saving blog:', err);
            showNotification('Failed to save blog: ' + err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        showConfirmationModal(
            'cancel',
            'Are you sure you want to cancel? Any unsaved changes will be lost.',
            () => navigate('/manage-blog')
        );
    };

    const handleBack = () => {
        navigate('/manage-blog');
    };

    const handleContentChange = (index, value) => {
        const newContent = [...editContent];
        newContent[index] = { 
            ...newContent[index], 
            value: value 
        };
        setEditContent(newContent);
    };

    const deleteContentBlock = (index) => {
        // Remove associated image file if exists
        if (imageFiles[index]) {
            const newImageFiles = { ...imageFiles };
            delete newImageFiles[index];
            setImageFiles(newImageFiles);
        }
        setEditContent(editContent.filter((_, i) => i !== index));
    };

    const moveContentBlock = (index, direction) => {
        if ((direction === 'up' && index > 0) || (direction === 'down' && index < editContent.length - 1)) {
            const newContent = [...editContent];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            [newContent[index], newContent[newIndex]] = [newContent[newIndex], newContent[index]];
            setEditContent(newContent);
        }
    };

    const addContentBlock = (type) => {
        const newBlock = {
            type: type,
            value: type === 'image' ? '' : '',
            tempId: `new-block-${Date.now()}`
        };
        setEditContent([...editContent, newBlock]);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-slate-700 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-600 text-lg font-medium">Loading Blog...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <div className="text-6xl mb-6">😔</div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Something went wrong</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={fetchBlog}
                            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium shadow-sm"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/manage-blog')}
                            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                            Go to Manage Blog
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-slate-600 text-xl font-serif">Blog not found</p>
                    <button
                        onClick={() => navigate('/manage-blog')}
                        className="mt-4 px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Go to Manage Blog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            {/* Confirmation Modal */}
            {confirmationModal.show && confirmationModal.type === 'cancel' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-amber-100 text-amber-600">
                                <X className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-serif font-semibold text-slate-900 mb-2">
                                Cancel Changes?
                            </h3>
                            <p className="text-slate-600 mb-6">
                                {confirmationModal.message}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={closeConfirmationModal}
                                    className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                >
                                    Continue Editing
                                </button>
                                <button
                                    onClick={() => {
                                        closeConfirmationModal();
                                        if (confirmationModal.onConfirm) {
                                            confirmationModal.onConfirm();
                                        }
                                    }}
                                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Crop Modal */}
            {cropModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-200 shadow-2xl">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <h3 className="text-xl font-serif font-semibold text-slate-900">Crop Image</h3>
                            <button
                                onClick={closeCropModal}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative h-96 bg-slate-900">
                            <Cropper
                                image={cropModal.image}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={cropModal.type === 'thumbnail' ? 1 : 4 / 3}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="p-6 border-t border-slate-200 bg-slate-50">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium text-slate-700 min-w-20">Zoom:</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="3"
                                        step="0.1"
                                        value={zoom}
                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-600 min-w-12 font-mono">{zoom.toFixed(1)}x</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium text-slate-700 min-w-20">Rotation:</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        value={rotation}
                                        onChange={(e) => setRotation(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-600 min-w-12 font-mono">{rotation}°</span>
                                </div>

                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        onClick={resetCrop}
                                        className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleCropComplete}
                                        className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2 font-medium shadow-sm"
                                    >
                                        <Check className="w-4 h-4" />
                                        Apply Crop
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg border-l-4 ${notification.type === 'error'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-green-50 border-green-500 text-green-700'
                    } transition-all duration-300 transform translate-x-0 backdrop-blur-sm`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3">Edit Blog Post</h1>
                            <p className="text-slate-600 text-lg">Refine and perfect your content with precision</p>
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blogs
                        </button>
                    </div>

                    <div className="flex items-center gap-4 bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Created: {formatDate(blog.createdAt)}</span>
                        </div>
                        {blog.updatedAt !== blog.createdAt && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="font-medium">Last Updated: {formatDate(blog.updatedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Thumbnail Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <h2 className="text-xl font-serif font-semibold text-slate-900">Featured Image</h2>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50">
                        {thumbnailPreview ? (
                            <div className="rounded-lg overflow-hidden border border-slate-200 mb-6 shadow-sm">
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-full h-auto max-h-96 object-contain"
                                />
                            </div>
                        ) : blog.thumbnail ? (
                            <div className="rounded-lg overflow-hidden border border-slate-200 mb-6 shadow-sm">
                                <img
                                    src={getImageUrl(blog.thumbnail)}
                                    alt="Current thumbnail"
                                    className="w-full h-auto max-h-96 object-contain"
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileImage className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg mb-2 font-medium">No thumbnail uploaded</p>
                                <p className="text-slate-400 text-sm">Upload a featured image for your blog</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <label className="px-6 py-3 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors flex items-center gap-3 text-base font-medium text-slate-700 shadow-sm hover:shadow-md">
                                <Crop className="w-5 h-5" />
                                {thumbnailPreview || blog.thumbnail ? 'Change Thumbnail' : 'Upload & Crop Thumbnail'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleThumbnailSelect(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>

                            {thumbnailFile && (
                                <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-700 font-medium">
                                        Cropped image ready for upload
                                    </span>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-slate-500 mt-4 text-center">
                            Recommended: Square image, at least 1200×1200 pixels. JPG, PNG, or WebP format.
                        </p>
                    </div>
                </div>

                {/* Title Input */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8 shadow-sm">
                    <label className="block text-lg font-serif font-semibold text-slate-900 mb-4">Blog Title *</label>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-4xl font-serif font-bold text-slate-900 border-b-2 border-slate-300 focus:border-slate-800 focus:outline-none pb-4 px-2 bg-transparent"
                        placeholder="Enter your compelling blog title..."
                    />
                </div>

                {/* Author Input */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8 shadow-sm">
                    <label className="block text-lg font-serif font-semibold text-slate-900 mb-4">Author</label>
                    <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="w-full text-xl text-slate-900 border border-slate-300 rounded-lg px-4 py-3 focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all font-light"
                        placeholder="Enter author name..."
                    />
                </div>

                {/* Add Content Blocks */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8 shadow-sm">
                    <label className="block text-lg font-serif font-semibold text-slate-900 mb-6">Add Content Blocks</label>
                    <div className="flex gap-4">
                        <button
                            onClick={() => addContentBlock('heading')}
                            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-3 text-base font-medium shadow-sm"
                        >
                            <Type className="w-5 h-5" />
                            Add Heading
                        </button>
                        <button
                            onClick={() => addContentBlock('paragraph')}
                            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-3 text-base font-medium shadow-sm"
                        >
                            <AlignLeft className="w-5 h-5" />
                            Add Paragraph
                        </button>
                        <button
                            onClick={() => addContentBlock('image')}
                            className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-3 text-base font-medium shadow-sm"
                        >
                            <FileImage className="w-5 h-5" />
                            Add Image
                        </button>
                    </div>
                </div>

                {/* Content Blocks */}
                <div className="space-y-8 mb-20">
                    {editContent.length === 0 ? (
                        <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-16 text-center">
                            <div className="text-6xl mb-6 text-slate-400">📄</div>
                            <p className="text-slate-500 text-xl mb-3 font-serif">No content yet</p>
                            <p className="text-slate-400">Add content blocks above to build your blog post</p>
                        </div>
                    ) : (
                        editContent.map((block, index) => (
                            <div key={block.tempId} className="bg-white rounded-xl border border-slate-200 p-8 relative group hover:border-slate-300 transition-all shadow-sm">
                                {/* Block Controls */}
                                <div className="absolute -top-4 right-6 flex gap-2">
                                    <button
                                        onClick={() => moveContentBlock(index, 'up')}
                                        disabled={index === 0}
                                        className="w-8 h-8 bg-white border border-slate-300 rounded-lg flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 hover:shadow-sm transition-all shadow-sm"
                                        title="Move up"
                                    >
                                        <ChevronUp className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => moveContentBlock(index, 'down')}
                                        disabled={index === editContent.length - 1}
                                        className="w-8 h-8 bg-white border border-slate-300 rounded-lg flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 hover:shadow-sm transition-all shadow-sm"
                                        title="Move down"
                                    >
                                        <ChevronDown className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => deleteContentBlock(index)}
                                        className="w-8 h-8 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center hover:bg-red-100 hover:shadow-sm transition-all shadow-sm"
                                        title="Delete block"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>

                                {/* Block Type Indicator */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-3 h-3 rounded-full ${block.type === 'heading' ? 'bg-slate-800' :
                                            block.type === 'paragraph' ? 'bg-slate-600' :
                                                'bg-slate-500'
                                        }`} />
                                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                                        {block.type} Block
                                    </span>
                                </div>

                                {/* Heading Block */}
                                {block.type === 'heading' && (
                                    <input
                                        type="text"
                                        value={block.value || ''}
                                        onChange={(e) => handleContentChange(index, e.target.value)}
                                        className="w-full text-3xl font-serif font-bold text-slate-900 border-b-2 border-slate-300 focus:border-slate-800 focus:outline-none pb-3 px-2 bg-transparent"
                                        placeholder="Enter heading text..."
                                    />
                                )}

                                {/* Paragraph Block */}
                                {block.type === 'paragraph' && (
                                    <textarea
                                        value={block.value || ''}
                                        onChange={(e) => handleContentChange(index, e.target.value)}
                                        className="w-full text-slate-700 border border-slate-300 rounded-xl p-6 focus:border-slate-800 focus:ring-2 focus:ring-slate-200 min-h-40 resize-y leading-relaxed text-lg font-light"
                                        placeholder="Start writing your content here..."
                                        rows="6"
                                    />
                                )}

                                {/* Image Block */}
                                {block.type === 'image' && (
                                    <div className="space-y-6">
                                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50">
                                            {(imageFiles[index] || block.value) ? (
                                                <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                                    <img
                                                        src={imageFiles[index] ? URL.createObjectURL(imageFiles[index]) : getImageUrl(block.value)}
                                                        alt="Preview"
                                                        className="w-full h-auto max-h-96 object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <FileImage className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                                    <p className="text-slate-500 text-lg mb-2 font-medium">No image uploaded yet</p>
                                                    <p className="text-slate-400 text-sm">Upload an image to display here</p>
                                                </div>
                                            )}

                                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-6">
                                                <label className="px-6 py-3 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors flex items-center gap-3 text-base font-medium text-slate-700 shadow-sm hover:shadow-md">
                                                    <Crop className="w-5 h-5" />
                                                    {imageFiles[index] || block.value ? 'Change Image' : 'Upload & Crop Image'}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageSelect(index, e.target.files[0])}
                                                        className="hidden"
                                                    />
                                                </label>

                                                {imageFiles[index] && (
                                                    <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                        <span className="text-sm text-green-700 font-medium">
                                                            Cropped image ready
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-12 border-t border-slate-200">
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="px-8 py-3.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <X className="w-5 h-5" />
                            <span>Cancel</span>
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-10 py-3.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditBlog;