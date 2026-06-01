import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';

const Dashboard = () => {
  const navigate = useNavigate();
  const { fetchAllProductsOfSeller } = useProduct();
  const sellerProducts = useSelector((state) => state.product.sellerProducts) || [];
  const user = useSelector((state) => state.auth.user);

  // ─── Filter & Sort States ──────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'price-desc', 'price-asc'
  
  // ─── Interactive Multi-Image Index State per Product ───────────
  const [imageIndices, setImageIndices] = useState({}); // { [productId]: currentIndex }

  // Fetch seller products on mount
  useEffect(() => {
    fetchAllProductsOfSeller();
  }, []);

  // ─── Computations & Analytics ──────────────────────────────────
  const totalValuation = useMemo(() => {
    return sellerProducts.reduce((acc, curr) => {
      const amount = Number(curr.price?.amount) || 0;
      return acc + amount;
    }, 0);
  }, [sellerProducts]);

  const latestProduct = useMemo(() => {
    if (!sellerProducts || sellerProducts.length === 0) return null;
    return [...sellerProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [sellerProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...sellerProducts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Sort criteria
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));
    }

    return result;
  }, [sellerProducts, searchQuery, sortBy]);

  // Helper to format currency
  const formatCurrency = (amount, currency = 'INR') => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (e) {
      return `${currency} ${amount}`;
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ─── Multi-Image Carousel Handlers ─────────────────────────────
  const handleNextImage = (productId, imagesCount, e) => {
    e.stopPropagation();
    e.preventDefault();
    setImageIndices((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imagesCount,
    }));
  };

  const handlePrevImage = (productId, imagesCount, e) => {
    e.stopPropagation();
    e.preventDefault();
    setImageIndices((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + imagesCount) % imagesCount,
    }));
  };

  return (
    <div className="min-h-screen bg-[#191110] text-white font-sans flex flex-col lg:flex-row">
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
        .font-archivo { font-family: 'Archivo Narrow', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
          SIDEBAR (lg and up)
      ════════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col justify-between w-64 xl:w-72 bg-[#110d0d] border-r border-gray-800/50 p-10 shrink-0">
        <div>
          {/* Logo */}
          <h1 className="font-archivo text-5xl xl:text-6xl font-black tracking-tighter text-white leading-none mb-10 select-none">
            VALINA
          </h1>

          {/* Divider */}
          <div className="h-px bg-gray-800/60 mb-10" />

          {/* Page metadata */}
          <p className="text-[10px] font-semibold text-[#ff5a4a] uppercase tracking-[0.2em] font-inter mb-2">
            Seller Portal
          </p>
          <h2 className="font-archivo text-2xl font-bold tracking-tight text-white leading-tight">
            SELLER<br />DASHBOARD
          </h2>

          {/* Accent red indicator line */}
          <div className="w-8 h-0.5 bg-[#ff5a4a] mt-4 mb-10" />

          {/* Navigation Links */}
          <nav className="space-y-4 font-inter">
            <Link
              to="/seller/dashboard"
              className="flex items-center gap-3 text-xs uppercase tracking-wider font-semibold text-white transition-colors duration-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a4a]" />
              Active Listings
            </Link>
            <Link
              to="/seller/add-product"
              className="flex items-center gap-3 text-xs uppercase tracking-wider font-semibold text-gray-500 hover:text-gray-200 transition-colors duration-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#ff5a4a]" />
              Add Product
            </Link>
            <Link
              to="/"
              className="flex items-center gap-3 text-xs uppercase tracking-wider font-semibold text-gray-500 hover:text-gray-200 transition-colors duration-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
              Public Storefront
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer (Seller profile metadata) */}
        <div>
          {user && (
            <div className="mb-6 p-4 bg-[#1e1614] border border-gray-800/60 font-inter">
              <p className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1">
                Authenticated As
              </p>
              <p className="text-xs font-semibold text-white truncate" title={user.email}>
                {user.name || user.email}
              </p>
            </div>
          )}

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
            Back to Shop
          </Link>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          MAIN WORKSPACE
      ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ── Mobile Navigation Header ── */}
        <header className="lg:hidden flex items-center justify-between px-6 py-6 bg-[#110d0d] border-b border-gray-800/50 shrink-0">
          <h1 className="font-archivo text-3xl font-black tracking-tighter text-white">
            VALINA
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/seller/add-product"
              className="bg-[#ff5a4a] hover:bg-[#ff4331] text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-inter transition-all duration-200"
            >
              + Create
            </Link>
            <Link
              to="/"
              className="text-[10px] text-gray-400 hover:text-white uppercase tracking-[0.15em] font-inter font-semibold transition-colors"
            >
              Shop
            </Link>
          </div>
        </header>

        {/* ── Scrollable Dashboard Grid Content ── */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-[#ff5a4a] uppercase tracking-[0.2em] font-inter mb-2 lg:hidden">
                  Seller Portal
                </p>
                <h2 className="font-archivo text-4xl sm:text-5xl font-bold tracking-tighter text-white leading-none">
                  SELLER DASHBOARD
                </h2>
                <p className="text-gray-400 text-sm font-inter mt-3">
                  Analyze your current inventory performance and list updates.
                </p>
              </div>

              {/* Desktop Create CTA */}
              <Link
                to="/seller/add-product"
                className="hidden lg:flex items-center gap-3 bg-[#ff5a4a] hover:bg-[#ff4331] text-white py-3.5 px-6 font-archivo font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,90,74,0.3)] shrink-0"
              >
                Create Product
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </Link>
            </div>

            {/* ═════════════════════════════════════════════════════════
                ANALYTICS METRICS SECTION
            ═════════════════════════════════════════════════════════ */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Metric Card 1: Total Products */}
              <div className="bg-[#110d0d] border border-gray-800/40 p-6 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-gray-700/50 transition-all duration-300">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] font-inter">
                  Total Listings
                </span>
                <span className="font-archivo text-4xl font-black text-white leading-none tracking-tight">
                  {sellerProducts.length}
                </span>
                <span className="text-[10px] text-gray-600 font-inter">
                  Active in Valina Catalog
                </span>
                {/* Visual red corner accent */}
                <div className="absolute top-0 right-0 w-1 h-0 bg-[#ff5a4a] group-hover:h-full transition-all duration-300" />
              </div>

              {/* Metric Card 2: Combined Valuation */}
              <div className="bg-[#110d0d] border border-gray-800/40 p-6 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-gray-700/50 transition-all duration-300">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] font-inter">
                  Combined Inventory Value
                </span>
                <span className="font-archivo text-3xl font-black text-[#ff5a4a] leading-none tracking-tight">
                  {formatCurrency(totalValuation)}
                </span>
                <span className="text-[10px] text-gray-600 font-inter">
                  Estimated Gross Catalog Asset
                </span>
                <div className="absolute top-0 right-0 w-1 h-0 bg-[#ff5a4a] group-hover:h-full transition-all duration-300" />
              </div>

              {/* Metric Card 3: Latest Creation */}
              <div className="bg-[#110d0d] border border-gray-800/40 p-6 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-gray-700/50 transition-all duration-300">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] font-inter">
                  Latest Creation
                </span>
                <span className="font-archivo text-lg font-bold text-white leading-tight truncate font-archivo uppercase">
                  {latestProduct ? latestProduct.name : 'No products found'}
                </span>
                <span className="text-[10px] text-gray-600 font-inter">
                  {latestProduct ? `Added on ${formatDate(latestProduct.createdAt)}` : 'Create a listing to see stats'}
                </span>
                <div className="absolute top-0 right-0 w-1 h-0 bg-[#ff5a4a] group-hover:h-full transition-all duration-300" />
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════
                TOOLBAR: SEARCH, SORT & FILTERS
            ═════════════════════════════════════════════════════════ */}
            <section className="bg-[#110d0d] border border-gray-800/40 p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
              
              {/* Search Bar */}
              <div className="w-full sm:max-w-md relative">
                <input
                  type="text"
                  placeholder="Search listings by name or key attributes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-800 py-2.5 pl-8 pr-4 text-sm text-white focus:outline-none focus:border-[#ff5a4a] transition-colors duration-200 placeholder-[#3a3a3a] font-inter"
                />
                {/* Search Icon */}
                <svg
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {/* Clear Input */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sorting Filter */}
              <div className="w-full sm:w-auto flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-inter shrink-0">
                  Sort By:
                </span>
                <div className="relative w-full sm:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-800 py-2 pr-6 text-sm text-white focus:outline-none focus:border-[#ff5a4a] transition-colors duration-200 cursor-pointer appearance-none font-inter"
                  >
                    <option value="newest" className="bg-[#191110] text-white">Newest First</option>
                    <option value="oldest" className="bg-[#191110] text-white">Oldest First</option>
                    <option value="price-desc" className="bg-[#191110] text-white">Price: High to Low</option>
                    <option value="price-asc" className="bg-[#191110] text-white">Price: Low to High</option>
                  </select>
                  {/* Select Icon */}
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
            </section>

            {/* ═════════════════════════════════════════════════════════
                PRODUCTS DISPLAY GRID
            ═════════════════════════════════════════════════════════ */}
            {filteredAndSortedProducts.length === 0 ? (
              
              /* ── Empty State Dashboard ── */
              <div className="bg-[#110d0d] border border-gray-800/40 py-20 px-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-gray-800 flex items-center justify-center mb-6 text-gray-600">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="font-archivo text-xl font-bold uppercase tracking-wider mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-500 font-inter text-sm max-w-sm leading-relaxed mb-8">
                  {searchQuery
                    ? "We couldn't find any products matching your search query. Try typing another name."
                    : 'You have not listed any items yet. Publish your initial catalog addition to begin selling.'}
                </p>

                {!searchQuery && (
                  <Link
                    to="/seller/add-product"
                    className="bg-[#ff5a4a] hover:bg-[#ff4331] text-white py-3.5 px-8 font-archivo font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,90,74,0.2)]"
                  >
                    Publish First Product
                  </Link>
                )}
              </div>
            ) : (
              
              /* ── Grid Container ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredAndSortedProducts.map((product) => {
                  const productImages = product.images || [];
                  const activeIndex = imageIndices[product._id] || 0;
                  const hasMultipleImages = productImages.length > 1;

                  return (
                    <article
                      key={product._id}
                      className="group bg-[#110d0d] border border-gray-800/40 hover:border-[#ff5a4a]/40 transition-all duration-300 flex flex-col relative"
                    >
                      {/* Product Image Frame */}
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#1a1413] shrink-0 select-none">
                        {productImages.length > 0 ? (
                          <img
                            src={productImages[activeIndex]?.url}
                            alt={`${product.name} image ${activeIndex + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          />
                        ) : (
                          /* Skeleton for Product missing images */
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 p-6">
                            <svg className="w-10 h-10 mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            <span className="text-[10px] uppercase font-archivo font-bold tracking-widest text-gray-600">No Image Available</span>
                          </div>
                        )}

                        {/* Glassmorphism Price Overlay Tag */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-gray-800/80 px-3 py-1.5 text-xs font-archivo font-bold text-white tracking-wider select-none uppercase">
                          {formatCurrency(product.price?.amount, product.price?.currency)}
                        </div>

                        {/* Interactive Image Carousel Navigation Buttons */}
                        {hasMultipleImages && (
                          <>
                            {/* Left Arrow */}
                            <button
                              onClick={(e) => handlePrevImage(product._id, productImages.length, e)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-none bg-black/40 border border-gray-800/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-[#ff5a4a] hover:border-[#ff5a4a] transition-all duration-200"
                              aria-label="Previous Image"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>

                            {/* Right Arrow */}
                            <button
                              onClick={(e) => handleNextImage(product._id, productImages.length, e)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-none bg-black/40 border border-gray-800/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-[#ff5a4a] hover:border-[#ff5a4a] transition-all duration-200"
                              aria-label="Next Image"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>

                            {/* Bullet Carousel Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1.5 rounded-full select-none">
                              {productImages.map((_, idx) => (
                                <span
                                  key={idx}
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === activeIndex ? 'w-4 bg-[#ff5a4a]' : 'w-1.5 bg-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Card Information Panel */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          {/* Publish Date */}
                          <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest font-inter">
                            LISTED {formatDate(product.createdAt)}
                          </p>
                          {/* Product Title */}
                          <h4 className="font-archivo text-xl font-bold uppercase tracking-tight text-white line-clamp-1 group-hover:text-[#ff5a4a] transition-colors duration-200">
                            {product.name}
                          </h4>
                          {/* Description */}
                          <p className="text-gray-400 font-inter text-[12px] leading-relaxed line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        {/* Interactive Footer & Actions Placeholder */}
                        <div className="pt-4 border-t border-gray-900 flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 font-inter font-semibold uppercase tracking-wider">
                            Images: {productImages.length}
                          </span>
                          
                          <div className="flex items-center gap-3">
                            {/* Sleek Action Buttons Placeholder */}
                            <button
                              onClick={() => navigate(`/seller/add-product`)}
                              className="text-gray-500 hover:text-white transition-colors duration-200"
                              title="Edit Listing (Redirect to create)"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              className="text-gray-500 hover:text-[#ff5a4a] transition-colors duration-200 cursor-not-allowed opacity-60"
                              title="Delete Listing (Feature Coming Soon)"
                              disabled
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
