import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from '../firebase.js'
import { ref, onValue, set, push, remove, update } from 'firebase/database'

const STORAGE_KEY = 'tabelok_daily_reports'
const DB_PATH = 'reports'

const ReportContext = createContext(null)

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
  const [reports, setReports] = useState([])
  const [loaded, setLoaded] = useState(false)

  // Listen for real-time updates from Firebase
  useEffect(() => {
    const dbRef = ref(db, DB_PATH)
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Convert Firebase object to sorted array
        const arr = Object.keys(data).map((key) => ({ ...data[key], _fbKey: key }))
        arr.sort((a, b) => (b.businessDay || '').localeCompare(a.businessDay || ''))
        setReports(arr)
      } else {
        setReports([])
      }
      setLoaded(true)
    }, (error) => {
      console.warn('Firebase read failed, falling back to localStorage', error)
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        setReports(stored ? JSON.parse(stored) : [])
      } catch {
        setReports([])
      }
      setLoaded(true)
    })
    return () => unsubscribe()
  }, [])

  // Also cache to localStorage as backup
  useEffect(() => {
    if (loaded && reports.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
    }
  }, [reports, loaded])

  /**
   * Save or merge entries into today's business-day report.
   * Multiple submissions on the same day are merged (quantities added).
   */
  const saveReport = useCallback((entries, paymentMethod = 'cash') => {
    const businessDay = getBusinessDay()
    const now = new Date()
    const existing = reports.find((r) => r.businessDay === businessDay)

    // Calculate this submission's revenue
    const submissionRevenue = entries.reduce((sum, e) => {
      return sum + (parseFloat(e.price.replace(/[^0-9.]/g, '')) || 0) * e.qty
    }, 0)

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
        cashTotal: (existing.cashTotal || 0) + (paymentMethod === 'cash' ? submissionRevenue : 0),
        qrTotal: (existing.qrTotal || 0) + (paymentMethod === 'qr' ? submissionRevenue : 0),
        lastUpdated: now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
      }
      delete updated._fbKey

      // Update in Firebase
      const fbKey = existing._fbKey
      if (fbKey) {
        set(ref(db, `${DB_PATH}/${fbKey}`), updated)
      }
    } else {
      // New day — create fresh report
      const totalRevenue = submissionRevenue
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
        cashTotal: paymentMethod === 'cash' ? totalRevenue : 0,
        qrTotal: paymentMethod === 'qr' ? totalRevenue : 0,
      }

      // Push to Firebase
      push(ref(db, DB_PATH), report)
    }
  }, [reports])

  /**
   * Directly overwrite a report's entries (for Edit mode).
   */
  const updateReport = useCallback((reportId, entries, cashTotal = 0, qrTotal = 0) => {
    const report = reports.find((r) => r.id === reportId)
    if (!report) return

    const totalRevenue = entries.reduce((sum, e) => {
      return sum + (parseFloat(e.price.replace(/[^0-9.]/g, '')) || 0) * e.qty
    }, 0)
    const totalItems = entries.reduce((sum, e) => sum + e.qty, 0)
    const now = new Date()

    const updated = {
      ...report,
      entries,
      totalRevenue,
      totalItems,
      cashTotal,
      qrTotal,
      lastUpdated: now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
    }
    delete updated._fbKey

    const fbKey = report._fbKey
    if (fbKey) {
      set(ref(db, `${DB_PATH}/${fbKey}`), updated)
    }
  }, [reports])

  const getReport = useCallback((id) => {
    return reports.find((r) => r.id === id) || null
  }, [reports])

  const deleteReport = useCallback((id) => {
    const report = reports.find((r) => r.id === id)
    if (report && report._fbKey) {
      remove(ref(db, `${DB_PATH}/${report._fbKey}`))
    }
  }, [reports])

  const clearAllReports = useCallback(() => {
    set(ref(db, DB_PATH), null)
    localStorage.removeItem(STORAGE_KEY)
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
