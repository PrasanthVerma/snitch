import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import { toggleTheme } from '../../../App/theme.slice.js'
import { useCart } from '../hooks/useCart'

const Cart = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, totalPrice } = useSelector((state) => state.cart)
  const isDarkMode = useSelector((state) => state.theme.isDarkMode)
  const user = useSelector((state) => state.auth.user)
  
  const { handleGetCart, handleRemoveFromCart, handleUpdateCartQuantity } = useCart()

  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      navigate('/login')
      return
    }
    handleGetCart()
  }, [user])

  // Formatting helper
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

  // Helper to extract variant details
  const getVariantDetails = (item) => {
    if (!item.variant || !item.product?.variants) return null
    if (Array.isArray(item.product.variants)) {
      return item.product.variants.find((v) => v._id === item.variant)
    }
    if (item.product.variants._id === item.variant) {
      return item.product.variants
    }
    return null
  }

  // Helper to get image for cart item
  const getItemImage = (item) => {
    const variant = getVariantDetails(item)
    if (variant && variant.images && variant.images.length > 0) {
      return variant.images[0].url
    }
    if (item.product?.images && item.product.images.length > 0) {
      return item.product.images[0].url
    }
    return '/luxora_login_bg.png'
  }

  // Helper to get display price
  const getItemPrice = (item) => {
    const variant = getVariantDetails(item)
    const amount = variant ? (variant.price?.amount || 0) : (item.price?.amount || 0)
    const currency = variant ? (variant.price?.currency || 'INR') : (item.price?.currency || 'INR')
    return { amount, currency }
  }

  const handleQuantityIncrement = (item) => {
    handleUpdateCartQuantity(item.product._id, item.variant, item.quantity + 1)
  }

  const handleQuantityDecrement = (item) => {
    if (item.quantity > 1) {
      handleUpdateCartQuantity(item.product._id, item.variant, item.quantity - 1)
    } else {
      handleRemoveFromCart(item.product._id, item.variant)
    }
  }

  // Calculations for Order Summary
  const subtotal = totalPrice
  const discount = Math.round(subtotal * 0.15) // 15% promotional discount
  const delivery = subtotal > 1499 ? 0 : 99
  const totalPayable = subtotal - discount + delivery

  return (
    <div className={`min-h-screen flex flex-col font-luxury-sans transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#111111]'
    }`}>
      
      {/* Announcement top bar */}
      <div className="w-full bg-[#111111] text-[#E5E5EA] py-2 px-4 text-center text-[10px] font-semibold tracking-[0.2em] uppercase select-none">
        FREE SHIPPING ON ORDERS ABOVE {formatCurrency(1499, 'INR')} | EASY RETURNS
      </div>

      {/* Global Navigation Header */}
      <header className={`w-full sticky top-0 z-50 border-b transition-colors duration-500 backdrop-blur-md ${
        isDarkMode ? 'bg-[#0A0A0A]/90 border-white/5' : 'bg-[#FAFAFA]/90 border-[#E5E5EA]'
      }`}>
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 md:px-12 py-5 flex items-center justify-between">
          {/* Logo */}
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

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold tracking-widest uppercase">
            {['Men', 'Women', 'New In', 'Collections', 'Sale'].map((navLink) => (
              <Link
                key={navLink}
                to="/"
                className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                {navLink}
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-full border transition-all duration-300 ${
                isDarkMode
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

            {user?.role === 'seller' && (
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
            )}
          </div>
        </div>
      </header>

      {/* Main cart container */}
      <main className="max-w-[1240px] mx-auto w-full px-6 sm:px-8 md:px-12 py-10 flex-1 flex flex-col gap-8">
        
        {/* Breadcrumb / Page Title */}
        <div className="flex flex-col gap-2">
          <nav className={`text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <Link to="/" className="hover:text-[#C5A880] transition-colors">Home</Link>
            <span>/</span>
            <span className={isDarkMode ? 'text-white' : 'text-black'}>Your Cart</span>
          </nav>
          <h2 className={`text-2xl sm:text-3xl font-luxury-serif font-light tracking-wide ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
            Shopping Cart {items.length > 0 && <span className="text-sm font-luxury-sans font-light opacity-65">({items.length} items)</span>}
          </h2>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className={`flex-1 flex flex-col items-center justify-center py-20 px-4 rounded-3xl border transition-all duration-300 ${
            isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
          }`}>
            <div className="p-6 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] mb-6 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold tracking-wide mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Your cart is empty
            </h3>
            <p className={`text-xs font-light text-center max-w-sm mb-8 leading-relaxed ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
              Browse our exclusive collections of premium, minimal-luxury clothing garments and add your favorite fits.
            </p>
            <Link
              to="/"
              className={`px-8 py-3.5 rounded-xl font-medium text-xs tracking-widest uppercase transition-all duration-300 select-none ${
                isDarkMode
                  ? 'bg-[#C5A880] text-[#0A0A0A] hover:bg-[#D9C3A5] shadow-[0_4px_16px_rgba(197,168,128,0.25)]'
                  : 'bg-black text-white hover:bg-[#1C1C1E] shadow-[0_4px_16px_rgba(0,0,0,0.15)]'
              }`}
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          /* Cart content */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Cart Items List (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              {items.map((item, idx) => {
                const itemImg = getItemImage(item)
                const { amount: priceAmount, currency: priceCurrency } = getItemPrice(item)
                const variantDetails = getVariantDetails(item)

                // Get dynamic attributes mapped to text (e.g. Size: XL | Color: Black)
                const rawAttrs = variantDetails?.attributes instanceof Map 
                  ? Object.fromEntries(variantDetails.attributes) 
                  : (variantDetails?.attributes || {})
                const attributeText = Object.entries(rawAttrs)
                  .map(([key, val]) => `${key}: ${val}`)
                  .join('  |  ')

                return (
                  <article
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex gap-4 sm:gap-6 ${
                      isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
                    }`}
                  >
                    {/* Item Image */}
                    <div className={`w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden shrink-0 border select-none ${
                      isDarkMode ? 'bg-[#151515] border-white/5' : 'bg-gray-100 border-[#E5E5EA]'
                    }`}>
                      <img
                        src={itemImg}
                        alt={item.product?.name || 'Product Image'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className={`text-sm sm:text-base font-semibold truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            {item.product?.name}
                          </h3>
                          {/* Remove button */}
                          <button
                            onClick={() => handleRemoveFromCart(item.product?._id, item.variant)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            aria-label="Remove item"
                            title="Remove item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Price per unit */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold tracking-wide ${isDarkMode ? 'text-[#C5A880]' : 'text-black'}`}>
                            {formatCurrency(priceAmount, priceCurrency)}
                          </span>
                          {item.quantity > 1 && (
                            <span className={`text-[10px] tracking-wider uppercase opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              / Unit
                            </span>
                          )}
                        </div>

                        {/* Description snippet */}
                        <p className={`text-[11px] font-light truncate max-w-md ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {item.product?.description}
                        </p>

                        {/* Selected variant details */}
                        {attributeText && (
                          <div className={`inline-flex items-center text-[10px] font-semibold tracking-wider uppercase bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] px-2.5 py-1 rounded-md`}>
                            {attributeText}
                          </div>
                        )}
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex justify-between items-end mt-4">
                        {/* Quantity Counter Widget */}
                        <div className={`flex items-center border rounded-xl overflow-hidden ${
                          isDarkMode ? 'border-[#2C2C2E] bg-[#151515]' : 'border-[#E5E5EA] bg-white'
                        }`}>
                          <button
                            onClick={() => handleQuantityDecrement(item)}
                            className={`w-8 h-8 flex items-center justify-center text-sm font-semibold transition-colors hover:bg-red-500/10 hover:text-red-500`}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className={`w-8 text-center text-xs font-mono select-none ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityIncrement(item)}
                            className={`w-8 h-8 flex items-center justify-center text-sm font-semibold transition-colors hover:bg-emerald-500/10 hover:text-emerald-500`}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Prices */}
                        <div className="text-right">
                          <span className={`text-[10px] text-gray-500 block font-semibold uppercase tracking-wider`}>Subtotal</span>
                          <div className="flex items-center gap-2 justify-end">
                            <span className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-[#C5A880]' : 'text-black'}`}>
                              {formatCurrency(priceAmount * item.quantity, priceCurrency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Right side: Price / Order Summary (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <section className={`p-6 rounded-2xl border transition-all duration-300 space-y-6 ${
                isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
              }`}>
                <h3 className={`text-xs font-bold tracking-widest uppercase pb-3 border-b border-dashed border-gray-500/10 ${
                  isDarkMode ? 'text-[#AEAEB2]' : 'text-[#48484A]'
                }`}>
                  Price Details
                </h3>

                <div className="space-y-4 text-xs font-light">
                  {/* Total MRP */}
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Price ({items.length} items)</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>

                  {/* Promo Discount */}
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Luxora Discount (15%)</span>
                    <span className="text-[#C5A880] font-mono">-{formatCurrency(discount)}</span>
                  </div>

                  {/* Delivery Charges */}
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Delivery Fee</span>
                    {delivery === 0 ? (
                      <span className="text-emerald-500 font-semibold uppercase tracking-wider">Free</span>
                    ) : (
                      <span className="font-mono">{formatCurrency(delivery)}</span>
                    )}
                  </div>
                </div>

                {/* Total amount payable */}
                <div className="pt-4 border-t border-dashed border-gray-500/10 flex justify-between items-baseline">
                  <span className={`text-sm font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-black'}`}>Total Amount</span>
                  <span className={`text-xl font-bold tracking-wide ${isDarkMode ? 'text-[#C5A880]' : 'text-black'}`}>
                    {formatCurrency(totalPayable)}
                  </span>
                </div>

                {/* Secure Guarantee Badge */}
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors duration-300 ${
                  isDarkMode ? 'bg-[#151515] border-[#2C2C2E]' : 'bg-[#FAFAFA] border-[#E5E5EA]'
                }`}>
                  <span className="text-base select-none">🔒</span>
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-bold uppercase tracking-wider leading-none ${isDarkMode ? 'text-white' : 'text-black'}`}>100% Secure Transaction</span>
                    <span className="text-[8px] text-gray-500 mt-0.5">Encrypted and guarded checkout systems</span>
                  </div>
                </div>

                {/* Place Order CTA Button */}
                <button
                  type="button"
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex justify-center items-center gap-2 select-none cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#C5A880] text-[#0A0A0A] hover:bg-[#D9C3A5] shadow-[0_4px_16px_rgba(197,168,128,0.25)]'
                      : 'bg-black text-white hover:bg-[#1C1C1E] shadow-[0_4px_16px_rgba(0,0,0,0.15)]'
                  }`}
                >
                  Place Order
                </button>
              </section>
            </div>

          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className={`w-full py-8 px-6 border-t mt-auto text-center text-[10px] text-gray-500 uppercase tracking-widest ${
        isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
      }`}>
        © 2026 LUXORA PREMIUM CLOTHING. ALL RIGHTS RESERVED.
      </footer>
    </div>
  )
}

export default Cart