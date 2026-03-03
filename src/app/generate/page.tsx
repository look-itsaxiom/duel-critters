'use client'

import { useState, useCallback } from 'react'
import PhotoUpload from '@/components/PhotoUpload'
import DiceRoller from '@/components/DiceRoller'
import CertificatePage from '@/components/CertificatePage'
import { checkAbility, abilityMagnitude } from '@/lib/generation'
import { generateQRDataUrl } from '@/lib/qr'
import type { CritterRecord, CreatureIdentification } from '@/lib/types'

type Step = 'upload' | 'identifying' | 'review' | 'rolling' | 'certifying' | 'done'
type RollingPhase = 'star-level' | 'hp' | 'atk' | 'spd' | 'ability-check' | 'complete'

const PHASE_ORDER: RollingPhase[] = ['star-level', 'hp', 'atk', 'spd', 'ability-check', 'complete']

function phaseLabel(phase: RollingPhase): string {
  switch (phase) {
    case 'star-level': return 'Star Level'
    case 'hp': return 'HP'
    case 'atk': return 'ATK'
    case 'spd': return 'SPD'
    case 'ability-check': return 'Ability Check'
    case 'complete': return 'Complete'
  }
}

const STEP_COLORS = [
  { dot: 'bg-critter-pink', ring: 'ring-pink-300' },
  { dot: 'bg-critter-orange', ring: 'ring-orange-300' },
  { dot: 'bg-critter-sky', ring: 'ring-sky-300' },
  { dot: 'bg-critter-amber', ring: 'ring-amber-300' },
  { dot: 'bg-critter-green', ring: 'ring-green-300' },
  { dot: 'bg-critter-violet', ring: 'ring-violet-300' },
]

interface RollingStats {
  starLevel: number | null
  hp: number | null
  hpDice: number[]
  atk: number | null
  spd: number | null
  abilityCheckRoll: number | null
  abilityPassed: boolean | null
}

export default function GeneratePage() {
  const [step, setStep] = useState<Step>('upload')
  const [rollingPhase, setRollingPhase] = useState<RollingPhase>('star-level')
  const [identification, setIdentification] = useState<CreatureIdentification & { photoUrl: string } | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [stats, setStats] = useState<RollingStats>({
    starLevel: null,
    hp: null,
    hpDice: [],
    atk: null,
    spd: null,
    abilityCheckRoll: null,
    abilityPassed: null,
  })
  const [nickname, setNickname] = useState('')
  const [correctedType, setCorrectedType] = useState('')
  const [critter, setCritter] = useState<CritterRecord | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Step 1: Photo uploaded - send to /api/identify
  const handlePhotoUpload = useCallback(async (file: File, preview: string) => {
    setPhotoPreview(preview)
    setStep('identifying')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const res = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        let message = 'Failed to identify creature'
        try { message = JSON.parse(text).error || message } catch {}
        throw new Error(message)
      }

      const data = await res.json()
      setIdentification(data)
      setCorrectedType(data.creatureType)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to identify creature')
      setStep('upload')
    }
  }, [])

  // Rolling phase handlers
  const handleStarLevelResult = useCallback((_rolls: number[], total: number) => {
    setStats(prev => ({ ...prev, starLevel: total }))
    setRollingPhase('hp')
  }, [])

  const handleHPResult = useCallback((rolls: number[], total: number) => {
    const hp = total + 6
    setStats(prev => ({ ...prev, hp, hpDice: rolls }))
    setRollingPhase('atk')
  }, [])

  const handleATKResult = useCallback((_rolls: number[], total: number) => {
    setStats(prev => {
      const atk = Math.floor((total + (prev.starLevel ?? 0)) / 2)
      return { ...prev, atk }
    })
    setRollingPhase('spd')
  }, [])

  const handleSPDResult = useCallback((_rolls: number[], total: number) => {
    setStats(prev => ({ ...prev, spd: total }))
    setRollingPhase('ability-check')
  }, [])

  const handleAbilityCheckResult = useCallback((_rolls: number[], total: number) => {
    setStats(prev => {
      const result = checkAbility(prev.starLevel ?? 1, total)
      return {
        ...prev,
        abilityCheckRoll: total,
        abilityPassed: result.passed,
      }
    })
    setRollingPhase('complete')
  }, [])

  // Step 4: Certify - send to /api/generate
  const handleCertify = useCallback(async () => {
    if (!identification || stats.starLevel === null) return

    setStep('certifying')
    setError(null)

    try {
      const qualifies = stats.abilityPassed ?? false
      const magnitude = qualifies ? abilityMagnitude(stats.starLevel) : 0

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: identification.name,
          ...(nickname.trim() ? { nickname: nickname.trim() } : {}),
          creatureType: correctedType || identification.creatureType,
          characteristics: identification.characteristics,
          starLevel: stats.starLevel,
          hp: stats.hp,
          hpDice: stats.hpDice,
          atk: stats.atk,
          spd: stats.spd,
          qualifiesForAbility: qualifies,
          abilityMagnitude: magnitude,
          photoUrl: identification.photoUrl,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        let message = 'Failed to generate critter'
        try { message = JSON.parse(text).error || message } catch {}
        throw new Error(message)
      }

      const critterData: CritterRecord = await res.json()
      setCritter(critterData)

      // Generate QR code for the critter's verification page
      const qr = await generateQRDataUrl(`${window.location.origin}/v/${critterData.id}`)
      setQrDataUrl(qr)

      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate critter')
      setStep('rolling')
      setRollingPhase('complete')
    }
  }, [identification, stats, nickname, correctedType])

  // Get the dice notation for the current rolling phase
  function getNotation(): string {
    switch (rollingPhase) {
      case 'star-level': return '1d6'
      case 'hp': return `${stats.starLevel ?? 1}d6`
      case 'atk': return '1d6'
      case 'spd': return '1d3'
      case 'ability-check': return '1d6'
      default: return '1d6'
    }
  }

  // Get the result handler for the current rolling phase
  function getResultHandler(): (rolls: number[], total: number) => void {
    switch (rollingPhase) {
      case 'star-level': return handleStarLevelResult
      case 'hp': return handleHPResult
      case 'atk': return handleATKResult
      case 'spd': return handleSPDResult
      case 'ability-check': return handleAbilityCheckResult
      default: return () => {}
    }
  }

  const allSteps: Step[] = ['upload', 'identifying', 'review', 'rolling', 'certifying', 'done']
  const currentStepIdx = allSteps.indexOf(step)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-orange-50 to-yellow-50 bg-dots print:bg-white print:min-h-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="font-display text-4xl font-bold text-center mb-2 text-amber-900 animate-fade-up print:hidden">
          Register a Critter
        </h1>
        <p className="text-center text-amber-700/70 font-medium mb-8 animate-fade-up print:hidden" style={{ animationDelay: '100ms' }}>
          Snap a photo, roll the dice, and bring your critter to life!
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-up print:hidden" style={{ animationDelay: '200ms' }}>
          {allSteps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  step === s
                    ? `${STEP_COLORS[i].dot} ring-4 ${STEP_COLORS[i].ring} scale-110`
                    : currentStepIdx > i
                    ? STEP_COLORS[i].dot
                    : 'bg-gray-200'
                }`}
              />
              {i < allSteps.length - 1 && (
                <div className={`w-8 h-1 rounded-full transition-colors duration-300 ${
                  currentStepIdx > i ? 'bg-gradient-to-r from-critter-pink to-critter-orange' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-center font-medium animate-pop">
            {error}
          </div>
        )}

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="font-display text-2xl font-bold text-center text-pink-600">Step 1: Upload a Photo</h2>
            <p className="text-center text-gray-500 text-sm">
              Snap a photo of your resin critter figurine and we will identify it!
            </p>
            <PhotoUpload onUpload={handlePhotoUpload} />
          </div>
        )}

        {/* Step: Identifying */}
        {step === 'identifying' && (
          <div className="text-center space-y-6 animate-fade-up">
            <h2 className="font-display text-2xl font-bold text-orange-600">Identifying Your Critter...</h2>
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Uploaded critter"
                className="mx-auto max-h-48 rounded-2xl object-contain shadow-lg border-2 border-orange-200"
              />
            )}
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-orange-400 border-t-transparent" />
            </div>
            <p className="text-gray-500 font-medium">Our AI is examining your creature...</p>
          </div>
        )}

        {/* Step: Review — correct creature type + add nickname */}
        {step === 'review' && identification && (
          <div className="space-y-6 animate-fade-up">
            <h2 className="font-display text-2xl font-bold text-center text-sky-600">
              Review Your Critter
            </h2>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-sky-200">
              {/* Photo + AI name */}
              <div className="flex items-center gap-4 mb-6">
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt={identification.name}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-amber-100"
                  />
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-400">AI Named</div>
                  <h3 className="font-display font-bold text-xl text-amber-900">{identification.name}</h3>
                </div>
              </div>

              {/* Creature type correction */}
              <div className="mb-4">
                <label htmlFor="creature-type" className="block text-sm font-bold text-gray-600 mb-1">
                  What kind of creature is this?
                </label>
                <input
                  id="creature-type"
                  type="text"
                  value={correctedType}
                  onChange={(e) => setCorrectedType(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-gray-800 font-medium
                             focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100
                             transition-colors"
                  placeholder="e.g. Dragon, Wolf, Bunny..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Fix this if the AI got it wrong
                </p>
              </div>

              {/* Nickname input */}
              <div className="mb-2">
                <label htmlFor="nickname" className="block text-sm font-bold text-gray-600 mb-1">
                  Nickname <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-gray-800 font-medium
                             focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100
                             transition-colors"
                  placeholder="Give your critter a nickname..."
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (correctedType.trim()) {
                    setIdentification({ ...identification, creatureType: correctedType.trim() })
                  }
                  setStep('rolling')
                }}
                disabled={!correctedType.trim()}
                className="px-10 py-4 bg-gradient-to-r from-sky-400 to-blue-500 text-white text-lg
                           font-display font-bold rounded-2xl shadow-lg shadow-sky-200
                           hover:shadow-xl hover:shadow-sky-300 hover:scale-105
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 active:scale-95"
              >
                Looks Good! Roll the Dice
              </button>
            </div>
          </div>
        )}

        {/* Step: Rolling */}
        {step === 'rolling' && identification && (
          <div className="space-y-6">
            {/* Creature info card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4 border-2 border-amber-200 animate-pop">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt={identification.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-amber-100"
                />
              )}
              <div>
                <h3 className="font-display font-bold text-xl text-amber-900">{identification.name}</h3>
                <p className="text-sm text-amber-600">{identification.creatureType}</p>
              </div>
            </div>

            {/* Stats summary card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100">
              <h3 className="font-display font-bold text-sm uppercase tracking-wide text-gray-400 mb-3">
                Stats Rolled
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatDisplay
                  label="Star Level"
                  value={stats.starLevel}
                  active={rollingPhase === 'star-level'}
                  color="amber"
                />
                <StatDisplay
                  label="HP"
                  value={stats.hp}
                  active={rollingPhase === 'hp'}
                  color="red"
                />
                <StatDisplay
                  label="ATK"
                  value={stats.atk}
                  active={rollingPhase === 'atk'}
                  color="orange"
                />
                <StatDisplay
                  label="SPD"
                  value={stats.spd}
                  active={rollingPhase === 'spd'}
                  color="blue"
                />
                <StatDisplay
                  label="Ability"
                  value={
                    stats.abilityPassed === null
                      ? null
                      : stats.abilityPassed
                      ? 'Yes'
                      : 'No'
                  }
                  active={rollingPhase === 'ability-check'}
                  color="purple"
                />
              </div>
            </div>

            {/* Dice roller for current phase */}
            {rollingPhase !== 'complete' && (
              <div className="space-y-2 animate-fade-up">
                <h2 className="font-display text-2xl font-bold text-center text-amber-800">
                  Roll for {phaseLabel(rollingPhase)}
                </h2>
                {rollingPhase === 'hp' && (
                  <p className="text-center text-sm text-amber-600 font-medium">
                    Roll {stats.starLevel}d6, then add 6 to the total
                  </p>
                )}
                {rollingPhase === 'atk' && (
                  <p className="text-center text-sm text-amber-600 font-medium">
                    ATK = floor((roll + Star Level) / 2)
                  </p>
                )}
                {rollingPhase === 'ability-check' && stats.starLevel !== null && (
                  <p className="text-center text-sm text-amber-600 font-medium">
                    Need to roll {Math.abs(stats.starLevel - 6)} or less to gain an ability
                  </p>
                )}
                <DiceRoller
                  key={rollingPhase}
                  notation={getNotation()}
                  label={phaseLabel(rollingPhase)}
                  onResult={getResultHandler()}
                />
              </div>
            )}

            {/* Certify button when all rolls complete */}
            {rollingPhase === 'complete' && (
              <div className="text-center space-y-4 animate-pop">
                <h2 className="font-display text-2xl font-bold text-green-600">All Stats Rolled!</h2>
                {stats.abilityPassed && stats.starLevel !== null && (
                  <p className="text-green-600 font-bold text-lg">
                    Ability qualified! Magnitude: {abilityMagnitude(stats.starLevel)}
                  </p>
                )}
                {stats.abilityPassed === false && (
                  <p className="text-gray-500 font-medium">No ability this time.</p>
                )}
                <button
                  onClick={handleCertify}
                  className="px-10 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-lg
                             font-display font-bold rounded-2xl shadow-lg shadow-green-200
                             hover:shadow-xl hover:shadow-green-300 hover:scale-105
                             transition-all duration-200 active:scale-95"
                >
                  Certify This Critter!
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: Certifying */}
        {step === 'certifying' && (
          <div className="text-center space-y-6 animate-fade-up">
            <h2 className="font-display text-2xl font-bold text-green-600">Certifying Your Critter...</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-green-400 border-t-transparent" />
            </div>
            {stats.abilityPassed && (
              <p className="text-gray-500 font-medium">Generating a unique ability for your critter...</p>
            )}
            {!stats.abilityPassed && (
              <p className="text-gray-500 font-medium">Saving your critter to the registry...</p>
            )}
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && critter && (
          <div className="space-y-6 animate-pop">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-green-500 mb-2">
                Critter Certified!
              </h2>
              <p className="text-gray-500 font-medium">
                Your critter has been registered. Print the certificate below!
              </p>
            </div>
            <CertificatePage critter={critter} qrDataUrl={qrDataUrl} />
            <div className="text-center">
              <button
                onClick={() => {
                  setStep('upload')
                  setRollingPhase('star-level')
                  setIdentification(null)
                  setPhotoPreview(null)
                  setStats({
                    starLevel: null,
                    hp: null,
                    hpDice: [],
                    atk: null,
                    spd: null,
                    abilityCheckRoll: null,
                    abilityPassed: null,
                  })
                  setNickname('')
                  setCorrectedType('')
                  setCritter(null)
                  setQrDataUrl('')
                  setError(null)
                }}
                className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white
                           font-display font-bold rounded-2xl shadow-lg shadow-orange-200
                           hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Register Another Critter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Small stat display chip used in the rolling stats summary */
function StatDisplay({
  label,
  value,
  active,
  color,
}: {
  label: string
  value: number | string | null
  active: boolean
  color: string
}) {
  const colorMap: Record<string, { activeBg: string, activeBorder: string, activeText: string, doneBg: string, doneBorder: string, doneText: string }> = {
    amber: { activeBg: 'bg-amber-50', activeBorder: 'border-amber-400', activeText: 'text-amber-600', doneBg: 'bg-amber-50', doneBorder: 'border-amber-200', doneText: 'text-amber-600' },
    red: { activeBg: 'bg-red-50', activeBorder: 'border-red-400', activeText: 'text-red-500', doneBg: 'bg-red-50', doneBorder: 'border-red-200', doneText: 'text-red-600' },
    orange: { activeBg: 'bg-orange-50', activeBorder: 'border-orange-400', activeText: 'text-orange-500', doneBg: 'bg-orange-50', doneBorder: 'border-orange-200', doneText: 'text-orange-600' },
    blue: { activeBg: 'bg-sky-50', activeBorder: 'border-sky-400', activeText: 'text-sky-500', doneBg: 'bg-sky-50', doneBorder: 'border-sky-200', doneText: 'text-sky-600' },
    purple: { activeBg: 'bg-purple-50', activeBorder: 'border-purple-400', activeText: 'text-purple-500', doneBg: 'bg-purple-50', doneBorder: 'border-purple-200', doneText: 'text-purple-600' },
  }

  const c = colorMap[color] ?? colorMap.amber

  return (
    <div
      className={`rounded-xl p-3 text-center transition-all duration-300 ${
        active
          ? `${c.activeBg} border-2 ${c.activeBorder} scale-105`
          : value !== null
          ? `${c.doneBg} border ${c.doneBorder}`
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className={`font-display text-xl font-bold ${active ? c.activeText : value !== null ? c.doneText : 'text-gray-300'}`}>
        {value !== null ? value : '--'}
      </div>
    </div>
  )
}
