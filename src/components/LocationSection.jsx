import React from 'react'
import { useMenu } from '../context/MenuContext.jsx'

export default function LocationSection() {
  const { menuData } = useMenu()
  const info = menuData?.locationInfo || {
    address: 'No 45, Jalan Kebangsaan, Taman Universiti, 81300 Skudai, Johor',
    openDays: 'Monday - Saturday',
    openHours: '6:00 PM - 12:00 AM',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.3340578663806!2d103.6212563!3d1.5463695999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da73f4e3c66f7f%3A0xe54d8cf12513f173!2sTaman%20Universiti%2C%2081300%20Skudai%2C%20Johor!5e0!3m2!1sen!2smy!4v1700000000000',
  }

  const encodedAddress = encodeURIComponent(info.address)
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

  return (
    <section className="max-w-4xl mx-auto px-4 py-8" id="location">
      {/* Section Divider */}
      <div className="w-24 h-1 bg-warm-gold/30 mx-auto mb-8 rounded-full" />

      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-3xl block mb-2 filter drop-shadow">📍</span>
        <h2 className="font-[Nunito] font-black text-2xl md:text-3xl text-warm-brown tracking-wide">
          Find Us & Store Hours
        </h2>
        <p className="font-[Caveat] text-warm-brown-light text-base md:text-lg mt-1">
          Stop by to grab your warm skewers and fresh bubur ayam!
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Info Card */}
        <div className="md:col-span-5 flex flex-col justify-between p-6 rounded-3xl bg-peach-100/40 backdrop-blur-md border border-white/40 shadow-xl shadow-warm-brown/5 space-y-6">
          <div className="space-y-5">
            {/* Days Section */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 shrink-0 rounded-2xl bg-warm-gold/15 flex items-center justify-center text-lg shadow-sm border border-warm-gold/10">
                🗓️
              </div>
              <div className="min-w-0">
                <h4 className="font-[Fredoka] font-bold text-xs uppercase tracking-wider text-warm-gold">
                  Opening Days
                </h4>
                <p className="font-[Inter] text-sm font-semibold text-warm-brown mt-0.5">
                  {info.openDays || 'Monday - Saturday'}
                </p>
              </div>
            </div>

            {/* Hours Section */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 shrink-0 rounded-2xl bg-warm-red/10 flex items-center justify-center text-lg shadow-sm border border-warm-red/5">
                ⏰
              </div>
              <div className="min-w-0">
                <h4 className="font-[Fredoka] font-bold text-xs uppercase tracking-wider text-warm-red">
                  Store Hours
                </h4>
                <p className="font-[Inter] text-sm font-semibold text-warm-brown mt-0.5">
                  {info.openHours || '6:00 PM - 12:00 AM'}
                </p>
              </div>
            </div>

            {/* Address Section */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 shrink-0 rounded-2xl bg-warm-brown/10 flex items-center justify-center text-lg shadow-sm border border-warm-brown/5">
                📍
              </div>
              <div className="min-w-0">
                <h4 className="font-[Fredoka] font-bold text-xs uppercase tracking-wider text-warm-brown-light/75">
                  Address
                </h4>
                <p className="font-[Inter] text-xs font-medium text-warm-brown/85 leading-relaxed mt-0.5">
                  {info.address || 'No 45, Jalan Kebangsaan, Taman Universiti, 81300 Skudai, Johor'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-2xl bg-warm-brown text-white font-[Fredoka] font-bold text-xs sm:text-sm tracking-wider text-center hover:bg-warm-brown/95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-warm-brown/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            🚗 Get Directions on Google Maps
          </a>
        </div>

        {/* Map Display */}
        <div className="md:col-span-7 rounded-3xl overflow-hidden bg-peach-100/20 border border-white/50 p-2 shadow-xl shadow-warm-brown/5 min-h-[300px] flex">
          {info.mapEmbedUrl ? (
            <iframe
              src={info.mapEmbedUrl}
              className="w-full flex-1 rounded-2xl border border-warm-brown/10 min-h-[300px] bg-white"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location Map"
            />
          ) : (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-warm-brown/5">
              <span className="text-3xl mb-1">🗺️</span>
              <p className="font-[Fredoka] text-warm-brown/50 text-sm font-bold">Map Embed URL not configured</p>
              <p className="font-[Inter] text-warm-brown-light/50 text-[11px] max-w-xs mt-0.5">
                Set the Map Embed Link in the Admin settings to display the interactive map.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
