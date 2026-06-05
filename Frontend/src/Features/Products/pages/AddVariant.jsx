import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router'
import { toggleTheme } from '../../../App/theme.slice.js'
import { useProduct } from '../hooks/useProduct'

const MAX_IMAGES = 7

const AddVariant = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { handleAddVariant, handleFetchProductById } = useProduct()

  const [product, setProduct] = useState(null)
  const [options, setOptions] = useState(['Color'])
  const [newOptionName, setNewOptionName] = useState('')
  const [variants, setVariants] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const isDarkMode = useSelector((state) => state.theme.isDarkMode)
  const fileInputRefs = useRef({})

  // ─── Fetch Product Details ──────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await handleFetchProductById(productId)
        setProduct(data)
        
        // Initialize with one empty variant row
        setVariants([
          {
            id: Date.now(),
            attributeValues: { Color: '' },
            priceAmount: '',
            stock: '',
            images: []
          }
        ])
      } catch (err) {
        setError('Failed to fetch the original product details.')
      } finally {
        setLoading(false)
      }
    }
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  // ─── Global Option Type Handlers ────────────────────────────────
  const handleAddOption = (e) => {
    e.preventDefault()
    const name = newOptionName.trim()
    if (!name) return
    if (options.some(opt => opt.toLowerCase() === name.toLowerCase())) {
      setError(`Option type "${name}" already exists.`)
      return
    }
    setError(null)
    setOptions((prev) => [...prev, name])
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        attributeValues: { ...v.attributeValues, [name]: '' }
      }))
    )
    setNewOptionName('')
  }

  const handleRemoveOption = (name) => {
    if (options.length <= 1) {
      setError('At least one attribute option type is required.')
      return
    }
    setError(null)
    setOptions((prev) => prev.filter((o) => o !== name))
    setVariants((prev) =>
      prev.map((v) => {
        const nextAttrs = { ...v.attributeValues }
        delete nextAttrs[name]
        return { ...v, attributeValues: nextAttrs }
      })
    )
  }

  // ─── Variant Row Handlers ───────────────────────────────────────
  const handleAddVariantRow = () => {
    const initAttrs = {}
    options.forEach((opt) => {
      initAttrs[opt] = ''
    })
    setVariants((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        attributeValues: initAttrs,
        priceAmount: '',
        stock: '',
        images: []
      }
    ])
  }

  const handleRemoveVariantRow = (id) => {
    if (variants.length <= 1) {
      setError('At least one variant row is required.')
      return
    }
    setVariants((prev) => {
      const target = prev.find((v) => v.id === id)
      if (target) {
        target.images.forEach((img) => URL.revokeObjectURL(img.preview))
      }
      return prev.filter((v) => v.id !== id)
    })
  }

  const handleFieldChange = (id, field, value) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return { ...v, [field]: value }
        }
        return v
      })
    )
  }

  const handleAttrValueChange = (id, optionKey, value) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            attributeValues: { ...v.attributeValues, [optionKey]: value }
          }
        }
        return v
      })
    )
  }

  // ─── Variant Images Handlers ────────────────────────────────────
  const handleFileChange = (variantId, files) => {
    const incoming = Array.from(files).filter((f) => f.type.startsWith('image/'))
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          const slots = MAX_IMAGES - v.images.length
          if (slots <= 0) return v
          const added = incoming.slice(0, slots).map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            id: `${Date.now()}-${Math.random()}`
          }))
          return { ...v, images: [...v.images, ...added] }
        }
        return v
      })
    )
  }

  const handleRemoveVariantImage = (variantId, imageId) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          const target = v.images.find((img) => img.id === imageId)
          if (target) URL.revokeObjectURL(target.preview)
          return { ...v, images: v.images.filter((img) => img.id !== imageId) }
        }
        return v
      })
    )
  }

  // ─── Form Batch Submit ──────────────────────────────────────────
  const handleSubmitAll = async () => {
    setError(null)

    // Validation
    const invalidRowIdx = variants.findIndex((v) => {
      return options.some((opt) => !v.attributeValues[opt] || v.attributeValues[opt].trim() === '')
    })

    if (invalidRowIdx !== -1) {
      setError(`Variant row #${invalidRowIdx + 1} has empty attribute values. Please complete them or delete the row.`)
      return
    }

    setSubmitting(true)
    setSubmitProgress({ current: 0, total: variants.length })

    try {
      // Create variants sequentially to prevent concurrent ImageKit upload bottlenecks
      for (let i = 0; i < variants.length; i++) {
        setSubmitProgress({ current: i + 1, total: variants.length })
        const variant = variants[i]

        const payload = new FormData()

        // Attributes payload
        const cleanedAttrs = {}
        options.forEach((opt) => {
          cleanedAttrs[opt] = variant.attributeValues[opt].trim()
        })
        payload.append('attributes', JSON.stringify(cleanedAttrs))

        // Price amount (optional)
        if (variant.priceAmount.trim() !== '') {
          payload.append('priceAmount', variant.priceAmount)
        }

        // Stock (optional)
        if (variant.stock.trim() !== '') {
          payload.append('stock', variant.stock)
        }

        // Files/Images
        variant.images.forEach((img) => {
          payload.append('images', img.file)
        })

        await handleAddVariant(productId, payload)
      }

      setSuccess(true)
      // Cleanup Object URLs
      variants.forEach((v) => v.images.forEach((img) => URL.revokeObjectURL(img.preview)))
      
      setTimeout(() => {
        navigate(`/product/${productId}`)
      }, 2000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Error uploading and adding variants.')
      setSubmitting(false)
    }
  }

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

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-black'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#C5A880]/30 border-t-[#C5A880] rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold">Loading product details...</span>
        </div>
      </div>
    )
  }

  const baseImage = product?.images && product.images.length > 0
    ? product.images[0].url
    : '/luxora_login_bg.png'

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row font-luxury-sans transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#111111]'
    }`}>
      {/* Sidebar Navigation */}
      <aside className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 p-8 shrink-0 select-none transition-colors duration-500 border-r ${
        isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
      }`}>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col">
            <h1 className={`text-2xl font-luxury-serif font-light tracking-[0.18em] uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>
              LUXORA
            </h1>
            <span className="text-[8px] font-medium tracking-[0.32em] text-[#C5A880] uppercase mt-1">
              PREMIUM CLOTHING
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {[
              { label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', path: '/seller/dashboard' },
              { label: 'Products', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', active: false },
              { label: 'Add Product', icon: 'M12 4v16m8-8H4', path: '/seller/add-product' },
              { label: 'Add Variant', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', path: `/seller/${productId}/add-variant`, active: true },
            ].map((item, idx) => {
              const className = `w-full flex items-center gap-3.5 px-4 py-3 text-xs tracking-wider font-medium rounded-xl transition-all duration-300 ${
                item.active
                  ? isDarkMode
                    ? 'bg-[#C5A880]/10 text-[#C5A880]'
                    : 'bg-black text-white'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`

              return (
                <Link key={idx} to={item.path || '#'} className={className}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

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

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className={`w-full flex justify-between items-center py-6 px-6 sm:px-8 md:px-12 border-b transition-colors duration-500 ${
          isDarkMode ? 'border-white/5 bg-[#0D0D0D]' : 'border-[#E5E5EA] bg-white'
        }`}>
          <div className="flex items-center gap-4">
            <Link
              to="/seller/dashboard"
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
                Manage Product Variants
              </h2>
              <span className={`text-[10px] sm:text-xs font-light mt-0.5 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                Define dynamic variant dimensions and publish multiple catalog options collectively
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
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

            <div className={`h-8 w-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

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

        {/* Content Body */}
        <div className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
          {/* Status Banners */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium tracking-wide flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium tracking-wide flex items-center gap-2.5 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>All variants uploaded successfully! Redirecting...</span>
            </div>
          )}

          {submitting && (
            <div className="p-4 rounded-xl bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] text-xs font-medium tracking-wide flex items-center gap-3">
              <div className="w-4.5 h-4.5 border-2 border-[#C5A880]/30 border-t-[#C5A880] rounded-full animate-spin shrink-0"></div>
              <span>
                Adding variants: Processing variant {submitProgress.current} of {submitProgress.total}...
              </span>
            </div>
          )}

          {/* Base Product Card: Small and Concise */}
          <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${
            isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
          }`}>
            <div className="w-12 h-16 rounded overflow-hidden shrink-0 bg-gray-500/10 border border-gray-500/10">
              <img
                src={baseImage}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#C5A880]/15 border border-[#C5A880]/25 text-[#C5A880] text-[8px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded shrink-0">
                  Base
                </span>
                <h3 className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {product?.name}
                </h3>
              </div>
              <p className={`text-[11px] font-light truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {product?.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-gray-500 block uppercase font-semibold">Base Price</span>
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-[#C5A880]' : 'text-black'}`}>
                {formatCurrency(product?.price?.amount, product?.price?.currency)}
              </span>
            </div>
          </div>

          {/* SECTION 1: Variant Options Schema definition */}
          <div className={`p-4 sm:p-5 rounded-xl border transition-all duration-300 space-y-4 ${
            isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
          }`}>
            <div className="flex items-center gap-2 pb-2 border-b border-dashed border-gray-500/10">
              <span className="w-5 h-5 rounded-full bg-[#C5A880] text-black font-bold text-[10px] flex items-center justify-center font-luxury-serif">
                1
              </span>
              <h3 className={`text-xs font-semibold tracking-wide uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Configure Option Dimensions (e.g. Color, Size)
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Option Tags */}
              {options.map((opt) => (
                <div
                  key={opt}
                  className={`flex items-center gap-2 pl-3 pr-2 py-1 rounded-full text-xs font-medium border ${
                    isDarkMode ? 'bg-[#151515] border-[#2C2C2E] text-white' : 'bg-gray-50 border-[#E5E5EA] text-black'
                  }`}
                >
                  <span>{opt}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(opt)}
                    className="p-0.5 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                    title={`Remove ${opt} option`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add Option Inline Input */}
              <form onSubmit={handleAddOption} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add option (e.g. Material)"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  className={`text-xs py-1.5 px-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-gray-600 focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                      : 'bg-white border-[#E5E5EA] text-black placeholder-gray-400 focus:border-black focus:ring-black/5'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                    isDarkMode
                      ? 'bg-[#151515] border-[#2C2C2E] text-[#C5A880] hover:bg-[#1E1E1E]'
                      : 'bg-white border-[#E5E5EA] text-black hover:bg-[#F2F2F7]'
                  }`}
                >
                  + Add Option
                </button>
              </form>
            </div>
          </div>

          {/* SECTION 2: Variants Table */}
          <div className={`p-4 sm:p-5 rounded-xl border transition-all duration-300 space-y-4 ${
            isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-dashed border-gray-500/10">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#C5A880] text-black font-bold text-[10px] flex items-center justify-center font-luxury-serif">
                  2
                </span>
                <h3 className={`text-xs font-semibold tracking-wide uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Variant Details List
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddVariantRow}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-all border ${
                  isDarkMode
                    ? 'border-[#2C2C2E] hover:border-[#C5A880] text-[#C5A880] bg-transparent'
                    : 'border-[#E5E5EA] hover:border-black text-black bg-transparent'
                }`}
              >
                + Add Another Row
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className={`border-b text-[10px] uppercase tracking-wider font-semibold ${
                    isDarkMode ? 'border-white/5 text-gray-500' : 'border-gray-100 text-gray-400'
                  }`}>
                    {options.map((opt) => (
                      <th key={opt} className="pb-3 pr-4 font-semibold">
                        {opt} *
                      </th>
                    ))}
                    <th className="pb-3 pr-4 font-semibold w-28">Price (₹)</th>
                    <th className="pb-3 pr-4 font-semibold w-20">Stock</th>
                    <th className="pb-3 pr-4 font-semibold">Images (Max 7)</th>
                    <th className="pb-3 text-center font-semibold w-16">Remove</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
                  {variants.map((variant, idx) => (
                    <tr key={variant.id} className="align-middle">
                      {/* Dynamic Options values inputs */}
                      {options.map((opt) => (
                        <td key={opt} className="py-3 pr-4">
                          <input
                            type="text"
                            value={variant.attributeValues[opt] || ''}
                            onChange={(e) => handleAttrValueChange(variant.id, opt, e.target.value)}
                            placeholder={`e.g. ${opt === 'Color' ? 'Black' : opt === 'Size' ? 'XL' : 'Value'}`}
                            className={`w-full text-xs py-2 px-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                              isDarkMode
                                ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-gray-700 focus:border-[#C5A880] focus:ring-[#C5A880]/5'
                                : 'bg-white border-[#E5E5EA] text-[#111111] placeholder-gray-300 focus:border-black focus:ring-black/5'
                            }`}
                            required
                          />
                        </td>
                      ))}

                      {/* Price input */}
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          value={variant.priceAmount}
                          onChange={(e) => handleFieldChange(variant.id, 'priceAmount', e.target.value)}
                          placeholder={`Copy: ${product?.price?.amount}`}
                          min="0"
                          step="0.01"
                          className={`w-full text-xs py-2 px-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                            isDarkMode
                              ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-gray-700 focus:border-[#C5A880] focus:ring-[#C5A880]/5'
                              : 'bg-white border-[#E5E5EA] text-[#111111] placeholder-gray-300 focus:border-black focus:ring-black/5'
                          }`}
                        />
                      </td>

                      {/* Stock input */}
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleFieldChange(variant.id, 'stock', e.target.value)}
                          placeholder="0"
                          min="0"
                          className={`w-full text-xs py-2 px-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                            isDarkMode
                              ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-gray-700 focus:border-[#C5A880] focus:ring-[#C5A880]/5'
                              : 'bg-white border-[#E5E5EA] text-[#111111] placeholder-gray-300 focus:border-black focus:ring-black/5'
                          }`}
                        />
                      </td>

                      {/* Mini Images Upload Cell */}
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2 flex-wrap min-w-[150px]">
                          {/* List of tiny previews */}
                          {variant.images.map((img) => (
                            <div key={img.id} className="relative w-8 h-8 rounded border border-gray-500/10 overflow-hidden shrink-0 group">
                              <img
                                src={img.preview}
                                alt="preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantImage(variant.id, img.id)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-bold transition-opacity"
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          {/* Plus mini upload button */}
                          {variant.images.length < MAX_IMAGES && (
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[variant.id]?.click()}
                              className={`w-8 h-8 rounded border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                isDarkMode
                                  ? 'border-[#2C2C2E] hover:border-[#C5A880] text-gray-600 hover:text-[#C5A880]'
                                  : 'border-[#E5E5EA] hover:border-black text-gray-400 hover:text-black'
                              }`}
                              title="Add row image"
                            >
                              <span className="text-sm font-semibold">+</span>
                            </button>
                          )}

                          {/* Hidden input */}
                          <input
                            ref={(el) => (fileInputRefs.current[variant.id] = el)}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileChange(variant.id, e.target.files)}
                            className="sr-only"
                          />

                          {variant.images.length === 0 && (
                            <span className="text-[9px] text-gray-500 italic">
                              Inheriting base images
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Delete row button */}
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(variant.id)}
                          className="p-1.5 rounded-lg border border-red-500/20 hover:border-red-500 text-red-500 hover:bg-red-500/5 transition-all"
                          title="Delete row"
                          disabled={variants.length <= 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className={`pt-6 border-t flex justify-end items-center gap-4 ${
            isDarkMode ? 'border-white/5' : 'border-[#E5E5EA]'
          }`}>
            <Link
              to={`/product/${productId}`}
              className={`px-6 py-3 rounded-xl text-xs font-semibold tracking-wider transition-all border ${
                isDarkMode
                  ? 'bg-transparent border-[#2C2C2E] text-white hover:bg-white/5'
                  : 'bg-white border-[#E5E5EA] text-[#636366] hover:bg-[#F2F2F7]'
              }`}
            >
              Cancel
            </Link>

            <button
              onClick={handleSubmitAll}
              disabled={submitting}
              className={`px-8 py-3 rounded-xl font-medium text-xs tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed select-none ${
                isDarkMode
                  ? 'bg-[#C5A880] text-[#0A0A0A] hover:bg-[#D9C3A5] disabled:bg-[#48484A] disabled:text-[#8E8E93] shadow-[0_4px_16px_rgba(197,168,128,0.2)]'
                  : 'bg-black text-white hover:bg-[#1C1C1E] disabled:bg-[#AEAEB2] disabled:text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
              }`}
            >
              <span>{submitting ? 'Uploading...' : 'Publish All Variants'}</span>
              {!submitting && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AddVariant