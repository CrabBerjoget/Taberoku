import React, { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../firebase.js'
import { ref, onValue, set } from 'firebase/database'

const STORAGE_KEY = 'tabelok_menu_data'
const DB_PATH = 'menuData'
const ADMIN_PASSWORD = 'tabelok123'

const defaultMenuData = {
  loklokSingles: [
    { id: 'mee', name: 'Mee', price: 'RM1.50', soldOut: false },
    { id: 'fishball', name: 'Fishball', price: 'RM1.50', soldOut: false },
    { id: 'fishcake', name: 'Fishcake', price: 'RM1.50', soldOut: false },
    { id: 'crabstick', name: 'Crab Stick', price: 'RM1.50', soldOut: false },
    { id: 'cheesetofu-lok', name: 'Cheese Tofu', price: 'RM1.50', soldOut: false },
    { id: 'soup', name: 'Soup', price: 'RM1.00', soldOut: false },
  ],
  loklokCombos: [
    { id: 'combobite6', name: 'ComboBite 6', price: 'RM10.00', soldOut: false, tooltip: '', maxPicks: 6 },
    { id: 'combobalun6', name: 'ComboBalun 6', price: 'RM15.00', soldOut: false, tooltip: '*Pick any 6 Loklok items + Bubur Ayam', maxPicks: 6, includesBubur: true },
    { id: 'comboate13', name: 'ComboAte 13', price: 'RM20.00', soldOut: false, tooltip: '', maxPicks: 13 },
  ],
  buburItems: [
    { id: 'kosong', name: 'Kosong', price: 'RM3.50', soldOut: false },
    { id: 'ayam', name: 'Ayam', price: 'RM5.50', soldOut: false },
    { id: 'cheesetofu-bub', name: 'Cheese Tofu', price: 'RM5.00', soldOut: false },
  ],
  buburPromos: [
    { id: '3xkosong', name: '3x Bubur Kosong', price: 'RM10.00', soldOut: false },
  ],
}

function mergeItems(defaults, stored) {
  if (!stored) return defaults
  return defaults.map((def) => {
    const override = stored.find((s) => s.id === def.id)
    return override ? { ...def, ...override } : def
  })
}

function mergeMenuData(stored) {
  return {
    loklokSingles: mergeItems(defaultMenuData.loklokSingles, stored.loklokSingles),
    loklokCombos: mergeItems(defaultMenuData.loklokCombos, stored.loklokCombos),
    buburItems: mergeItems(defaultMenuData.buburItems, stored.buburItems),
    buburPromos: mergeItems(defaultMenuData.buburPromos, stored.buburPromos),
  }
}

const MenuContext = createContext(null)

export function MenuProvider({ children }) {
  const [menuData, setMenuData] = useState(() => {
    // Load from localStorage as initial state while Firebase loads
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return mergeMenuData(JSON.parse(stored))
    } catch (e) {
      console.warn('Failed to load menu data from localStorage', e)
    }
    return structuredClone(defaultMenuData)
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [fbReady, setFbReady] = useState(false)

  // Listen for real-time menu updates from Firebase
  useEffect(() => {
    const dbRef = ref(db, DB_PATH)
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setMenuData(mergeMenuData(data))
      }
      setFbReady(true)
    }, (error) => {
      console.warn('Firebase menu read failed', error)
      setFbReady(true)
    })
    return () => unsubscribe()
  }, [])

  // Cache to localStorage as backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menuData))
  }, [menuData])

  function login(password) {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      return true
    }
    return false
  }

  function logout() {
    setIsAdmin(false)
    setShowAdmin(false)
  }

  function updateItem(category, id, updates) {
    setMenuData((prev) => {
      const updated = {
        ...prev,
        [category]: prev[category].map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }
      // Sync to Firebase
      set(ref(db, DB_PATH), updated)
      return updated
    })
  }

  function resetToDefaults() {
    const defaults = structuredClone(defaultMenuData)
    setMenuData(defaults)
    set(ref(db, DB_PATH), defaults)
  }

  return (
    <MenuContext.Provider
      value={{
        menuData,
        isAdmin,
        showAdmin,
        setShowAdmin,
        login,
        logout,
        updateItem,
        resetToDefaults,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('useMenu must be used within MenuProvider')
  return ctx
}
