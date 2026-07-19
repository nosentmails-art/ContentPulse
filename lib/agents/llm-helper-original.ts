/**
 * LLM Helper - Mock LLM analysis for server-side agents
 * Eliminates need for fetch() calls from server-side code
 */

export async function mockLLMAnalyze(
  systemPrompt: string,
  prompt: string
): Promise<Record<string, any>> {
  // Detect analyzer type using unique JSON field names from each agent's prompt template.
  // This avoids false-positive matches when generic words like "audience" appear in other agents' prompts.
  let mockResult: any = {};

  if (prompt.includes('"overallScore"') || prompt.includes('overallLabel')) {
    // Sentiment Analysis
    mockResult = {
      overallScore: 82,
      overallLabel: 'Highly Positive',
      positiveThemes: ['Practical value', 'Clear writing', 'Timely topics'],
      negativeThemes: ['Wants more examples', 'Too technical at times'],
      topPositiveComment: 'This saved me hours of research - exactly what I needed.',
      topNegativeComment: 'Great concepts but would benefit from more real-world examples.',
      actionableInsight: 'Focus on real-world case studies with concrete before/after metrics.',
    };
  } else if (prompt.includes('"priorityAction"')) {
    // Opportunity Identification
    mockResult = {
      summary: 'Identified 5 high-impact content opportunities based on performance patterns.',
      opportunities: [
        {
          topic: 'AI agents for content automation',
          format: 'Tutorial series',
          channel: 'BLOG',
          urgency: 'hot',
          reason: '+300% search growth in this category, minimal competitor coverage',
          suggestedTitle: 'How to Build AI Agents for Content: A Step-by-Step Guide',
        },
        {
          topic: 'DevOps best practices 2024',
          format: 'Long-form guide',
          channel: 'LINKEDIN',
          urgency: 'warm',
          reason: 'High audience interest (62% engagement rate on related posts)',
          suggestedTitle: 'The Complete DevOps Playbook for Fast-Growing Teams',
        },
      ],
      priorityAction: 'Launch AI tutorial series immediately - category creation opportunity with zero direct competitors and 3x search growth.',
    };
  } else if (prompt.includes('"theirStrengths"') || prompt.includes('"yourAdvantages"')) {
    // Competitor Analysis
    mockResult = {
      summary: 'You outpace competitors on technical depth but lag on publishing consistency.',
      gaps: [
        {
          topic: 'AI & Machine Learning',
          competitorCoverage: '45 posts/quarter',
          yourCoverage: '8 posts/quarter',
          opportunity: 'Major gap - 82% of your audience shows interest in this topic',
        },
        {
          topic: 'Cloud Architecture',
          competitorCoverage: '30 posts/quarter',
          yourCoverage: '5 posts/quarter',
          opportunity: 'Growing demand - 54% search volume increase',
        },
      ],
      theirStrengths: ['Consistent 3x/week publishing', 'Format diversity (video + text)', 'Strong SEO optimization'],
      yourAdvantages: ['Superior technical depth', 'Higher quality per piece', 'Stronger community engagement'],
      topRecommendation: 'Increase publishing frequency to 2x/week and prioritize AI & ML topics to close the biggest gap.',
    };
  } else if (prompt.includes('"matrix"') || prompt.includes('"topCombo"')) {
    // Channel & Content Intelligence
    mockResult = {
      summary: 'LinkedIn outperforms other channels by 280% on engagement. Long-form articles are your strongest format.',
      matrix: [
        {
          format: 'Long-form article',
          channel: 'LINKEDIN',
          performanceScore: 92,
          keyMetric: '8.5K impressions, 12% CTR',
          verdict: 'Best combo — double down here',
        },
        {
          format: 'Short post',
          channel: 'TWITTER',
          performanceScore: 18,
          keyMetric: '320 impressions, 0.8% CTR',
          verdict: 'Avoid — very low return',
        },
        {
          format: 'Tutorial',
          channel: 'BLOG',
          performanceScore: 74,
          keyMetric: '5.2K views, 8% engagement',
          verdict: 'Good — strong SEO value',
        },
      ],
      topCombo: {
        format: 'Long-form article',
        channel: 'LINKEDIN',
        reason: 'Highest engagement rate (12%) and best reach per post',
      },
      avoidCombo: {
        format: 'Short post',
        channel: 'TWITTER',
        reason: 'Minimal traction with your audience — zero measurable ROI',
      },
    };
  } else if (prompt.includes('"segments"') || prompt.includes('"topInsight"')) {
    // Audience Intelligence
    mockResult = {
      summary: 'Your audience shows strong engagement across two primary tech-focused segments with an average 8.5% engagement rate.',
      segments: [
        {
          name: 'Early Adopters (Tech)',
          description: 'Software engineers and technical CTOs evaluating new tools',
          topContent: 'Technical tutorials and deep-dives',
          bestTime: 'Tuesday–Thursday, 10 AM–2 PM',
          engagementRate: '8.5%',
        },
        {
          name: 'Growth Leaders',
          description: 'Marketing and growth managers at scaling startups',
          topContent: 'Strategy guides and case studies',
          bestTime: 'Monday–Wednesday, 8 AM–11 AM',
          engagementRate: '6.2%',
        },
      ],
      topInsight: 'Technical deep-dives drive 3x higher engagement than general content — your core audience rewards specificity.',
      recommendation: 'Publish 2 technical deep-dives per week, targeting the 10 AM Tuesday slot for maximum reach.',
    };
  } else {
    mockResult = {
      summary: 'Analysis complete — review individual metrics below.',
      data: { analyzed: 87, keyFindings: ['LinkedIn is your top channel', 'Long-form content wins'] },
    };
  }

  return mockResult;
}
