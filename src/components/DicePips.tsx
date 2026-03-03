const PIP_CHARS: Record<number, string> = {
  1: '\u2680', // ⚀
  2: '\u2681', // ⚁
  3: '\u2682', // ⚂
  4: '\u2683', // ⚃
  5: '\u2684', // ⚄
  6: '\u2685', // ⚅
}

interface DicePipsProps {
  rolls: number[]
  className?: string
}

export default function DicePips({ rolls, className = '' }: DicePipsProps) {
  return (
    <span className={`font-mono text-lg ${className}`}>
      {rolls.map((roll, i) => (
        <span key={i} title={`${roll}`}>{PIP_CHARS[roll] || '?'}</span>
      ))}
    </span>
  )
}
