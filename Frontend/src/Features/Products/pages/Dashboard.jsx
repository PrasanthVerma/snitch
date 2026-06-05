import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../../App/theme.slice.js';
import { useProduct } from '../hooks/useProduct';

const Dashboard = () => {
  const navigate = useNavigate();
  const { handleFetchAllProductsOfSeller, handleDeleteProduct } = useProduct();
  const sellerProducts = useSelector((state) => state.product.sellerProducts) || [];
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // ─── Filter & Sort States ──────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'price-desc', 'price-asc'

  // ─── Interactive Multi-Image Index State per Product ───────────
  const [imageIndices, setImageIndices] = useState({}); // { [productId]: currentIndex }

  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  // Fetch seller products on mount
  useEffect(() => {
    handleFetchAllProductsOfSeller();
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

  // Helper values for mock metrics
  const mockOrders = useMemo(() => sellerProducts.length * 7 || 156, [sellerProducts]);
  const mockViews = useMemo(() => sellerProducts.length * 128 || 18432, [sellerProducts]);
  const mockEarnings = useMemo(() => totalValuation * 5.4 || 245680, [totalValuation]);

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row font-luxury-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#111111]'}`}>

      {/* ═══════════════════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════════════════════ */}
      <aside className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 p-8 shrink-0 select-none transition-colors duration-500 border-r ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
        }`}>
        {/* Navigation Section */}
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex flex-col">
            <h1 className={`text-2xl font-luxury-serif font-light tracking-[0.18em] uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>
              LUXORA
            </h1>
            <span className="text-[8px] font-medium tracking-[0.32em] text-[#C5A880] uppercase mt-1">
              PREMIUM CLOTHING
            </span>
          </div>

          {/* User Profile Card in Sidebar */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-[#151515] border-white/5' : 'bg-gray-50 border-[#E5E5EA]'
            }`}>
            <div className="w-9 h-9 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/30 text-[#C5A880] flex items-center justify-center font-bold text-xs shrink-0 select-none">
              {user?.fullname ? user.fullname.substring(0, 1).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-[11px] font-semibold tracking-wide truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {user?.fullname || 'Arjun Sharma'}
              </span>
              <span className="text-[9px] text-[#C5A880] font-medium tracking-wide flex items-center gap-1 mt-0.5">
                Verified Seller
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current text-amber-500" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.585a.75.75 0 011.026.22l.534.8A1 1 0 008.647 5h2.707a1 1 0 00.82-.4L12.707 3.8a.75.75 0 111.226.862l-.768 1.093A2.5 2.5 0 0111.138 7H8.862a2.5 2.5 0 01-2.027-1.245L6.048 4.61a.75.75 0 01.22-1.026zM5.83 8.12a.75.75 0 01.127 1.052l-2 2.625a.75.75 0 01-1.196-.913l2-2.625A.75.75 0 015.83 8.12zm8.34 0a.75.75 0 011.052.128l2 2.625a.75.75 0 01-1.196.913l-2-2.625a.75.75 0 01.144-1.041zM3 13a4 4 0 004 4h6a4 4 0 004-4v-1H3v1zm0-3h14V9H3v1z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-1">
            {[
              { label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', path: '/seller/dashboard', active: true },
              { label: 'Inventory', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', active: false },
              { label: 'Add Product', icon: 'M12 4v16m8-8H4', path: '/seller/add-product', active: false },
              { label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', badge: 12, active: false },
              { label: 'Earnings', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', active: false },
              { label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm0 0h5a2 2 0 002-2v-3a2 2 0 00-2-2h-5M9 19h5M18 5v14a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2z', active: false },
              { label: 'Payouts', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', active: false },
              { label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', active: false }
            ].map((item, idx) => {
              const navContent = (
                <span className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-3.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded bg-orange-500 text-white font-bold text-[9px] font-mono leading-none">
                      {item.badge}
                    </span>
                  )}
                </span>
              );

              const className = `w-full flex items-center px-4 py-2.5 text-xs tracking-wider font-medium rounded-xl transition-all duration-300 ${item.active
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
          className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider transition-colors duration-300 rounded-xl ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Link>
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          MAIN WORKSPACE
      ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Mobile Navigation Header ── */}
        <header className={`lg:hidden flex items-center justify-between px-6 py-5 border-b shrink-0 transition-colors ${isDarkMode ? 'bg-[#110d0d] border-white/5' : 'bg-white border-[#E5E5EA]'
          }`}>
          <div className="flex flex-col">
            <span className="text-xl font-luxury-serif tracking-[0.15em] text-[#C5A880] uppercase">LUXORA</span>
            <span className="text-[8px] tracking-[0.2em] opacity-60 uppercase">Premium Clothing</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/seller/add-product"
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${isDarkMode ? 'bg-[#C5A880] text-black hover:bg-[#D9C3A5]' : 'bg-black text-white hover:bg-[#1C1C1E]'
                }`}
            >
              + Create
            </Link>
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-1 text-gray-500 hover:text-white"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* ── Main Dashboard Workspace Frame ── */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 md:px-12 py-10">
          <div className="max-w-[1240px] mx-auto flex flex-col gap-10">

            {/* Top Workspace Header (Greeting & CTAs) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-dashed border-gray-500/10">
              <div className="flex flex-col">
                <h2 className={`text-2xl sm:text-3xl font-luxury-serif font-light tracking-wide flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#111111]'
                  }`}>
                  Welcome back, {user?.fullname?.split(' ')[0] || 'Arjun'} 👋
                </h2>
                <span className={`text-xs font-light mt-1.5 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                  Here's what's happening with your store today.
                </span>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Theme Toggler */}
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className={`p-2 rounded-full border transition-all duration-300 ${isDarkMode
                    ? 'bg-[#151515] border-[#2C2C2E] text-yellow-500 hover:bg-[#1E1E1E]'
                    : 'bg-white border-[#E5E5EA] text-[#636366] hover:bg-[#F2F2F7]'
                    }`}
                  aria-label="Toggle Theme"
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

                {/* Notifications bell */}
                <button className={`p-2 rounded-full border relative ${isDarkMode ? 'bg-[#151515] border-[#2C2C2E] text-white' : 'bg-white border-[#E5E5EA] text-black'
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500"></span>
                </button>

                {/* Add Product CTA */}
                <Link
                  to="/seller/add-product"
                  className={`px-5 py-2.5 rounded-xl font-medium text-xs tracking-wider flex items-center gap-2 transition-all duration-300 cursor-pointer select-none ${isDarkMode
                    ? 'bg-[#C5A880] text-[#0A0A0A] hover:bg-[#D9C3A5] shadow-[0_4px_16px_rgba(197,168,128,0.2)]'
                    : 'bg-black text-white hover:bg-[#1C1C1E] shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </Link>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════
                METRIC CARDS ROW (4 Columns Grid)
            ═════════════════════════════════════════════════════════ */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Card 1: Total Products */}
              <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
                }`}>
                <div className="flex flex-col gap-2 min-w-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                    Total Products
                  </span>
                  <span className={`text-3xl font-luxury-serif font-light ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                    {sellerProducts.length}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    12% vs last month
                  </span>
                </div>
                <div className="p-3.5 rounded-full bg-[#C5A880]/10 text-[#C5A880] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
                }`}>
                <div className="flex flex-col gap-2 min-w-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                    Total Orders
                  </span>
                  <span className={`text-3xl font-luxury-serif font-light ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                    {mockOrders}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    18% vs last month
                  </span>
                </div>
                <div className="p-3.5 rounded-full bg-[#C5A880]/10 text-[#C5A880] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Total Earnings */}
              <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
                }`}>
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                    Total Earnings
                  </span>
                  <span className={`text-2xl sm:text-3xl font-luxury-serif font-light truncate ${isDarkMode ? 'text-white' : 'text-[#111111]'}`} title={formatCurrency(mockEarnings)}>
                    {formatCurrency(mockEarnings)}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    22% vs last month
                  </span>
                </div>
                <div className="p-3.5 rounded-full bg-[#C5A880]/10 text-[#C5A880] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>

              {/* Card 4: Total Views */}
              <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
                }`}>
                <div className="flex flex-col gap-2 min-w-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                    Total Visits
                  </span>
                  <span className={`text-3xl font-luxury-serif font-light ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                    {mockViews.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    15% vs last month
                  </span>
                </div>
                <div className="p-3.5 rounded-full bg-[#C5A880]/10 text-[#C5A880] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════
                SPLIT CONTAINER: LEFT TABLE & RIGHT ANALYTICAL SIDE WIDGETS
            ═════════════════════════════════════════════════════════ */}
            <div className="flex flex-col lg:flex-row gap-8 sm:gap-10">

              {/* LEFT COLUMN: Searchable Products Table (70% Width) */}
              <div className="w-full lg:w-[68%] xl:w-[70%] flex flex-col gap-6">
                <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
                  }`}>
                  {/* Table Header Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-dashed border-gray-500/10">
                    <div className="flex flex-col">
                      <h3 className={`text-base font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        Your Products
                      </h3>
                      <span className={`text-[10px] sm:text-xs font-light mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Manage and monitor all the products in your store.
                      </span>
                    </div>

                    {/* Inline search bar */}
                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                      {/* Search wrapper */}
                      <div className="relative w-full sm:w-56">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E8E93]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`w-full text-xs py-2 pl-9 pr-8 rounded-lg border focus:outline-none focus:ring-2 transition-all font-light ${isDarkMode
                            ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-[#555558] focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                            : 'bg-white border-[#E5E5EA] text-black placeholder-[#AEAEB2] focus:border-black focus:ring-black/5'
                            }`}
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8E8E93] hover:text-[#AEAEB2] transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Sorting Filter Selector */}
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className={`text-xs py-2 pl-3.5 pr-8 rounded-lg border focus:outline-none focus:ring-2 font-medium cursor-pointer appearance-none ${isDarkMode
                            ? 'bg-[#151515] border-[#2C2C2E] text-white focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                            : 'bg-white border-[#E5E5EA] text-[#333333] focus:border-black focus:ring-black/5'
                            }`}
                        >
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                          <option value="price-desc">Price: High-Low</option>
                          <option value="price-asc">Price: Low-High</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8E8E93]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products Table */}
                  {filteredAndSortedProducts.length === 0 ? (
                    <div className="py-16 text-center flex flex-col items-center justify-center">
                      <div className="p-4 rounded-full bg-white/5 border border-white/10 text-gray-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold tracking-wide uppercase">No listings found</h4>
                      <p className={`text-xs font-light max-w-xs mt-1.5 leading-relaxed ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {searchQuery ? "We couldn't find items matching your search. Try adjusting the query." : "List your first item to begin cataloging products."}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'border-white/5 text-[#8E8E93]' : 'border-[#E5E5EA] text-[#636366]'
                            }`}>
                            <th className="pb-3.5 pr-4 font-bold">Product</th>
                            <th className="pb-3.5 px-4 font-bold">Price</th>
                            <th className="pb-3.5 px-4 font-bold text-center">Stock</th>
                            <th className="pb-3.5 px-4 font-bold text-center">Orders</th>
                            <th className="pb-3.5 px-4 font-bold text-center">Status</th>
                            <th className="pb-3.5 px-4 font-bold">Created At</th>
                            <th className="pb-3.5 pl-4 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-500/5 text-xs font-light">
                          {filteredAndSortedProducts.map((product) => {
                            const productImages = product.images || [];
                            const activeIndex = imageIndices[product._id] || 0;
                            const hasMultiple = productImages.length > 1;

                            // Seed values based on product ID hash to look realistic
                            const codeSeed = product._id?.substring(product._id.length - 4) || 'a1b2';
                            const intSeed = parseInt(codeSeed, 16) || 45;
                            const seededStock = (intSeed % 35) + 15;
                            const seededOrders = (intSeed % 25) + 8;

                            return (
                              <tr key={product._id} className="hover:bg-gray-500/5 transition-colors group">
                                {/* Thumbnail + Title */}
                                <td className="py-4 pr-4">
                                  <div className="flex items-center gap-3 min-w-[200px]">
                                    {/* square thumbnail carousel container */}
                                    <div className="w-10 h-12 rounded bg-gray-500/10 border border-gray-500/10 overflow-hidden relative shrink-0 select-none">
                                      {productImages.length > 0 ? (
                                        <img
                                          src={productImages[activeIndex]?.url}
                                          alt={`Thumbnail index ${activeIndex + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                          🏷️
                                        </div>
                                      )}

                                      {/* mini carousel arrows on thumbnail hover */}
                                      {hasMultiple && (
                                        <div className="absolute inset-0 flex items-center justify-between px-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                          <button
                                            type="button"
                                            onClick={(e) => handlePrevImage(product._id, productImages.length, e)}
                                            className="w-3.5 h-3.5 rounded bg-black/50 text-white flex items-center justify-center font-bold text-[8px]"
                                          >
                                            ‹
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => handleNextImage(product._id, productImages.length, e)}
                                            className="w-3.5 h-3.5 rounded bg-black/50 text-white flex items-center justify-center font-bold text-[8px]"
                                          >
                                            ›
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                        {product.name}
                                      </span>
                                      <span className={`text-[10px] font-mono mt-0.5 truncate select-all opacity-60`}>
                                        ID: {product._id}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Price */}
                                <td className="py-4 px-4 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                      {formatCurrency(product.price?.amount, product.price?.currency)}
                                    </span>
                                    <span className="text-[9px] opacity-60 uppercase">{product.price?.currency || 'INR'}</span>
                                  </div>
                                </td>

                                {/* Stock */}
                                <td className="py-4 px-4 text-center font-medium font-mono text-gray-400">
                                  {seededStock}
                                </td>


                                {/* Orders */}
                                <td className="py-4 px-4 text-center font-medium font-mono text-gray-400">
                                  {seededOrders}
                                </td>

                                {/* Status */}
                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-semibold leading-none">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                    Published
                                  </span>
                                </td>

                                {/* Created At */}
                                <td className="py-4 px-4 whitespace-nowrap text-gray-400 font-medium">
                                  {formatDate(product.createdAt)}
                                </td>

                                {/* Actions */}
                                <td className="py-4 pl-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/seller/update-product/${product._id}`)}
                                      className={`p-1.5 rounded transition-all ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-gray-100'
                                        }`}
                                      title="Edit Product"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProduct(product._id)}
                                      className={`p-1.5 text-gray-600 opacity-40`}
                                      title="Delete Listing"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigate(`/seller/${product._id}/add-variant`)
                                      }}
                                      className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-lg border transition-all ${
                                        isDarkMode
                                          ? 'border-[#C5A880]/30 text-[#C5A880] hover:bg-[#C5A880]/10'
                                          : 'border-black/25 text-black hover:bg-black/5'
                                      }`}
                                      title="Add Variant Options"
                                    >
                                      + Variant
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Footer */}
                  {filteredAndSortedProducts.length > 0 && (
                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t ${isDarkMode ? 'border-white/5' : 'border-[#E5E5EA]'
                      }`}>
                      <span className={`text-[11px] font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Showing 1 to {filteredAndSortedProducts.length} of {sellerProducts.length} products
                      </span>

                      {/* Pagination Controls representation */}
                      <div className="flex items-center gap-1.5 select-none self-end sm:self-center">
                        <button disabled className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-semibold opacity-40 cursor-not-allowed ${isDarkMode ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]'
                          }`}>
                          ‹
                        </button>
                        <button className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${isDarkMode ? 'bg-[#C5A880] text-black' : 'bg-black text-white'
                          }`}>
                          1
                        </button>
                        <button disabled className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-semibold opacity-40 cursor-not-allowed ${isDarkMode ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]'
                          }`}>
                          2
                        </button>
                        <button disabled className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-semibold opacity-40 cursor-not-allowed ${isDarkMode ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]'
                          }`}>
                          3
                        </button>
                        <span className="text-gray-500 text-xs px-1">...</span>
                        <button disabled className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-semibold opacity-40 cursor-not-allowed ${isDarkMode ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]'
                          }`}>
                          5
                        </button>
                        <button disabled className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-semibold opacity-40 cursor-not-allowed ${isDarkMode ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]'
                          }`}>
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* RIGHT COLUMN: Sidebar Summary & Analytics widgets (30% Width) */}
              <div className="w-full lg:flex-1 flex flex-col gap-6">
                {/* WIDGET 1: Store Summary */}
                <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
                  }`}>
                  <div className="flex items-center gap-3.5 mb-5 pb-3.5 border-b border-dashed border-gray-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-[#C5A880]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                    <h4 className={`text-xs font-semibold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                      Store Summary
                    </h4>
                  </div>

                  <div className="space-y-4 text-xs font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Total Products</span>
                      <span className={isDarkMode ? 'text-white' : 'text-black'}>{sellerProducts.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Total Orders</span>
                      <span className={isDarkMode ? 'text-white' : 'text-black'}>{mockOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Total Earnings</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-[#C5A880]' : 'text-black'}`}>{formatCurrency(mockEarnings)}</span>
                    </div>

                    <button
                      type="button"
                      disabled
                      className={`w-full py-2.5 rounded-lg border text-[11px] font-semibold tracking-wide mt-4 flex items-center justify-center gap-2 cursor-not-allowed opacity-50 ${isDarkMode ? 'bg-[#151515] border-white/5 text-white' : 'bg-gray-50 border-[#E5E5EA] text-black'
                        }`}
                    >
                      View All Analytics
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* WIDGET 2: Top Performing Product Spotlight */}
                <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
                  }`}>
                  <div className="flex items-center gap-3.5 mb-5 pb-3.5 border-b border-dashed border-gray-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-[#C5A880]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h4 className={`text-xs font-semibold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                      Top Performing Product
                    </h4>
                  </div>

                  {latestProduct ? (
                    <div className="space-y-4">
                      {/* Product Spotlight card */}
                      <div className="flex gap-3">
                        <div className="w-12 h-14 rounded bg-gray-500/10 border border-gray-500/10 overflow-hidden shrink-0">
                          {latestProduct.images?.length > 0 ? (
                            <img
                              src={latestProduct.images[0]?.url}
                              alt={latestProduct.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              🏷️
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 justify-center">
                          <span className={`text-xs font-semibold truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            {latestProduct.name}
                          </span>
                          <span className="text-[10px] text-[#C5A880] mt-0.5 leading-none">
                            {formatCurrency(latestProduct.price?.amount, latestProduct.price?.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Performance Specs */}
                      <div className="grid grid-cols-3 gap-2 text-center pt-2 select-none">
                        <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-[#151515] border-white/5' : 'bg-gray-50 border-[#E5E5EA]'}`}>
                          <span className="block text-[8px] text-gray-500 uppercase tracking-wide">Views</span>
                          <span className={`block text-xs font-bold font-mono mt-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>2,345</span>
                        </div>
                        <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-[#151515] border-white/5' : 'bg-gray-50 border-[#E5E5EA]'}`}>
                          <span className="block text-[8px] text-gray-500 uppercase tracking-wide">Orders</span>
                          <span className={`block text-xs font-bold font-mono mt-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>32</span>
                        </div>
                        <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-[#151515] border-white/5' : 'bg-gray-50 border-[#E5E5EA]'}`}>
                          <span className="block text-[8px] text-gray-500 uppercase tracking-wide">Earnings</span>
                          <span className="block text-[10px] font-bold font-mono mt-0.5 text-emerald-500">₹63,968</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/seller/add-product')}
                        className={`w-full py-2.5 rounded-lg border text-[11px] font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${isDarkMode ? 'bg-[#151515] border-white/5 text-white hover:bg-white/5' : 'bg-gray-50 border-[#E5E5EA] text-black hover:bg-gray-100'
                          }`}
                      >
                        View Product
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <p className={`text-xs font-light text-center py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      No listings available
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
