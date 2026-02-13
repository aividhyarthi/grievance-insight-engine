interface Props {
  score: number;
  grade: string;
  size: 'sm' | 'lg';
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green-500
  if (score >= 60) return '#eab308'; // yellow-500
  if (score >= 40) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

export function ScoreGauge({ score, grade, size }: Props) {
  const isLarge = size === 'lg';
  const diameter = isLarge ? 140 : 80;
  const strokeWidth = isLarge ? 10 : 6;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="score-gauge" style={{ width: diameter, height: diameter }}>
        <svg width={diameter} height={diameter}>
          {/* Background circle */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold"
            style={{
              fontSize: isLarge ? '2rem' : '1.125rem',
              color,
            }}
          >
            {score}
          </span>
          {grade && (
            <span
              className="font-semibold text-gray-500"
              style={{ fontSize: isLarge ? '0.875rem' : '0.625rem' }}
            >
              {grade}
            </span>
          )}
        </div>
      </div>
      {isLarge && (
        <p
          className="mt-2 font-medium text-sm"
          style={{ color }}
        >
          {getScoreLabel(score)}
        </p>
      )}
    </div>
  );
}
