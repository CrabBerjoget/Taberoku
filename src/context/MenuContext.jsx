import React, { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../firebase.js'
import { ref, onValue, set } from 'firebase/database'

const STORAGE_KEY = 'tabelok_menu_data'
const DB_PATH = 'menuData'
const ADMIN_PASSWORD = 'tabelok123'

const defaultMenuData = {
  loklokSingles: [
    { id: 'mee', name: 'Mee', price: 'RM1.50', closingPrice: 'RM1.00', soldOut: false, comingSoon: false },
    { id: 'fishball', name: 'Fishball', price: 'RM1.50', closingPrice: 'RM1.00', soldOut: false, comingSoon: false },
    { id: 'fishcake', name: 'Fishcake', price: 'RM1.50', closingPrice: 'RM1.00', soldOut: false, comingSoon: false },
    { id: 'crabstick', name: 'Crab Stick', price: 'RM1.50', closingPrice: 'RM1.00', soldOut: false, comingSoon: false },
    { id: 'cheesetofu-lok', name: 'Cheese Tofu', price: 'RM1.50', closingPrice: 'RM1.00', soldOut: false, comingSoon: false },
    { id: 'soup', name: 'Soup', price: 'RM1.00', closingPrice: 'RM0.80', soldOut: false, comingSoon: false },
  ],
  loklokCombos: [
    { id: 'combobite6', name: 'ComboBite 6', price: 'RM10.00', closingPrice: 'RM8.00', soldOut: false, tooltip: '', maxPicks: 6, comingSoon: false },
    { id: 'combobalun6', name: 'ComboBalun 6', price: 'RM15.00', closingPrice: 'RM12.00', soldOut: false, tooltip: '*Pick any 6 Loklok items + Bubur Ayam', maxPicks: 6, includesBubur: true, comingSoon: false },
    { id: 'comboate13', name: 'ComboAte 13', price: 'RM20.00', closingPrice: 'RM16.00', soldOut: false, tooltip: '', maxPicks: 13, comingSoon: false },
  ],
  buburItems: [
    { id: 'kosong', name: 'Kosong', price: 'RM3.50', closingPrice: 'RM2.50', soldOut: false, comingSoon: false },
    { id: 'ayam', name: 'Ayam', price: 'RM5.50', closingPrice: 'RM4.50', soldOut: false, comingSoon: false },
    { id: 'cheesetofu-bub', name: 'Cheese Tofu', price: 'RM5.00', closingPrice: 'RM4.00', soldOut: false, comingSoon: false },
  ],
  buburPromos: [
    { id: '3xkosong', name: '3x Bubur Kosong', price: 'RM10.00', closingPrice: 'RM8.00', soldOut: false, comingSoon: false },
  ],
  closingSales: false,
  locationInfo: {
    address: 'Allamanda Night Stall, Kolej Allamanda, Universiti Malaysia Sarawak',
    openDays: 'Monday - Friday',
    openHours: '7:30pm - 11:30pm',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d705.0745821311538!2d110.43186671591273!3d1.4706165899463588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31fba33cfc54597f%3A0x59df071c87b87f47!2sCarpark%20Kafe%20Biru%20Allamanda!5e0!3m2!1sen!2smy!4v1779292346846!5m2!1sen!2smy',
  },
}

function mergeMenuData(stored) {
  if (!stored) return structuredClone(defaultMenuData)

  const mapItem = (item) => ({
    ...item,
    soldOut: typeof item.soldOut === 'boolean' ? item.soldOut : false,
    comingSoon: typeof item.comingSoon === 'boolean' ? item.comingSoon : false,
    closingPrice: item.closingPrice || '',
  })

  return {
    loklokSingles: (stored.loklokSingles || []).map(mapItem),
    loklokCombos: (stored.loklokCombos || []).map(item => ({
      ...mapItem(item),
      tooltip: item.tooltip || '',
      maxPicks: item.maxPicks !== undefined ? Number(item.maxPicks) : 6,
      includesBubur: typeof item.includesBubur === 'boolean' ? item.includesBubur : false,
    })),
    buburItems: (stored.buburItems || []).map(mapItem),
    buburPromos: (stored.buburPromos || []).map(mapItem),
    closingSales: typeof stored.closingSales === 'boolean' ? stored.closingSales : false,
    locationInfo: {
      address: (stored.locationInfo && stored.locationInfo.address) || defaultMenuData.locationInfo.address,
      openDays: (stored.locationInfo && stored.locationInfo.openDays) || defaultMenuData.locationInfo.openDays,
      openHours: (stored.locationInfo && stored.locationInfo.openHours) || defaultMenuData.locationInfo.openHours,
      mapEmbedUrl: (stored.locationInfo && stored.locationInfo.mapEmbedUrl) || defaultMenuData.locationInfo.mapEmbedUrl,
    },
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
        const merged = mergeMenuData(data)

        // One-time migration: replace old placeholder location with correct defaults
        if (data.locationInfo && data.locationInfo.address && data.locationInfo.address.includes('Skudai')) {
          merged.locationInfo = { ...defaultMenuData.locationInfo }
          set(ref(db, DB_PATH), merged)
        }

        setMenuData(merged)
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

  // Auto-off closing sales at 2:00 AM
  useEffect(() => {
    function checkAutoOff() {
      if (!menuData) return
      const currentHour = new Date().getHours()
      if (menuData.closingSales && (currentHour >= 2 && currentHour < 17)) {
        const updated = {
          ...menuData,
          closingSales: false,
        }
        setMenuData(updated)
        set(ref(db, DB_PATH), updated)
        console.log('⏰ Auto-off: Late Night Sales disabled automatically at 2:00 AM.')
      }
    }
    
    checkAutoOff()
    const interval = setInterval(checkAutoOff, 30000) // check every 30 seconds
    return () => clearInterval(interval)
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

  function addItem(category, name, price, extraFields = {}) {
    const baseId = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') || 'item'
    let id = baseId
    let counter = 1
    const allIds = new Set((menuData[category] || []).map(item => item.id))
    while (allIds.has(id)) {
      id = `${baseId}-${counter}`
      counter++
    }

    const newItem = {
      id,
      name: name.trim(),
      price: price.trim(),
      soldOut: false,
      ...extraFields
    }

    const updated = {
      ...menuData,
      [category]: [...(menuData[category] || []), newItem],
    }

    setMenuData(updated)
    set(ref(db, DB_PATH), updated)
  }

  function removeItem(category, id) {
    const updated = {
      ...menuData,
      [category]: (menuData[category] || []).filter((item) => item.id !== id),
    }
    setMenuData(updated)
    set(ref(db, DB_PATH), updated)
  }

  function updateItem(category, id, updates) {
    const updated = {
      ...menuData,
      [category]: (menuData[category] || []).map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }
    setMenuData(updated)
    set(ref(db, DB_PATH), updated)
  }

  function resetToDefaults() {
    const defaults = structuredClone(defaultMenuData)
    setMenuData(defaults)
    set(ref(db, DB_PATH), defaults)
  }

  function toggleClosingSales() {
    const updated = {
      ...menuData,
      closingSales: !menuData.closingSales,
    }
    setMenuData(updated)
    set(ref(db, DB_PATH), updated)
  }

  function updateLocationInfo(updates) {
    const updated = {
      ...menuData,
      locationInfo: {
        ...(menuData.locationInfo || {}),
        ...updates,
      },
    }
    setMenuData(updated)
    set(ref(db, DB_PATH), updated)
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
        addItem,
        removeItem,
        updateItem,
        resetToDefaults,
        toggleClosingSales,
        updateLocationInfo,
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
