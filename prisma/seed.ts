import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.agentRun.deleteMany();
  await prisma.agentAttribute.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.channelMetrics.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.tenant.deleteMany();

  // Create Tenant 1: DevInsights Blog
  const devInsights = await prisma.tenant.create({
    data: {
      name: 'DevInsights Blog',
      slug: 'devinsights',
      niche: 'developer education',
    },
  });

  // Create Tenant 2: GrowthStack Weekly
  const growthStack = await prisma.tenant.create({
    data: {
      name: 'GrowthStack Weekly',
      slug: 'growthstack',
      niche: 'B2B SaaS marketing',
    },
  });

  // Helper function to create agents with attributes
  const createAgentWithAttributes = async (
    tenantId: string,
    type: string,
    name: string,
    description: string,
    attributes: Array<{ key: string; label: string; description?: string; enabled: boolean }>
  ) => {
    const agent = await prisma.agent.create({
      data: {
        tenantId,
        type,
        name,
        description,
        attributes: {
          create: attributes,
        },
      },
    });
    return agent;
  };

  // Create agents for devinsights tenant
  console.log('Creating agents for devinsights...');

  await createAgentWithAttributes(
    devInsights.id,
    'CONTENT_ANALYTICS',
    'Content Analytics',
    'Analyzes content performance across channels',
    [
      { key: 'linkedin', label: 'Pull LinkedIn data', enabled: true },
      { key: 'youtube', label: 'Pull YouTube data', enabled: true },
      { key: 'blog', label: 'Pull Blog data', enabled: true },
      { key: 'email', label: 'Pull Email Newsletter data', enabled: false },
      { key: 'reddit', label: 'Pull Reddit data', enabled: false },
      { key: 'ppc', label: 'Pull Google PPC data', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    devInsights.id,
    'AUDIENCE_INTELLIGENCE',
    'Audience Intelligence',
    'Identifies audience segments and engagement patterns',
    [
      { key: 'timing', label: 'Engagement timing analysis', enabled: true },
      { key: 'segments', label: 'Audience segment breakdown', enabled: true },
      { key: 'top_type', label: 'Top engaged audience type', enabled: true },
      { key: 'demographics', label: 'Demographic patterns and trends', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    devInsights.id,
    'CHANNEL_CONTENT_INTELLIGENCE',
    'Channel Content Intelligence',
    'Analyzes format and channel performance combinations',
    [
      { key: 'channel_format_combo', label: 'Channel-format combination analysis', enabled: true },
      { key: 'top_channels', label: 'Top performing channels', enabled: true },
      { key: 'top_formats', label: 'Top performing content formats', enabled: true },
      { key: 'cross_channel_strategy', label: 'Cross-channel strategy recommendations', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    devInsights.id,
    'SENTIMENT_ANALYSIS',
    'Sentiment Analysis',
    'Analyzes audience sentiment from comments and reactions',
    [
      { key: 'sentiment_score', label: 'Overall sentiment scoring', enabled: true },
      { key: 'themes', label: 'Sentiment themes extraction', enabled: true },
      { key: 'audience_tone', label: 'Audience emotional tone', enabled: true },
      { key: 'recommendations', label: 'Sentiment-based recommendations', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    devInsights.id,
    'GAP_ANALYSIS',
    'Gap Analysis',
    'Identifies content gaps and opportunities',
    [
      { key: 'topics', label: 'Topic gap identification', enabled: true },
      { key: 'formats', label: 'Format gap analysis', enabled: true },
      { key: 'seasonal', label: 'Seasonal opportunity detection', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    devInsights.id,
    'COMPETITOR_ANALYSIS',
    'Competitor Analysis',
    'Compares your content with competitors',
    [
      { key: 'coverage_gaps', label: 'Topic coverage gaps vs competitors', enabled: true },
      { key: 'competitor_strengths', label: 'Competitor strengths analysis', enabled: true },
      { key: 'your_advantages', label: 'Your competitive advantages', enabled: true },
      { key: 'market_positioning', label: 'Market positioning strategy', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    devInsights.id,
    'OPPORTUNITY_IDENTIFICATION',
    'Opportunity Identification',
    'Identifies high-impact content opportunities',
    [
      { key: 'high_impact_topics', label: 'High-impact topic recommendations', enabled: true },
      { key: 'format_channel_strategy', label: 'Best format-channel combinations', enabled: true },
      { key: 'urgency', label: 'Opportunity urgency ranking', enabled: true },
      { key: 'content_gaps', label: 'Content gap analysis', enabled: false },
    ]
  );

  // Create agents for growthstack tenant
  console.log('Creating agents for growthstack...');

  await createAgentWithAttributes(
    growthStack.id,
    'CONTENT_ANALYTICS',
    'Content Analytics',
    'Analyzes content performance across channels',
    [
      { key: 'linkedin', label: 'Pull LinkedIn data', enabled: true },
      { key: 'youtube', label: 'Pull YouTube data', enabled: true },
      { key: 'blog', label: 'Pull Blog data', enabled: true },
      { key: 'email', label: 'Pull Email Newsletter data', enabled: false },
      { key: 'reddit', label: 'Pull Reddit data', enabled: false },
      { key: 'ppc', label: 'Pull Google PPC data', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    growthStack.id,
    'AUDIENCE_INTELLIGENCE',
    'Audience Intelligence',
    'Identifies audience segments and engagement patterns',
    [
      { key: 'timing', label: 'Engagement timing analysis', enabled: true },
      { key: 'segments', label: 'Audience segment breakdown', enabled: true },
      { key: 'top_type', label: 'Top engaged audience type', enabled: true },
      { key: 'demographics', label: 'Demographic patterns and trends', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    growthStack.id,
    'CHANNEL_CONTENT_INTELLIGENCE',
    'Channel Content Intelligence',
    'Analyzes format and channel performance combinations',
    [
      { key: 'channel_format_combo', label: 'Channel-format combination analysis', enabled: true },
      { key: 'top_channels', label: 'Top performing channels', enabled: true },
      { key: 'top_formats', label: 'Top performing content formats', enabled: true },
      { key: 'cross_channel_strategy', label: 'Cross-channel strategy recommendations', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    growthStack.id,
    'SENTIMENT_ANALYSIS',
    'Sentiment Analysis',
    'Analyzes audience sentiment from comments and reactions',
    [
      { key: 'sentiment_score', label: 'Overall sentiment scoring', enabled: true },
      { key: 'themes', label: 'Sentiment themes extraction', enabled: true },
      { key: 'audience_tone', label: 'Audience emotional tone', enabled: true },
      { key: 'recommendations', label: 'Sentiment-based recommendations', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    growthStack.id,
    'GAP_ANALYSIS',
    'Gap Analysis',
    'Identifies content gaps and opportunities',
    [
      { key: 'topics', label: 'Topic gap identification', enabled: true },
      { key: 'formats', label: 'Format gap analysis', enabled: true },
      { key: 'seasonal', label: 'Seasonal opportunity detection', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    growthStack.id,
    'COMPETITOR_ANALYSIS',
    'Competitor Analysis',
    'Compares your content with competitors',
    [
      { key: 'coverage_gaps', label: 'Topic coverage gaps vs competitors', enabled: true },
      { key: 'competitor_strengths', label: 'Competitor strengths analysis', enabled: true },
      { key: 'your_advantages', label: 'Your competitive advantages', enabled: true },
      { key: 'market_positioning', label: 'Market positioning strategy', enabled: false },
    ]
  );

  await createAgentWithAttributes(
    growthStack.id,
    'OPPORTUNITY_IDENTIFICATION',
    'Opportunity Identification',
    'Identifies high-impact content opportunities',
    [
      { key: 'high_impact_topics', label: 'High-impact topic recommendations', enabled: true },
      { key: 'format_channel_strategy', label: 'Best format-channel combinations', enabled: true },
      { key: 'urgency', label: 'Opportunity urgency ranking', enabled: true },
      { key: 'content_gaps', label: 'Content gap analysis', enabled: false },
    ]
  );

  // Seed ContentItems for devinsights
  console.log('Seeding content for devinsights...');

  // 20 LinkedIn posts (with meaningful titles for gap analysis)
  const linkedinTitles = [
    'AI-Powered Developer Tools: The Future of Coding',
    '5 Cloud Architecture Patterns Every Engineer Should Know',
    'DevOps Best Practices for 2024',
    'Machine Learning in Production: Real-World Challenges',
    'API Design: REST vs GraphQL vs gRPC',
    'Kubernetes Security: Essential Checklist',
    'Why Your Development Team Needs Better Monitoring',
    'Microservices: When to Use and When to Avoid',
    'Growth Hacking for B2B SaaS Companies',
    'Understanding Database Scalability Trade-offs',
    'Performance Optimization: Quick Wins for Your App',
    'The Rise of Serverless Architecture',
    'Building Resilient Systems: Failure Modes and Recovery',
    'Data Engineering Trends 2024',
    'AI/ML Integration: Practical Implementation Guide',
    'Cloud Cost Optimization Strategies',
    'Security First: Building Threat-Resilient Applications',
    'Growth Metrics That Actually Matter',
    'Technical Debt: Causes and Solutions',
    'Modern Authentication: OAuth 2.0 and Beyond',
  ];

  for (let i = 0; i < 20; i++) {
    const contentItem = await prisma.contentItem.create({
      data: {
        tenantId: devInsights.id,
        channel: 'LINKEDIN',
        title: linkedinTitles[i],
        contentType: 'text',
        publishDate: new Date(Date.now() - (i * 86400000)),
        rawData: JSON.stringify({ postId: `li_${i}` }),
        metrics: {
          create: {
            impressions: Math.floor(Math.random() * 5000) + 500,
            reach: Math.floor(Math.random() * 3000) + 300,
            likes: Math.floor(Math.random() * 150) + 10,
            comments: Math.floor(Math.random() * 50) + 2,
            shares: Math.floor(Math.random() * 20) + 1,
            ctr: Math.random() * 5 + 0.5,
            followerGrowth: Math.floor(Math.random() * 50),
          },
        },
      },
    });
  }

  // 15 Blog articles (meaningful titles)
  const blogTitles = [
    'Complete Guide to Kubernetes Deployments',
    'Building Scalable Node.js Applications',
    'Database Indexing Strategies Explained',
    'GraphQL Tutorial: Building Modern APIs',
    'Docker Best Practices for Production',
    'React Performance Optimization',
    'Python Async/Await Explained',
    'Git Workflows for Teams',
    'Machine Learning Basics for Developers',
    'Implementing CI/CD Pipelines',
    'Cloud Security: Defense in Depth',
    'TypeScript Advanced Patterns',
    'Building Real-time Applications',
    'API Rate Limiting Strategies',
    'Code Review Best Practices',
  ];

  for (let i = 0; i < 15; i++) {
    await prisma.contentItem.create({
      data: {
        tenantId: devInsights.id,
        channel: 'BLOG',
        title: blogTitles[i],
        contentType: 'article',
        publishDate: new Date(Date.now() - (i * 172800000)),
        rawData: JSON.stringify({ articleId: `blog_${i}` }),
        metrics: {
          create: {
            wordCount: Math.floor(Math.random() * 3000) + 1000,
            sessions: Math.floor(Math.random() * 1000) + 100,
            timeOnPage: Math.random() * 300 + 30,
            bounceRate: Math.random() * 80 + 10,
            conversions: Math.floor(Math.random() * 20) + 1,
            searchTraffic: Math.floor(Math.random() * 500) + 50,
          },
        },
      },
    });
  }

  // 8 YouTube videos (meaningful titles)
  const youtubeTitles = [
    'Advanced Kubernetes Tutorial [Production Ready]',
    'Building Microservices: Full Course',
    'DevOps Roadmap for 2024',
    'React Hooks Deep Dive',
    'Docker and Kubernetes Comparison',
    'System Design Interview Prep',
    'Cloud Architecture Best Practices',
    'Growth Marketing Strategy Guide',
  ];

  for (let i = 0; i < 8; i++) {
    await prisma.contentItem.create({
      data: {
        tenantId: devInsights.id,
        channel: 'YOUTUBE',
        title: youtubeTitles[i],
        contentType: 'video',
        publishDate: new Date(Date.now() - (i * 604800000)),
        rawData: JSON.stringify({ videoId: `yt_${i}` }),
        metrics: {
          create: {
            views: Math.floor(Math.random() * 50000) + 1000,
            watchTime: Math.random() * 1000 + 100,
            avgViewDuration: Math.random() * 600 + 60,
            likes: Math.floor(Math.random() * 500) + 50,
            comments: Math.floor(Math.random() * 100) + 5,
            subscribersGained: Math.floor(Math.random() * 200) + 10,
            commentText: `Great content! Really helpful for my project.`,
          },
        },
      },
    });
  }

  // Seed ContentItems for growthstack
  console.log('Seeding content for growthstack...');

  // 20 Email campaigns
  for (let i = 1; i <= 20; i++) {
    await prisma.contentItem.create({
      data: {
        tenantId: growthStack.id,
        channel: 'EMAIL_NEWSLETTER',
        title: `Email Campaign #${i}`,
        contentType: 'email',
        publishDate: new Date(Date.now() - (i * 604800000)),
        rawData: JSON.stringify({ campaignId: `email_${i}` }),
        metrics: {
          create: {
            openRate: Math.random() * 50 + 20,
            ctr: Math.random() * 10 + 1,
            conversions: Math.floor(Math.random() * 30) + 2,
            leadsGenerated: Math.floor(Math.random() * 50) + 5,
            unsubscribes: Math.floor(Math.random() * 10),
          },
        },
      },
    });
  }

  // 15 LinkedIn posts
  for (let i = 1; i <= 15; i++) {
    await prisma.contentItem.create({
      data: {
        tenantId: growthStack.id,
        channel: 'LINKEDIN',
        title: linkedinTitles[i],
        contentType: 'text',
        publishDate: new Date(Date.now() - (i * 86400000)),
        rawData: JSON.stringify({ postId: `li_gs_${i}` }),
        metrics: {
          create: {
            impressions: Math.floor(Math.random() * 8000) + 1000,
            reach: Math.floor(Math.random() * 5000) + 500,
            likes: Math.floor(Math.random() * 200) + 20,
            comments: Math.floor(Math.random() * 80) + 5,
            shares: Math.floor(Math.random() * 30) + 2,
            ctr: Math.random() * 6 + 0.8,
            followerGrowth: Math.floor(Math.random() * 100) + 10,
          },
        },
      },
    });
  }

  // 10 Reddit threads
  for (let i = 1; i <= 10; i++) {
    await prisma.contentItem.create({
      data: {
        tenantId: growthStack.id,
        channel: 'REDDIT',
        title: `Reddit Thread #${i}`,
        contentType: 'discussion',
        publishDate: new Date(Date.now() - (i * 345600000)),
        rawData: JSON.stringify({ threadId: `reddit_${i}` }),
        metrics: {
          create: {
            upvotes: Math.floor(Math.random() * 5000) + 100,
            comments: Math.floor(Math.random() * 200) + 10,
            trendVelocity: Math.random() * 100,
            mentionFrequency: Math.floor(Math.random() * 50) + 5,
            commentText: `This is exactly what I was looking for!`,
          },
        },
      },
    });
  }

  // Seed competitors
  console.log('Seeding competitors...');

  await prisma.competitor.create({
    data: {
      tenantId: devInsights.id,
      name: 'dev.to',
      url: 'https://dev.to',
      niche: 'developer education',
      isAuto: false,
    },
  });

  await prisma.competitor.create({
    data: {
      tenantId: devInsights.id,
      name: 'CSS-Tricks',
      url: 'https://css-tricks.com',
      niche: 'developer education',
      isAuto: false,
    },
  });

  await prisma.competitor.create({
    data: {
      tenantId: growthStack.id,
      name: 'Buffer',
      url: 'https://buffer.com',
      niche: 'B2B SaaS marketing',
      isAuto: false,
    },
  });

  await prisma.competitor.create({
    data: {
      tenantId: growthStack.id,
      name: 'Contentful',
      url: 'https://contentful.com',
      niche: 'B2B SaaS marketing',
      isAuto: false,
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
