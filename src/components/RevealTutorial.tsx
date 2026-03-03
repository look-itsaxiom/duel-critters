'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import MiniBoard from '@/components/MiniBoard'
import { TUTORIAL_SLIDES } from '@/lib/tutorialSlides'
import type { TutorialSlide } from '@/lib/tutorialSlides'
import type Reveal from 'reveal.js'
import 'reveal.js/dist/reveal.css'
import '@/styles/reveal-theme.css'

export default function RevealTutorial() {
  const deckRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<Reveal | null>(null)

  // Track the active step index for each slide (keyed by slide index)
  const [activeSteps, setActiveSteps] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {}
    TUTORIAL_SLIDES.forEach((_, i) => {
      initial[i] = 0
    })
    return initial
  })

  const handleFragmentChange = useCallback(() => {
    if (!revealRef.current) return
    const state = revealRef.current.getState()
    const slideIdx = state.indexh
    // Count visible fragments in the current slide
    const currentSlide = revealRef.current.getCurrentSlide()
    if (!currentSlide) return
    const fragments = currentSlide.querySelectorAll('.fragment.visible')
    setActiveSteps((prev) => ({
      ...prev,
      [slideIdx]: fragments.length,
    }))
  }, [])

  useEffect(() => {
    if (!deckRef.current) return

    let deck: Reveal | null = null

    async function initReveal() {
      const Reveal = (await import('reveal.js')).default
      if (!deckRef.current) return

      deck = new Reveal(deckRef.current, {
        embedded: true,
        keyboardCondition: 'focused',
        touch: true,
        navigationMode: 'linear' as const,
        controls: true,
        controlsTutorial: false,
        progress: true,
        slideNumber: true,
        hash: false,
        history: false,
        center: false,
        transition: 'slide',
        transitionSpeed: 'default',
        width: '100%',
        height: '100%',
        margin: 0,
        minScale: 1,
        maxScale: 1,
      })

      await deck.initialize()
      revealRef.current = deck

      // Listen for fragment changes to update board state
      deck.on('fragmentshown', handleFragmentChange)
      deck.on('fragmenthidden', handleFragmentChange)
      // Also update on slide change (reset fragment count)
      deck.on('slidechanged', () => {
        // Small delay to let Reveal.js settle fragment state
        setTimeout(handleFragmentChange, 50)
      })

      // Set initial state
      handleFragmentChange()
    }

    initReveal()

    return () => {
      if (deck) {
        try {
          deck.destroy()
        } catch {
          // Reveal.js can throw on destroy if DOM is already cleaned up
        }
      }
    }
  }, [handleFragmentChange])

  return (
    <div className="reveal-tutorial-wrapper">
      <div className="reveal" ref={deckRef} tabIndex={0}>
        <div className="slides">
          {TUTORIAL_SLIDES.map((slide, slideIdx) => (
            <TutorialSlideSection
              key={slide.id}
              slide={slide}
              activeStep={activeSteps[slideIdx] ?? 0}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-gray-400">
        Click the arrows or use keyboard to step through each lesson
      </p>
    </div>
  )
}

/* ─── Individual Slide Section ─── */

function TutorialSlideSection({
  slide,
  activeStep,
}: {
  slide: TutorialSlide
  activeStep: number
}) {
  const step = slide.steps[activeStep] ?? slide.steps[0]
  const totalFragments = slide.steps.length - 1 // first step is shown by default

  return (
    <section data-transition="slide">
      {/* Slide header */}
      <div className="mb-1">
        <div className="slide-icon">{slide.icon}</div>
        <h2>{slide.title}</h2>
      </div>

      {/* Mini board visual */}
      <div className="flex justify-center">
        <MiniBoard
          obstacles={step.obstacles}
          critters={step.critters}
          highlights={step.highlights}
          cellSize={32}
          className="transition-all duration-300"
        />
      </div>

      {/* Caption */}
      <p className="slide-caption">{step.caption}</p>

      {/* Hidden fragments — Reveal.js counts these for step progression.
          We render (steps.length - 1) fragments since step 0 is the default. */}
      {Array.from({ length: totalFragments }, (_, i) => (
        <div key={i} className="fragment" aria-hidden="true" />
      ))}
    </section>
  )
}
