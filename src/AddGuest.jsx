import React, { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import Cropper from 'react-easy-crop';

export default function AddGuestForm() {
  const [formData, setFormData] = useState({
    guestName: '',
    guestRole: '',
    aboutGuest: '',
    twitter: '',
    instagram: '',
    threads: '',
    headingOne: '',
    descriptionOne: '',
    headingTwo: '',
    descriptionTwo: '',
    headingthree: '',
    descriptionThree: '',
    youtubeLink: '',
  });

  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const aspectRatio = 300 / 380;

  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isYouTubeUrl = (url) => {
    if (!url) return true;
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
    return pattern.test(url);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedFile) newErrors.guestImage = 'Guest image is required';
    if (!formData.guestName.trim()) newErrors.guestName = 'Guest name is required';
    if (!formData.guestRole.trim()) newErrors.guestRole = 'Guest role is required';
    if (!formData.aboutGuest.trim()) newErrors.aboutGuest = 'About guest is required';

    if (formData.twitter && !isValidUrl(formData.twitter))
      newErrors.twitter = 'Enter a valid Twitter URL';
    if (formData.instagram && !isValidUrl(formData.instagram))
      newErrors.instagram = 'Enter a valid Instagram URL';
    if (formData.threads && !isValidUrl(formData.threads))
      newErrors.threads = 'Enter a valid Threads URL';

    if (!formData.headingOne.trim()) newErrors.headingOne = 'Heading One is required';
    if (!formData.descriptionOne.trim()) newErrors.descriptionOne = 'Description One is required';
    if (!formData.headingTwo.trim()) newErrors.headingTwo = 'Heading Two is required';
    if (!formData.descriptionTwo.trim()) newErrors.descriptionTwo = 'Description Two is required';
    if (!formData.headingthree.trim()) newErrors.headingThree = 'Heading Three is required';
    if (!formData.descriptionThree.trim()) newErrors.descriptionThree = 'Description Three is required';

    if (formData.youtubeLink && !isYouTubeUrl(formData.youtubeLink))
      newErrors.youtubeLink = 'Enter a valid YouTube URL';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setShowCropModal(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

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
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const applyCrop = async () => {
    try {
      if (!originalImage || !croppedAreaPixels) return;

      const croppedBlob = await getCroppedImg(originalImage, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'guest-image.jpg', { type: 'image/jpeg' });
      
      setSelectedFile(croppedFile);
      setImagePreview(URL.createObjectURL(croppedBlob));
      setShowCropModal(false);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      const userId = "cmhn37g5d0000tzn4yl22gjk0";

      const formDataToSend = new FormData();
      
      formDataToSend.append("guestImage", selectedFile);
      formDataToSend.append("guestName", formData.guestName);
      formDataToSend.append("guestRole", formData.guestRole);
      formDataToSend.append("aboutGuest", formData.aboutGuest);
      formDataToSend.append("instagram", formData.instagram);
      formDataToSend.append("twitter", formData.twitter);
      formDataToSend.append("threads", formData.threads);
      formDataToSend.append("headingOne", formData.headingOne);
      formDataToSend.append("descriptionOne", formData.descriptionOne);
      formDataToSend.append("headingTwo", formData.headingTwo);
      formDataToSend.append("descriptionTwo", formData.descriptionTwo);
      formDataToSend.append("headingthree", formData.headingthree);
      formDataToSend.append("descriptionThree", formData.descriptionThree);
      formDataToSend.append("youtubeLink", formData.youtubeLink);
      formDataToSend.append("userId", userId);

      await fetch("http://localhost:8000/api/add-guest", {
        method: "POST",
        body: formDataToSend
      });
 

      alert("Guest added successfully ✅");
      setFormData({
        guestName: "",
        guestRole: "",
        aboutGuest: "",
        twitter: "",
        instagram: "",
        threads: "",
        headingOne: "",
        descriptionOne: "",
        headingTwo: "",
        descriptionTwo: "",
        headingthree: "",
        descriptionThree: "",
        youtubeLink: "",
      });
      setSelectedFile(null);
      setImagePreview(null);
      setErrors({});
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="w-full lg:w-[90%] mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Guest</h1>

        <div>
          <div className="mb-8">
            <label className="block text-sm font-normal text-gray-900 mb-3">
              Upload Guest Picture
            </label>

            <div className="border-2 bg-gray-50 border-dashed border-gray-300 rounded-lg p-5 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-blue-600 font-normal mb-2">
                    <span className="underline">Click Here</span> to upload file
                  </p>
                  <p className="text-xs text-gray-500">
                    Image will be cropped to 300×380px
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: .jpg, .jpeg, .png
                  </p>
                </label>
              )}
            </div>
            {errors.guestImage && <p className="text-red-500 text-xs mt-2">{errors.guestImage}</p>}
          </div>

          <div className='mb-8 bg-gray-50 rounded-lg p-5'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-normal text-gray-900 mb-2">
                  Guest Name
                </label>
                <input
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleInputChange}
                  placeholder="Enter Guest Name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                    errors.guestName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.guestName && <p className="text-red-500 text-xs mt-1">{errors.guestName}</p>}
              </div>
              <div>
                <label className="block text-sm font-normal text-gray-900 mb-2">
                  Guest Role
                </label>
                <input
                  type="text"
                  name="guestRole"
                  value={formData.guestRole}
                  onChange={handleInputChange}
                  placeholder="Enter Guest Role"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                    errors.guestRole ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.guestRole && <p className="text-red-500 text-xs mt-1">{errors.guestRole}</p>}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-normal text-gray-900 mb-2">
                About Guest
              </label>
              <textarea
                name="aboutGuest"
                value={formData.aboutGuest}
                onChange={handleInputChange}
                placeholder="Enter About Guest"
                rows="5"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none text-sm ${
                  errors.aboutGuest ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.aboutGuest && <p className="text-red-500 text-xs mt-1">{errors.aboutGuest}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-normal text-gray-900 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="Paste Twitter Link"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                    errors.twitter ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.twitter && <p className="text-red-500 text-xs mt-1">{errors.twitter}</p>}
              </div>
              <div>
                <label className="block text-sm font-normal text-gray-900 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="Paste Instagram Link"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                    errors.instagram ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.instagram && <p className="text-red-500 text-xs mt-1">{errors.instagram}</p>}
              </div>
              <div>
                <label className="block text-sm font-normal text-gray-900 mb-2">
                  Threads
                </label>
                <input
                  type="url"
                  name="threads"
                  value={formData.threads}
                  onChange={handleInputChange}
                  placeholder="Paste Threads Link"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                    errors.threads ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.threads && <p className="text-red-500 text-xs mt-1">{errors.threads}</p>}
              </div>
            </div>
          </div>

          <div className="mb-8 bg-gray-50 rounded-lg p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              What's Inside the Podcast
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Heading 1
              </label>
              <input
                type="text"
                name="headingOne"
                value={formData.headingOne}
                onChange={handleInputChange}
                placeholder="Enter Heading"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                  errors.headingOne ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.headingOne && <p className="text-red-500 text-xs mt-1">{errors.headingOne}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Description
              </label>
              <textarea
                name="descriptionOne"
                value={formData.descriptionOne}
                onChange={handleInputChange}
                placeholder="Enter Description"
                rows="5"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none text-sm ${
                  errors.descriptionOne ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.descriptionOne && <p className="text-red-500 text-xs mt-1">{errors.descriptionOne}</p>}
            </div>
          </div>

          <div className="mb-8 bg-gray-50 rounded-lg p-5">
            <div className="mb-4">
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Heading 2
              </label>
              <input
                type="text"
                name="headingTwo"
                value={formData.headingTwo}
                onChange={handleInputChange}
                placeholder="Enter Heading"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                  errors.headingTwo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.headingTwo && <p className="text-red-500 text-xs mt-1">{errors.headingTwo}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Description
              </label>
              <textarea
                name="descriptionTwo"
                value={formData.descriptionTwo}
                onChange={handleInputChange}
                placeholder="Enter Description"
                rows="5"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none text-sm ${
                  errors.descriptionTwo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.descriptionTwo && <p className="text-red-500 text-xs mt-1">{errors.descriptionTwo}</p>}
            </div>
          </div>

          <div className="mb-8 bg-gray-50 rounded-lg p-5">
            <div className="mb-4">
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Heading 3
              </label>
              <input
                type="text"
                name="headingthree"
                value={formData.headingthree}
                onChange={handleInputChange}
                placeholder="Enter Heading"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                  errors.headingThree ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.headingThree && <p className="text-red-500 text-xs mt-1">{errors.headingThree}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Description
              </label>
              <textarea
                name="descriptionThree"
                value={formData.descriptionThree}
                onChange={handleInputChange}
                placeholder="Enter Description"
                rows="5"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none text-sm ${
                  errors.descriptionThree ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.descriptionThree && <p className="text-red-500 text-xs mt-1">{errors.descriptionThree}</p>}
            </div>
          </div>

          <div className="mb-8 bg-gray-50 rounded-lg p-5">
            <label className="block text-sm font-normal text-gray-900 mb-2">
              YouTube Link
            </label>
            <input
              type="url"
              name="youtubeLink"
              value={formData.youtubeLink}
              onChange={handleInputChange}
              placeholder="Paste YouTube Link"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                errors.youtubeLink ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.youtubeLink && <p className="text-red-500 text-xs mt-1">{errors.youtubeLink}</p>}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Guest...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Crop Image</h2>
                <button
                  onClick={() => setShowCropModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Crop your image (Aspect Ratio: 300×380px)
                </label>
              </div>

              <div className="relative mb-6 bg-gray-100 rounded-lg overflow-hidden"
                style={{ height: '300px', width: '100%' }}>
                <Cropper
                  image={originalImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="rect"
                  showGrid={true}
                  objectFit="contain"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoom: {Math.round(zoom * 100)}%
                </label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCropModal(false)}
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyCrop}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Crop & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}