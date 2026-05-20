import React, { useState, useEffect } from 'react'
import { useMenu } from '../context/MenuContext.jsx'

const CATEGORIES = [
  { key: 'loklokSingles', label: '🍢 Loklok — Single Item', hasExtra: false },
  { key: 'loklokCombos', label: '🔥 Loklok — Combos', hasExtra: true },
  { key: 'buburItems', label: "🍚 AlaMeq D'Bubur", hasExtra: false },
  { key: 'buburPromos', label: '🎉 Bubur — Promos', hasExtra: false },
]

export default function AdminPage({ onNavigate }) {
  const { menuData, isAdmin, login, logout, addItem, removeItem, updateItem, resetToDefaults, updateLocationInfo, toggleClosingSales } = useMenu()

  // Gated login state
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [shake, setShake] = useState(false)

  // Active Category tab
  const [activeCategory, setActiveCategory] = useState('loklokSingles')

  // Add Product Form state
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newClosingPrice, setNewClosingPrice] = useState('')
  const [newComingSoon, setNewComingSoon] = useState(false)
  const [newTooltip, setNewTooltip] = useState('')
  const [newMaxPicks, setNewMaxPicks] = useState(6)
  const [newIncludesBubur, setNewIncludesBubur] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Edit Product state (id of product being edited)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editClosingPrice, setEditClosingPrice] = useState('')
  const [editComingSoon, setEditComingSoon] = useState(false)
  const [editTooltip, setEditTooltip] = useState('')
  const [editMaxPicks, setEditMaxPicks] = useState(6)
  const [editIncludesBubur, setEditIncludesBubur] = useState(false)

  // Location and Store Info state
  const [storeAddress, setStoreAddress] = useState('')
  const [storeOpenDays, setStoreOpenDays] = useState('')
  const [storeOpenHours, setStoreOpenHours] = useState('')
  const [storeMapEmbedUrl, setStoreMapEmbedUrl] = useState('')

  // Delete product confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Success notifications
  const [notification, setNotification] = useState('')

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(''), 3000)
      return () => clearTimeout(t)
    }
  }, [notification])

  useEffect(() => {
    if (menuData?.locationInfo) {
      setStoreAddress(menuData.locationInfo.address || '')
      setStoreOpenDays(menuData.locationInfo.openDays || '')
      setStoreOpenHours(menuData.locationInfo.openHours || '')
      setStoreMapEmbedUrl(menuData.locationInfo.mapEmbedUrl || '')
    }
  }, [menuData])

  function showToast(msg) {
    setNotification(msg)
  }

  function handleSaveStoreInfo(e) {
    e.preventDefault()
    updateLocationInfo({
      address: storeAddress.trim(),
      openDays: storeOpenDays.trim(),
      openHours: storeOpenHours.trim(),
      mapEmbedUrl: storeMapEmbedUrl.trim(),
    })
    showToast('💾 Store location & hours updated!')
  }

  function handleLogin(e) {
    e.preventDefault()
    if (login(passwordInput)) {
      setLoginError(false)
    } else {
      setLoginError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  function handleAddProduct(e) {
    e.preventDefault()
    if (!newName.trim() || !newPrice.trim()) {
      showToast('⚠️ Please enter both name and price!')
      return
    }

    const priceFormatted = newPrice.trim().toUpperCase().startsWith('RM') 
      ? newPrice.trim() 
      : `RM${newPrice.trim()}`

    const closingPriceFormatted = newClosingPrice.trim() !== ''
      ? (newClosingPrice.trim().toUpperCase().startsWith('RM') ? newClosingPrice.trim() : `RM${newClosingPrice.trim()}`)
      : ''

    const extraFields = {
      comingSoon: newComingSoon,
      closingPrice: closingPriceFormatted,
    }

    if (activeCategory === 'loklokCombos') {
      extraFields.tooltip = newTooltip.trim()
      extraFields.maxPicks = Number(newMaxPicks) || 6
      extraFields.includesBubur = newIncludesBubur
    }

    addItem(activeCategory, newName, priceFormatted, extraFields)
    showToast(`✅ Added "${newName}" successfully!`)

    // Clear form
    setNewName('')
    setNewPrice('')
    setNewClosingPrice('')
    setNewComingSoon(false)
    setNewTooltip('')
    setNewMaxPicks(6)
    setNewIncludesBubur(false)
    setShowAddForm(false)
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditPrice(item.price)
    setEditClosingPrice(item.closingPrice || '')
    setEditComingSoon(item.comingSoon || false)
    setEditTooltip(item.tooltip || '')
    setEditMaxPicks(item.maxPicks || 6)
    setEditIncludesBubur(item.includesBubur || false)
  }

  function handleSaveEdit(item) {
    if (!editName.trim() || !editPrice.trim()) {
      showToast('⚠️ Name and price cannot be empty!')
      return
    }

    const priceFormatted = editPrice.trim().toUpperCase().startsWith('RM')
      ? editPrice.trim()
      : `RM${editPrice.trim()}`

    const closingPriceFormatted = editClosingPrice.trim() !== ''
      ? (editClosingPrice.trim().toUpperCase().startsWith('RM') ? editClosingPrice.trim() : `RM${editClosingPrice.trim()}`)
      : ''

    const updates = {
      name: editName.trim(),
      price: priceFormatted,
      closingPrice: closingPriceFormatted,
      comingSoon: editComingSoon,
    }

    if (activeCategory === 'loklokCombos') {
      updates.tooltip = editTooltip.trim()
      updates.maxPicks = Number(editMaxPicks) || 6
      updates.includesBubur = editIncludesBubur
    }

    updateItem(activeCategory, item.id, updates)
    setEditingId(null)
    showToast('💾 Item updated successfully!')
  }

  function handleDelete(id) {
    removeItem(activeCategory, id)
    setConfirmDeleteId(null)
    showToast('🗑️ Item deleted successfully!')
  }

  // Gated login screen
  if (!isAdmin) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 font-[Inter] animate-gradient"
        style={{
          background: 'linear-gradient(135deg, #FDE6C2 0%, #FFF5E6 25%, #FBCF8E 50%, #FFF8F0 75%, #FDE6C2 100%)',
          backgroundSize: '200% 200%',
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #5C3D2E 0.5px, transparent 0)`, backgroundSize: '20px 20px' }} />
        
        <div className={`relative w-full max-w-md bg-peach-100/90 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-2xl shadow-warm-brown/20 transition-all ${shake ? 'animate-wiggle' : ''}`}>
          
          <button
            onClick={() => onNavigate('')}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-warm-brown/10 flex items-center justify-center text-warm-brown/60 hover:bg-warm-brown/20 transition-all font-bold"
          >
            ←
          </button>

          <div className="text-center mt-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-brown/10 flex items-center justify-center text-3xl">
              🔐
            </div>
            <h2 className="font-[Nunito] font-black text-3xl text-warm-brown mb-1">Admin Panel</h2>
            <p className="font-[Inter] text-warm-brown-light/60 text-sm mb-6">Access product & price control center</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setLoginError(false) }}
                placeholder="Enter Admin Password"
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl bg-white/50 border border-white/60 font-[Inter] text-warm-brown text-sm placeholder:text-warm-brown/30 focus:outline-none focus:ring-2 focus:ring-warm-gold/40 focus:border-warm-gold/40 transition-all"
              />
              {loginError && (
                <p className="font-[Fredoka] text-warm-red text-xs">Incorrect password, please try again</p>
              )}
              <button
                type="submit"
                className="w-full px-4 py-3.5 rounded-xl bg-warm-brown text-white font-[Fredoka] font-bold text-sm tracking-wide hover:bg-warm-brown-light active:scale-95 transition-all duration-200"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard screen
  const currentItems = menuData[activeCategory] || []
  const activeLabel = CATEGORIES.find(c => c.key === activeCategory)?.label || ''

  return (
    <div 
      className="min-h-screen font-[Inter] pb-12"
      style={{
        background: 'linear-gradient(135deg, #e8d5c4 0%, #f5e6d3 50%, #e8d5c4 100%)'
      }}
    >
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-warm-brown text-white font-[Fredoka] text-sm shadow-xl animate-slide-up">
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-warm-brown/95 backdrop-blur-sm shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('')}
              className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/25 transition-all font-bold"
            >
              ←
            </button>
            <h1 className="font-[Nunito] font-black text-xl sm:text-2xl text-white tracking-wide flex items-center gap-1.5">
              <span>⚙️</span> <span className="hidden sm:inline">Admin Dashboard</span><span className="sm:hidden text-base">Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('reports')}
              className="px-3 py-1.5 rounded-lg bg-white/10 font-[Fredoka] text-white/85 text-xs hover:bg-white/20 transition-all flex items-center gap-1"
            >
              📋 Reports
            </button>
            <button
              onClick={() => { logout(); onNavigate('') }}
              className="px-3 py-1.5 rounded-lg bg-warm-red/80 font-[Fredoka] text-white text-xs hover:bg-warm-red transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Navigation Info */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white/30 backdrop-blur-md border border-white/40 p-4 rounded-2xl gap-3">
          <div className="text-center sm:text-left">
            <p className="font-[Caveat] text-warm-brown-light text-lg">Logged in as Administrator</p>
            <p className="font-[Fredoka] font-bold text-warm-brown text-xs">
              Manage your products, set pricing, or toggle availability.
            </p>
          </div>
          <button
            onClick={() => onNavigate('report')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-warm-gold text-white font-[Fredoka] font-bold text-xs tracking-wider hover:bg-warm-gold/90 transition-all duration-200"
          >
            ✍️ Open Live Sales Entry
          </button>
        </div>

        {/* Global Late Night Toggle switch card */}
        <div className="bg-gradient-to-r from-warm-red/10 via-peach-200/40 to-warm-gold/10 border border-warm-red/20 shadow-md rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌙</span>
            <div>
              <h3 className="font-[Fredoka] font-bold text-warm-brown text-sm">Late Night / Closing Sales Mode</h3>
              <p className="font-[Caveat] text-warm-brown-light/80 text-sm">
                When active, custom promotional prices apply to items on the storefront automatically!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`font-[Fredoka] text-xs uppercase tracking-wider font-bold ${menuData.closingSales ? 'text-warm-red animate-pulse' : 'text-warm-brown-light/60'}`}>
              {menuData.closingSales ? 'Active 🌙' : 'Inactive'}
            </span>
            <button
              onClick={() => {
                toggleClosingSales()
                showToast(`Late Night Sales Mode ${!menuData.closingSales ? 'ENABLED 🌙' : 'DISABLED'}`)
              }}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 cursor-pointer ${
                menuData.closingSales ? 'bg-warm-red' : 'bg-warm-brown/20'
              }`}
              title="Toggle Late Night / Closing Sales Mode"
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                menuData.closingSales ? 'left-[30px]' : 'left-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map(({ key, label }) => {
            const isActive = activeCategory === key
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveCategory(key)
                  setEditingId(null)
                  setShowAddForm(false)
                }}
                className={`py-3 px-2 rounded-xl font-[Fredoka] font-bold text-xs sm:text-sm tracking-wide text-center transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-warm-brown text-white shadow-md shadow-warm-brown/20' 
                    : 'bg-white/40 text-warm-brown/70 hover:bg-white/60'
                }`}
              >
                {label.split(' — ')[0]} {/* Shorter label for tab */}
                <span className="block text-[10px] font-normal opacity-60 mt-0.5 sm:inline sm:ml-1 sm:mt-0">
                  ({menuData[key]?.length || 0})
                </span>
              </button>
            )
          })}
        </div>

        {/* Products Management Card */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-warm-brown/10 pb-4 gap-3">
            <div>
              <h2 className="font-[Nunito] font-black text-xl text-warm-brown">{activeLabel}</h2>
              <p className="font-[Inter] text-warm-brown-light/70 text-xs">Add, edit, or toggle sold out status below.</p>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl bg-green-600 text-white font-[Fredoka] font-bold text-xs hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              {showAddForm ? '✕ Cancel Add' : '➕ Add Product'}
            </button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <form onSubmit={handleAddProduct} className="p-4 rounded-2xl bg-white/40 border border-white/60 space-y-4 animate-slide-up">
              <h3 className="font-[Fredoka] font-bold text-warm-brown text-sm">Add New Product to {activeLabel.split(' — ')[0]}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-[Fredoka] text-warm-brown mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Cheese Sausage"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-warm-brown/25 text-warm-brown text-sm placeholder:text-warm-brown/30 focus:outline-none focus:ring-2 focus:ring-warm-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[Fredoka] text-warm-brown mb-1">Price (RM)</label>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="e.g. 1.50 or RM1.50"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-warm-brown/25 text-warm-brown text-sm placeholder:text-warm-brown/30 focus:outline-none focus:ring-2 focus:ring-warm-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[Fredoka] text-warm-brown mb-1">Late Night Sale Price (RM, Optional)</label>
                  <input
                    type="text"
                    value={newClosingPrice}
                    onChange={(e) => setNewClosingPrice(e.target.value)}
                    placeholder="e.g. 1.00"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-warm-brown/25 text-warm-brown text-sm placeholder:text-warm-brown/30 focus:outline-none focus:ring-2 focus:ring-warm-gold/40"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="newComingSoon"
                    checked={newComingSoon}
                    onChange={(e) => setNewComingSoon(e.target.checked)}
                    className="w-4 h-4 rounded text-warm-gold focus:ring-warm-gold/40"
                  />
                  <label htmlFor="newComingSoon" className="text-xs font-[Fredoka] text-warm-brown font-bold cursor-pointer">
                    Toggle Coming Soon (Disable purchases)
                  </label>
                </div>
              </div>

              {activeCategory === 'loklokCombos' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-[Fredoka] text-warm-brown mb-1">Tooltip / Description (Optional)</label>
                    <input
                      type="text"
                      value={newTooltip}
                      onChange={(e) => setNewTooltip(e.target.value)}
                      placeholder="e.g. *Pick any 6 Loklok items + Sauce"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-warm-brown/25 text-warm-brown text-sm placeholder:text-warm-brown/30 focus:outline-none focus:ring-2 focus:ring-warm-gold/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-[Fredoka] text-warm-brown mb-1">Max Picks</label>
                    <input
                      type="number"
                      value={newMaxPicks}
                      onChange={(e) => setNewMaxPicks(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-warm-brown/25 text-warm-brown text-sm focus:outline-none focus:ring-2 focus:ring-warm-gold/40"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="newIncludesBubur"
                      checked={newIncludesBubur}
                      onChange={(e) => setNewIncludesBubur(e.target.checked)}
                      className="w-4 h-4 rounded text-warm-gold focus:ring-warm-gold/40"
                    />
                    <label htmlFor="newIncludesBubur" className="text-xs font-[Inter] font-medium text-warm-brown">
                      Includes Free Bubur Ayam Promo
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-[Fredoka] font-bold text-xs tracking-wider transition-all"
              >
                Submit New Product
              </button>
            </form>
          )}

          {/* Products List */}
          {currentItems.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-4xl block mb-2">🍽️</span>
              <p className="font-[Fredoka] text-warm-brown/50 text-sm">No items in this category yet.</p>
              <button 
                onClick={() => setShowAddForm(true)} 
                className="mt-2 font-[Fredoka] text-warm-gold text-xs underline font-bold hover:text-warm-brown"
              >
                Create one now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentItems.map((item) => {
                const isEditing = editingId === item.id
                
                return (
                  <div 
                    key={item.id}
                    className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl transition-all border ${
                      item.soldOut 
                        ? 'bg-warm-brown/5 border-warm-brown/10 opacity-75' 
                        : 'bg-white/40 border-white/20 hover:bg-white/50'
                    }`}
                  >
                    {isEditing ? (
                      /* Editing Mode Form */
                      <div className="flex-1 space-y-3 pr-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-[Fredoka] text-warm-brown mb-0.5">Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-warm-brown/30 font-[Inter] text-warm-brown text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-[Fredoka] text-warm-brown mb-0.5">Price</label>
                            <input
                              type="text"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-warm-brown/30 font-[Fredoka] text-warm-brown text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-[Fredoka] text-warm-brown mb-0.5">Late Night Price</label>
                            <input
                              type="text"
                              value={editClosingPrice}
                              onChange={(e) => setEditClosingPrice(e.target.value)}
                              placeholder="e.g. 1.00"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-warm-brown/30 font-[Fredoka] text-warm-brown text-xs focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 pt-4">
                            <input
                              type="checkbox"
                              id={`editComingSoon-${item.id}`}
                              checked={editComingSoon}
                              onChange={(e) => setEditComingSoon(e.target.checked)}
                              className="w-4 h-4 rounded text-warm-gold focus:ring-warm-gold/40"
                            />
                            <label htmlFor={`editComingSoon-${item.id}`} className="text-xs font-[Fredoka] font-bold text-warm-brown cursor-pointer">
                              Coming Soon
                            </label>
                          </div>
                        </div>

                        {activeCategory === 'loklokCombos' && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-[Fredoka] text-warm-brown mb-0.5">Tooltip</label>
                              <input
                                type="text"
                                value={editTooltip}
                                onChange={(e) => setEditTooltip(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-warm-brown/30 font-[Inter] text-warm-brown text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-[Fredoka] text-warm-brown mb-0.5">Max Picks</label>
                              <input
                                type="number"
                                value={editMaxPicks}
                                onChange={(e) => setEditMaxPicks(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-warm-brown/30 font-[Inter] text-warm-brown text-xs focus:outline-none"
                              />
                            </div>
                            <div className="sm:col-span-3 flex items-center gap-1.5 pt-1">
                              <input
                                type="checkbox"
                                id={`editIncludesBubur-${item.id}`}
                                checked={editIncludesBubur}
                                onChange={(e) => setEditIncludesBubur(e.target.checked)}
                                className="w-4 h-4 rounded text-warm-gold focus:ring-warm-gold/40"
                              />
                              <label htmlFor={`editIncludesBubur-${item.id}`} className="text-xs font-[Inter] text-warm-brown">
                                Includes Bubur
                              </label>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleSaveEdit(item)}
                            className="px-3 py-1.5 rounded-lg bg-green-600 text-white font-[Fredoka] font-bold text-xs hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-warm-brown/10 text-warm-brown font-[Fredoka] text-xs hover:bg-warm-brown/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between pr-4 gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${item.soldOut ? 'bg-warm-red' : item.comingSoon ? 'bg-warm-gold animate-pulse' : 'bg-green-500'}`} />
                            <span className={`font-[Inter] text-sm font-semibold whitespace-normal break-words ${item.soldOut ? 'text-warm-brown/40 line-through' : 'text-warm-brown'}`}>
                              {item.name}
                            </span>
                            {item.soldOut && (
                              <span className="text-[8px] font-[Fredoka] text-white bg-warm-red px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold shrink-0">
                                Sold Out
                              </span>
                            )}
                            {item.comingSoon && (
                              <span className="text-[8px] font-[Fredoka] text-white bg-warm-gold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold shrink-0">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-warm-brown-light/50 font-mono mt-0.5">
                            ID: {item.id}
                            {item.closingPrice && ` | Late Night: ${item.closingPrice}`}
                            {item.tooltip && ` | Tooltip: "${item.tooltip}"`}
                            {item.maxPicks !== undefined && ` | Max Picks: ${item.maxPicks}`}
                            {item.includesBubur && ` | +Bubur`}
                          </div>
                        </div>

                        <div className="font-[Fredoka] font-bold text-sm text-warm-red shrink-0 self-start sm:self-auto flex flex-col items-end">
                          <span>{item.price}</span>
                          {item.closingPrice && (
                            <span className="text-[10px] text-warm-brown-light/60 font-normal">
                              🌙 {item.closingPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions panel */}
                    {!isEditing && (
                      <div className="flex flex-wrap items-center gap-3 shrink-0 mt-3 md:mt-0 border-t border-warm-brown/5 pt-3 md:pt-0 md:border-t-0">
                        {/* Coming soon toggle switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-[Fredoka] text-warm-brown/60">Coming Soon:</span>
                          <button
                            onClick={() => updateItem(activeCategory, item.id, { comingSoon: !item.comingSoon })}
                            className={`w-9 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${
                              item.comingSoon ? 'bg-warm-gold' : 'bg-warm-brown/20'
                            }`}
                            title={item.comingSoon ? 'Disable coming soon' : 'Enable coming soon'}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                              item.comingSoon ? 'left-[18px]' : 'left-0.5'
                            }`} />
                          </button>
                        </div>

                        {/* Sold out toggle switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-[Fredoka] text-warm-brown/60">Sold Out:</span>
                          <button
                            onClick={() => updateItem(activeCategory, item.id, { soldOut: !item.soldOut })}
                            className={`w-9 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${
                              item.soldOut ? 'bg-warm-red' : 'bg-warm-brown/20'
                            }`}
                            title={item.soldOut ? 'Mark available' : 'Mark sold out'}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                              item.soldOut ? 'left-[18px]' : 'left-0.5'
                            }`} />
                          </button>
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={() => startEdit(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-warm-brown/10 font-[Fredoka] text-warm-brown text-xs font-bold hover:bg-warm-brown/20 transition-colors"
                        >
                          ✏️ Edit
                        </button>

                        {/* Delete Button */}
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1.5 animate-slide-up">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-warm-red text-white font-[Fredoka] text-xs font-bold hover:bg-warm-red-dark transition-colors"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1.5 rounded-lg bg-warm-brown/10 font-[Fredoka] text-warm-brown text-xs hover:bg-warm-brown/20"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-warm-red/10 font-[Fredoka] text-warm-red text-xs hover:bg-warm-red/20 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Store Location & Hours Settings */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="font-[Nunito] font-black text-xl text-warm-brown flex items-center gap-2">
              <span>📍</span> Store Location & Hours
            </h2>
            <p className="font-[Inter] text-warm-brown-light/70 text-xs">
              Configure your address, business opening days, hours, and interactive Google Map URL.
            </p>
          </div>
          
          <form onSubmit={handleSaveStoreInfo} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-[Fredoka] text-warm-brown mb-1">Opening Days</label>
                <input
                  type="text"
                  value={storeOpenDays}
                  onChange={(e) => setStoreOpenDays(e.target.value)}
                  placeholder="e.g. Monday - Saturday"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-warm-brown/25 text-warm-brown text-sm placeholder:text-warm-brown/30 focus:outline-none focus:ring-2 focus:ring-warm-gold/40"
                />
              </div>
              <div>
                <label className="block text-xs font-[Fredoka] text-warm-brown mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={storeOpenHours}
                  onChange={(e) => setStoreOpenHours(e.target.value)}
                  placeholder="e.g. 6:00 PM - 12:00 AM"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-warm-brown/25 text-warm-brown text-sm placeholder:text-warm-brown/30 focus:outline-none focus:ring-2 focus:ring-warm-gold/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-[Fredoka] text-warm-brown mb-1">Store Address</label>
              <textarea
                rows={2}
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="e.g. No 45, Jalan Kebangsaan, Taman Universiti, 81300 Skudai, Johor"
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-warm-brown/25 text-warm-brown text-sm placeholder:text-warm-brown/30 focus:outline-none focus:ring-2 focus:ring-warm-gold/40 font-[Inter] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-[Fredoka] text-warm-brown mb-1">Google Maps Embed URL</label>
              <input
                type="text"
                value={storeMapEmbedUrl}
                onChange={(e) => setStoreMapEmbedUrl(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-warm-brown/25 text-warm-brown text-xs placeholder:text-warm-brown/30 focus:outline-none focus:ring-2 focus:ring-warm-gold/40"
              />
              <p className="text-[10px] text-warm-brown-light/50 font-[Inter] mt-1.5 leading-relaxed">
                <strong>💡 How to get this:</strong> Go to <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="underline text-warm-gold font-bold">Google Maps</a>, search for your location, click <strong>Share</strong> → <strong>Embed a map</strong>, and copy only the <code>src</code> attribute URL from the iframe code (starts with <code>https://www.google.com/maps/embed...</code>).
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-warm-brown hover:bg-warm-brown/95 text-white font-[Fredoka] font-bold text-xs tracking-wider transition-all shadow-md shadow-warm-brown/10 cursor-pointer"
              >
                💾 Save Store Info
              </button>
            </div>
          </form>
        </div>

        {/* Database resets */}
        <div className="glass-card rounded-2xl p-4 border border-warm-red/20 bg-warm-red/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-[Fredoka] font-bold text-warm-red text-sm">🔄 Database Maintenance</h3>
              <p className="font-[Inter] text-warm-brown/65 text-xs">Reset the menu data to the standard system defaults. This overrides all custom modifications.</p>
            </div>
            
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="font-[Inter] text-warm-brown text-xs font-semibold">Are you absolutely sure?</span>
                <button
                  onClick={() => { resetToDefaults(); setShowResetConfirm(false); showToast('🔄 Reset menu to default items!') }}
                  className="px-3 py-1.5 rounded-lg bg-warm-red text-white font-[Fredoka] text-xs hover:bg-warm-red-dark transition-colors"
                >
                  Yes, Reset All
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-warm-brown/10 font-[Fredoka] text-warm-brown text-xs hover:bg-warm-brown/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-warm-red text-white font-[Fredoka] font-bold text-xs hover:bg-warm-red-dark transition-all"
              >
                Reset All Menu Items
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
