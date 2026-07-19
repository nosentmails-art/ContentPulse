/**
 * SentimentDashboard Component
 * Displays sentiment analysis results in a 6-section responsive dashboard
 * 
 * Sections:
 * 1. Overall Brand Sentiment Card
 * 2. Per-Channel Sentiment Cards
 * 3. Channel Comparison Table
 * 4. Cross-Channel Themes Grid
 * 5. Brand Recommendations
 * 6. Metadata Footer
 */

interface SentimentDashboardProps {
  data: any;
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function getSentimentColor(label: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (label?.toLowerCase()) {
    case 'positive':
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-300',
        border: 'border-green-500/30',
      };
    case 'negative':
      return {
        bg: 'bg-red-500/20',
        text: 'text-red-300',
        border: 'border-red-500/30',
      };
    default:
      return {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-300',
        border: 'border-yellow-500/30',
      };
  }
}

function getTrendIndicator(direction: string): string {
  switch (direction) {
    case '↗':
      return '↗ Improving';
    case '↘':
      return '↘ Declining';
    case '→':
    default:
      return '→ Stable';
  }
}

export default function SentimentDashboard({ data }: SentimentDashboardProps) {
  if (!data || !data.brandOverallSentiment) {
    return (
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-slate-400">No sentiment data available</p>
      </div>
    );
  }

  const { brandOverallSentiment, channelSentiments, analysisMetadata } = data;

  // ============================================================================
  // SECTION 1: Overall Brand Sentiment Card (Full-width)
  // ============================================================================
  const overallColor = getSentimentColor(brandOverallSentiment.overallSentimentLabel);

  // ============================================================================
  // SECTION 2: Per-Channel Sentiment Cards (Responsive Grid)
  // ============================================================================
  const channelCards = channelSentiments?.map((channel: any, idx: number) => {
    const channelColor = getSentimentColor(channel.sentimentLabel);
    return (
      <div
        key={idx}
        className={`p-4 rounded-lg border ${channelColor.border} ${channelColor.bg}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-white">{channel.channel}</h4>
          <span className="text-2xl font-bold text-white">
            {Math.round(channel.sentimentScore)}
          </span>
        </div>

        {/* Weight indicator */}
        <p className="text-sm text-slate-300 mb-3">
          Content Weight: {channel.contentPiecesWeight.toFixed(1)}%
        </p>

        {/* Engagement metrics grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div>
            <p className="text-slate-400">Avg Comments</p>
            <p className="text-white font-semibold">
              {channel.engagementMetrics.averageCommentsPerPost.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Avg Likes</p>
            <p className="text-white font-semibold">
              {channel.engagementMetrics.averageLikesPerPost.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Total Engagement</p>
            <p className="text-white font-semibold">
              {channel.engagementMetrics.totalEngagement}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Quality</p>
            <p className="text-white font-semibold">
              {channel.engagementMetrics.engagementQuality}
            </p>
          </div>
        </div>

        {/* Themes */}
        <div className="text-xs space-y-1 mb-3">
          {channel.positiveThemes && channel.positiveThemes.length > 0 && (
            <p className="text-green-300">
              ✓ {truncateText(channel.positiveThemes[0], 25)}
            </p>
          )}
          {channel.positiveThemes && channel.positiveThemes.length > 1 && (
            <p className="text-green-300">
              ✓ {truncateText(channel.positiveThemes[1], 25)}
            </p>
          )}
        </div>

        {/* Key insight */}
        <p className="text-xs text-slate-300 italic">
          {truncateText(channel.keyInsight, 80)}
        </p>
      </div>
    );
  }) || [];

  // ============================================================================
  // SECTION 3: Channel Comparison Table
  // ============================================================================
  const comparisonRows = brandOverallSentiment.channelComparison?.map(
    (comp: any, idx: number) => (
      <tr
        key={idx}
        className="border-t border-slate-700 hover:bg-slate-700/50 transition"
      >
        <td className="py-3 px-4 text-white font-medium">{comp.channel}</td>
        <td className="py-3 px-4">
          <span className={`text-sm font-medium ${getSentimentColor(comp.label).text}`}>
            {comp.label}
          </span>
        </td>
        <td className="py-3 px-4 text-white text-right">{Math.round(comp.score)}</td>
        <td className="py-3 px-4 text-white text-right">
          {comp.contentWeight.toFixed(1)}%
        </td>
        <td className="py-3 px-4 text-white text-right">
          {comp.contribution.toFixed(1)}
        </td>
        <td className="py-3 px-4 text-white text-right">
          {Math.round(comp.engagement)}
        </td>
      </tr>
    )
  ) || [];

  // ============================================================================
  // SECTION 4: Cross-Channel Themes Grid
  // ============================================================================
  const positiveThemes = brandOverallSentiment.crossChannelThemes?.commonPositiveThemes || [];
  const negativeThemes = brandOverallSentiment.crossChannelThemes?.commonNegativeThemes || [];

  // ============================================================================
  // SECTION 5: Brand Recommendations
  // ============================================================================
  const recommendations = brandOverallSentiment.brandRecommendations || [];

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="space-y-6">
      {/* SECTION 1: Overall Brand Sentiment Card */}
      <div className={`p-6 rounded-lg border ${overallColor.border} ${overallColor.bg}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">
              Brand Overall Sentiment
            </h3>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-bold text-white">
                {Math.round(brandOverallSentiment.overallSentimentScore)}
              </span>
              <span className="text-2xl text-slate-300">/100</span>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-semibold mb-2 ${overallColor.text}`}>
              {brandOverallSentiment.overallSentimentLabel}
            </p>
            <p className="text-lg text-slate-300 mb-2">
              {getTrendIndicator(brandOverallSentiment.trend?.direction)}
            </p>
            <p className="text-xs text-slate-400">
              Confidence: {brandOverallSentiment.trend?.confidenceLevel}
            </p>
          </div>
        </div>
        <p className="mt-4 text-slate-300 italic">
          {brandOverallSentiment.overallInsight}
        </p>
      </div>

      {/* SECTION 2: Per-Channel Sentiment Cards */}
      <div>
        <h3 className="text-lg font-semibold text-slate-300 mb-4">
          Sentiment by Channel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channelCards}
        </div>
      </div>

      {/* SECTION 3: Channel Comparison Table */}
      {comparisonRows.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">
            Channel Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 px-4 text-left text-slate-400 font-semibold">
                    Channel
                  </th>
                  <th className="py-3 px-4 text-left text-slate-400 font-semibold">
                    Sentiment
                  </th>
                  <th className="py-3 px-4 text-right text-slate-400 font-semibold">
                    Score
                  </th>
                  <th className="py-3 px-4 text-right text-slate-400 font-semibold">
                    Weight %
                  </th>
                  <th className="py-3 px-4 text-right text-slate-400 font-semibold">
                    Contribution
                  </th>
                  <th className="py-3 px-4 text-right text-slate-400 font-semibold">
                    Engagement
                  </th>
                </tr>
              </thead>
              <tbody>{comparisonRows}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: Cross-Channel Themes Grid */}
      {(positiveThemes.length > 0 || negativeThemes.length > 0) && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">
            Cross-Channel Themes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Themes */}
            {positiveThemes.length > 0 && (
              <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <h4 className="text-sm font-semibold text-green-300 mb-3">
                  Positive Themes
                </h4>
                <ul className="space-y-2">
                  {positiveThemes.map((theme: string, idx: number) => (
                    <li key={idx} className="text-sm text-green-200 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">+</span>
                      <span>{theme}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Negative Themes */}
            {negativeThemes.length > 0 && (
              <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                <h4 className="text-sm font-semibold text-red-300 mb-3">
                  Negative Themes
                </h4>
                <ul className="space-y-2">
                  {negativeThemes.map((theme: string, idx: number) => (
                    <li key={idx} className="text-sm text-red-200 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">-</span>
                      <span>{theme}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: Brand Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">
            Brand Recommendations
          </h3>
          <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
            <ul className="space-y-3">
              {recommendations.map((rec: string, idx: number) => (
                <li
                  key={idx}
                  className="text-slate-300 flex items-start gap-3"
                >
                  <span className="text-indigo-400 mt-0.5">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 6: Metadata Footer */}
      {analysisMetadata && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-slate-400">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-slate-500 font-semibold mb-1">Items Analyzed</p>
              <p className="text-white text-sm">
                {analysisMetadata.totalContentItems}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold mb-1">Channels</p>
              <p className="text-white text-sm">
                {analysisMetadata.totalChannelsAnalyzed}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold mb-1">Analysis Date</p>
              <p className="text-white text-sm">
                {analysisMetadata.analysisTimestamp
                  ? new Date(analysisMetadata.analysisTimestamp).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
