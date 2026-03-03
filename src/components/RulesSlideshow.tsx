'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { SLIDES, ACCENT_CLASSES } from '@/lib/rulesSlides'
import type { RuleSlide, AccentClasses } from '@/lib/rulesSlides'

export default function RulesSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const touchStartX = useRef<number | null>(null)

  const slide = SLIDES[currentIndex]
  const colors = ACCENT_CLASSES[slide.accentColor]
  const totalSlides = SLIDES.length
  const isFirst = currentIndex === 0
  const isLast = currentIndex === totalSlides - 1

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= totalSlides || index === currentIndex) return
    setDirection(index > currentIndex ? 'right' : 'left')
    setCurrentIndex(index)
  }, [currentIndex, totalSlides])

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  // Touch swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 50) goPrev()
    else if (delta < -50) goNext()
    touchStartX.current = null
  }, [goNext, goPrev])

  return (
    <div
      className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-8 sm:px-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide counter */}
      <p className={`font-display text-sm font-bold ${colors.text}`}>
        {currentIndex + 1} of {totalSlides}
      </p>

      {/* Slide area with nav buttons */}
      <div className="relative w-full">
        {/* Prev button */}
        <button
          onClick={goPrev}
          disabled={isFirst}
          aria-label="Previous slide"
          className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center
                     rounded-full bg-white/90 text-2xl font-bold text-gray-500 shadow-lg backdrop-blur
                     transition-all duration-200 hover:scale-110 hover:bg-white hover:text-gray-700 hover:shadow-xl
                     disabled:opacity-0 disabled:pointer-events-none sm:-left-6 sm:h-14 sm:w-14"
        >
          &#8249;
        </button>

        {/* Slide content — key forces remount to retrigger animation */}
        <div
          key={currentIndex}
          className={direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
        >
          <SlideContent slide={slide} colors={colors} />
        </div>

        {/* Next button (becomes Print CTA on last slide) */}
        {!isLast ? (
          <button
            onClick={goNext}
            aria-label="Next slide"
            className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center
                       rounded-full bg-white/90 text-2xl font-bold text-gray-500 shadow-lg backdrop-blur
                       transition-all duration-200 hover:scale-110 hover:bg-white hover:text-gray-700 hover:shadow-xl
                       sm:-right-6 sm:h-14 sm:w-14"
          >
            &#8250;
          </button>
        ) : (
          <button
            onClick={() => window.print()}
            className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 flex h-12 items-center gap-2
                       rounded-full bg-gradient-to-r from-emerald-400 to-green-500 px-5 text-sm font-bold
                       text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl
                       sm:-right-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0118 8.653v4.097A2.25 2.25 0 0115.75 15h-.25v.75c0 .966-.784 1.75-1.75 1.75h-7.5A1.75 1.75 0 014.5 15.75V15h-.25A2.25 2.25 0 012 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75zm1.5 0v3.362a40 40 0 017 0V2.75a.25.25 0 00-.25-.25h-6.5a.25.25 0 00-.25.25zm-1 7.5v5.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-5.5a.25.25 0 00-.25-.25h-7.5a.25.25 0 00-.25.25z" clipRule="evenodd" />
            </svg>
            Print
          </button>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {SLIDES.map((s, i) => {
          const c = ACCENT_CLASSES[s.accentColor]
          return (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Go to ${s.title}`}
              className={`h-3 w-3 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? `${c.dotActive} scale-125 shadow-sm`
                  : `${c.dot} ${c.dotHover}`
              }`}
            />
          )
        })}
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-gray-400 font-medium">
        Use arrow keys, swipe, or click dots to navigate
      </p>
    </div>
  )
}

/* ─── Slide Content Renderer ─── */

function SlideContent({ slide, colors }: { slide: RuleSlide; colors: AccentClasses }) {
  return (
    <div className={`rounded-2xl border-2 ${colors.border} bg-white p-6 shadow-md sm:p-8 min-h-[340px] flex flex-col`}>
      <h2 className={`font-display mb-4 flex items-center gap-3 text-2xl font-bold sm:text-3xl ${colors.textDark}`}>
        <span className="text-3xl sm:text-4xl animate-bounce-gentle" role="img" aria-hidden="true">
          {slide.icon}
        </span>
        {slide.title}
      </h2>

      {/* Standard rule list */}
      {slide.rules && <RuleList items={slide.rules} />}

      {/* Custom content blocks */}
      {slide.custom === 'quick-reference' && <QuickReferenceContent />}
      {slide.custom === 'combat-example' && <CombatExampleContent />}
      {slide.custom === 'scoring' && <ScoringContent />}
    </div>
  )
}

/* ─── Reusable Helpers ─── */

function RuleList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-gray-700">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/* ─── Custom Slide Content ─── */

function QuickReferenceContent() {
  return (
    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 flex-1">
      <div className="rounded-xl bg-emerald-50 p-4">
        <p className="font-bold text-emerald-800">Goal</p>
        <p className="text-emerald-700">First to 3 Victory Points wins!</p>
      </div>
      <div className="rounded-xl bg-sky-50 p-4">
        <p className="font-bold text-sky-800">Team Size</p>
        <p className="text-sky-700">3 critters per player on an 8x10 grid</p>
      </div>
      <div className="rounded-xl bg-amber-50 p-4">
        <p className="font-bold text-amber-800">Turn Actions</p>
        <p className="text-amber-700">Each critter can Move + Attack + Use Ability</p>
      </div>
      <div className="rounded-xl bg-violet-50 p-4">
        <p className="font-bold text-violet-800">Scoring</p>
        <p className="text-violet-700">Defeat a critter = 1 VP | Raid enemy base = 1 VP</p>
      </div>
    </div>
  )
}

function CombatExampleContent() {
  return (
    <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 border border-amber-200">
      <span className="font-bold">Example:</span> Your critter has
      3 ATK. You roll a 4 on the d6. That is 4 + 3 = 7 damage to the
      enemy critter!
    </div>
  )
}

function ScoringContent() {
  return (
    <div className="space-y-3 flex-1">
      <p className="font-medium text-gray-800">
        There are two ways to earn Victory Points (VP):
      </p>
      <div className="space-y-2">
        <div className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 border border-green-200">
          <span className="font-display text-lg font-bold text-green-600">1 VP</span>
          <p className="text-sm text-green-800">
            <span className="font-bold">Defeat a critter.</span>{' '}
            Knock an enemy critter down to 0 HP.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 border border-green-200">
          <span className="font-display text-lg font-bold text-green-600">1 VP</span>
          <p className="text-sm text-green-800">
            <span className="font-bold">Raid the enemy base.</span>{' '}
            Move into the enemy base when no defenders are inside, then spend your attack action to score.
          </p>
        </div>
      </div>
      <p className="font-display mt-2 text-center text-lg font-bold text-emerald-600">
        First player to reach 3 Victory Points wins the game!
      </p>
    </div>
  )
}
