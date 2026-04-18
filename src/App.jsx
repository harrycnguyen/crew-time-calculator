import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Disc, PlaySquare, Component, Layout, Settings, Clock, ArrowRight, Check } from 'lucide-react'
import { FLIGHT_TYPES, calculateBriefingTime } from './utils/calculator'

// Mapped specific cute gradient colors matching the image's squares
const ICON_COLORS = [
  'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', // Pink
  'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', // Orange/Yellow
  'linear-gradient(135deg, #42E695 0%, #3BB2B8 100%)' // Mint/Teal
];

const ICONS = [PlaySquare, Component, Layout];

// Custom Scroll Snap Time Column (Clean flat style)
const ScrollColumn = ({ max, value, onChange }) => {
  const items = useMemo(() => Array.from({ length: max + 1 }, (_, i) => String(i).padStart(2, '0')), [max]);
  const itemHeight = 60;
  const ref = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const idx = items.indexOf(value);
    if (idx !== -1 && ref.current) {
      ref.current.scrollTop = idx * itemHeight;
    }
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
    }, 100);
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
        width: '70px',
        position: 'relative'
      }}
    >
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
              scrollSnapAlign: 'start',
              fontSize: isSelected ? '2.4rem' : '1.5rem',
              fontWeight: isSelected ? 800 : 600,
              color: isSelected ? 'var(--purple-main)' : 'var(--text-light)',
              opacity: isSelected ? 1 : 0.5,
              transition: 'all 0.2s',
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
    <div className="app-container">
      
      {/* Header */}
      <div className="app-header" style={{ justifyContent: 'center' }}>
        <div className="app-title">ICrewTime</div>
      </div>

      <div className="content-area no-scrollbar">
        
        {/* Soft, rounded scroll wheel container */}
        <div className="scroll-picker-container">
          <div className="picker-highlight"></div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '16px',
            zIndex: 2,
            maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)'
          }}>
            <ScrollColumn 
              max={23} 
              value={etd.split(':')[0]} 
              onChange={(val) => setEtd(`${val}:${etd.split(':')[1]}`)} 
            />
            
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--purple-main)', paddingBottom: '6px' }}>:</div>

            <ScrollColumn 
              max={59} 
              value={etd.split(':')[1]} 
              onChange={(val) => setEtd(`${etd.split(':')[0]}:${val}`)} 
            />
          </div>
        </div>

        {/* Flight Type list replacing the abstract components */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>Flight Categories</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)' }}>{result?.group}</span>
        </div>

        <div>
          {Object.values(FLIGHT_TYPES).map((type, idx) => {
            const isActive = flightType === type;
            const prefixMatch = type.match(/^(\d\.\d)/);
            const prefix = prefixMatch ? prefixMatch[1] : '';
            const pureText = type.replace(/^\d\.\d\s/, '');
            
            const IconComponent = ICONS[idx % ICONS.length];
            const iconBg = ICON_COLORS[idx % ICON_COLORS.length];

            return (
              <div 
                key={type} 
                className={`list-item ${isActive ? 'active' : ''}`}
                onClick={() => setFlightType(type)}
              >
                <div className="icon-box" style={{ background: iconBg }}>
                  <IconComponent size={20} color="#FFF" />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{pureText.substring(0, 22)}{pureText.length > 22 ? '...' : ''}</div>
                  <div className="list-title-sub" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', marginTop: '2px' }}>
                    Type {prefix}
                  </div>
                </div>

                <div style={{ color: isActive ? '#FFF' : 'var(--text-light)' }}>
                  {isActive ? <Check size={18} strokeWidth={3} /> : <ArrowRight size={18} />}
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* The stunning bottom wave drawer */}
      {result && (
        <div className="bottom-wave" style={{ transform: result ? 'translateY(0)' : 'translateY(100%)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Briefing */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: 600 }}>Briefing Time</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '2px' }}>Pre-flight Check</div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '8px 20px', 
                borderRadius: '16px',
                fontSize: '1.8rem',
                fontWeight: 900
              }}>
                {result.briefingTime}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.15)' }}></div>

            {/* Pickup */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: 600 }}>Pickup ({result.terminal})</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '2px' }}>{result.offsetT1}</div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '8px 20px', 
                borderRadius: '16px',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: '#3DE5CC'
              }}>
                {result.pickupTime}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default App
