'use client'

import { useState, useCallback } from 'react'
import PhotoUpload from '@/components/PhotoUpload'
import DiceRoller from '@/components/DiceRoller'
import CertificatePage from '@/components/CertificatePage'
import { checkAbility, abilityMagnitude } from '@/lib/generation'
import { generateQRDataUrl } from '@/lib/qr'
import type { CritterRecord, CreatureIdentification } from '@/lib/types'

type Step = 'upload' | 'identifying' | 'rolling' | 'certifying' | 'done'
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
        const data = await res.json()
        throw new Error(data.error || 'Failed to identify creature')
      }

      const data = await res.json()
      setIdentification(data)
      setStep('rolling')
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
          creatureType: identification.creatureType,
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
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate critter')
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
  }, [identification, stats])

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-2">Generate a Critter</h1>
        <p className="text-center text-gray-500 mb-8">
          Snap a photo, roll the dice, and bring your critter to life!
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['upload', 'identifying', 'rolling', 'certifying', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  step === s
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : PHASE_ORDER.indexOf(rollingPhase) >= 0 &&
                      (['upload', 'identifying', 'rolling', 'certifying', 'done'] as Step[]).indexOf(step) > i
                    ? 'bg-amber-400'
                    : 'bg-gray-300'
                }`}
              />
              {i < 4 && <div className="w-8 h-0.5 bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Step 1: Upload a Photo</h2>
            <p className="text-center text-gray-500 text-sm">
              Take a picture of any creature - real or toy - and we will identify it!
            </p>
            <PhotoUpload onUpload={handlePhotoUpload} />
          </div>
        )}

        {/* Step: Identifying */}
        {step === 'identifying' && (
          <div className="text-center space-y-6">
            <h2 className="text-xl font-semibold">Identifying Your Critter...</h2>
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Uploaded critter"
                className="mx-auto max-h-48 rounded-lg object-contain shadow-md"
              />
            )}
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
            </div>
            <p className="text-gray-500">Our AI is examining your creature...</p>
          </div>
        )}

        {/* Step: Rolling */}
        {step === 'rolling' && identification && (
          <div className="space-y-6">
            {/* Creature info card */}
            <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt={identification.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="font-bold text-lg">{identification.name}</h3>
                <p className="text-sm text-gray-500">{identification.creatureType}</p>
              </div>
            </div>

            {/* Stats summary card */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">
                Stats Rolled
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatDisplay
                  label="Star Level"
                  value={stats.starLevel}
                  active={rollingPhase === 'star-level'}
                />
                <StatDisplay
                  label="HP"
                  value={stats.hp}
                  active={rollingPhase === 'hp'}
                />
                <StatDisplay
                  label="ATK"
                  value={stats.atk}
                  active={rollingPhase === 'atk'}
                />
                <StatDisplay
                  label="SPD"
                  value={stats.spd}
                  active={rollingPhase === 'spd'}
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
                />
              </div>
            </div>

            {/* Dice roller for current phase */}
            {rollingPhase !== 'complete' && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-center">
                  Roll for {phaseLabel(rollingPhase)}
                </h2>
                {rollingPhase === 'hp' && (
                  <p className="text-center text-sm text-gray-500">
                    Roll {stats.starLevel}d6, then add 6 to the total
                  </p>
                )}
                {rollingPhase === 'atk' && (
                  <p className="text-center text-sm text-gray-500">
                    ATK = floor((roll + Star Level) / 2)
                  </p>
                )}
                {rollingPhase === 'ability-check' && stats.starLevel !== null && (
                  <p className="text-center text-sm text-gray-500">
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
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold">All Stats Rolled!</h2>
                {stats.abilityPassed && stats.starLevel !== null && (
                  <p className="text-green-600 font-medium">
                    Ability qualified! Magnitude: {abilityMagnitude(stats.starLevel)}
                  </p>
                )}
                {stats.abilityPassed === false && (
                  <p className="text-gray-500">No ability this time.</p>
                )}
                <button
                  onClick={handleCertify}
                  className="px-8 py-4 bg-green-500 text-white text-lg font-bold rounded-xl
                             hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl
                             active:transform active:scale-95"
                >
                  Certify This Critter!
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: Certifying */}
        {step === 'certifying' && (
          <div className="text-center space-y-6">
            <h2 className="text-xl font-semibold">Certifying Your Critter...</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
            </div>
            {stats.abilityPassed && (
              <p className="text-gray-500">Generating a unique ability for your critter...</p>
            )}
            {!stats.abilityPassed && (
              <p className="text-gray-500">Saving your critter to the registry...</p>
            )}
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && critter && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Critter Certified!
              </h2>
              <p className="text-gray-500">
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
                  setCritter(null)
                  setQrDataUrl('')
                  setError(null)
                }}
                className="px-6 py-3 bg-amber-500 text-white font-bold rounded-lg
                           hover:bg-amber-600 transition-colors"
              >
                Generate Another Critter
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
}: {
  label: string
  value: number | string | null
  active: boolean
}) {
  return (
    <div
      className={`rounded-lg p-3 text-center transition-colors ${
        active
          ? 'bg-amber-50 border-2 border-amber-400'
          : value !== null
          ? 'bg-green-50 border border-green-200'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className={`text-lg font-bold ${active ? 'text-amber-600' : value !== null ? 'text-green-600' : 'text-gray-300'}`}>
        {value !== null ? value : '--'}
      </div>
    </div>
  )
}
