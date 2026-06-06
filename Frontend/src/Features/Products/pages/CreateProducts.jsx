import React, { useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../../App/theme.slice.js';
import { Link } from 'react-router';
import { useProduct } from '../hooks/useProduct.js'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'];
const MAX_IMAGES = 7;

const CreateProducts = () => {
  const { handleAddProduct } = useProduct()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'INR',
    stock: 0,
    attributes: [{ key: '', value: '' }]
  });
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const fileInputRef = useRef(null);

  // ─── Form Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: '', value: '' }]
    }));
  };

  const handleRemoveAttribute = (index) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, idx) => idx !== index)
    }));
  };

  const handleAttributeChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.attributes.map((attr, idx) => {
        if (idx === index) {
          return { ...attr, [field]: value };
        }
        return attr;
      });
      return { ...prev, attributes: updated };
    });
  };

  // ─── Image Handlers ─────────────────────────────────────────────
  const processFiles = useCallback((files) => {
    const incoming = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    );
    setImages((prev) => {
      const slots = MAX_IMAGES - prev.length;
      if (slots <= 0) return prev;
      const added = incoming.slice(0, slots).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random()}`,
      }));
      return [...prev, ...added];
    });
  }, []);

  const handleFileInputChange = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  // ─── Drag & Drop ────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (images.length >= MAX_IMAGES) return;
    processFiles(e.dataTransfer.files);
  };

  // ─── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('priceAmount', formData.priceAmount);
      payload.append('priceCurrency', formData.priceCurrency);
      payload.append('stock', formData.stock);

      const attributesObj = {};
      formData.attributes.forEach((attr) => {
        if (attr.key.trim() && attr.value.trim()) {
          attributesObj[attr.key.trim()] = attr.value.trim();
        }
      });
      payload.append('attributes', JSON.stringify(attributesObj));

      images.forEach((img) => payload.append('images', img.file));

      await handleAddProduct(payload);

      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'INR',
        stock: 0,
        attributes: [{ key: '', value: '' }]
      });
      setImages([]);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row font-luxury-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#111111]'}`}>
      
      {/* ═══════════════════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════════════════════ */}
      <aside className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 p-8 shrink-0 select-none transition-colors duration-500 border-r ${
        isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
      }`}>
        {/* Navigation Section */}
        <div className="flex flex-col gap-10">
          {/* Logo */}
          <div className="flex flex-col">
            <h1 className={`text-2xl font-luxury-serif font-light tracking-[0.18em] uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>
              LUXORA
            </h1>
            <span className="text-[8px] font-medium tracking-[0.32em] text-[#C5A880] uppercase mt-1">
              PREMIUM CLOTHING
            </span>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-1">
            {[
              { label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', path: '/seller/dashboard', active: false },
              { label: 'Products', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', active: false },
              { label: 'Add Product', icon: 'M12 4v16m8-8H4', path: '/seller/add-product', active: true },
              { label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', active: false },
              { label: 'Earnings', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', active: false },
              { label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm0 0h5a2 2 0 002-2v-3a2 2 0 00-2-2h-5M9 19h5M18 5v14a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2z', active: false },
              { label: 'Reviews', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', active: false },
              { label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', active: false },
              { label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', active: false }
            ].map((item, idx) => {
              const navContent = (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </>
              );

              const className = `w-full flex items-center gap-3.5 px-4 py-3 text-xs tracking-wider font-medium rounded-xl transition-all duration-300 ${
                item.active
                  ? isDarkMode
                    ? 'bg-[#C5A880]/10 text-[#C5A880]'
                    : 'bg-black text-white'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`;

              if (item.path) {
                return (
                  <Link key={idx} to={item.path} className={className}>
                    {navContent}
                  </Link>
                );
              }

              return (
                <button
                  key={idx}
                  disabled
                  className={`${className} cursor-not-allowed opacity-50`}
                >
                  {navContent}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions (Exclude Premium upgrade box as requested!) */}
        <Link
          to="/"
          className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider transition-colors duration-300 rounded-xl ${
            isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Link>
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          MAIN PANEL WORKSPACE
      ════════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto min-h-screen flex flex-col">
        {/* Header Widget */}
        <header className={`w-full flex justify-between items-center py-6 px-6 sm:px-8 md:px-12 border-b transition-colors duration-500 ${
          isDarkMode ? 'border-white/5 bg-[#0D0D0D]' : 'border-[#E5E5EA] bg-white'
        }`}>
          {/* Back Trigger & Section Meta */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className={`p-2.5 rounded-full border transition-all duration-300 shrink-0 ${
                isDarkMode ? 'bg-[#151515] border-[#2C2C2E] text-white hover:bg-[#1E1E1E]' : 'bg-white border-[#E5E5EA] text-black hover:bg-[#F2F2F7]'
              }`}
              aria-label="Back to dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex flex-col">
              <h2 className={`text-xl sm:text-2xl font-luxury-serif font-light tracking-wide ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                Add New Product
              </h2>
              <span className={`text-[10px] sm:text-xs font-light mt-0.5 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                Create a new product and add it to your store
              </span>
            </div>
          </div>

          {/* Right Actions Widgets */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-full border transition-all duration-300 ${
                isDarkMode
                  ? 'bg-[#151515] border-[#2C2C2E] text-yellow-500 hover:bg-[#1E1E1E] hover:border-[#3A3A3C]'
                  : 'bg-white border-[#E5E5EA] text-[#636366] hover:bg-[#F2F2F7] hover:border-[#D1D1D6]'
              }`}
              aria-label="Toggle Theme"
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Notification bell widget */}
            <button className={`p-2.5 rounded-full border relative ${
              isDarkMode ? 'bg-[#151515] border-[#2C2C2E] text-white' : 'bg-white border-[#E5E5EA] text-black'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Orange Dot badge */}
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-orange-500"></span>
            </button>

            {/* Divider line */}
            <div className={`h-8 w-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

            {/* User Account Info Circle widget */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/30 text-[#C5A880] flex items-center justify-center font-bold text-xs select-none">
                S
              </div>
              <div className="hidden sm:flex flex-col select-none">
                <span className={`text-[11px] font-semibold tracking-wide leading-none ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>Seller Account</span>
                <span className="text-[9px] text-[#C5A880] font-medium tracking-wide mt-1">Verified Seller</span>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Form Frame */}
        <div className="flex-1 w-full max-w-[1240px] mx-auto px-6 sm:px-8 md:px-12 py-10">
          
          {/* Status Banners */}
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium tracking-wide flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium tracking-wide flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Product published and cataloged successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 sm:gap-10">
            {/* Left Column (Inputs & Details - 60% Width) */}
            <div className="w-full lg:w-[58%] xl:w-[60%] flex flex-col gap-8">
              
              {/* SECTION 1: Product Information */}
              <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${
                isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
              }`}>
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-dashed border-gray-500/10">
                  <span className="w-6 h-6 rounded-full bg-[#C5A880] text-black font-bold text-xs flex items-center justify-center font-luxury-serif">
                    1
                  </span>
                  <h3 className={`text-base font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Product Information
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Product Title */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className={`block text-[11px] font-semibold tracking-[0.08em] uppercase ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                        Title of the product
                      </label>
                      <span className={`text-[10px] font-medium tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formData.name.length}/120
                      </span>
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product title"
                      maxLength={120}
                      className={`w-full text-sm py-3.5 px-4 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-300 font-light ${
                        isDarkMode
                          ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-[#555558] focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                          : 'bg-white border-[#E5E5EA] text-[#111111] placeholder-[#AEAEB2] focus:border-black focus:ring-black/5'
                      }`}
                      required
                    />
                  </div>

                  {/* Product Description */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className={`block text-[11px] font-semibold tracking-[0.08em] uppercase ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                        Description of the product
                      </label>
                      <span className={`text-[10px] font-medium tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formData.description.length}/2000
                      </span>
                    </div>

                    {/* Rich text editor toolbar representation */}
                    <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                      isDarkMode ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]'
                    }`}>
                      <div className={`flex items-center gap-2 p-2 border-b flex-wrap ${
                        isDarkMode ? 'bg-[#151515] border-[#2C2C2E]' : 'bg-gray-50 border-[#E5E5EA]'
                      }`}>
                        {/* Selector representation */}
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-semibold cursor-default shrink-0 select-none ${
                          isDarkMode ? 'bg-transparent border-[#2C2C2E] text-white' : 'bg-white border-[#E5E5EA] text-black'
                        }`}>
                          Paragraph
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {/* vertical divider */}
                        <div className={`h-4 w-px shrink-0 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                        {/* B, I, U, List buttons */}
                        {['B', 'I', 'U'].map((style) => (
                          <button
                            key={style}
                            type="button"
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-default ${
                              isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-black hover:bg-gray-200'
                            }`}
                          >
                            {style === 'B' && 'B'}
                            {style === 'I' && <span className="italic">I</span>}
                            {style === 'U' && <span className="underline">U</span>}
                          </button>
                        ))}
                        {/* lists representation */}
                        <div className={`h-4 w-px shrink-0 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                        {[
                          'M4 6h16M4 12h16M4 18h7', // Unordered
                          'M4 6h16M4 12h16M4 18h16' // Ordered
                        ].map((listIcon, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-200 cursor-default ${
                              isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-black hover:bg-gray-200'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={listIcon} />
                            </svg>
                          </button>
                        ))}
                        {/* Link representation */}
                        <div className={`h-4 w-px shrink-0 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                        <button
                          type="button"
                          className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-200 cursor-default ${
                            isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-black hover:bg-gray-200'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                      </div>

                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Write a detailed description of your product..."
                        maxLength={2000}
                        rows={6}
                        className={`w-full text-sm p-4 resize-none leading-relaxed border-none focus:outline-none focus:ring-0 transition-colors font-light ${
                          isDarkMode ? 'bg-[#0D0D0D] text-white placeholder-[#555558]' : 'bg-white text-[#111111] placeholder-[#AEAEB2]'
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Pricing & Inventory */}
              <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${
                isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
              }`}>
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-dashed border-gray-500/10">
                  <span className="w-6 h-6 rounded-full bg-[#C5A880] text-black font-bold text-xs flex items-center justify-center font-luxury-serif">
                    2
                  </span>
                  <h3 className={`text-base font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Pricing & Inventory
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Price Amount */}
                  <div className="space-y-2">
                    <label className={`block text-[11px] font-semibold tracking-[0.08em] uppercase ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                      Price Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E8E93] text-sm">
                        ₹
                      </div>
                      <input
                        type="number"
                        name="priceAmount"
                        value={formData.priceAmount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        className={`w-full text-sm py-3.5 pl-8 pr-4 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-300 font-light ${
                          isDarkMode
                            ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-[#555558] focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                            : 'bg-white border-[#E5E5EA] text-[#111111] placeholder-[#AEAEB2] focus:border-black focus:ring-black/5'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Price Currency */}
                  <div className="space-y-2">
                    <label className={`block text-[11px] font-semibold tracking-[0.08em] uppercase ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                      Price Currency
                    </label>
                    <div className="relative">
                      <select
                        name="priceCurrency"
                        value={formData.priceCurrency}
                        onChange={handleChange}
                        className={`w-full text-sm py-3.5 pl-4 pr-10 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-300 font-light cursor-pointer appearance-none ${
                          isDarkMode
                            ? 'bg-[#151515] border-[#2C2C2E] text-white focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                            : 'bg-white border-[#E5E5EA] text-[#111111] focus:border-black focus:ring-black/5'
                        }`}
                        required
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c} className={isDarkMode ? 'bg-[#151515] text-white' : 'bg-white text-black'}>
                            {c === 'INR' ? 'INR (₹)' : c === 'USD' ? 'USD ($)' : c === 'EUR' ? 'EUR (€)' : c === 'GBP' ? 'GBP (£)' : c}
                          </option>
                        ))}
                      </select>
                      {/* caret down outline vector */}
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#8E8E93]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Stock Level */}
                  <div className="space-y-2">
                    <label className={`block text-[11px] font-semibold tracking-[0.08em] uppercase ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                      Stock Level
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="Enter quantity"
                      min="0"
                      className={`w-full text-sm py-3.5 px-4 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-300 font-light ${
                        isDarkMode
                          ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-[#555558] focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                          : 'bg-white border-[#E5E5EA] text-[#111111] placeholder-[#AEAEB2] focus:border-black focus:ring-black/5'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Specifications & Attributes */}
              <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${
                isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
              }`}>
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-dashed border-gray-500/10">
                  <span className="w-6 h-6 rounded-full bg-[#C5A880] text-black font-bold text-xs flex items-center justify-center font-luxury-serif">
                    3
                  </span>
                  <h3 className={`text-base font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Specifications & Attributes
                  </h3>
                </div>

                <p className={`text-xs font-light leading-relaxed mb-6 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                  Add key attributes such as Material, Fit, Sleeve, Care Instructions, etc. to help buyers make informed decisions.
                </p>

                <div className="space-y-4">
                  {formData.attributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Attribute Name (e.g. Material)"
                          value={attr.key}
                          onChange={(e) => handleAttributeChange(idx, 'key', e.target.value)}
                          className={`w-full text-xs py-3 px-4 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-300 font-light ${
                            isDarkMode
                              ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-[#555558] focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                              : 'bg-white border-[#E5E5EA] text-[#111111] placeholder-[#AEAEB2] focus:border-black focus:ring-black/5'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Attribute Value (e.g. 100% Cotton)"
                          value={attr.value}
                          onChange={(e) => handleAttributeChange(idx, 'value', e.target.value)}
                          className={`w-full text-xs py-3 px-4 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-300 font-light ${
                            isDarkMode
                              ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-[#555558] focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                              : 'bg-white border-[#E5E5EA] text-[#111111] placeholder-[#AEAEB2] focus:border-black focus:ring-black/5'
                          }`}
                        />
                      </div>
                      
                      {formData.attributes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(idx)}
                          className="p-2.5 rounded-xl border border-red-500/20 hover:border-red-500 text-red-500 hover:bg-red-500/5 transition-all shrink-0"
                          title="Remove attribute"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    className={`mt-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                      isDarkMode
                        ? 'bg-[#151515] border-[#2C2C2E] text-[#C5A880] hover:bg-[#1E1E1E]'
                        : 'bg-white border-[#E5E5EA] text-black hover:bg-[#F2F2F7]'
                    }`}
                  >
                    + Add Attribute
                  </button>
                </div>
              </div>

              {/* SECTION 4: Product Images (Upto 7) */}
              <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${
                isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
              }`}>
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-dashed border-gray-500/10">
                  <span className="w-6 h-6 rounded-full bg-[#C5A880] text-black font-bold text-xs flex items-center justify-center font-luxury-serif">
                    4
                  </span>
                  <h3 className={`text-base font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Product Images (Upto {MAX_IMAGES})
                  </h3>
                </div>

                <p className={`text-xs font-light leading-relaxed ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                  You can upload up to {MAX_IMAGES} images. (JPG, PNG or WEBP up to 5MB each). Place high-quality, high-resolution clothing displays to maximize seller conversions.
                </p>
              </div>
            </div>

            {/* Right Column (Drag and Drop & Previews - 40% Width) */}
            <div className="w-full lg:flex-1 flex flex-col gap-6">
              
              {/* Image Drag and Drop Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all duration-300 ${
                  images.length >= MAX_IMAGES
                    ? 'border-gray-800 cursor-not-allowed opacity-50'
                    : isDragging
                      ? 'border-[#C5A880] bg-[#C5A880]/5 scale-[1.01] cursor-copy'
                      : isDarkMode
                        ? 'border-[#2C2C2E] hover:border-gray-500 bg-[#0D0D0D] cursor-pointer'
                        : 'border-[#E5E5EA] hover:border-gray-400 bg-white cursor-pointer'
                }`}
              >
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="sr-only"
                  aria-label="Upload images trigger"
                />

                {/* Cloud icon outline in bronze gold */}
                <div className={`p-4 rounded-full mb-4 transition-colors ${
                  isDragging ? 'bg-[#C5A880]/20 text-[#C5A880]' : 'bg-[#C5A880]/5 text-[#C5A880]'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <h4 className={`text-sm font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                  {isDragging ? 'Drop images to upload' : 'Drag & drop images here'}
                </h4>
                <span className={`text-[11px] font-light mt-1 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>or</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (images.length < MAX_IMAGES) fileInputRef.current?.click();
                  }}
                  className={`mt-3.5 px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-[#151515] border border-[#2C2C2E] text-white hover:bg-[#1E1E1E]'
                      : 'bg-white border border-[#E5E5EA] text-black hover:bg-[#F2F2F7]'
                  }`}
                >
                  Browse Files
                </button>

                <div className={`text-[10px] tracking-wider uppercase font-semibold mt-6 ${
                  images.length >= MAX_IMAGES ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {images.length} / {MAX_IMAGES} images uploaded
                </div>
              </div>

              {/* Image Previews Section */}
              <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${
                isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
              }`}>
                <h4 className={`text-xs font-semibold tracking-[0.08em] uppercase mb-4 ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                  Image Previews
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-dashed border-gray-500/10">
                      <img
                        src={img.preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover select-none"
                      />
                      {/* Black Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(img.id);
                          }}
                          className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 hover:scale-110 transition-all duration-300"
                          aria-label="Delete Image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Position index number badge */}
                      <span className="absolute bottom-1.5 left-2 text-[9px] bg-black/40 text-white/80 py-0.5 px-1.5 rounded font-mono select-none">
                        {idx + 1}
                      </span>
                    </div>
                  ))}

                  {/* Add more grid box slots */}
                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`aspect-square border border-dashed rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                        isDarkMode
                          ? 'border-[#2C2C2E] hover:border-[#C5A880] text-gray-500 hover:text-[#C5A880] hover:bg-white/5'
                          : 'border-[#E5E5EA] hover:border-black text-gray-500 hover:text-black hover:bg-gray-50'
                      }`}
                      aria-label="Add image grid box slot"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[9px] tracking-wide font-medium">Add Image</span>
                    </button>
                  )}
                </div>

                {/* Info Text below grid previews */}
                {images.length < MAX_IMAGES && (
                  <p className="text-[10px] text-gray-500 font-light mt-4">
                    You can add up to {MAX_IMAGES - images.length} more images
                  </p>
                )}
              </div>
            </div>
          </form>

          {/* Action buttons footer aligned right */}
          <div className={`mt-10 pt-6 border-t flex justify-end items-center gap-4 ${
            isDarkMode ? 'border-white/5' : 'border-[#E5E5EA]'
          }`}>
            <Link
              to="/"
              className={`px-6 py-3 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 border ${
                isDarkMode
                  ? 'bg-transparent border-[#2C2C2E] text-white hover:bg-white/5'
                  : 'bg-white border-[#E5E5EA] text-[#636366] hover:bg-[#F2F2F7]'
              }`}
            >
              Cancel
            </Link>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-medium text-xs tracking-wider flex items-center gap-2 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed select-none ${
                isDarkMode
                  ? 'bg-[#C5A880] text-[#0A0A0A] hover:bg-[#D9C3A5] disabled:bg-[#48484A] disabled:text-[#8E8E93] shadow-[0_4px_16px_rgba(197,168,128,0.2)]'
                  : 'bg-black text-white hover:bg-[#1C1C1E] disabled:bg-[#AEAEB2] disabled:text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
              }`}
            >
              <span>{loading ? 'Publishing...' : 'Publish Product'}</span>
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProducts;
