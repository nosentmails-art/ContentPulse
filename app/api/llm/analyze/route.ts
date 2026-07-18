import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/llm/analyze
 * Mock LLM adapter - returns realistic mock data based on prompt content
 * Allows agents to run without external LLM dependency during development
 */
export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt parameter' },
        { status: 400 }
      );
    }

    // Detect analyzer type from prompt to return appropriate mock
    let mockResult: any = {};

    if (prompt.includes('audience') || prompt.includes('segments')) {
      // AUDIENCE_INTELLIGENCE mock
      mockResult = {
        summary:
          'Your audience shows strong engagement across tech-focused segments with peak activity during business hours.',
        segments: [
          {
            name: 'Early Adopters (Tech)',
            description: 'Software engineers and CTOs interested in cutting-edge tools',
            topContent: 'Technical tutorials and deep-dive guides',
            bestTime: 'Tuesday-Thursday, 10 AM - 2 PM',
            engagementRate: '8.5%',
          },
          {
            name: 'Growth Marketers',
            description: 'Marketing leaders looking for growth strategies',
            topContent: 'Case studies and data-driven insights',
            bestTime: 'Monday-Wednesday, 9 AM - 11 AM',
            engagementRate: '6.2%',
          },
        ],
        topInsight:
          'Tech-focused content drives 3x higher engagement than general industry news.',
        recommendation:
          'Double down on technical deep-dives and case studies targeting the Early Adopters segment.',
      };
    } else if (
      prompt.includes('channel') ||
      prompt.includes('format') ||
      prompt.includes('matrix')
    ) {
      // CHANNEL_CONTENT_INTELLIGENCE mock
      mockResult = {
        summary:
          'LinkedIn significantly outperforms other channels. Long-form articles perform 4x better than short posts.',
        matrix: [
          {
            format: 'Long-form article',
            channel: 'LINKEDIN',
            performanceScore: 92,
            keyMetric: '8,500 impressions, 12% CTR',
            verdict: 'Best combination - double down here',
          },
          {
            format: 'Video tutorial',
            channel: 'YOUTUBE',
            performanceScore: 87,
            keyMetric: '15,000 views, 45% watch ratio',
            verdict: 'Strong performer, scale this',
          },
        ],
        topCombo: {
          format: 'Long-form article',
          channel: 'LINKEDIN',
          reason: 'Drives highest engagement with 12% CTR.',
        },
        avoidCombo: {
          format: 'Meme posts',
          channel: 'TWITTER',
          reason: 'Zero traction in your data.',
        },
      };
    } else if (
      prompt.includes('sentiment') ||
      prompt.includes('comment') ||
      prompt.includes('reaction')
    ) {
      // SENTIMENT_ANALYSIS mock
      mockResult = {
        overallScore: 82,
        overallLabel: 'Highly Positive',
        positiveThemes: [
          'Practical value and actionable advice',
          'Clear writing and easy to understand',
          'Timely, addresses current challenges',
        ],
        negativeThemes: [
          'Some wanted more depth/examples',
          'Occasionally too technical for beginners',
        ],
        topPositiveComment: 'This saved me hours of research. Exactly what I needed.',
        topNegativeComment:
          'Great concepts but would love to see real-world implementation examples.',
        actionableInsight:
          'Focus on real-world case studies and implementation guides.',
      };
    } else if (prompt.includes('competitor') || prompt.includes('coverage')) {
      // COMPETITOR_ANALYSIS mock
      mockResult = {
        summary:
          'You outpace competitors on technical depth but lag on content consistency.',
        gaps: [
          {
            topic: 'AI & Machine Learning applications',
            competitorCoverage: '45 posts in last 6 months',
            yourCoverage: '8 posts',
            opportunity: 'Major content gap. Publish 2-3 AI-focused pieces monthly.',
          },
        ],
        theirStrengths: [
          'Consistent weekly publishing',
          'Diversified format mix',
          'Strong SEO optimization',
        ],
        yourAdvantages: [
          'Superior technical depth',
          'Higher-quality production',
          'Stronger audience relationships',
        ],
        topRecommendation:
          'Increase publishing frequency to 2x weekly. Prioritize AI topics.',
      };
    } else if (prompt.includes('opportunity') || prompt.includes('gap')) {
      // OPPORTUNITY_IDENTIFICATION or GAP_ANALYSIS mock
      mockResult = {
        summary: 'Identified 5 high-impact opportunities across topics and channels.',
        opportunities: [
          {
            topic: 'AI agents for content operations',
            format: 'Tutorial series',
            channel: 'BLOG',
            urgency: 'hot',
            reason: 'Competitor search volume +300% YoY.',
            suggestedTitle:
              'How to Build AI Agents for Content Production in 2024: A Guide',
          },
        ],
        priorityAction:
          'Launch AI agents tutorial series. Category-creation opportunity with zero saturation.',
      };
    } else {
      // Default comprehensive mock
      mockResult = {
        summary: 'Comprehensive content analysis complete.',
        data: {
          totalAnalyzed: 87,
          keyFindings: [
            'LinkedIn outperforms by 280%',
            'Long-form content wins',
          ],
        },
      };
    }

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Error in POST /api/llm/analyze:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
