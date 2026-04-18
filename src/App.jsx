import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Plane, Check, MapPin } from 'lucide-react'
import { FLIGHT_TYPES, calculateBriefingTime } from './utils/calculator'

// Custom Scroll Snap Time Column (iOS style)
const ScrollColumn = ({ max, value, onChange }) => {
  const items = useMemo(() => Array.from({ length: max + 1 }, (_, i) => String(i).padStart(2, '0')), [max]);
  const itemHeight = 60; // Exact height of one number block
  const ref = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const idx = items.indexOf(value);
    if (idx !== -1 && ref.current) {
      ref.current.scrollTop = idx * itemHeight;
    }
    // Only snap to initial value on mount.
    // User dragging scroll shouldn't be interrupted by strict tracking variables
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    clearTimeout(timeoutRef.current);
    const scrollTop = e.target.scrollTop;
    
    timeoutRef.current = setTimeout(() => {
      const index = Math.round(scrollTop / itemHeight);
      if (items[index] && items[index] !== value) {
        onChange(items[index]);
      }
    }, 150); // Small debounce to not fire unneeded renders mid-bounce
  };

  return (
    <div 
      ref={ref}
      onScroll={handleScroll}
      className="no-scrollbar"
      style={{
        height: `${itemHeight * 3}px`,
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        width: '65px',
        position: 'relative'
      }}
    >
      {/* Top spacer so first element can snap to center exactly */}
      <div style={{ height: `${itemHeight}px` }}></div>
      {items.map(item => {
        const isSelected = item === value;
        return (
          <div 
            key={item}
            style={{
              height: `${itemHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'start', // Start aligns perfectly with 1st spacer element spacing
              fontSize: isSelected ? '2.5rem' : '1.4rem',
              fontWeight: isSelected ? 800 : 500,
              opacity: isSelected ? 1 : 0.4,
              color: isSelected ? '#5221E6' : 'var(--text-light)',
              textShadow: isSelected ? '0 4px 10px rgba(82, 33, 230, 0.2)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
              cursor: 'pointer'
            }}
            onClick={() => {
              const idx = items.indexOf(item);
              ref.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
            }}
          >
            {item}
          </div>
        )
      })}
      {/* Bottom spacer manually pushes scroll height */}
      <div style={{ height: `${itemHeight}px` }}></div>
    </div>
  )
}

function App() {
  const [etd, setEtd] = useState('08:00')
  const [flightType, setFlightType] = useState(Object.values(FLIGHT_TYPES)[0])

  const result = useMemo(() => {
    return calculateBriefingTime(etd, flightType)
  }, [etd, flightType])

  return (
    <>
      {/* Absolute background layer to mimic the stark lighting shadow in the image */}
      <div className="bg-shadow-layer"></div>

      <div className="liquid-panel">
        
        {/* Header section */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h1>ICrewTime</h1>
        </div>

        {/* Time Selector - mimics the white search pill from the image with Scroll Snap */}
        <div>
          <span className="label" style={{ marginBottom: '12px', opacity: 0.7 }}>Departure (ETD)</span>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.4)', 
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '32px',
            padding: '10px 0', 
            position: 'relative', 
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)'
          }}>
            
            {/* Super premium frosted highlight pill acting as selection indicator */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '150px',
              height: '64px',
              border: '1px solid rgba(255,255,255,1)',
              background: 'rgba(255,255,255, 0.8)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06), inset 0 4px 10px rgba(255,255,255,0.9)',
              pointerEvents: 'none',
              borderRadius: '20px',
              zIndex: 1
            }}></div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '12px',
              zIndex: 2,
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'
            }}>
              <ScrollColumn 
                max={23} 
                value={etd.split(':')[0]} 
                onChange={(val) => setEtd(`${val}:${etd.split(':')[1]}`)} 
              />
              
              {/* Premium custom colon dots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 3, opacity: 0.8 }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-dark)' }}></div>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-dark)' }}></div>
              </div>

              <ScrollColumn 
                max={59} 
                value={etd.split(':')[1]} 
                onChange={(val) => setEtd(`${etd.split(':')[0]}:${val}`)} 
              />
            </div>

          </div>
        </div>

        {/* Flight Picker - clear semi-opaque glass strips that light up purple gradient when selected */}
        <div style={{ marginTop: '8px' }}>
          <span className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Flight Type</span>
            <span style={{ color: '#7b4bf3', fontWeight: '700' }}>{result?.group}</span>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.values(FLIGHT_TYPES).map((type) => {
              const isActive = flightType === type;
              // Extract the short prefix (e.g. "1.1") for displaying as an icon
              const prefixMatch = type.match(/^(\d\.\d)/);
              const prefix = prefixMatch ? prefixMatch[1] : '';
              
              // Clean text without the prefix
              const pureText = type.replace(/^\d\.\d\s/, '');
              
              return (
                <button
                  key={type}
                  className={isActive ? 'glass-btn-active' : 'clear-pill'}
                  onClick={() => setFlightType(type)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="icon-circle">
                      {isActive ? <Check size={16} /> : <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{prefix}</span>}
                    </div>
                    <span style={{ textAlign: 'left', lineHeight: '1.3' }}>{pureText}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Results colored glass card */}
        {result && (
          <div className="result-card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="result-label">Briefing Time</span>
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.6)', 
                  padding: '12px 24px', 
                  borderRadius: '24px',
                  boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.9), 0 4px 15px rgba(0,0,0,0.05)',
                  minWidth: '120px',
                  textAlign: 'center',
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#1a1a1a'
                }}
              >
                {result.briefingTime}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="result-label">Pickup Time</span>
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.6)', 
                  padding: '12px 24px', 
                  borderRadius: '24px',
                  boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.9), 0 4px 15px rgba(0,0,0,0.05)',
                  minWidth: '120px',
                  textAlign: 'center',
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#4a2fb6'
                }}
              >
                {result.pickupTime}
              </div>
            </div>
            
            {/* Soft inner pill for Terminal location */}
            <div style={{ 
              marginTop: '4px',
              padding: '12px', 
              background: 'rgba(255,255,255,0.3)', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.5)',
              position: 'relative',
              zIndex: 2
            }}>
              <MapPin size={18} />
              <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{result.terminal}</span>
              <span style={{ fontSize: '0.75rem', marginLeft: 'auto', opacity: 0.8 }}>{result.offsetT1}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
