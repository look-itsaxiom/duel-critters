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
  const [lastResult, setLastResult] = useState<{ rolls: number[]; total: number } | null>(null)

  useEffect(() => {
    let mounted = true

    async function initDiceBox() {
      // @3d-dice/dice-box must be dynamically imported because it uses
      // Web Workers and BabylonJS, which require a browser environment.
      // A top-level import would break Next.js SSR/SSG.
      const { default: DiceBox } = await import('@3d-dice/dice-box')

      if (!mounted || !containerRef.current) return

      // v1.1.0+ API: constructor takes a single config object.
      // The "container" property is the CSS selector for the target element.
      // The old two-argument API (selector, config) is deprecated.
      const box = new DiceBox({
        container: '#dice-canvas',
        assetPath: '/assets/',
        theme: 'default',
        scale: 6,
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
      // dice-box does not expose a destroy/dispose method,
      // but clearing removes all dice from the scene
      if (diceBoxRef.current) {
        diceBoxRef.current.clear()
      }
    }
  }, [])

  const roll = useCallback(async () => {
    if (!diceBoxRef.current || rolling || disabled) return
    setRolling(true)
    setLastResult(null)

    try {
      // roll() returns a promise that resolves with an array of die result objects.
      // Each object contains a "value" property with the die's rolled value.
      const result = await diceBoxRef.current.roll(notation)

      const rolls = result.map((die) => die.value)
      const total = rolls.reduce((a, b) => a + b, 0)

      setLastResult({ rolls, total })
      setRolling(false)
      onResult(rolls, total)
    } catch (err) {
      console.error('Dice roll failed:', err)
      setRolling(false)
    }
  }, [notation, onResult, rolling, disabled])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-bold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div
        ref={containerRef}
        id="dice-canvas"
        className="relative w-80 h-48 bg-gray-900 rounded-lg overflow-hidden"
      />
      <button
        onClick={roll}
        disabled={!isReady || rolling || disabled}
        className="px-6 py-2 bg-amber-500 text-white font-bold rounded-lg
                   hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        {rolling ? 'Rolling...' : `Roll ${notation}`}
      </button>
      {lastResult && (
        <div className="text-center">
          <span className="text-lg font-bold text-amber-600">{lastResult.total}</span>
          {lastResult.rolls.length > 1 && (
            <span className="ml-2 text-sm text-gray-400">
              ({lastResult.rolls.join(' + ')})
            </span>
          )}
        </div>
      )}
    </div>
  )
}
