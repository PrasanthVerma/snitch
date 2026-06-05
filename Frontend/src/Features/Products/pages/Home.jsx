import React, { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { toggleTheme } from "../../../App/theme.slice.js"
import { useNavigate, Link } from "react-router"
import { useProduct } from "../hooks/useProduct.js"
import { useAuth } from '../../Auth/hooks/useAuth.js'

const Home = () => {
  const navigate = useNavigate()
  const products = useSelector((state) => state.product.allProducts) || []
  const user = useSelector((state) => state.auth.user)
  const { handleFetchAllProducts } = useProduct()
  const {handleLogout} = useAuth()
  const dispatch = useDispatch()

  const isDarkMode = useSelector((state) => state.theme.isDarkMode)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'oldest', 'price-desc', 'price-asc'
  
  // Interactive carousel index state per product card
  const [imageIndices, setImageIndices] = useState({}) // { [productId]: currentImageIndex }

  useEffect(() => {
    handleFetchAllProducts()
  }, [])

  // ─── Computations & Filtering ──────────────────────────────────
  const filteredAndSortedProducts = useMemo(() => {
    let result = []

    products.forEach((product) => {
      // Add base product
      result.push(product)

      // Add variants if any
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          let attrString = ''
          if (variant.attributes) {
            const vals = variant.attributes instanceof Map 
              ? Array.from(variant.attributes.values())
              : Object.values(variant.attributes)
            if (vals.length > 0) {
              attrString = ` (${vals.join(' / ')})`
            }
          }

          result.push({
            ...product,
            _id: `${product._id}-${variant._id}`,
            isVariant: true,
            parentProductId: product._id,
            variantId: variant._id,
            name: `${product.name}${attrString}`,
            price: variant.price || product.price,
            images: variant.images && variant.images.length > 0 ? variant.images : product.images,
          })
        })
      }
    })

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      )
    }

    // Sort criteria
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0))
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0))
    }

    return result
  }, [products, searchQuery, sortBy])

  // Helper to format currency
  const formatCurrency = (amount, currency = 'INR') => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
      }).format(amount)
    } catch (e) {
      return `${currency} ${amount}`
    }
  }

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // ─── Multi-Image Carousel Handlers ─────────────────────────────
  const handleNextImage = (productId, imagesCount, e) => {
    e.stopPropagation()
    e.preventDefault()
    setImageIndices((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imagesCount,
    }))
  }

  const handlePrevImage = (productId, imagesCount, e) => {
    e.stopPropagation()
    e.preventDefault()
    setImageIndices((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + imagesCount) % imagesCount,
    }))
  }

  return (
    <div className={`min-h-screen flex flex-col font-luxury-sans transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#111111]'
    }`}>
      
      {/* ═══════════════════════════════════════════════════════════
          GLOBAL HEADER (NAVIGATION BAR)
      ════════════════════════════════════════════════════════════ */}
      <header className={`w-full sticky top-0 z-50 border-b transition-colors duration-500 backdrop-blur-md ${
        isDarkMode ? 'bg-[#0A0A0A]/90 border-white/5' : 'bg-[#FAFAFA]/90 border-[#E5E5EA]'
      }`}>
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 md:px-12 py-5 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex flex-col select-none group">
            <h1 className={`text-xl sm:text-2xl font-luxury-serif font-light tracking-[0.18em] uppercase ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}>
              LUXORA
            </h1>
            <span className="text-[7px] font-medium tracking-[0.32em] text-[#C5A880] uppercase mt-0.5">
              PREMIUM CLOTHING
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold tracking-widest uppercase">
            {['Catalog', 'Collections', 'About', 'Contact'].map((navLink) => (
              <a
                key={navLink}
                href="#catalog"
                className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                {navLink}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-full border transition-all duration-300 ${
                isDarkMode
                  ? 'bg-[#151515] border-[#2C2C2E] text-yellow-500 hover:bg-[#1E1E1E]'
                  : 'bg-white border-[#E5E5EA] text-[#636366] hover:bg-[#F2F2F7]'
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

            {/* Dashboard Shortcut link (if authenticated as seller/user) */}
            {user?.role === 'seller' ? (
              <Link
                to="/seller/dashboard"
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 hidden sm:inline-flex ${
                  isDarkMode
                    ? 'bg-[#151515] border border-[#2C2C2E] text-[#C5A880] hover:bg-[#1E1E1E]'
                    : 'bg-white border border-[#E5E5EA] text-black hover:bg-[#F2F2F7]'
                }`}
              >
                Seller Portal
              </Link>
            ) : null}

            {/* Login/Logout Button */}
            {user ? (
              <button
                onClick={handleLogout}
                className={`px-5 py-2 rounded-xl font-medium text-xs tracking-wider transition-all duration-300 select-none cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#C5A880] text-[#0A0A0A] hover:bg-[#D9C3A5]'
                    : 'bg-black text-white hover:bg-[#1C1C1E]'
                }`}
              >
                Log Out
              </button>
            ) : (
              <Link
                to="/login"
                className={`px-5 py-2 rounded-xl font-medium text-xs tracking-wider transition-all duration-300 select-none ${
                  isDarkMode
                    ? 'bg-[#C5A880] text-[#0A0A0A] hover:bg-[#D9C3A5]'
                    : 'bg-black text-white hover:bg-[#1C1C1E]'
                }`}
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          EDITORIAL HERO SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="w-full relative overflow-hidden bg-[#0A0A0A] select-none h-[520px] sm:h-[600px] flex items-center">
        {/* Custom Campaign Image background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85 transition-transform duration-10000 ease-out scale-102 hover:scale-105"
          style={{ backgroundImage: "url('/luxora_login_bg.png')" }}
        ></div>

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-[#0A0A0A]/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 via-[#0A0A0A]/30 to-transparent"></div>

        {/* Content container */}
        <div className="max-w-[1240px] mx-auto w-full px-6 sm:px-8 md:px-12 z-10 flex flex-col items-start text-left">
          <span className="text-[10px] font-bold tracking-[0.35em] text-[#C5A880] uppercase mb-4 animate-fade-in">
            New Arrivals
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-luxury-serif font-light leading-[1.1] text-white max-w-[580px]">
            Elevate Your Style.
          </h2>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-luxury-serif font-light leading-[1.1] text-[#C5A880] mt-2 max-w-[580px]">
            Every Day.
          </h2>
          <p className="text-xs sm:text-sm text-[#E5E5EA] font-light mt-6 max-w-[420px] leading-relaxed opacity-85">
            Discover a curated capsule of high-fashion garments crafted for comfort, tailored for luxury, and built for confidence.
          </p>

          <div className="flex items-center gap-4 mt-10">
            <a
              href="#catalog"
              className="px-8 py-3.5 rounded-xl font-medium text-xs tracking-wider bg-[#C5A880] text-black hover:bg-[#D9C3A5] transition-all duration-300 shadow-[0_4px_20px_rgba(197,168,128,0.25)]"
            >
              Shop Collection
            </a>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SEARCHABLE PRODUCT CATALOG SECTION
      ═════════════════════════════════════════════════════════ */}
      <section id="catalog" className="max-w-[1240px] mx-auto w-full px-6 sm:px-8 md:px-12 py-16 flex-1 flex flex-col gap-10">
        
        {/* Section Heading & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-dashed border-gray-500/10">
          <div className="flex flex-col">
            <h3 className={`text-2xl sm:text-3xl font-luxury-serif font-light tracking-wide ${
              isDarkMode ? 'text-white' : 'text-[#111111]'
            }`}>
              Curated Listings
            </h3>
            <span className={`text-xs font-light mt-1.5 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
              Premium clothing items listed in the Luxora catalog
            </span>
          </div>

          {/* Search, Sort, Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            {/* Search Input Box */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E93]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs py-2.5 pl-10 pr-8 rounded-lg border focus:outline-none focus:ring-2 transition-all font-light ${
                  isDarkMode
                    ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-[#555558] focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                    : 'bg-white border-[#E5E5EA] text-black placeholder-[#AEAEB2] focus:border-black focus:ring-black/5'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8E8E93] hover:text-[#AEAEB2] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Listings Display Grid */}
        {filteredAndSortedProducts.length === 0 ? (
          /* Empty Catalog state */
          <div className={`py-20 rounded-2xl border text-center flex flex-col items-center justify-center transition-colors ${
            isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
          }`}>
            <div className="p-4 rounded-full bg-white/5 border border-white/10 text-gray-500 mb-6 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h4 className="text-base font-semibold tracking-wide uppercase">No garments listed</h4>
            <p className={`text-xs font-light max-w-sm mt-2 leading-relaxed px-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {searchQuery ? "We couldn't find items in the collection matching your search." : "Luxora's capsule collection is currently blank. Check back soon for catalog additions!"}
            </p>
          </div>
        ) : (
          /* Grid list products cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedProducts.map((product) => {
              const productImages = product.images || []
              const activeIndex = imageIndices[product._id] || 0
              const hasMultiple = productImages.length > 1

              return (
                <article
                  onClick={() => {
                    if (product.isVariant) {
                      navigate(`/product/${product.parentProductId}?v=${product.variantId}`)
                    } else {
                      navigate(`/product/${product._id}`)
                    }
                  }}
                  key={product._id}
                  className={`group border rounded-2xl overflow-hidden flex flex-col relative transition-all duration-500 ${
                    isDarkMode ? 'bg-[#0D0D0D] border-white/5 hover:border-[#C5A880]/30' : 'bg-white border-[#E5E5EA] hover:border-black/20'
                  }`}
                >
                  {/* Image container frame */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#151515]/10 shrink-0 select-none">
                    {productImages.length > 0 ? (
                      <img
                        src={productImages[activeIndex]?.url}
                        alt={`${product.name} display ${activeIndex + 1}`}
                        className="w-full h-full object-contain bg-black/5 dark:bg-[#151515] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-6">
                        🏷️
                      </div>
                    )}

                    {/* Pricing Overlay Badge */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-white tracking-wider select-none rounded-lg">
                      {formatCurrency(product.price?.amount, product.price?.currency)}
                    </div>

                    {/* Image Carousel next/prev arrows */}
                    {hasMultiple && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handlePrevImage(product._id, productImages.length, e)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#C5A880] hover:text-black hover:border-none"
                          aria-label="Previous Image"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleNextImage(product._id, productImages.length, e)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#C5A880] hover:text-black hover:border-none"
                          aria-label="Next Image"
                        >
                          ›
                        </button>

                        {/* Carousel Indicators bullets */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          {productImages.map((_, idx) => (
                            <span
                              key={idx}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === activeIndex ? 'w-4 bg-[#C5A880]' : 'w-1.5 bg-gray-500'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Product card body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block leading-none">
                        CURATED LISTING
                      </span>
                      <h4 className={`text-base font-semibold truncate leading-snug group-hover:text-[#C5A880] transition-colors ${
                        isDarkMode ? 'text-white' : 'text-black'
                      }`}>
                        {product.name}
                      </h4>
                      <p className={`text-xs font-light line-clamp-2 leading-relaxed ${
                        isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'
                      }`}>
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-gray-500/5 flex items-center justify-between">
                      <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">
                        Images: {productImages.length}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => navigate('/login')} // Point mock detail button to checkout/auth portal
                        className={`text-[10px] font-bold tracking-wider uppercase group-hover:underline ${
                          isDarkMode ? 'text-[#C5A880]' : 'text-black'
                        }`}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TRUST GUARANTEE FOOTER
      ════════════════════════════════════════════════════════════ */}
      <footer className={`w-full py-12 px-6 sm:px-8 md:px-12 border-t mt-auto transition-colors duration-500 ${
        isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
      }`}>
        <div className="max-w-[1240px] mx-auto flex flex-col gap-10">
          {/* Trust badges grid row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center pb-8 border-b border-dashed border-gray-500/10">
            {/* Premium Quality */}
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C5A880] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>Premium Quality</span>
              <span className={`text-[9px] font-light mt-0.5 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>Finest materials</span>
            </div>
            {/* Secure Shopping */}
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C5A880] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>Secure Shopping</span>
              <span className={`text-[9px] font-light mt-0.5 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>100% protected</span>
            </div>
            {/* Easy Returns */}
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C5A880] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
              </svg>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>Easy Returns</span>
              <span className={`text-[9px] font-light mt-0.5 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>Hassle-free shopping</span>
            </div>
            {/* 24/7 Support */}
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C5A880] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M18.48 8.2c0-3.32-2.69-6-6-6s-6 2.68-6 6a6 6 0 00.32 1.93C6.73 10.15 6 11.5 6 13c0 2.21 1.79 4 4 4h.5v2H9c-.55 0-1 .45-1 1v1h8v-1c0-.55-.45-1-1-1h-1.5v-2h.5c2.21 0 4-1.79 4-4 0-1.5-.73-2.85-.8-2.87a6 6 0 00.28-1.93z" />
              </svg>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>24/7 Support</span>
              <span className={`text-[9px] font-light mt-0.5 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>We're here to help</span>
            </div>
          </div>

          {/* Footer Branding Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest select-none">
            <span>© 2026 LUXORA PREMIUM CLOTHING. ALL RIGHTS RESERVED.</span>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="hover:text-gray-300">Privacy Policy</a>
              <a href="#terms" className="hover:text-gray-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
