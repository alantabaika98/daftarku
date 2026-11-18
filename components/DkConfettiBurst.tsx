'use client';
import React from 'react';

const PIECES = [
  { left: '10%', delay: '0s', color: '#155EEF', size: 'w-2.5 h-2.5', shape: 'rounded-sm' },
  { left: '20%', delay: '0.15s', color: '#FF9F1C', size: 'w-2 h-3', shape: 'rounded-full' },
  { left: '30%', delay: '0.05s', color: '#2589FF', size: 'w-3 h-2', shape: 'rounded-sm' },
  { left: '40%', delay: '0.25s', color: '#FF9F1C', size: 'w-2.5 h-2.5', shape: 'rounded-full' },
  { left: '50%', delay: '0.1s', color: '#155EEF', size: 'w-2 h-3', shape: 'rounded-sm' },
  { left: '60%', delay: '0.2s', color: '#FF9F1C', size: 'w-3 h-2', shape: 'rounded-full' },
  { left: '70%', delay: '0.08s', color: '#2589FF', size: 'w-2.5 h-2.5', shape: 'rounded-sm' },
  { left: '80%', delay: '0.18s', color: '#FF9F1C', size: 'w-2 h-3', shape: 'rounded-full' },
  { left: '90%', delay: '0.12s', color: '#155EEF', size: 'w-2.5 h-2.5', shape: 'rounded-sm' }
];

export function DkConfettiBurst() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dkConfettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
      `}} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 overflow-hidden z-40">
        {PIECES.map((p, i) => (
          <span
            key={i}
            style={{
              left: p.left,
              backgroundColor: p.color,
              animation: `dkConfettiFall 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay} forwards`
            }}
            className={`absolute -top-4 shadow-sm ${p.size} ${p.shape}`}
          />
        ))}
      </div>
    </>
  );
}