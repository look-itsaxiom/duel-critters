'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type DiceBox from '@3d-dice/dice-box'

interface DiceRollerProps {
  notation: string // e.g. "3d6", "1d3"
  label: string // e.g. "Star Level", "HP"
  onResult: (rolls: number[], total: number) => void
  disabled?: boolean
}

export default function DiceRoller({ notation, label, onResult, disabled }: DiceRollerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const diceBoxRef = useRef<DiceBox | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [rolling, setRolling] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [resultSplash, setResultSplash] = useState<{ rolls: number[]; total: number } | null>(null)

  useEffect(() => {
    let mounted = true

    async function initDiceBox() {
      const { default: DiceBox } = await import('@3d-dice/dice-box')

      if (!mounted || !containerRef.current) return

      const box = new DiceBox({
        container: '#dice-canvas',
        assetPath: '/assets/',
        theme: 'default',
        scale: 12,
        offscreen: true,
      })

      await box.init()

      if (!mounted) return

      diceBoxRef.current = box
      setIsReady(true)
    }

    initDiceBox().catch((err) => {
      console.error('Failed to initialize DiceBox:', err)
    })

    return () => {
      mounted = false
      if (diceBoxRef.current) {
        diceBoxRef.current.clear()
      }
    }
  }, [])

  const roll = useCallback(async () => {
    if (!diceBoxRef.current || rolling || disabled) return
    setRolling(true)
    setShowOverlay(true)
    setResultSplash(null)

    try {
      const result = await diceBoxRef.current.roll(notation)

      const rolls = result.map((die) => die.value)
      const total = rolls.reduce((a, b) => a + b, 0)

      setResultSplash({ rolls, total })

      // Auto-dismiss after 1.5s
      setTimeout(() => {
        setShowOverlay(false)
        setResultSplash(null)
        setRolling(false)
        onResult(rolls, total)
      }, 1500)
    } catch (err) {
      console.error('Dice roll failed:', err)
      setShowOverlay(false)
      setRolling(false)
    }
  }, [notation, onResult, rolling, disabled])

  return (
    <>
      {/* Roll button — always visible inline */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={roll}
          disabled={!isReady || rolling || disabled}
          className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-lg
                     font-display font-bold rounded-2xl shadow-lg shadow-orange-200
                     hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 active:scale-95"
        >
          {rolling ? 'Rolling...' : `Roll ${notation}`}
        </button>
        {!isReady && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-amber-500" />
            Loading dice...
          </div>
        )}
      </div>

      {/* Fullscreen dice overlay — always in DOM so dice-box container stays mounted.
          We toggle visibility via opacity/pointer-events instead of conditional rendering. */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col items-center justify-center transition-opacity duration-300 ${
          showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Label at top */}
        <div className="relative z-10 mb-4">
          <span className="font-display text-2xl font-bold text-white/90 drop-shadow-lg">
            Rolling for {label}...
          </span>
        </div>

        {/* Dice canvas — always mounted, fills overlay area */}
        <div
          ref={containerRef}
          id="dice-canvas"
          className="relative z-10 w-[90vw] h-[60vh] max-w-2xl rounded-2xl overflow-hidden"
        />

        {/* Result splash */}
        {resultSplash && (
          <div className="relative z-10 mt-6 animate-pop text-center">
            <div className="font-display text-6xl font-bold text-amber-400 drop-shadow-lg">
              {resultSplash.total}
            </div>
            {resultSplash.rolls.length > 1 && (
              <div className="text-lg text-white/70 font-medium mt-1">
                ({resultSplash.rolls.join(' + ')})
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
