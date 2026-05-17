import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'tabelok_daily_reports'

const ReportContext = createContext(null)

function loadReports() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get the "business day" key for a given date.
 * Business day resets at 2:00 AM — so 12:30 AM on May 18 still counts as May 17.
 */
function getBusinessDay(date = new Date()) {
  const d = new Date(date)
  if (d.getHours() < 2) {
    d.setDate(d.getDate() - 1)
  }
  return d.toISOString().slice(0, 10) // "YYYY-MM-DD"
}

function getBusinessDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' })
}

export function ReportProvider({ children }) {
  const [reports, setReports] = useState(loadReports)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  }, [reports])

  /**
   * Save or merge entries into today's business-day report.
   * Multiple submissions on the same day are merged (quantities added).
   */
  const saveReport = useCallback((entries) => {
    const businessDay = getBusinessDay()
    const now = new Date()

    setReports((prev) => {
      const existing = prev.find((r) => r.businessDay === businessDay)

      if (existing) {
        // Merge: add new quantities to existing entries
        const mergedEntries = [...existing.entries]
        entries.forEach((newEntry) => {
          const idx = mergedEntries.findIndex((e) => e.id === newEntry.id)
          if (idx >= 0) {
            mergedEntries[idx] = { ...mergedEntries[idx], qty: mergedEntries[idx].qty + newEntry.qty }
          } else {
            mergedEntries.push({ ...newEntry })
          }
        })

        const totalRevenue = mergedEntries.reduce((sum, e) => {
          return sum + (parseFloat(e.price.replace(/[^0-9.]/g, '')) || 0) * e.qty
        }, 0)
        const totalItems = mergedEntries.reduce((sum, e) => sum + e.qty, 0)

        const updated = {
          ...existing,
          entries: mergedEntries,
          totalRevenue,
          totalItems,
          lastUpdated: now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
        }

        return prev.map((r) => (r.businessDay === businessDay ? updated : r))
      } else {
        // New day — create fresh report
        const totalRevenue = entries.reduce((sum, e) => {
          return sum + (parseFloat(e.price.replace(/[^0-9.]/g, '')) || 0) * e.qty
        }, 0)
        const totalItems = entries.reduce((sum, e) => sum + e.qty, 0)

        const report = {
          id: Date.now(),
          businessDay,
          date: getBusinessDayLabel(businessDay),
          time: now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
          lastUpdated: now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
          entries,
          totalRevenue,
          totalItems,
        }
        return [report, ...prev]
      }
    })
  }, [])

  /**
   * Directly overwrite a report's entries (for Edit mode).
   */
  const updateReport = useCallback((reportId, entries) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r
        const totalRevenue = entries.reduce((sum, e) => {
          return sum + (parseFloat(e.price.replace(/[^0-9.]/g, '')) || 0) * e.qty
        }, 0)
        const totalItems = entries.reduce((sum, e) => sum + e.qty, 0)
        const now = new Date()
        return {
          ...r,
          entries,
          totalRevenue,
          totalItems,
          lastUpdated: now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
        }
      })
    )
  }, [])

  const getReport = useCallback((id) => {
    return reports.find((r) => r.id === id) || null
  }, [reports])

  const deleteReport = useCallback((id) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const clearAllReports = useCallback(() => {
    setReports([])
  }, [])

  return (
    <ReportContext.Provider value={{ reports, saveReport, updateReport, getReport, deleteReport, clearAllReports }}>
      {children}
    </ReportContext.Provider>
  )
}

export function useReports() {
  const ctx = useContext(ReportContext)
  if (!ctx) throw new Error('useReports must be used within ReportProvider')
  return ctx
}
