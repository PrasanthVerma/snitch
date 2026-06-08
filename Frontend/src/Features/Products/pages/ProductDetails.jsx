import React, { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { toggleTheme } from "../../../App/theme.slice.js"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { useProduct } from "../hooks/useProduct.js"
import { useAuth } from '../../Auth/hooks/useAuth.js'
import { useCart } from "../../Cart/hooks/useCart.js"

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { handleFetchProductById, handleFetchAllProducts } = useProduct()
  const { handleLogout } = useAuth()
  const { handleGetCart, handleAddToCart } = useCart()
  const dispatch = useDispatch()

  const [product, setProduct] = useState(null)
  const isDarkMode = useSelector((state) => state.theme.isDarkMode)
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Black')
  const [accordion, setAccordion] = useState({
    details: true,
    shipping: false,
    returns: false,
  })

  const user = useSelector((state) => state.auth.user)
  const allProducts = useSelector((state) => state.product.allProducts) || []
  const cartItems = useSelector((state) => state.cart.items) || []
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const [selectedVariant, setSelectedVariant] = useState(null)
  const activeVariantId = searchParams.get('variant')

  async function fetchProductDetails() {
    try {
      const productData = await handleFetchProductById(id)
      setProduct(productData)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchProductDetails()
    handleFetchAllProducts()
    if (user) {
      handleGetCart()
    }
  }, [id, user])

  // Sync selected variant with query parameter
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      if (activeVariantId) {
        const found = product.variants.find((v) => v._id === activeVariantId)
        if (found) {
          setSelectedVariant(found)
          setActiveImgIndex(0)
          return
        }
      }
    }
    setSelectedVariant(null)
    setActiveImgIndex(0)
  }, [activeVariantId, product])

  // Recommendations slice
  const recommendations = useMemo(() => {
    return allProducts
      .filter((p) => p._id !== id)
      .slice(0, 4)
  }, [allProducts, id])

  // Handle dynamic variant images fallback to product images
  const productImages = useMemo(() => {
    if (!product) return [{ url: '/luxora_login_bg.png' }]
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images
    }
    return product.images && product.images.length > 0
      ? product.images
      : [{ url: '/luxora_login_bg.png' }]
  }, [product, selectedVariant])

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

  const toggleAccordion = (key) => {
    setAccordion((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!product) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-black'
        }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#C5A880]/30 border-t-[#C5A880] rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold">Loading details...</span>
        </div>
      </div>
    )
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const colors = [
    { name: 'Black', hex: '#111111' },
    { name: 'Brown', hex: '#5C4033' },
    { name: 'Blue', hex: '#2C3E50' }
  ]

  // Calculate dynamic variant price / stock fallback to product
  const priceAmount = selectedVariant ? (selectedVariant.price?.amount || 0) : (product.price?.amount || 0)
  const priceCurrency = selectedVariant ? (selectedVariant.price?.currency || 'INR') : (product.price?.currency || 'INR')
  const mrpAmount = Math.round(priceAmount * 1.5)
  const discountPercent = 33

  const isOutOfStock = selectedVariant
    ? (selectedVariant.stock ?? 0) <= 0
    : product.variants && product.variants.length > 0
      ? product.variants.every((v) => (v.stock ?? 0) <= 0)
      : false

  const stockCount = selectedVariant ? selectedVariant.stock : null

  return (
    <div className={`min-h-screen flex flex-col font-luxury-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#111111]'
      }`}>

      {/* Announcement top bar */}
      <div className="w-full bg-[#111111] text-[#E5E5EA] py-2 px-4 text-center text-[10px] font-semibold tracking-[0.2em] uppercase select-none">
        FREE SHIPPING ON ORDERS ABOVE {formatCurrency(1499, 'INR')} | EASY RETURNS
      </div>

      {/* Global Navigation Header */}
      <header className={`w-full sticky top-0 z-50 border-b transition-colors duration-500 backdrop-blur-md ${isDarkMode ? 'bg-[#0A0A0A]/90 border-white/5' : 'bg-[#FAFAFA]/90 border-[#E5E5EA]'
        }`}>
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 md:px-12 py-5 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex flex-col select-none group">
            <h1 className={`text-xl sm:text-2xl font-luxury-serif font-light tracking-[0.18em] uppercase ${isDarkMode ? 'text-white' : 'text-black'
              }`}>
              LUXORA
            </h1>
            <span className="text-[7px] font-medium tracking-[0.32em] text-[#C5A880] uppercase mt-0.5">
              PREMIUM CLOTHING
            </span>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold tracking-widest uppercase">
            {['Men', 'Women', 'New In', 'Collections', 'Sale'].map((navLink) => (
              <Link
                key={navLink}
                to="/"
                className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                  }`}
              >
                {navLink}
              </Link>
            ))}
          </nav>

          {/* Search bar & Right Controls */}
          <div className="flex items-center gap-4">
            {/* Search Input Box */}
            <div className="relative hidden lg:block w-56">
              <input
                type="text"
                placeholder="Search for products..."
                className={`w-full text-[11px] py-2 pl-4 pr-9 rounded-full border focus:outline-none transition-all font-light ${isDarkMode
                  ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-gray-600 focus:border-[#C5A880]'
                  : 'bg-white border-[#E5E5EA] text-black placeholder-gray-400 focus:border-black'
                  }`}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Wishlist icon button */}
            <button className="p-2 rounded-full hover:bg-white/5 transition-all text-gray-400 hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Cart Icon with badge */}
            <Link to="/cart" className="p-2 rounded-full relative text-gray-400 hover:text-white block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#C5A880] text-black text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle Button */}
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

            {/* Seller Portal Link */}
            {user?.role === 'seller' ? (
              <Link
                to="/seller/dashboard"
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 hidden sm:inline-flex ${isDarkMode
                  ? 'bg-[#151515] border border-[#2C2C2E] text-[#C5A880] hover:bg-[#1E1E1E]'
                  : 'bg-white border border-[#E5E5EA] text-black hover:bg-[#F2F2F7]'
                  }`}
              >
                Seller Portal
              </Link>
            ) : null}

            {/* Log In / Log Out */}
            {user ? (
              <button
                onClick={handleLogout}
                className={`px-5 py-2 rounded-xl font-medium text-xs tracking-wider transition-all duration-300 select-none cursor-pointer ${isDarkMode
                  ? 'bg-[#C5A880] text-[#0A0A0A] hover:bg-[#D9C3A5]'
                  : 'bg-black text-white hover:bg-[#1C1C1E]'
                  }`}
              >
                Log Out
              </button>
            ) : (
              <Link
                to="/login"
                className={`px-5 py-2 rounded-xl font-medium text-xs tracking-wider transition-all duration-300 select-none ${isDarkMode
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

      {/* Main product details frame */}
      <main className="max-w-[1240px] mx-auto w-full px-6 sm:px-8 md:px-12 py-10 flex-1 flex flex-col gap-12">
        {/* Breadcrumb navigation */}
        <nav className={`text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
          <Link to="/" className="hover:text-[#C5A880] transition-colors">Home</Link>
          <span>/</span>
          <span className="hover:text-[#C5A880] transition-colors">Catalog</span>
          <span>/</span>
          <span className={isDarkMode ? 'text-white' : 'text-black'}>{product.name}</span>
        </nav>

        {/* Split grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

          {/* LEFT: Image Gallery Display (7 columns) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">

            {/* Vertical thumbnails */}
            <div className="hidden md:flex flex-col gap-3 w-20 shrink-0 select-none">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`aspect-[3/4] rounded-lg overflow-hidden border transition-all duration-300 ${idx === activeImgIndex
                    ? 'border-[#C5A880] scale-102 ring-1 ring-[#C5A880]'
                    : isDarkMode
                      ? 'border-white/5 opacity-55 hover:opacity-100'
                      : 'border-[#E5E5EA] opacity-60 hover:opacity-100'
                    }`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Display frame */}
            <div className={`flex-1 aspect-[3/4] rounded-2xl overflow-hidden relative border transition-all duration-300 select-none ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
              }`}>
              <img
                src={productImages[activeImgIndex]?.url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-102"
              />

              {/* Expand caret icon top-right */}
              <button className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#C5A880] hover:text-black hover:border-none transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
            </div>
          </div>

          {/* RIGHT: Product specifications (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Headers, Title, Ratings */}
            <div className="space-y-3">
              <span className="inline-flex bg-[#C5A880]/15 border border-[#C5A880]/25 text-[#C5A880] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded">
                New Arrival
              </span>
              <h2 className={`text-3xl sm:text-4xl font-luxury-serif font-light leading-tight ${isDarkMode ? 'text-white' : 'text-black'
                }`}>
                {product.name}
              </h2>
              {/* Ratings */}
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500 text-sm">
                  {['★', '★', '★', '★', '☆'].map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                  4.7 (128 reviews)
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="py-4 border-y border-dashed border-gray-500/10 flex items-baseline gap-4">
              <span className={`text-2xl font-semibold tracking-wide ${isDarkMode ? 'text-[#C5A880]' : 'text-black'}`}>
                {formatCurrency(priceAmount, priceCurrency)}
              </span>
              <span className={`text-sm line-through ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {formatCurrency(mrpAmount, priceCurrency)}
              </span>
              <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider">
                {discountPercent}% OFF
              </span>
            </div>

            {/* Brief Description */}
            <p className={`text-xs font-light leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {product.description || "Classic capsule garments crafted from premium materials. Timeless visual aesthetics with a tailored, modern silhouette."}
            </p>

            {/* Real Variant Switcher (if product has variants) */}
            {product.variants && product.variants.length > 0 ? (
              <div className="space-y-3">
                <span className={`block text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                  Select Option:
                </span>
                <div className="flex flex-wrap gap-2">
                  {/* Default / Base Style */}
                  <button
                    type="button"
                    onClick={() => setSearchParams({})}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${!selectedVariant
                      ? isDarkMode
                        ? 'bg-[#C5A880] text-black border-none'
                        : 'bg-black text-white border-none'
                      : isDarkMode
                        ? 'border-[#2C2C2E] hover:border-gray-500 text-white bg-transparent hover:bg-white/5'
                        : 'border-[#E5E5EA] hover:border-black text-black bg-transparent hover:bg-black/5'
                      }`}
                  >
                    Default Style
                  </button>

                  {/* Dynamic Variant Options */}
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant && selectedVariant._id === v._id
                    const rawAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {})
                    const label = Object.entries(rawAttrs)
                      .map(([key, val]) => `${val}`)
                      .join(' / ')

                    return (
                      <button
                        type="button"
                        key={v._id}
                        onClick={() => setSearchParams({ variant: v._id })}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${isSelected
                          ? isDarkMode
                            ? 'bg-[#C5A880] text-black border-none'
                            : 'bg-black text-white border-none'
                          : isDarkMode
                            ? 'border-[#2C2C2E] hover:border-gray-500 text-white bg-transparent hover:bg-white/5'
                            : 'border-[#E5E5EA] hover:border-black text-black bg-transparent hover:bg-black/5'
                          }`}
                      >
                        {label || 'Variant'}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Color selection */}
                <div className="space-y-2.5">
                  <span className={`block text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}`}>
                    Color: {selectedColor}
                  </span>
                  <div className="flex items-center gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-7 h-7 rounded-full border transition-all duration-300 flex items-center justify-center p-0.5 ${selectedColor === color.name
                          ? 'border-[#C5A880] scale-105 ring-1 ring-[#C5A880]'
                          : isDarkMode
                            ? 'border-white/10 hover:border-white/30'
                            : 'border-gray-200 hover:border-gray-400'
                          }`}
                        style={{ backgroundColor: color.hex }}
                        aria-label={`Select ${color.name} color`}
                      >
                        {selectedColor === color.name && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size selection */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                    <span className={isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'}>Size:</span>
                    <button className="flex items-center gap-1 hover:underline text-[#C5A880]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${selectedSize === size
                          ? isDarkMode
                            ? 'bg-[#C5A880] text-black border-none'
                            : 'bg-black text-white border-none'
                          : isDarkMode
                            ? 'border-[#2C2C2E] hover:border-gray-500 text-white bg-transparent'
                            : 'border-[#E5E5EA] hover:border-black text-black bg-transparent'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Stock, Shipping info */}
            <div className="flex items-center gap-6 py-2 text-[10px] font-semibold tracking-wider uppercase text-gray-500 select-none">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                {isOutOfStock ? 'Out of Stock' : (stockCount !== null ? `In Stock (${stockCount} items)` : 'In Stock')}
              </div>
              <div className="flex items-center gap-1.5">
                📦 Ships in 1-2 days
              </div>
              <div className="flex items-center gap-1.5">
                🔄 Easy Returns
              </div>
            </div>

            {/* Action buttons (Add to Cart & Buy Now stacked or row) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              {/* Add to Cart */}
              <button
                type="button"
                onClick={() => { handleAddToCart(product._id, selectedVariant?._id || product._id) }}
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex justify-center items-center gap-2 select-none cursor-pointer ${isDarkMode
                  ? 'bg-[#C5A880] text-[#0A0A0A] hover:bg-[#D9C3A5] shadow-[0_4px_16px_rgba(197,168,128,0.25)]'
                  : 'bg-black text-white hover:bg-[#1C1C1E] shadow-[0_4px_16px_rgba(0,0,0,0.15)]'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </button>

              {/* Buy Now */}
              <button
                type="button"
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all duration-300 border flex justify-center items-center gap-2 select-none cursor-pointer ${isDarkMode
                  ? 'bg-transparent border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880]/5'
                  : 'bg-transparent border-black text-black hover:bg-black/5'
                  }`}
              >
                Buy Now
              </button>

              {/* Wishlist Icon */}
              <button
                type="button"
                className={`p-3.5 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 hover:text-red-500 ${isDarkMode
                  ? 'border-[#2C2C2E] text-white hover:bg-white/5'
                  : 'border-[#E5E5EA] text-black hover:bg-black/5'
                  }`}
                aria-label="Add to Wishlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Quick Guarantees panel */}
            <div className={`mt-2 p-4 rounded-xl border grid grid-cols-3 gap-2 text-center transition-colors duration-300 ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-gray-50 border-[#E5E5EA]'
              }`}>
              <div className="flex flex-col items-center">
                <span className="text-[14px] mb-1">🚚</span>
                <span className={`text-[9px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-black'}`}>Free Shipping</span>
                <span className="text-[8px] text-gray-500 font-light mt-0.5">On orders &gt; ₹1499</span>
              </div>
              <div className="flex flex-col items-center border-x border-gray-500/10 px-1">
                <span className="text-[14px] mb-1">🔄</span>
                <span className={`text-[9px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-black'}`}>Easy Returns</span>
                <span className="text-[8px] text-gray-500 font-light mt-0.5">Within 7 days</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[14px] mb-1">🔒</span>
                <span className={`text-[9px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-black'}`}>Secure Payment</span>
                <span className="text-[8px] text-gray-500 font-light mt-0.5">100% protected</span>
              </div>
            </div>

            {/* Accordion list */}
            <div className="mt-4 divide-y divide-gray-500/10">

              {/* Accordion Item 1: Product Details */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('details')}
                  className="w-full flex justify-between items-center text-left font-semibold uppercase tracking-wider text-[10px]"
                >
                  <span className={isDarkMode ? 'text-white' : 'text-black'}>Product Details</span>
                  <span className="text-gray-500">{accordion.details ? '−' : '+'}</span>
                </button>
                {accordion.details && (
                  <div className={`mt-3 space-y-2 text-[11px] font-light leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Seller ID: <span className="font-mono">{product.seller}</span></li>
                      <li>Item ID: <span className="font-mono">{product._id}</span></li>
                      <li>Created: {new Date(product.createdAt).toLocaleDateString()}</li>
                      <li>Updated: {new Date(product.updatedAt).toLocaleDateString()}</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion Item 2: Shipping & Delivery */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex justify-between items-center text-left font-semibold uppercase tracking-wider text-[10px]"
                >
                  <span className={isDarkMode ? 'text-white' : 'text-black'}>Shipping & Delivery</span>
                  <span className="text-gray-500">{accordion.shipping ? '−' : '+'}</span>
                </button>
                {accordion.shipping && (
                  <div className={`mt-3 text-[11px] font-light leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    We provide premium, express worldwide shipping. Orders are processed within 24-48 hours. Shipping takes 3-5 business days depending on location. Free shipping applies to orders above ₹1499.
                  </div>
                )}
              </div>

              {/* Accordion Item 3: Returns & Refunds */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('returns')}
                  className="w-full flex justify-between items-center text-left font-semibold uppercase tracking-wider text-[10px]"
                >
                  <span className={isDarkMode ? 'text-white' : 'text-black'}>Returns & Refunds</span>
                  <span className="text-gray-500">{accordion.returns ? '−' : '+'}</span>
                </button>
                {accordion.returns && (
                  <div className={`mt-3 text-[11px] font-light leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    If you are not completely satisfied with your purchase, you may return the item within 7 days of delivery for a full refund or exchange. Items must be unworn, tags attached, and in original packaging.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: "You may also like" slider section */}
        {recommendations.length > 0 && (
          <section className="pt-10 border-t border-dashed border-gray-500/10 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-luxury-serif font-light tracking-wide ${isDarkMode ? 'text-white' : 'text-black'
                }`}>
                You may also like
              </h3>

              {/* slider arrow navigation icon */}
              <button className={`p-2.5 rounded-full border transition-all duration-300 ${isDarkMode ? 'bg-[#151515] border-[#2C2C2E] text-white hover:bg-[#1E1E1E]' : 'bg-white border-[#E5E5EA] text-black hover:bg-[#F2F2F7]'
                }`} aria-label="Next slide">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {recommendations.map((item) => {
                const itemImages = item.images || []
                return (
                  <article
                    key={item._id}
                    onClick={() => {
                      setProduct(null)
                      navigate(`/product/${item._id}`)
                    }}
                    className={`group border rounded-xl overflow-hidden flex flex-col relative transition-all duration-500 cursor-pointer ${isDarkMode ? 'bg-[#0D0D0D] border-white/5 hover:border-[#C5A880]/30' : 'bg-white border-[#E5E5EA] hover:border-black/20'
                      }`}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#151515]/10 shrink-0">
                      {itemImages.length > 0 ? (
                        <img
                          src={itemImages[0]?.url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                          🏷️
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-white tracking-wider rounded">
                        {formatCurrency(item.price?.amount, item.price?.currency)}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className={`text-sm font-semibold truncate transition-colors group-hover:text-[#C5A880] ${isDarkMode ? 'text-white' : 'text-black'
                          }`}>
                          {item.name}
                        </h4>
                        <p className={`text-[11px] font-light line-clamp-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer copyright */}
      <footer className={`w-full py-8 px-6 border-t mt-auto text-center text-[10px] text-gray-500 uppercase tracking-widest ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
        }`}>
        © 2026 LUXORA PREMIUM CLOTHING. ALL RIGHTS RESERVED.
      </footer>
    </div>
  )
}

export default ProductDetails
