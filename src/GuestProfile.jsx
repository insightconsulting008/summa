import React from 'react';
import { Play, Twitter, Instagram, Youtube, Dribbble } from 'lucide-react';
import underline from './assets/underline.png'
import cover from './assets/cover.png'
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IoLogoInstagram } from "react-icons/io5";
import axios from 'axios';
import { FaXTwitter } from "react-icons/fa6";
import { RiThreadsLine } from "react-icons/ri";
import profile from './assets/profile.png'


 
export default function PodcastPortfolio() {
    // const { guestId } = useParams();
    const guestId = "cmi5q2ung0001ec1wvle3kjc5"
    const [guest, setGuest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGuest = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`http://localhost:8000/api/manage-guest/${guestId}`);
                console.log(response.data.guest)
                setGuest(response.data.guest);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch guest');
                console.error('Error fetching guest:', err);
            } finally {
                setLoading(false);
            }
        };

        if (guestId) {
            fetchGuest();
        }
    }, [guestId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading guest details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <h3 className="text-red-800 font-semibold text-lg mb-2">Error</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!guest) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 text-lg">Guest not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
<div className="relative min-h-screen bg-black overflow-hidden">
  {/* Background */}
  <div className="absolute inset-0">
    <div className="absolute top-1/2 right-1/4 w-[600px] h-[300px] bg-purple-600/30 rounded-full blur-[150px]"></div>
    <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px]"></div>
  </div>

  <div className="relative grid grid-cols-1 lg:grid-cols-2 items-center gap-10 max-w-7xl mx-auto px-6 min-h-screen">
    {/* Left Section */}
    <div className="space-y-6 z-10">
      <h1 className="text-5xl lg:text-6xl font-bold text-yellow-300 leading-tight">
        {guest.guestName}
      </h1>
      <p className="text-xl text-gray-300">{guest.guestRole}</p>
      <p className="text-base text-gray-400 leading-relaxed max-w-lg">
        {guest.aboutGuest}
      </p>

      <div className="flex space-x-4 text-white pt-4">
        <a href={guest.twitter} className="hover:text-purple-400 transition">
          <FaXTwitter className="w-6 h-6" />
        </a>
        <a href={guest.instagram} className="hover:text-purple-400 transition">
          <IoLogoInstagram className="w-6 h-6" />
        </a>
        <a href={guest.threads} className="hover:text-purple-400 transition">
          <RiThreadsLine className="w-6 h-6" />
        </a>
      </div>
    </div>

    {/* Right Section - iPhone Mockup */}
    <div className="flex justify-center items-center">
      <div className="relative">
        {/* iPhone Frame */}
        <div className="relative w-[350px] h-[580px] bg-gray-900 rounded-[40px] shadow-2xl border-[5px] border-[#8B8B8B]">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[55px] h-[8px] bg-[#8B8B8B] rounded-full z-20"></div>
          
          {/* Screen Content */}
<div className="relative w-full h-full bg-black rounded-[35px] overflow-hidden">

{/* Guest Image */}
<img 
  src={guest.guestImage} 
  alt={guest.guestName}
  className="w-full h-full object-cover"
/>

{/* Gradient Overlay */}
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

{/* Guest Info Overlay */}
<div className="absolute bottom-0 w-full p-4 text-center">
  
  <p className="inline-block px-4 py-1 text-xs font-medium text-black bg-amber-300 rounded-full">
    {guest.guestRole}
  </p>
</div>

</div>

          
              </div>
        
        {/* Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-[60px] blur-xl -z-10"></div>
      </div>
    </div>
  </div>
</div>

            {/* What's Inside the Podcast Section */}
            <div className="bg-white py-20 ">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
                            What's Inside{' '}
                            <span className="relative inline-block">
                                <span className="relative z-10">the Podcast</span>
                                <img
                                    className="absolute  -bottom-3  w-full h-auto"
                                    src={underline}
                                    alt="underline"
                                />
                            </span>
                        </h2>
                        <p className="text-gray-600 text-base sm:text-lg mt-3">
                            Discover the key themes and topics we explore in every episode
                        </p>
                    </div>

                    {/* Three Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Card 1 */}
                        <div className='bg-[#fdfefe]  border border-[#ebebeb] p-6 rounded-xl '>

                            <h3 className="text-xl font-bold text-black mb-3">{guest.headingOne}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {guest.descriptionOne}
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className='bg-[#fdfefe]  border border-[#ebebeb] p-6 rounded-xl '>

                            <h3 className="text-xl font-bold text-black mb-3">{guest.headingTwo}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {guest.descriptionTwo}
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className='bg-[#fdfefe]  border border-[#ebebeb] p-6 rounded-xl '>

                            <h3 className="text-xl font-bold text-black mb-3">{guest.headingthree}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {guest.descriptionThree}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stories from the Valley Section */}
            <div className="bg-white py-14 ">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
                            Stories from{' '}
                            <span className="relative inline-block">
                                <span className="relative z-10">the Valley</span>
                                <img
                                    className="absolute  -bottom-3  w-full h-auto"
                                    src={underline}
                                    alt="underline"
                                />
                            </span>
                        </h2>
                        <p className="text-gray-600 text-base sm:text-lg mt-3 max-w-2xl mx-auto">
                            Our blog shares insights, stories, and reflections from the world of tech, design, and innovation — written to inspire your next big thought.                        </p>
                    </div>

                    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Cover background */}
                        <div className="relative w-full rounded-3xl overflow-hidden ">
                            <img
                                src={cover}
                                alt="cover background"
                                className="absolute inset-0 w-full h-full object-cover"
                            />



                            {/* Video container */}
                            <div className="relative p-3 sm:p-4 md:p-5 lg:p-6">
                                <div className="relative w-full rounded-2xl overflow-hidden ">
                                    <div className="relative pb-[56.25%]">
                                        <iframe
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={guest.youtubeLink}
                                            title="Video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}