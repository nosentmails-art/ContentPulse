/**
 * LLM Helper - Multi-provider LLM analysis for server-side agents
 * Prefers GROQ, falls back to Gemini, then deterministic mock data.
 */

function getLlmConfig() {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  const model = process.env.GROQ_MODEL || process.env.OPENAI_MODEL || 'llama-3.3-70b-versatile';
  const baseUrl = process.env.GROQ_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1';
  if (!apiKey) return null;
  return { apiKey, baseUrl, model };
}

function extractJson(text: string | undefined): Record<string, any> {
  if (!text) throw new Error('Empty LLM response');
  const trimmed = text.trim();
  const match = trimmed.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonStr = match ? match[1].trim() : trimmed;
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return { summary: jsonStr };
  }
}

async function callOpenAICompatible(systemPrompt: string, prompt: string, apiKey: string, baseUrl: string, model: string) {
  const url = baseUrl.endsWith('/') ? baseUrl + 'chat/completions' : baseUrl + '/chat/completions';
  const maxRetries = 3;
  let attempt = 0;

  while (true) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (res.ok) {
      const data: any = await res.json();
      return extractJson(data.choices?.[0]?.message?.content);
    }

    const text = await res.text();
    if (res.status === 429 && attempt < maxRetries) {
      const retryHeader = res.headers.get('retry-after');
      let waitSeconds = retryHeader ? parseInt(retryHeader, 10) : 0;
      if (!waitSeconds || isNaN(waitSeconds)) {
        const match = text.match(/try again in ([\d.]+)s/i);
        waitSeconds = match ? parseFloat(match[1]) : 10;
      }
      console.warn(`[llm-helper] Groq rate limit hit, retrying in ${waitSeconds}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
      attempt++;
      continue;
    }

    throw new Error('HTTP ' + res.status + ': ' + text);
  }
}

async function callGemini(systemPrompt: string, prompt: string, apiKey: string, model: string) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + prompt }] }],
    }),
  });
  if (!res.ok) {
    throw new Error('HTTP ' + res.status + ': ' + (await res.text()));
  }
  const data: any = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return extractJson(text);
}

export async function mockLLMAnalyze(
  systemPrompt: string,
  prompt: string
): Promise<Record<string, any>> {
  const config = getLlmConfig();
  if (config) {
    try {
      const result = await callOpenAICompatible(systemPrompt, prompt, config.apiKey, config.baseUrl, config.model);
      const provider = config.baseUrl.includes('groq')
        ? 'groq'
        : config.baseUrl.includes('openai')
          ? 'openai'
          : 'openai-compatible';
      console.log('[llm-helper] Success: ' + provider + ' / ' + config.model);
      return result;
    } catch (error) {
      console.error('[llm-helper] OpenAI-compatible call failed, falling back to Gemini:', error);
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  if (geminiKey) {
    try {
      const result = await callGemini(systemPrompt, prompt, geminiKey, geminiModel);
      console.log('[llm-helper] Success: gemini / ' + geminiModel);
      return result;
    } catch (error) {
      console.error('[llm-helper] Gemini call failed, using mock fallback:', error);
    }
  }

  console.warn('[llm-helper] No API keys configured; returning mock data.');
  return getMockResult(prompt);
}

function getMockResult(
  prompt: string
): Record<string, any> {
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
  } else if (prompt.includes('"gapReasons"') || prompt.includes('"opportunityEnhancements"')) {
    // Gap & Opportunity Analysis (hybrid)
    mockResult = {
      gapReasons: [
        { topic: 'AI', reason: 'AI has no visible coverage in the uploaded content titles, but shows high demand from engagement patterns.' },
        { topic: 'Cloud', reason: 'Cloud appears in only 2% of uploaded content rows, representing a significant coverage gap.' },
      ],
      opportunityEnhancements: [
        { topic: 'AI', suggestedTitle: 'AI-Powered Content Strategy: A Practical Implementation Guide', urgency: 'HOT', reason: 'Zero coverage with high audience interest based on engagement signals.' },
        { topic: 'Cloud', suggestedTitle: 'Cloud Architecture Patterns for Modern Applications', urgency: 'WARM', reason: 'Low coverage with moderate engagement potential.' },
      ],
      nextBestAction: 'Create an AI-focused long-form article on your strongest channel (LinkedIn) to test this high-priority gap.',
    };
  } else if (prompt.includes('"segmentDescriptions"') && !prompt.includes('"segments"')) {
    // Audience Intelligence (hybrid - segment descriptions only)
    mockResult = {
      segmentDescriptions: [
        { name: 'Early Adopters (Tech)', description: 'Technical decision-makers actively evaluating new tools and frameworks for production use.' },
        { name: 'Growth Leaders', description: 'Marketing leaders focused on scalable growth strategies and measurable ROI.' },
      ],
      topInsight: 'Your technical audience segment shows 3x higher engagement than general business content.',
      recommendation: 'Double down on technical deep-dives and implementation guides for the Early Adopters segment.',
    };
  } else if (prompt.includes('"verdicts"') || prompt.includes('"topCombo"')) {
    // Channel Intelligence (hybrid)
    mockResult = {
      topCombo: {
        format: 'Long-form article',
        channel: 'LINKEDIN',
        reason: 'Highest engagement rate (12%) and best reach per post — this is your winning combination.',
      },
      avoidCombo: {
        format: 'Short post',
        channel: 'TWITTER',
        reason: 'Minimal traction with your audience — zero measurable ROI from this format/channel pair.',
      },
      verdicts: [
        { format: 'Long-form article', channel: 'LINKEDIN', verdict: 'Best combo — double down here' },
        { format: 'Tutorial', channel: 'BLOG', verdict: 'Good — strong SEO value' },
        { format: 'Short post', channel: 'TWITTER', verdict: 'Avoid — very low return' },
      ],
    };
  } else {
    mockResult = {
      summary: 'Analysis complete — review individual metrics below.',
      data: { analyzed: 87, keyFindings: ['LinkedIn is your top channel', 'Long-form content wins'] },
    };
  }

  return mockResult;
}
