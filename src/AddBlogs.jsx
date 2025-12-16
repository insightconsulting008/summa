import React, { useState, useCallback } from 'react';
import { X, Upload } from 'lucide-react';
import Cropper from 'react-easy-crop';

// Image Cropper Component using react-easy-crop
function ImageCropper({ imageUrl, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    const image = await loadImage(imageUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set fixed output dimensions
    canvas.width = 500;
    canvas.height = 380;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      500,
      380
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleApplyCrop = async () => {
    setIsCropping(true);
    try {
      const croppedBlob = await createCroppedImage();
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error('Error cropping image:', error);
      setIsCropping(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Crop Image</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="relative min-w-lg h-[300px] bg-gray-900 rounded-lg overflow-hidden mb-6">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={500 / 380}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isCropping}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCrop}
              disabled={isCropping}
              className={`px-6 py-2 rounded-lg font-medium ${
                isCropping
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isCropping ? 'Cropping...' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Add Blog Component
const AddBlog = () => {
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [thumbnail, setThumbnail] = useState({ file: null, imageUrl: null });
  const [cropImage, setCropImage] = useState(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(null);
  const [isCroppingThumbnail, setIsCroppingThumbnail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      value: type === 'image' ? null : '',
      imageUrl: null,
      file: null
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id, field, value) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    ));
  };

  const removeBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const handleImageSelect = (blockId, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImage(e.target.result);
      setCurrentBlockIndex(blockId);
      setIsCroppingThumbnail(false);
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailSelect = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImage(e.target.result);
      setIsCroppingThumbnail(true);
      setCurrentBlockIndex(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob) => {
    if (!croppedBlob) {
      alert('Error cropping image. Please try again.');
      return;
    }

    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    const croppedUrl = URL.createObjectURL(croppedBlob);
    
    if (isCroppingThumbnail) {
      // Update thumbnail
      setThumbnail({ file: croppedFile, imageUrl: croppedUrl });
    } else {
      // Update block image
      setBlocks(blocks.map(block => 
        block.id === currentBlockIndex 
          ? { ...block, file: croppedFile, imageUrl: croppedUrl } 
          : block
      ));
    }
    
    setCropImage(null);
    setCurrentBlockIndex(null);
    setIsCroppingThumbnail(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Please enter a blog title');
      return;
    }

    // Validate that image blocks have files
    const imageBlocks = blocks.filter(b => b.type === 'image');
    const missingImages = imageBlocks.some(b => !b.file);
    
    if (missingImages) {
      alert('Please upload images for all image blocks');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    
    // Find thumbnail index (if exists, it will be the first image)
    let thumbnailIndex = null;
    if (thumbnail.file) {
      thumbnailIndex = 0;
    }
    
    const data = {
      title,
      userId: 'cmhn37g5d0000tzn4yl22gjk0',
      thumbnail: thumbnailIndex,
      blocks: blocks.map(block => ({
        type: block.type,
        value: block.type !== 'image' ? block.value : null
      }))
    };
    
    formData.append('data', JSON.stringify(data));
    
    // Add thumbnail first if exists
    if (thumbnail.file) {
      formData.append('thumbnail', thumbnail.file, 'thumbnail.jpg');
    }
    
    // Add block images
    blocks.forEach((block, index) => {
      if (block.type === 'image' && block.file) {
        formData.append('images', block.file, `image-${index}.jpg`);
      }
    });

    console.log('Submitting blog with:');
    console.log('- Title:', title);
    console.log('- Thumbnail:', thumbnail.file ? 'Yes' : 'No');
    console.log('- Blocks:', blocks);

    try {
      const response = await fetch('http://localhost:8000/api/add-blogs', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Blog created successfully!');
        setTitle('');
        setBlocks([]);
        setThumbnail({ file: null, imageUrl: null });
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Error creating blog: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className='flex justify-between items-start'> 
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Blog</h1> 
          <button 
            onClick={() => console.log('Navigate to blogs')} 
            className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg transition font-medium hover:bg-gray-50"
          > 
            ← Back to Blogs 
          </button>
        </div>

        {/* Title Input */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Title
          </label>
          <input
            type="text"
            placeholder="Enter Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Thumbnail Upload (Optional) */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blog Thumbnail <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            {thumbnail.imageUrl ? (
              <div className="text-center">
                <img 
                  src={thumbnail.imageUrl} 
                  alt="Thumbnail Preview" 
                  className="max-h-64 mx-auto mb-4 rounded"
                />
                <button
                  onClick={() => setThumbnail({ file: null, imageUrl: null })}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove Thumbnail
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-blue-600 font-medium mb-2">Click Here to upload thumbnail</p>
                <p className="text-sm text-gray-500">
                  Guidelines: 1200×800px or 12:8 ratio.<br />
                  Supported formats: .jpg, .jpeg, .png
                </p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleThumbnailSelect(file);
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Add Block Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => addBlock('heading')}
            className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium"
          >
            Add Heading
          </button>
          <button
            onClick={() => addBlock('paragraph')}
            className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium"
          >
            Add Paragraph
          </button>
          <button
            onClick={() => addBlock('image')}
            className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium"
          >
            Add Image
          </button>
        </div>

        {/* Content Blocks */}
        <div className="space-y-6 mb-6">
          {blocks.map((block) => (
            <div key={block.id} className="bg-white rounded-lg shadow-sm p-6 relative">
              <button
                onClick={() => removeBlock(block.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>

              {block.type === 'heading' && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Heading"
                    value={block.value}
                    onChange={(e) => updateBlock(block.id, 'value', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </>
              )}

              {block.type === 'paragraph' && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paragraph
                  </label>
                  <textarea
                    placeholder="Enter Paragraph"
                    value={block.value}
                    onChange={(e) => updateBlock(block.id, 'value', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </>
              )}

              {block.type === 'image' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  {block.imageUrl ? (
                    <div className="text-center">
                      <img 
                        src={block.imageUrl} 
                        alt="Preview" 
                        className="max-h-64 mx-auto mb-4 rounded"
                      />
                    </div>
                  ) : (
                    <label className="cursor-pointer block text-center">
                      <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-blue-600 font-medium mb-2">Click Here to upload file</p>
                      <p className="text-sm text-gray-500">
                        Guidelines: 1200×800px or 12:8 ratio.<br />
                        Supported formats: .jpg, .jpeg, .png
                      </p>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleImageSelect(block.id, file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setTitle('');
              setBlocks([]);
              setThumbnail({ file: null, imageUrl: null });
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md font-medium ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {cropImage && (
        <ImageCropper
          imageUrl={cropImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropImage(null);
            setCurrentBlockIndex(null);
            setIsCroppingThumbnail(false);
          }}
        />
      )}
    </div>
  );
};

export default AddBlog;