import React, { useState, useEffect } from 'react'
import { useMenu } from '../context/MenuContext.jsx'
import { useReports } from '../context/ReportContext.jsx'

export default function WorkerReportPage({ onNavigate, editReportId = null }) {
  const { menuData } = useMenu()
  const { saveReport, updateReport, getReport } = useReports()

  const isEditMode = !!editReportId
  const editingReport = isEditMode ? getReport(editReportId) : null

  // quantities: { [itemId]: qty }
  const [quantities, setQuantities] = useState({})
  const [saved, setSaved] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Pre-load quantities when editing
  useEffect(() => {
    if (editingReport) {
      const loaded = {}
      editingReport.entries.forEach((e) => { loaded[e.id] = e.qty })
      setQuantities(loaded)
    }
  }, [editReportId])

  const allItems = [
    ...menuData.loklokSingles.map((i) => ({ ...i, category: 'Loklok' })),
    ...menuData.loklokCombos.map((i) => ({ ...i, category: 'Combo' })),
    ...menuData.buburItems.map((i) => ({ ...i, category: 'Bubur' })),
  ]

  function getQty(id) { return quantities[id] || 0 }

  function add(id) {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
    setSaved(false)
  }

  function remove(id) {
    setQuantities((prev) => {
      const current = prev[id] || 0
      if (current <= 1) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: current - 1 }
    })
    setSaved(false)
  }

  const entries = allItems
    .filter((item) => getQty(item.id) > 0)
    .map((item) => ({ id: item.id, name: item.name, price: item.price, qty: getQty(item.id) }))

  const totalItems = entries.reduce((sum, e) => sum + e.qty, 0)
  const totalRevenue = entries.reduce((sum, e) => {
    const priceNum = parseFloat(e.price.replace(/[^0-9.]/g, '')) || 0
    return sum + priceNum * e.qty
  }, 0)

  function handleSave() {
    if (entries.length === 0) return
    if (isEditMode) {
      updateReport(editReportId, entries)
    } else {
      saveReport(entries, paymentMethod)
    }
    setSaved(true)
    if (!isEditMode) {
      setQuantities({})
      setPaymentMethod('cash')
    }
  }

  // Group items by category
  const groups = [
    { key: 'Loklok', label: '🍢 Single Item', items: menuData.loklokSingles },
    { key: 'Combo', label: '🔥 Combos', items: menuData.loklokCombos },
    { key: 'Bubur', label: "🍚 AlaMeq D' Bubur", items: menuData.buburItems },
  ]

  return (
    <div className="min-h-screen font-[Inter]" style={{ background: 'linear-gradient(135deg, #e8d5c4 0%, #f5e6d3 50%, #e8d5c4 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-warm-brown/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => isEditMode ? onNavigate('reports') : onNavigate('')}
            className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/25 transition-all text-sm"
          >
            ←
          </button>
          <h1 className="font-[Fredoka] font-bold text-white text-base tracking-wide">
            {isEditMode ? '✏️ Edit Report' : '📋 Daily Report'}
          </h1>
          <button
            onClick={() => onNavigate('reports')}
            className="px-3 py-1.5 rounded-lg bg-white/15 font-[Fredoka] text-white/80 text-xs hover:bg-white/25 transition-all"
          >
            History
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Date display */}
        <div className="text-center">
          {isEditMode && editingReport ? (
            <>
              <p className="font-[Caveat] text-warm-brown-light/60 text-lg">Editing report</p>
              <p className="font-[Fredoka] font-bold text-warm-brown text-sm">{editingReport.date}</p>
            </>
          ) : (
            <>
              <p className="font-[Caveat] text-warm-brown-light/60 text-lg">Today&apos;s Sales</p>
              <p className="font-[Fredoka] font-bold text-warm-brown text-sm">
                {new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="font-[Inter] text-warm-brown/40 text-[10px] mt-1">
                Multiple submissions will be merged into today&apos;s report
              </p>
            </>
          )}
        </div>

        {/* Saved banner */}
        {saved && (
          <div className="p-3 rounded-xl bg-green-100/80 border border-green-300/40 text-center animate-slide-up">
            <p className="font-[Fredoka] text-green-700 text-sm font-bold">
              {isEditMode ? '✅ Report updated!' : '✅ Report saved & merged!'}
            </p>
          </div>
        )}

        {/* Menu groups */}
        {groups.map(({ key, label, items }) => (
          <div key={key} className="glass-card rounded-2xl p-4">
            <h3 className="font-[Fredoka] font-bold text-warm-brown text-sm mb-3 flex items-center gap-2">
              {label}
            </h3>
            <div className="space-y-2">
              {items.map((item) => {
                const qty = getQty(item.id)
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${qty > 0 ? 'bg-warm-gold/15 border border-warm-gold/30' : 'bg-white/25 border border-white/15'
                      }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${qty > 0 ? 'bg-warm-red' : 'bg-warm-gold/40'}`} />
                      <span className="font-[Inter] text-warm-brown text-sm font-medium truncate">{item.name}</span>
                      <span className="font-[Fredoka] text-warm-brown/50 text-xs shrink-0">{item.price}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => remove(item.id)}
                        disabled={qty === 0}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all select-none ${qty > 0 ? 'bg-warm-red/15 text-warm-red hover:bg-warm-red/25 active:scale-90' : 'bg-warm-brown/5 text-warm-brown/15'
                          }`}
                      >
                        −
                      </button>
                      <span className={`w-7 text-center font-[Fredoka] font-bold text-sm ${qty > 0 ? 'text-warm-brown' : 'text-warm-brown/15'}`}>
                        {qty}
                      </span>
                      <button
                        onClick={() => add(item.id)}
                        className="w-7 h-7 rounded-full bg-warm-gold/20 text-warm-gold hover:bg-warm-gold/35 active:scale-90 flex items-center justify-center text-sm font-bold transition-all select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Summary + Save */}
        <div className="glass-card rounded-2xl p-4 sticky bottom-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-[Inter] text-warm-brown/50 text-xs">Items sold</p>
              <p className="font-[Fredoka] font-bold text-warm-brown text-lg">{totalItems}</p>
            </div>
            <div className="text-right">
              <p className="font-[Inter] text-warm-brown/50 text-xs">Total revenue</p>
              <p className="font-[Fredoka] font-bold text-warm-red text-lg">RM{totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment method toggle */}
          {!isEditMode && entries.length > 0 && (
            <div className="mb-3">
              <p className="font-[Inter] text-warm-brown/50 text-xs mb-2 text-center">Payment Method</p>
              <div className="flex rounded-xl overflow-hidden border border-warm-brown/15">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 py-2.5 font-[Fredoka] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'cash'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white/30 text-warm-brown/50 hover:bg-white/50'
                  }`}
                >
                  💵 Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex-1 py-2.5 font-[Fredoka] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'qr'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/30 text-warm-brown/50 hover:bg-white/50'
                  }`}
                >
                  📱 QR
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={entries.length === 0}
            className={`w-full px-4 py-3 rounded-xl font-[Fredoka] font-bold text-sm tracking-wide transition-all duration-200 ${entries.length > 0
              ? 'bg-warm-brown text-white hover:bg-warm-brown-light active:scale-95'
              : 'bg-warm-brown/10 text-warm-brown/25 cursor-not-allowed'
              }`}
          >
            {entries.length === 0
              ? 'Add items above to save report'
              : isEditMode
                ? `💾 Update Report (${entries.length} items)`
                : `💾 Save Daily Report (${entries.length} items)`}
          </button>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
