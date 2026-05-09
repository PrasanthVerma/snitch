import React, { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';
import {useNavigate} from 'react-router'

const Register = () => {

  const {handleRegister,handleGoogleAuth} = useAuth();
  const { error, loading } = useSelector(state => state.auth);
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    contact: "",
    password: "",
    isSeller: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleRegister(formData);
    if (success) {
      navigate("/");
    }
  };

  const handleGoogle = async () => {
    const success = await handleGoogleAuth();
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex text-white bg-black font-sans">
      {/* Left side - Image & Logo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] items-center justify-center overflow-hidden">
        {/* Dark figure/hoodie image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90 grayscale-[50%]"
          style={{ backgroundImage: "url('/register_bg.png')" }}
        ></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-12 left-12 z-10">
          <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-lg">VALINA</h1>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#191110]">
        <div className="w-full max-w-[440px] p-8 sm:p-12">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12">
            <h1 className="text-4xl font-black tracking-tighter text-white">VALINA</h1>
          </div>

          <h2 className="text-3xl font-bold mb-3 tracking-wide">CREATE ACCOUNT</h2>
          <p className="text-gray-400 mb-6 text-sm">Join the ecosystem. Enter your details below.</p>
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-semibold uppercase tracking-wider">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-gray-300 uppercase tracking-[0.15em]">Full Name</label>
              <input 
                type="text" 
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Enter your full name" 
                className="w-full bg-transparent border-b border-gray-700/80 py-2.5 text-sm focus:outline-none focus:border-[#ff5a4a] transition-colors placeholder-[#3a3a3a] text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-gray-300 uppercase tracking-[0.15em]">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com" 
                className="w-full bg-transparent border-b border-gray-700/80 py-2.5 text-sm focus:outline-none focus:border-[#ff5a4a] transition-colors placeholder-[#3a3a3a] text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-gray-300 uppercase tracking-[0.15em]">Contact Number</label>
              <input 
                type="text" 
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="10-digit mobile number" 
                className="w-full bg-transparent border-b border-gray-700/80 py-2.5 text-sm focus:outline-none focus:border-[#ff5a4a] transition-colors placeholder-[#3a3a3a] text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-gray-300 uppercase tracking-[0.15em]">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••" 
                className="w-full bg-transparent border-b border-gray-700/80 py-2.5 text-sm focus:outline-none focus:border-[#ff5a4a] transition-colors placeholder-[#3a3a3a] text-white"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isSeller"
                name="isSeller"
                checked={formData.isSeller}
                onChange={handleChange}
                className="w-4 h-4 bg-transparent border-gray-700/80 focus:ring-[#ff5a4a]"
              />
              <label htmlFor="isSeller" className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.15em]">Register as Seller</label>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#ff5a4a] hover:bg-[#ff4331] disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3.5 px-4 font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,90,74,0.3)] disabled:hover:shadow-none"
              >
                {loading ? 'REGISTERING...' : 'REGISTER'}
                {!loading && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="h-px bg-gray-800/80 flex-1"></div>
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-semibold">Or continue with</span>
            <div className="h-px bg-gray-800/80 flex-1"></div>
          </div>

          <div className="mt-8">
            <button className="w-full border border-gray-800 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 py-3.5 px-4 font-bold text-xs uppercase tracking-widest transition-all duration-300" onClick={handleGoogle} disabled={loading}>
              GOOGLE
            </button>
          </div>

          <div className="mt-12 text-center">
            <Link to="/login" className="text-[10px] text-gray-400 hover:text-white uppercase tracking-[0.15em] font-bold transition-colors duration-300">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
