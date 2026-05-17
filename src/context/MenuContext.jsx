import React, { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'tabelok_menu_data'
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

function loadMenuData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to pick up any new items added in code
      return {
        loklokSingles: mergeItems(defaultMenuData.loklokSingles, parsed.loklokSingles),
        loklokCombos: mergeItems(defaultMenuData.loklokCombos, parsed.loklokCombos),
        buburItems: mergeItems(defaultMenuData.buburItems, parsed.buburItems),
        buburPromos: mergeItems(defaultMenuData.buburPromos, parsed.buburPromos),
      }
    }
  } catch (e) {
    console.warn('Failed to load menu data from localStorage', e)
  }
  return structuredClone(defaultMenuData)
}

function mergeItems(defaults, stored) {
  if (!stored) return defaults
  return defaults.map((def) => {
    const override = stored.find((s) => s.id === def.id)
    return override ? { ...def, ...override } : def
  })
}

const MenuContext = createContext(null)

export function MenuProvider({ children }) {
  const [menuData, setMenuData] = useState(loadMenuData)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  // Persist to localStorage on change
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
    setMenuData((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
  }

  function resetToDefaults() {
    setMenuData(structuredClone(defaultMenuData))
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
