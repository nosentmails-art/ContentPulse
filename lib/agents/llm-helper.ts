/**
 * LLM Helper - Mock LLM analysis for server-side agents
 * Eliminates need for fetch() calls from server-side code
 */

export async function mockLLMAnalyze(
  systemPrompt: string,
  prompt: string
): Promise<Record<string, any>> {
  // Detect analyzer type from prompt
  let mockResult: any = {};

  if (prompt.includes('audience') || prompt.includes('segments')) {
    mockResult = {
      summary: 'Your audience shows strong engagement across tech-focused segments.',
      segments: [
        {
          name: 'Early Adopters (Tech)',
          description: 'Software engineers and CTOs',
          topContent: 'Technical tutorials',
          bestTime: 'Tue-Thu, 10 AM-2 PM',
          engagementRate: '8.5%',
        },
      ],
      topInsight: 'Tech content drives 3x higher engagement.',
      recommendation: 'Focus on technical deep-dives.',
    };
  } else if (prompt.includes('competitor')) {
    mockResult = {
      summary: 'You outpace on technical depth but lag on consistency.',
      gaps: [
        {
          topic: 'AI & Machine Learning',
          competitorCoverage: '45 posts',
          yourCoverage: '8 posts',
          opportunity: 'Major gap - 82% audience interest',
        },
      ],
      theirStrengths: ['Consistent publishing', 'Format diversity'],
      yourAdvantages: ['Technical depth', 'Higher quality'],
      topRecommendation: 'Increase frequency to 2x weekly, prioritize AI topics.',
    };
  } else if (prompt.includes('opportunity')) {
    mockResult = {
      summary: 'Identified 5 high-impact opportunities.',
      opportunities: [
        {
          topic: 'AI agents for content',
          format: 'Tutorial series',
          channel: 'BLOG',
          urgency: 'hot',
          reason: '+300% search growth, zero competitors',
          suggestedTitle: 'How to Build AI Agents for Content',
        },
      ],
      priorityAction: 'Launch AI tutorials - category creation opportunity.',
    };
  } else if (prompt.includes('channel') || prompt.includes('format')) {
    mockResult = {
      summary: 'LinkedIn outperforms other channels by 280%.',
      matrix: [
        {
          format: 'Long-form article',
          channel: 'LINKEDIN',
          performanceScore: 92,
          keyMetric: '8.5K impressions, 12% CTR',
          verdict: 'Best combo',
        },
      ],
      topCombo: {
        format: 'Long-form article',
        channel: 'LINKEDIN',
        reason: 'Highest engagement',
      },
      avoidCombo: {
        format: 'Short post',
        channel: 'TWITTER',
        reason: 'Zero traction',
      },
    };
  } else if (prompt.includes('sentiment') || prompt.includes('comment')) {
    mockResult = {
      overallScore: 82,
      overallLabel: 'Highly Positive',
      positiveThemes: ['Practical value', 'Clear writing', 'Timely'],
      negativeThemes: ['Wants more examples', 'Too technical'],
      topPositiveComment: 'This saved me hours of research.',
      topNegativeComment: 'Great concepts but need more examples.',
      actionableInsight: 'Focus on real-world case studies.',
    };
  } else {
    mockResult = {
      summary: 'Analysis complete',
      data: { analyzed: 87, keyFindings: ['LinkedIn wins', 'Long-form wins'] },
    };
  }

  return mockResult;
}
