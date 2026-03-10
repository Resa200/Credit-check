import { getCreditRating, getRatingColor } from '@/lib/utils'

interface CreditScoreGaugeProps {
  score: number
  max?: number
}

export default function CreditScoreGauge({ score, max = 850 }: CreditScoreGaugeProps) {
  const rating = getCreditRating(score, max)
  const colorClass = getRatingColor(rating)

  // SVG arc parameters
  const radius = 54
  const circumference = Math.PI * radius // half circle
  const pct = Math.min(Math.max(score / max, 0), 1)

  const arcColor =
    rating === 'Excellent'
      ? '#10B981'
      : rating === 'Good'
      ? '#34D399'
      : rating === 'Fair'
      ? '#F59E0B'
      : '#F43F5E'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-20 overflow-hidden">
        {/* Track */}
        <svg
          viewBox="0 0 120 60"
          className="w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background arc */}
          <path
            d="M 10 58 A 50 50 0 0 1 110 58"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d="M 10 58 A 50 50 0 0 1 110 58"
            fill="none"
            stroke={arcColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference * pct} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>

        {/* Score number */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-2xl font-bold text-[#1E293B]">{score}</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-[#94A3B8]">out of {max}</p>
        <p className={`text-sm font-semibold mt-0.5 ${colorClass}`}>{rating}</p>
      </div>
    </div>
  )
}
