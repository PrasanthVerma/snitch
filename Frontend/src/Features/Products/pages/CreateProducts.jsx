import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import {useProduct} from '../hooks/useProduct.js'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'];
const MAX_IMAGES = 7;

const CreateProducts = () => {
  const {handleAddProduct} = useProduct()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'INR',
  });
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // ─── Form Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    // Reset so same file can be re-selected
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
      images.forEach((img) => payload.append('images', img.file));

      await handleAddProduct(payload);

      setSuccess(true);
      // Reset form after successful submission
      setFormData({ name: '', description: '', priceAmount: '', priceCurrency: 'INR' });
      setImages([]);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared input class ─────────────────────────────────────────
  const inputClass =
    'w-full bg-transparent border-b border-gray-700/80 py-3 text-sm focus:outline-none focus:border-[#ff5a4a] transition-colors duration-200 placeholder-[#3a3a3a] text-white';
  const labelClass =
    'block text-[10px] font-semibold text-gray-300 uppercase tracking-[0.15em] mb-2';

  return (
    <div className="min-h-screen bg-[#191110] text-white font-sans">
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
        .font-archivo { font-family: 'Archivo Narrow', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="flex min-h-screen">
        {/* ═══════════════════════════════════════════════════════════
            SIDEBAR
        ════════════════════════════════════════════════════════════ */}
        <aside className="hidden lg:flex flex-col justify-between w-64 xl:w-72 bg-[#110d0d] border-r border-gray-800/50 p-10 shrink-0">
          {/* Top */}
          <div>
            {/* Logo */}
            <h1 className="font-archivo text-5xl xl:text-6xl font-black tracking-tighter text-white leading-none mb-10">
              VALINA
            </h1>

            {/* Divider */}
            <div className="h-px bg-gray-800/60 mb-10" />

            {/* Page meta */}
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] font-inter mb-2">
              Seller Dashboard
            </p>
            <h2 className="font-archivo text-2xl font-bold tracking-tight text-white leading-tight">
              CREATE<br />PRODUCT
            </h2>

            {/* Accent line */}
            <div className="w-8 h-0.5 bg-[#ff5a4a] mt-4 mb-10" />

            {/* Instructions */}
            <ul className="space-y-3">
              {[
                'Fill in product details',
                'Add up to 7 images',
                'Publish to catalog',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full border border-gray-700 flex items-center justify-center text-[9px] text-gray-500 font-inter font-semibold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[11px] text-gray-500 font-inter leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Back link */}
          <Link
            to="/"
            className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-white uppercase tracking-[0.15em] font-inter font-semibold transition-colors duration-200 group"
          >
            <svg
              className="w-3 h-3 rotate-180 group-hover:-translate-x-0.5 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
            Back to Dashboard
          </Link>
        </aside>

        {/* ═══════════════════════════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════════════════════════════ */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between px-6 py-6 border-b border-gray-800/50">
            <h1 className="font-archivo text-3xl font-black tracking-tighter text-white">
              VALINA
            </h1>
            <Link
              to="/"
              className="text-[10px] text-gray-400 hover:text-white uppercase tracking-[0.15em] font-inter font-semibold transition-colors"
            >
              ← Back
            </Link>
          </div>

          <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
            {/* Page heading */}
            <div className="mb-12 lg:mb-16">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] font-inter mb-2 lg:hidden">
                Seller Dashboard
              </p>
              <h2 className="font-archivo text-4xl sm:text-5xl font-bold tracking-tighter text-white lg:hidden mb-1">
                CREATE PRODUCT
              </h2>
              <p className="text-gray-400 text-sm font-inter">
                List a new item in the exclusive catalog.
              </p>
            </div>

            {/* ── Error banner ── */}
            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-semibold uppercase tracking-wider font-inter">
                {error}
              </div>
            )}

            {/* ── Success banner ── */}
            {success && (
              <div className="mb-8 p-4 bg-[#ff5a4a]/10 border border-[#ff5a4a]/40 text-[#ff5a4a] text-xs font-semibold uppercase tracking-wider font-inter flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Product published successfully.
              </div>
            )}

            <form className="space-y-10" onSubmit={handleSubmit}>
              {/* ── Product Name ── */}
              <div className="space-y-2">
                <label className={labelClass}>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Utility Cargo Jacket"
                  className={inputClass}
                  required
                />
              </div>

              {/* ── Description ── */}
              <div className="space-y-2">
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe materials, fit, and design details..."
                  rows={5}
                  className={`${inputClass} resize-none leading-relaxed`}
                  required
                />
              </div>

              {/* ── Price Row ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
                {/* Price Amount */}
                <div className="space-y-2">
                  <label className={labelClass}>Price Amount</label>
                  <input
                    type="number"
                    name="priceAmount"
                    value={formData.priceAmount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <label className={labelClass}>Price Currency</label>
                  <div className="relative">
                    <select
                      name="priceCurrency"
                      value={formData.priceCurrency}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-gray-700/80 py-3 text-sm text-white focus:outline-none focus:border-[#ff5a4a] transition-colors duration-200 cursor-pointer appearance-none pr-6"
                      required
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c} className="bg-[#1e1614] text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                    {/* Custom arrow */}
                    <svg
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════
                  IMAGES
              ════════════════════════════════════════════════════ */}
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <label className={labelClass}>Product Images</label>
                  <span className="text-[10px] text-gray-600 font-inter font-semibold uppercase tracking-[0.1em]">
                    <span
                      className={
                        images.length >= MAX_IMAGES
                          ? 'text-[#ff5a4a]'
                          : 'text-gray-400'
                      }
                    >
                      {images.length}
                    </span>{' '}
                    / {MAX_IMAGES}
                  </span>
                </div>

                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() =>
                    images.length < MAX_IMAGES && fileInputRef.current?.click()
                  }
                  className={`
                    relative border-2 border-dashed transition-all duration-200 rounded-none
                    ${images.length >= MAX_IMAGES
                      ? 'border-gray-800 cursor-not-allowed opacity-50'
                      : isDragging
                      ? 'border-[#ff5a4a] bg-[#ff5a4a]/5 cursor-copy scale-[1.005]'
                      : 'border-gray-700/60 hover:border-gray-500 cursor-pointer'
                    }
                  `}
                >
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    className="sr-only"
                    aria-label="Upload product images"
                  />

                  {/* Drop zone content */}
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    {/* Upload icon */}
                    <div
                      className={`mb-4 transition-colors duration-200 ${
                        isDragging ? 'text-[#ff5a4a]' : 'text-gray-600'
                      }`}
                    >
                      <svg
                        className="w-10 h-10 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </div>

                    <p
                      className={`font-archivo font-bold text-sm uppercase tracking-widest mb-1 transition-colors duration-200 ${
                        isDragging ? 'text-[#ff5a4a]' : 'text-gray-300'
                      }`}
                    >
                      {isDragging ? 'Release to Upload' : 'Drag & Drop Images'}
                    </p>
                    <p className="text-[11px] text-gray-600 font-inter">
                      or{' '}
                      <span className="text-gray-400 underline underline-offset-2">
                        click to browse
                      </span>{' '}
                      — up to {MAX_IMAGES} images
                    </p>
                    <p className="text-[10px] text-gray-700 font-inter mt-1 uppercase tracking-[0.1em]">
                      JPG · PNG · WEBP
                    </p>
                  </div>
                </div>

                {/* ── Image Previews Grid ── */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 pt-2">
                    {images.map((img, index) => (
                      <div key={img.id} className="relative group aspect-square">
                        <img
                          src={img.preview}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(img.id);
                          }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#ff5a4a] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#ff4331]"
                          aria-label="Remove image"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {/* Index badge */}
                        <span className="absolute bottom-1 left-1.5 text-[9px] text-white/60 font-inter font-semibold">
                          {index + 1}
                        </span>
                      </div>
                    ))}

                    {/* Add more slot (if space remains) */}
                    {images.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border border-dashed border-gray-700/60 hover:border-[#ff5a4a] text-gray-700 hover:text-[#ff5a4a] flex items-center justify-center transition-all duration-200 group"
                        aria-label="Add more images"
                      >
                        <svg
                          className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="h-px bg-gray-800/50" />

              {/* ── Submit Button ── */}
              <div className="pb-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full bg-[#ff5a4a] hover:bg-[#ff4331]
                    disabled:bg-gray-700 disabled:cursor-not-allowed
                    text-white py-4 px-6
                    font-archivo font-bold text-xs uppercase tracking-widest
                    flex justify-center items-center gap-3
                    transition-all duration-300
                    hover:shadow-[0_0_30px_rgba(255,90,74,0.25)]
                    disabled:hover:shadow-none
                    rounded-none
                  "
                >
                  {loading ? (
                    <>
                      {/* Spinner */}
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Product
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-gray-600 font-inter text-center mt-4 uppercase tracking-[0.1em]">
                  Product will be visible in the catalog immediately after publishing.
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateProducts;
