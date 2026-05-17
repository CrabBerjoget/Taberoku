import React, { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  // cart is { [itemId]: { name, price, qty, subItems?: string[] } }
  const [cart, setCart] = useState({})

  const addItem = useCallback((id, name, price) => {
    setCart((prev) => ({
      ...prev,
      [id]: { name, price, qty: (prev[id]?.qty || 0) + 1 },
    }))
  }, [])

  // Add a combo with selected sub-items
  const addCombo = useCallback((id, name, price, subItems) => {
    setCart((prev) => {
      const existing = prev[id]
      const existingCombos = existing?.combos || []
      return {
        ...prev,
        [id]: {
          name,
          price,
          qty: (existing?.qty || 0) + 1,
          combos: [...existingCombos, subItems],
        },
      }
    })
  }, [])

  const removeItem = useCallback((id) => {
    setCart((prev) => {
      const current = prev[id]
      if (!current || current.qty <= 1) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      const updated = { ...current, qty: current.qty - 1 }
      // Remove last combo selection if exists
      if (updated.combos && updated.combos.length > 0) {
        updated.combos = updated.combos.slice(0, -1)
      }
      return { ...prev, [id]: updated }
    })
  }, [])

  const getQty = useCallback((id) => cart[id]?.qty || 0, [cart])

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0)

  const cartItems = Object.entries(cart)
    .filter(([, item]) => item.qty > 0)
    .map(([id, item]) => ({ id, ...item }))

  // Calculate total price from all cart items
  const totalPrice = cartItems.reduce((sum, item) => {
    const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0
    return sum + priceNum * item.qty
  }, 0)

  const clearCart = useCallback(() => setCart({}), [])

  return (
    <CartContext.Provider value={{ cart, addItem, addCombo, removeItem, getQty, totalItems, cartItems, totalPrice, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
