declare module '@3d-dice/dice-box' {
  interface DiceBoxConfig {
    container?: string | null
    id?: string
    enableShadows?: boolean
    shadowTransparency?: number
    lightIntensity?: number
    delay?: number
    scale?: number
    theme?: string
    preloadThemes?: string[]
    externalThemes?: Record<string, string>
    themeColor?: string
    offscreen?: boolean
    assetPath?: string
    origin?: string
    suspendSimulation?: boolean
    onBeforeRoll?: (diceNotation: any[]) => void
    onDieComplete?: (result: DieResult) => void
    onRollComplete?: (results: RollGroup[]) => void
    onRemoveComplete?: (results: any[]) => void
    onThemeConfigLoaded?: (themeData: any) => void
    onThemeLoaded?: (themeData: any) => void
  }

  interface DieResult {
    groupId: number
    rollId: number
    sides: number | string
    theme: string
    themeColor: string
    dieType: string
    value: number
    modifier?: number
    data?: string
  }

  interface RollGroup {
    id: number
    qty: number
    sides: number | string
    theme: string
    themeColor: string
    modifier: number
    value: number
    rolls: DieResult[]
  }

  interface RollOptions {
    theme?: string
    themeColor?: string
    newStartPoint?: boolean
  }

  class DiceBox {
    config: DiceBoxConfig
    canvas: HTMLCanvasElement
    isVisible: boolean
    onBeforeRoll: (diceNotation: any[]) => void
    onDieComplete: (result: DieResult) => void
    onRollComplete: (results: RollGroup[]) => void
    onRemoveComplete: (results: any[]) => void
    onThemeLoaded: (themeData: any) => void
    onThemeConfigLoaded: (themeData: any) => void

    constructor(config?: DiceBoxConfig)
    init(): Promise<void>
    roll(notation: string | string[] | object | object[], options?: RollOptions): Promise<DieResult[]>
    add(notation: string | string[] | object | object[], options?: RollOptions): Promise<DieResult[]>
    reroll(dice: DieResult | DieResult[], options?: { remove?: boolean; hide?: boolean; newStartPoint?: boolean }): Promise<DieResult[]>
    remove(dice: DieResult | DieResult[], options?: { hide?: boolean }): Promise<any[]>
    clear(): DiceBox
    hide(className?: string): DiceBox
    show(): DiceBox
    updateConfig(config: Partial<DiceBoxConfig>): void
    getRollResults(): RollGroup[]
  }

  export default DiceBox
}
