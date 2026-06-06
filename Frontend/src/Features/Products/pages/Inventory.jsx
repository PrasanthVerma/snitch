import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../../../App/theme.slice.js'
import { useProduct } from '../hooks/useProduct'
import { useAuth } from '../../Auth/hooks/useAuth.js'

const Inventory = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { handleLogout } = useAuth()
  const { handleFetchAllProductsOfSeller, handleUpdateStock, handleDeleteProduct } = useProduct()

  // Redux selectors
  const sellerProducts = useSelector((state) => state.product.sellerProducts) || []
  const isDarkMode = useSelector((state) => state.theme.isDarkMode)
  const user = useSelector((state) => state.auth.user)

  // Local Page states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'in-stock', 'low-stock', 'out-of-stock'
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'oldest', 'price-desc', 'price-asc', 'stock-desc', 'stock-asc', 'alphabetical'
  const [expandedProductIds, setExpandedProductIds] = useState({}) // { [productId]: boolean }
  const [updatingStockId, setUpdatingStockId] = useState(null) // ID of product/variant currently saving
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Inline stock input edit states
  const [editStockInputs, setEditStockInputs] = useState({}) // { [id]: number }
  const [activeEditInputIds, setActiveEditInputIds] = useState({}) // { [id]: boolean }

  useEffect(() => {
    handleFetchAllProductsOfSeller()
  }, [])

  // ─── Metrics Computation ────────────────────────────────────────
  const stats = useMemo(() => {
    let totalStock = 0
    let lowStockCount = 0
    let outOfStockCount = 0

    sellerProducts.forEach((p) => {
      const hasVariants = p.variants && p.variants.length > 0
      if (hasVariants) {
        let productOutOfStock = true
        let productLowStock = false

        p.variants.forEach((v) => {
          totalStock += v.stock
          if (v.stock > 0) {
            productOutOfStock = false
          }
          if (v.stock > 0 && v.stock < 5) {
            productLowStock = true
          }
        })

        if (productOutOfStock) outOfStockCount++
        if (productLowStock) lowStockCount++
      } else {
        totalStock += p.stock
        if (p.stock === 0) {
          outOfStockCount++
        } else if (p.stock < 5) {
          lowStockCount++
        }
      }
    })

    return {
      totalProducts: sellerProducts.length,
      totalStock,
      lowStockCount,
      outOfStockCount
    }
  }, [sellerProducts])

  // ─── Filter & Sort Computation ──────────────────────────────────
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...sellerProducts]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p._id?.toLowerCase().includes(query) ||
          (p.variants && p.variants.some((v) => 
            v.attributes && Object.entries(v.attributes).some(([_, val]) => 
              val.toLowerCase().includes(query)
            )
          ))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => {
        const hasVariants = p.variants && p.variants.length > 0

        if (statusFilter === 'out-of-stock') {
          if (hasVariants) {
            return p.variants.every((v) => v.stock === 0)
          } else {
            return p.stock === 0
          }
        }

        if (statusFilter === 'low-stock') {
          if (hasVariants) {
            return p.variants.some((v) => v.stock > 0 && v.stock < 5)
          } else {
            return p.stock > 0 && p.stock < 5
          }
        }

        if (statusFilter === 'in-stock') {
          if (hasVariants) {
            return p.variants.some((v) => v.stock >= 5)
          } else {
            return p.stock >= 5
          }
        }

        return true
      })
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
    } else if (sortBy === 'stock-desc') {
      result.sort((a, b) => {
        const stockA = a.variants?.length ? a.variants.reduce((acc, v) => acc + v.stock, 0) : a.stock
        const stockB = b.variants?.length ? b.variants.reduce((acc, v) => acc + v.stock, 0) : b.stock
        return stockB - stockA
      })
    } else if (sortBy === 'stock-asc') {
      result.sort((a, b) => {
        const stockA = a.variants?.length ? a.variants.reduce((acc, v) => acc + v.stock, 0) : a.stock
        const stockB = b.variants?.length ? b.variants.reduce((acc, v) => acc + v.stock, 0) : b.stock
        return stockA - stockB
      })
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [sellerProducts, searchQuery, statusFilter, sortBy])

  // ─── Helper Helpers ─────────────────────────────────────────────
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

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3500)
  }

  // ─── Stock Update Actions ─────────────────────────────────────────
  const startEditing = (id, currentVal) => {
    setActiveEditInputIds((prev) => ({ ...prev, [id]: true }))
    setEditStockInputs((prev) => ({ ...prev, [id]: currentVal }))
  }

  const cancelEditing = (id) => {
    setActiveEditInputIds((prev) => ({ ...prev, [id]: false }))
  }

  const onStockChange = (id, newStock) => {
    setEditStockInputs((prev) => ({ ...prev, [id]: newStock }))
  }

  const handleSaveStock = async (productId, variantId, targetStock) => {
    const targetId = variantId || productId
    if (targetStock === undefined || targetStock === null || isNaN(targetStock) || targetStock < 0) {
      showToastMsg('Stock must be a positive number', 'error')
      return
    }

    try {
      setUpdatingStockId(targetId)
      await handleUpdateStock(productId, targetStock, variantId)
      showToastMsg('Stock level updated successfully', 'success')
      setActiveEditInputIds((prev) => ({ ...prev, [targetId]: false }))
    } catch (err) {
      showToastMsg(err?.response?.data?.message || err?.message || 'Failed to update stock level', 'error')
    } finally {
      setUpdatingStockId(null)
    }
  }

  const handleStepStock = async (product, variant = null, step) => {
    const productId = product._id
    const variantId = variant ? variant._id : null
    const targetId = variantId || productId

    const currentStock = variant ? variant.stock : product.stock
    const newStock = Math.max(0, currentStock + step)

    try {
      setUpdatingStockId(targetId)
      await handleUpdateStock(productId, newStock, variantId)
      showToastMsg('Stock adjusted successfully', 'success')
      setEditStockInputs((prev) => ({ ...prev, [targetId]: newStock }))
    } catch (err) {
      showToastMsg(err?.response?.data?.message || err?.message || 'Failed to adjust stock', 'error')
    } finally {
      setUpdatingStockId(null)
    }
  }

  // ─── Toggle Variant Sub-rows ──────────────────────────────────────
  const toggleExpandProduct = (productId) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  const handleProductDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await handleDeleteProduct(productId)
        showToastMsg('Product listing deleted successfully', 'success')
      } catch (err) {
        showToastMsg(err?.response?.data?.message || err?.message || 'Failed to delete listing', 'error')
      }
    }
  }

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row font-luxury-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-[#111111]'}`}>
      
      {/* ═══════════════════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════════════════════ */}
      <aside className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 p-8 shrink-0 select-none transition-colors duration-500 border-r ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'}`}>
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
            <h1 className={`text-2xl font-luxury-serif font-light tracking-[0.18em] uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>
              LUXORA
            </h1>
            <span className="text-[8px] font-medium tracking-[0.32em] text-[#C5A880] uppercase mt-1">
              PREMIUM CLOTHING
            </span>
          </div>

          {/* User Profile Card */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-[#151515] border-white/5' : 'bg-gray-50 border-[#E5E5EA]'}`}>
            <div className="w-9 h-9 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/30 text-[#C5A880] flex items-center justify-center font-bold text-xs shrink-0 select-none">
              {user?.fullname ? user.fullname.substring(0, 1).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-[11px] font-semibold tracking-wide truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {user?.fullname || 'Arjun Sharma'}
              </span>
              <span className="text-[9px] text-[#C5A880] font-medium tracking-wide flex items-center gap-1 mt-0.5">
                Verified Seller
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-1">
            {[
              { label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', path: '/seller/dashboard', active: false },
              { label: 'Inventory', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', path: '/seller/inventory', active: true },
              { label: 'Add Product', icon: 'M12 4v16m8-8H4', path: '/seller/add-product', active: false },
              { label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', active: false },
              { label: 'Earnings', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', active: false },
            ].map((item, idx) => {
              const navContent = (
                <span className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-3.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                  </span>
                </span>
              )

              const className = `w-full flex items-center px-4 py-2.5 text-xs tracking-wider font-medium rounded-xl transition-all duration-300 ${item.active
                ? isDarkMode
                  ? 'bg-[#C5A880]/10 text-[#C5A880]'
                  : 'bg-black text-white'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`

              return item.path ? (
                <Link key={idx} to={item.path} className={className}>
                  {navContent}
                </Link>
              ) : (
                <button key={idx} disabled className={`${className} opacity-50`}>
                  {navContent}
                </button>
              )
            })}
          </nav>
        </div>

        <Link
          onClick={handleLogout}
          to="/"
          className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider transition-colors duration-300 rounded-xl ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
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
        
        {/* Mobile Header */}
        <header className={`lg:hidden flex items-center justify-between px-6 py-5 border-b shrink-0 transition-colors ${isDarkMode ? 'bg-[#110d0d] border-white/5' : 'bg-white border-[#E5E5EA]'}`}>
          <div className="flex flex-col">
            <span className="text-xl font-luxury-serif tracking-[0.15em] text-[#C5A880] uppercase">LUXORA</span>
            <span className="text-[8px] tracking-[0.2em] opacity-60 uppercase">Inventory Control</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => dispatch(toggleTheme())} className="p-1 text-gray-500 hover:text-white">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 sm:px-8 md:px-12 py-10">
          <div className="max-w-[1240px] mx-auto flex flex-col gap-8">
            
            {/* Header section with theme toggle and action button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-dashed border-gray-500/10">
              <div className="flex flex-col">
                <h2 className={`text-2xl sm:text-3xl font-luxury-serif font-light tracking-wide ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                  Inventory Manager
                </h2>
                <span className={`text-xs font-light mt-1.5 ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                  Monitor stock levels, manage variants, and tweak stock levels in real-time.
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Theme Toggler */}
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className={`p-2 rounded-full border transition-all duration-300 ${isDarkMode ? 'bg-[#151515] border-[#2C2C2E] text-yellow-500 hover:bg-[#1E1E1E]' : 'bg-white border-[#E5E5EA] text-[#636366] hover:bg-[#F2F2F7]'}`}
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

                {/* Add Product Link */}
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
              
              {/* Metric: Total Products */}
              <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'}`}>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                    Catalog Listings
                  </span>
                  <span className={`text-3xl font-luxury-serif font-light ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                    {stats.totalProducts}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Distinct products</span>
                </div>
                <div className="p-3 rounded-full bg-[#C5A880]/10 text-[#C5A880]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>

              {/* Metric: Total Stock */}
              <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'}`}>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                    Total Items In Stock
                  </span>
                  <span className={`text-3xl font-luxury-serif font-light ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                    {stats.totalStock.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Accumulated units count</span>
                </div>
                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                  </svg>
                </div>
              </div>

              {/* Metric: Low Stock Warning */}
              <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'}`}>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                    Low Stock Alerts
                  </span>
                  <span className={`text-3xl font-luxury-serif font-light ${stats.lowStockCount > 0 ? 'text-amber-500' : isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                    {stats.lowStockCount}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Under 5 units remaining</span>
                </div>
                <div className={`p-3 rounded-full ${stats.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-gray-500/10 text-gray-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              {/* Metric: Out of stock */}
              <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'}`}>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#8E8E93]' : 'text-[#636366]'}`}>
                    Out of Stock Listings
                  </span>
                  <span className={`text-3xl font-luxury-serif font-light ${stats.outOfStockCount > 0 ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                    {stats.outOfStockCount}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Requires replenishment</span>
                </div>
                <div className={`p-3 rounded-full ${stats.outOfStockCount > 0 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-gray-500/10 text-gray-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
            </section>

            {/* ═════════════════════════════════════════════════════════
                PRODUCTS INVENTORY MAIN CARD
            ═════════════════════════════════════════════════════════ */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-[#E5E5EA]'}`}>
              
              {/* Header Filters Controls */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-dashed border-gray-500/10">
                <div className="flex flex-col">
                  <h3 className={`text-base font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Catalog Inventory List
                  </h3>
                  <span className={`text-[11px] font-light mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Manage products and expand variants to modify stock counts.
                  </span>
                </div>

                {/* Filters Input & Selects */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search query input */}
                  <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E8E93]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search title, ID, attributes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full text-xs py-2 pl-9 pr-8 rounded-lg border focus:outline-none focus:ring-2 transition-all font-light ${
                        isDarkMode
                          ? 'bg-[#151515] border-[#2C2C2E] text-white placeholder-[#555558] focus:border-[#C5A880] focus:ring-[#C5A880]/10'
                          : 'bg-white border-[#E5E5EA] text-black placeholder-[#AEAEB2] focus:border-black focus:ring-black/5'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8E8E93] hover:text-[#AEAEB2]"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Stock Status Select */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`text-xs py-2 pl-3 pr-8 rounded-lg border focus:outline-none focus:ring-2 font-medium cursor-pointer appearance-none ${
                        isDarkMode ? 'bg-[#151515] border-[#2C2C2E] text-white focus:border-[#C5A880] focus:ring-[#C5A880]/10' : 'bg-white border-[#E5E5EA] text-[#333333] focus:border-black focus:ring-black/5'
                      }`}
                    >
                      <option value="all">All Stock Statuses</option>
                      <option value="in-stock">In Stock (≥5)</option>
                      <option value="low-stock">Low Stock (1-4)</option>
                      <option value="out-of-stock">Out of Stock (0)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-500 text-[10px]">
                      ▼
                    </div>
                  </div>

                  {/* Sort By Select */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`text-xs py-2 pl-3 pr-8 rounded-lg border focus:outline-none focus:ring-2 font-medium cursor-pointer appearance-none ${
                        isDarkMode ? 'bg-[#151515] border-[#2C2C2E] text-white focus:border-[#C5A880] focus:ring-[#C5A880]/10' : 'bg-white border-[#E5E5EA] text-[#333333] focus:border-black focus:ring-black/5'
                      }`}
                    >
                      <option value="newest">Sort: Newest</option>
                      <option value="oldest">Sort: Oldest</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="stock-desc">Stock: High to Low</option>
                      <option value="stock-asc">Stock: Low to High</option>
                      <option value="alphabetical">Name: A-Z</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-500 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Table section */}
              {filteredAndSortedProducts.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center">
                  <div className="p-4 rounded-full bg-white/5 border border-white/10 text-gray-500 mb-4">
                    🏷️
                  </div>
                  <h4 className="text-sm font-semibold tracking-wide uppercase">No Products Found</h4>
                  <p className={`text-xs font-light max-w-xs mt-1.5 leading-relaxed ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    We couldn't locate any products matching the selected filter criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'border-white/5 text-[#8E8E93]' : 'border-[#E5E5EA] text-[#636366]'}`}>
                        <th className="pb-3.5 pr-4 font-bold w-12"></th> {/* Accordion column */}
                        <th className="pb-3.5 pr-4 font-bold">Product</th>
                        <th className="pb-3.5 px-4 font-bold">Base Price</th>
                        <th className="pb-3.5 px-4 font-bold text-center">Stock Level</th>
                        <th className="pb-3.5 px-4 font-bold text-center">Variants</th>
                        <th className="pb-3.5 px-4 font-bold text-center">Status</th>
                        <th className="pb-3.5 pl-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-500/5 text-xs font-light">
                      {filteredAndSortedProducts.map((product) => {
                        const hasVariants = product.variants && product.variants.length > 0
                        const totalProductStock = hasVariants
                          ? product.variants.reduce((sum, v) => sum + v.stock, 0)
                          : product.stock
                        
                        const isExpanded = expandedProductIds[product._id]
                        const isBaseEditing = activeEditInputIds[product._id]
                        const tempBaseVal = editStockInputs[product._id] !== undefined ? editStockInputs[product._id] : product.stock
                        const isBaseSaving = updatingStockId === product._id

                        return (
                          <React.Fragment key={product._id}>
                            <tr className="hover:bg-gray-500/5 transition-colors group">
                              {/* Accordion Expand/Collapse Trigger */}
                              <td className="py-4 pr-2 text-center">
                                {hasVariants ? (
                                  <button
                                    onClick={() => toggleExpandProduct(product._id)}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                                      isDarkMode 
                                        ? 'border-white/15 text-white hover:bg-white/5' 
                                        : 'border-gray-200 text-black hover:bg-gray-50'
                                    }`}
                                    title={isExpanded ? 'Collapse variants' : 'Expand variants'}
                                  >
                                    <span className={`inline-block transition-transform duration-300 font-bold ${isExpanded ? 'rotate-90 text-[#C5A880]' : 'rotate-0'}`}>
                                      ▶
                                    </span>
                                  </button>
                                ) : (
                                  <span className="text-gray-500/30 text-[9px] font-mono">•</span>
                                )}
                              </td>

                              {/* Product details thumbnail & info */}
                              <td className="py-4 pr-4">
                                <div className="flex items-center gap-3 min-w-[200px]">
                                  <div className="w-10 h-12 rounded bg-gray-500/10 border border-gray-500/10 overflow-hidden relative shrink-0">
                                    {product.images && product.images.length > 0 ? (
                                      <img
                                        src={product.images[0].url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                                        🏷️
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                      {product.name}
                                    </span>
                                    <span className="text-[9px] opacity-60 font-mono select-all">
                                      ID: {product._id}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Base Price */}
                              <td className="py-4 px-4 whitespace-nowrap font-medium">
                                <span className={isDarkMode ? 'text-white' : 'text-black'}>
                                  {formatCurrency(product.price?.amount, product.price?.currency)}
                                </span>
                              </td>

                              {/* Stock Level column */}
                              <td className="py-4 px-4">
                                {hasVariants ? (
                                  <div className="flex flex-col items-center justify-center">
                                    <span className="font-mono font-medium text-gray-400">{totalProductStock}</span>
                                    <span className="text-[8px] tracking-wider text-[#C5A880] uppercase font-semibold mt-0.5">
                                      Across Variants
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    {/* Stepper Down */}
                                    <button
                                      disabled={product.stock <= 0 || isBaseSaving}
                                      onClick={() => handleStepStock(product, null, -1)}
                                      className="w-6 h-6 rounded bg-gray-500/10 hover:bg-gray-500/25 flex items-center justify-center text-xs font-bold transition-all disabled:opacity-40"
                                    >
                                      -
                                    </button>

                                    {isBaseEditing ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          value={tempBaseVal}
                                          disabled={isBaseSaving}
                                          onChange={(e) => onStockChange(product._id, parseInt(e.target.value) || 0)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveStock(product._id, null, tempBaseVal)
                                            if (e.key === 'Escape') cancelEditing(product._id)
                                          }}
                                          className={`w-14 text-center rounded border px-1 py-0.5 text-xs focus:outline-none focus:ring-1 font-mono ${
                                            isDarkMode 
                                              ? 'bg-[#151515] border-[#2C2C2E] text-white focus:border-[#C5A880] focus:ring-[#C5A880]' 
                                              : 'bg-white border-gray-300 text-black focus:border-black focus:ring-black'
                                          }`}
                                        />
                                        <button
                                          disabled={isBaseSaving}
                                          onClick={() => handleSaveStock(product._id, null, tempBaseVal)}
                                          className="p-1 text-emerald-500 hover:scale-110 transition-transform"
                                          title="Save Stock"
                                        >
                                          ✓
                                        </button>
                                        <button
                                          disabled={isBaseSaving}
                                          onClick={() => cancelEditing(product._id)}
                                          className="p-1 text-red-500 hover:scale-110 transition-transform"
                                          title="Cancel"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <div 
                                        className="flex items-center gap-1 cursor-pointer group/stock"
                                        onClick={() => startEditing(product._id, product.stock)}
                                      >
                                        <span className="font-mono text-xs hover:underline">{product.stock}</span>
                                        <span className="opacity-0 group-hover/stock:opacity-100 text-[10px] text-gray-500 transition-opacity">
                                          ✏️
                                        </span>
                                      </div>
                                    )}

                                    {/* Stepper Up */}
                                    <button
                                      disabled={isBaseSaving}
                                      onClick={() => handleStepStock(product, null, 1)}
                                      className="w-6 h-6 rounded bg-gray-500/10 hover:bg-gray-500/25 flex items-center justify-center text-xs font-bold transition-all"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Variants column */}
                              <td className="py-4 px-4 text-center whitespace-nowrap font-medium font-mono text-gray-400">
                                {hasVariants ? (
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                    isDarkMode ? 'bg-[#C5A880]/15 text-[#C5A880]' : 'bg-black/5 text-black'
                                  }`}>
                                    {product.variants.length} Variants
                                  </span>
                                ) : (
                                  <span className="text-gray-500/40 text-[10px]">None</span>
                                )}
                              </td>

                              {/* Status Level */}
                              <td className="py-4 px-4 text-center whitespace-nowrap">
                                {totalProductStock === 0 ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-semibold leading-none">
                                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                    Out of Stock
                                  </span>
                                ) : totalProductStock < 5 ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-semibold leading-none">
                                    <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-semibold leading-none">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                    In Stock
                                  </span>
                                )}
                              </td>

                              {/* Product Actions */}
                              <td className="py-4 pl-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2.5">
                                  {isBaseSaving && (
                                    <span className="inline-block w-3.5 h-3.5 rounded-full border border-t-transparent border-[#C5A880] animate-spin"></span>
                                  )}
                                  
                                  {/* Add Variant Button */}
                                  <button
                                    onClick={() => navigate(`/seller/${product._id}/add-variant`)}
                                    className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded border transition-all ${
                                      isDarkMode ? 'border-[#C5A880]/30 text-[#C5A880] hover:bg-[#C5A880]/10' : 'border-black/25 text-black hover:bg-black/5'
                                    }`}
                                    title="Add new variant options"
                                  >
                                    + Variant
                                  </button>

                                  {/* Edit Product details */}
                                  <button
                                    onClick={() => navigate(`/seller/update-product/${product._id}`)}
                                    className={`p-1.5 rounded transition-all ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}
                                    title="Edit Product Details"
                                  >
                                    ✏️
                                  </button>

                                  {/* Delete Product */}
                                  <button
                                    onClick={() => handleProductDelete(product._id)}
                                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded transition-all"
                                    title="Delete Product Listing"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Nested Variants sub-accordion block */}
                            {isExpanded && hasVariants && (
                              <tr className={isDarkMode ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}>
                                <td colSpan={7} className="px-6 py-3">
                                  <div className={`rounded-xl border p-4 sm:p-5 transition-all duration-300 ${isDarkMode ? 'border-white/5 bg-[#101010]' : 'border-gray-200 bg-white'}`}>
                                    <div className="flex items-center justify-between pb-3 border-b border-dashed border-gray-500/10 mb-3">
                                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#C5A880]">
                                        Variant Allocations
                                      </h4>
                                      <span className="text-[10px] text-gray-500">
                                        Each variant represents a distinct stock allocation.
                                      </span>
                                    </div>

                                    <div className="overflow-x-auto w-full">
                                      <table className="w-full text-left text-xs font-light">
                                        <thead>
                                          <tr className={`border-b text-[9px] font-bold tracking-wider uppercase ${isDarkMode ? 'border-white/5 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                                            <th className="pb-2">Specifications</th>
                                            <th className="pb-2">Price Override</th>
                                            <th className="pb-2 text-center">Stock Level</th>
                                            <th className="pb-2 text-center">Status</th>
                                            <th className="pb-2 text-right">Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-500/5">
                                          {product.variants.map((v) => {
                                            const vTargetId = v._id
                                            const isVEditing = activeEditInputIds[vTargetId]
                                            const tempVVal = editStockInputs[vTargetId] !== undefined ? editStockInputs[vTargetId] : v.stock
                                            const isVSaving = updatingStockId === vTargetId

                                            return (
                                              <tr key={v._id} className="hover:bg-gray-500/5 transition-colors">
                                                {/* Attributes Specification tags */}
                                                <td className="py-2.5">
                                                  <div className="flex flex-wrap gap-1.5">
                                                    {v.attributes && Object.entries(v.attributes).map(([key, value]) => (
                                                      <span key={key} className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                                                        isDarkMode ? 'bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880]' : 'bg-gray-100 border border-gray-200 text-gray-800'
                                                      }`}>
                                                        {key.toUpperCase()}: {value}
                                                      </span>
                                                    ))}
                                                  </div>
                                                </td>

                                                {/* Price override / base price */}
                                                <td className="py-2.5 font-medium">
                                                  {formatCurrency(v.price?.amount || product.price?.amount, v.price?.currency || product.price?.currency)}
                                                </td>

                                                {/* Variant Stock level with steppers & manual inputs */}
                                                <td className="py-2.5">
                                                  <div className="flex items-center justify-center gap-2">
                                                    {/* Stepper Down */}
                                                    <button
                                                      disabled={v.stock <= 0 || isVSaving}
                                                      onClick={() => handleStepStock(product, v, -1)}
                                                      className="w-5 h-5 rounded bg-gray-500/10 hover:bg-gray-500/25 flex items-center justify-center text-xs font-bold transition-all disabled:opacity-40"
                                                    >
                                                      -
                                                    </button>

                                                    {isVEditing ? (
                                                      <div className="flex items-center gap-1">
                                                        <input
                                                          type="number"
                                                          value={tempVVal}
                                                          disabled={isVSaving}
                                                          onChange={(e) => onStockChange(v._id, parseInt(e.target.value) || 0)}
                                                          onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveStock(product._id, v._id, tempVVal)
                                                            if (e.key === 'Escape') cancelEditing(v._id)
                                                          }}
                                                          className={`w-14 text-center rounded border px-1 py-0.5 text-xs focus:outline-none focus:ring-1 font-mono ${
                                                            isDarkMode 
                                                              ? 'bg-[#151515] border-[#2C2C2E] text-white focus:border-[#C5A880] focus:ring-[#C5A880]' 
                                                              : 'bg-white border-gray-300 text-black focus:border-black focus:ring-black'
                                                          }`}
                                                        />
                                                        <button
                                                          disabled={isVSaving}
                                                          onClick={() => handleSaveStock(product._id, v._id, tempVVal)}
                                                          className="p-0.5 text-emerald-500 hover:scale-115 transition-transform"
                                                        >
                                                          ✓
                                                        </button>
                                                        <button
                                                          disabled={isVSaving}
                                                          onClick={() => cancelEditing(v._id)}
                                                          className="p-0.5 text-red-500 hover:scale-115 transition-transform"
                                                        >
                                                          ✕
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <div 
                                                        className="flex items-center gap-1 cursor-pointer group/vstock"
                                                        onClick={() => startEditing(v._id, v.stock)}
                                                      >
                                                        <span className="font-mono text-xs hover:underline">{v.stock}</span>
                                                        <span className="opacity-0 group-hover/vstock:opacity-100 text-[9px] text-gray-500">
                                                          ✏️
                                                        </span>
                                                      </div>
                                                    )}

                                                    {/* Stepper Up */}
                                                    <button
                                                      disabled={isVSaving}
                                                      onClick={() => handleStepStock(product, v, 1)}
                                                      className="w-5 h-5 rounded bg-gray-500/10 hover:bg-gray-500/25 flex items-center justify-center text-xs font-bold transition-all"
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                </td>

                                                {/* Variant Status */}
                                                <td className="py-2.5 text-center">
                                                  {v.stock === 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[9px] font-semibold">
                                                      Out of Stock
                                                    </span>
                                                  ) : v.stock < 5 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-semibold">
                                                      Low Stock
                                                    </span>
                                                  ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-semibold">
                                                      In Stock
                                                    </span>
                                                  )}
                                                </td>

                                                {/* Variant Saving Indicators */}
                                                <td className="py-2.5 text-right font-medium text-[9px] text-gray-500">
                                                  {isVSaving ? (
                                                    <span className="flex items-center justify-end gap-1 font-mono">
                                                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-t-transparent border-[#C5A880] animate-spin"></span>
                                                      Saving...
                                                    </span>
                                                  ) : (
                                                    <span className="opacity-30 font-mono">Synced</span>
                                                  )}
                                                </td>
                                              </tr>
                                            )
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Toast Notification Alert Banner */}
          {toast.show && (
            <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 scale-100 ${
              toast.type === 'success'
                ? isDarkMode
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isDarkMode
                  ? 'bg-red-500/10 border-red-500/20 text-red-500'
                  : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {toast.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Inventory