/**
 * SentimentScoreCard Component
 * @author sanat.k.mahapatra
 * 
 * Displays sentiment analysis score with positive/negative themes
 */

interface SentimentScoreCardProps {
  score: number;
  label: string;
  positiveThemes: string[];
  negativeThemes: string[];
}

export function SentimentScoreCard({
  score,
  label,
  positiveThemes,
  negativeThemes,
}: SentimentScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s > 60) return "text-green-400";
    if (s >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-6">{label}</h3>

      <div className="text-center mb-8">
        <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
          {score}%
        </div>
        <p className="text-slate-400 text-sm mt-2">Audience Sentiment</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Positive Themes */}
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-3">Positive Themes</h4>
          <div className="flex flex-wrap gap-2">
            {positiveThemes.map((theme, i) => (
              <span
                key={i}
                className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        {/* Negative Themes */}
        <div>
          <h4 className="text-sm font-medium text-red-400 mb-3">Negative Themes</h4>
          <div className="flex flex-wrap gap-2">
            {negativeThemes.map((theme, i) => (
              <span
                key={i}
                className="inline-block px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
