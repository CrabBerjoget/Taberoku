import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import LoklokMenu from './components/LoklokMenu.jsx'
import BuburMenu from './components/BuburMenu.jsx'
import Footer from './components/Footer.jsx'
import FloatingParticles from './components/FloatingParticles.jsx'
import AdminModal from './components/AdminModal.jsx'
import BuyNowButton from './components/BuyNowButton.jsx'
import WorkerReportPage from './pages/WorkerReportPage.jsx'
import ReportHistoryPage from './pages/ReportHistoryPage.jsx'
import { MenuProvider, useMenu } from './context/MenuContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ReportProvider } from './context/ReportContext.jsx'

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.replace('#/', '') || '')

  useEffect(() => {
    function handleHash() {
      setRoute(window.location.hash.replace('#/', '') || '')
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const navigate = useCallback((path) => {
    window.location.hash = `#/${path}`
  }, [])

  return [route, navigate]
}

function MenuPage({ onNavigate }) {
  const { showAdmin, setShowAdmin } = useMenu()

  return (
    <div
      className="min-h-screen font-[Inter] relative animate-gradient"
      style={{
        background: 'linear-gradient(135deg, #FDE6C2 0%, #FFF5E6 25%, #FBCF8E 50%, #FFF8F0 75%, #FDE6C2 100%)',
        backgroundSize: '200% 200%',
      }}
    >
      {/* Floating food particles */}
      <FloatingParticles />

      {/* Subtle dot texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-[1]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #5C3D2E 0.5px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Decorative corner blob - top right */}
      <div className="fixed top-0 right-0 w-80 h-80 pointer-events-none z-[1]">
        <div className="w-full h-full bg-gradient-to-bl from-warm-red/[0.04] to-transparent rounded-full translate-x-1/3 -translate-y-1/3 animate-blob" />
      </div>

      {/* Decorative corner blob - bottom left */}
      <div className="fixed bottom-0 left-0 w-96 h-96 pointer-events-none z-[1]">
        <div className="w-full h-full bg-gradient-to-tr from-warm-gold/[0.05] to-transparent rounded-full -translate-x-1/3 translate-y-1/3 animate-blob" style={{ animationDelay: '6s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <Header />
        <LoklokMenu />
        <BuburMenu />
        <Footer />
      </div>

      {/* Admin modal */}
      {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} onNavigate={onNavigate} />}

      {/* Floating WhatsApp buy button */}
      <BuyNowButton />
    </div>
  )
}

function AppContent() {
  const [route, navigate] = useHashRoute()

  // Parse edit route: "report/edit/12345"
  const editMatch = route.match(/^report\/edit\/(\d+)$/)

  if (editMatch) {
    return <WorkerReportPage onNavigate={navigate} editReportId={Number(editMatch[1])} />
  }

  switch (route) {
    case 'report':
      return <WorkerReportPage onNavigate={navigate} />
    case 'reports':
      return <ReportHistoryPage onNavigate={navigate} />
    default:
      return <MenuPage onNavigate={navigate} />
  }
}

export default function App() {
  return (
    <MenuProvider>
      <CartProvider>
        <ReportProvider>
          <AppContent />
        </ReportProvider>
      </CartProvider>
    </MenuProvider>
  )
}
