declare module 'reveal.js' {
  interface RevealConfig {
    embedded?: boolean
    keyboardCondition?: 'focused' | null
    touch?: boolean
    navigationMode?: 'default' | 'linear' | 'grid'
    controls?: boolean
    controlsTutorial?: boolean
    progress?: boolean
    slideNumber?: boolean | string
    hash?: boolean
    history?: boolean
    center?: boolean
    transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom'
    transitionSpeed?: 'default' | 'fast' | 'slow'
    width?: number | string
    height?: number | string
    margin?: number
    minScale?: number
    maxScale?: number
    [key: string]: unknown
  }

  interface RevealState {
    indexh: number
    indexv: number
    indexf?: number
  }

  class Reveal {
    constructor(element: HTMLElement, config?: RevealConfig)
    initialize(): Promise<void>
    destroy(): void
    getState(): RevealState
    getCurrentSlide(): HTMLElement | null
    on(event: string, callback: (...args: unknown[]) => void): void
    off(event: string, callback: (...args: unknown[]) => void): void
  }

  export default Reveal
}

declare module 'reveal.js/dist/reveal.css' {
  const content: string
  export default content
}
