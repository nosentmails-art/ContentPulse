import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const seededRandom = (n: number) => Math.abs(Math.sin(n * 99999.0));

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

  // Create additional tenants (8 more for total of 10)
  const additionalTenants = [
    { name: 'TechCrunch Clone', slug: 'techcrunch', niche: 'technology news' },
    { name: 'Marketing Daily', slug: 'marketingdaily', niche: 'digital marketing' },
    { name: 'DevTools Hub', slug: 'devtoolshub', niche: 'developer tools' },
    { name: 'Startup Weekly', slug: 'startupweekly', niche: 'startup advice' },
    { name: 'Cloud Insights', slug: 'cloudinsights', niche: 'cloud computing' },
    { name: 'AI Frontiers', slug: 'aifrontiers', niche: 'artificial intelligence' },
    { name: 'Data Science Daily', slug: 'datasciencedaily', niche: 'data science' },
    { name: 'Security Brief', slug: 'securitybrief', niche: 'cybersecurity' },
  ];

  const createdTenants = [devInsights, growthStack];
  for (const tenantData of additionalTenants) {
    const tenant = await prisma.tenant.create({
      data: tenantData,
    });
    createdTenants.push(tenant);
  }

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

  // Helper function to create all agents for a tenant
  const createAgentsForTenant = async (tenantId: string) => {
    await createAgentWithAttributes(
      tenantId,
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
      tenantId,
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
      tenantId,
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
      tenantId,
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
      tenantId,
      'GAP_ANALYSIS',
      'Gap & Opportunity Analysis',
      'Finds content strategy gaps and turns them into recommended opportunities',
      [
        { key: 'topics', label: 'Topic gap identification', enabled: true },
        { key: 'formats', label: 'Format gap analysis', enabled: true },
        { key: 'seasonal', label: 'Seasonal opportunity detection', enabled: false },
      ]
    );

    await createAgentWithAttributes(
      tenantId,
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
      tenantId,
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
  };

  // Create agents for all tenants
  console.log('Creating agents for all tenants...');
  for (const tenant of createdTenants) {
    console.log(`Creating agents for ${tenant.name}...`);
    await createAgentsForTenant(tenant.id);
  }

  // Helper function to create content for a tenant
  const createContentForTenant = async (tenantId: string, tenantSlug: string) => {
    console.log(`Seeding content for ${tenantSlug}...`);

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
      'Docker vs Kubernetes: When to Use Which',
      'Building Event-Driven Microservices',
      'GraphQL Federation: A Complete Guide',
      'React Server Components: The Future',
      'TypeScript 5.0: New Features Explained',
      'Next.js 14: App Router Deep Dive',
      'Vue 3 Composition API Best Practices',
      'Angular Signals: A New Era',
      'SvelteKit: Full-Stack Framework',
      'Remix vs Next.js: Comparison',
      'Tauri vs Electron: Desktop Apps',
      'Rust for JavaScript Developers',
      'Go vs Node.js: Backend Performance',
      'Python vs JavaScript: AI Development',
      'TensorFlow.js: ML in the Browser',
      'WebAssembly: The Future of Web',
      'WebGPU: Graphics Acceleration',
      'WebRTC: Real-Time Communication',
      'WebSockets vs Server-Sent Events',
      'Service Workers: Offline First',
      'Progressive Web Apps: Complete Guide',
      'WebAuthn: Passwordless Authentication',
      'Content Security Policy: Security Guide',
      'CORS: Understanding Cross-Origin',
      'HTTP/3: The Future of Web',
      'QUIC Protocol: UDP-Based Transport',
      'TLS 1.3: Security Improvements',
      'DNS over HTTPS: Privacy First',
      'IPv6: The Next Generation',
      'Edge Computing: Distributed Processing',
      'CDN Strategies: Global Performance',
      'Load Balancing: Algorithms Guide',
      'Caching Strategies: Browser to Edge',
      'Database Sharding: Scalability Guide',
      'Read Replicas: Performance Scaling',
      'Write Throughput: Optimization Tips',
    ];

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
      'System Design: Distributed Systems',
      'Microservices Architecture Patterns',
      'Event Sourcing: Complete Guide',
      'CQRS: Command Query Separation',
      'Domain-Driven Design: Practical Guide',
      'Clean Architecture: Principles',
      'SOLID Principles: Examples',
      'Design Patterns: JavaScript',
      'Refactoring: Code Improvement',
      'Test-Driven Development: Guide',
      'Behavior-Driven Development: BDD',
      'Acceptance Test-Driven Development',
      'Continuous Integration: Jenkins',
      'Continuous Deployment: Strategies',
      'Infrastructure as Code: Terraform',
      'Configuration Management: Ansible',
      'Container Orchestration: Kubernetes',
      'Service Mesh: Istio Guide',
      'Observability: Monitoring Stack',
      'Logging: Best Practices',
      'Tracing: Distributed Systems',
      'Metrics: Prometheus Guide',
      'Alerting: PagerDuty Setup',
      'Incident Response: Playbook',
      'Post-Mortem: Analysis Guide',
      'Chaos Engineering: Resilience',
      'Disaster Recovery: Planning',
      'Business Continuity: Strategy',
      'Compliance: GDPR Guide',
      'Security Audits: Penetration Testing',
      'Vulnerability Management: Process',
      'Patch Management: Automation',
      'Supply Chain Security: SBOM',
    ];

    const youtubeTitles = [
      'Advanced Kubernetes Tutorial [Production Ready]',
      'Building Microservices: Full Course',
      'DevOps Roadmap for 2024',
      'React Hooks Deep Dive',
      'Docker and Kubernetes Comparison',
      'System Design Interview Prep',
      'Cloud Architecture Best Practices',
      'Growth Marketing Strategy Guide',
      'TypeScript Generics Explained',
      'React Context API Deep Dive',
      'Redux Toolkit: Complete Guide',
      'Zustand: State Management',
      'Jotai: Atomic State',
      'Recoil: Facebook State',
      'XState: State Machines',
      'Robot: Visual State Machines',
      'MobX: Reactive State',
      'Pinia: Vue State',
      'Vuex: Vue State Legacy',
      'Apollo Client: GraphQL',
      'React Query: Data Fetching',
      'SWR: Data Fetching',
      'TanStack Query: Data Fetching',
      'Axios vs Fetch: HTTP',
      'Fetch API: Complete Guide',
      'XMLHttpRequest: Legacy AJAX',
      'WebSocket: Real-Time Guide',
      'Socket.io: Real-Time Framework',
      'Pusher: Real-Time Service',
      'Firebase Realtime Database',
      'Firestore: NoSQL Database',
      'Supabase: Open Source Firebase',
      'PlanetScale: Serverless MySQL',
      'Neon: Serverless PostgreSQL',
      'MongoDB Atlas: Cloud Database',
      'Redis: In-Memory Database',
      'Elasticsearch: Search Engine',
      'Meilisearch: Open Source Search',
      'Algolia: Search as a Service',
      'Typesense: Open Source Search',
    ];

    // Double the content - 40 LinkedIn, 30 Blog, 16 YouTube per tenant
    for (let i = 0; i < 40; i++) {
      await prisma.contentItem.create({
        data: {
          tenantId,
          channel: 'LINKEDIN',
          title: linkedinTitles[i % linkedinTitles.length],
          contentType: 'text',
          publishDate: new Date(Date.now() - (i * 86400000)),
          rawData: JSON.stringify({ postId: `li_${tenantSlug}_${i}` }),
          metrics: {
            create: {
              impressions: Math.floor(seededRandom(i + tenantSlug.length) * 5000) + 500,
              reach: Math.floor(seededRandom(i + tenantSlug.length) * 3000) + 300,
              likes: Math.floor(seededRandom(i + tenantSlug.length) * 150) + 10,
              comments: Math.floor(seededRandom(i + tenantSlug.length) * 50) + 2,
              shares: Math.floor(seededRandom(i + tenantSlug.length) * 20) + 1,
              ctr: seededRandom(i + tenantSlug.length) * 5 + 0.5,
              followerGrowth: Math.floor(seededRandom(i + tenantSlug.length) * 50),
            },
          },
        },
      });
    }

    for (let i = 0; i < 30; i++) {
      await prisma.contentItem.create({
        data: {
          tenantId,
          channel: 'BLOG',
          title: blogTitles[i % blogTitles.length],
          contentType: 'article',
          publishDate: new Date(Date.now() - (i * 172800000)),
          rawData: JSON.stringify({ articleId: `blog_${tenantSlug}_${i}` }),
          metrics: {
            create: {
              wordCount: Math.floor(seededRandom(i + tenantSlug.length) * 3000) + 1000,
              sessions: Math.floor(seededRandom(i + tenantSlug.length) * 1000) + 100,
              timeOnPage: seededRandom(i + tenantSlug.length) * 300 + 30,
              bounceRate: seededRandom(i + tenantSlug.length) * 80 + 10,
              conversions: Math.floor(seededRandom(i + tenantSlug.length) * 20) + 1,
              searchTraffic: Math.floor(seededRandom(i + tenantSlug.length) * 500) + 50,
            },
          },
        },
      });
    }

    for (let i = 0; i < 16; i++) {
      await prisma.contentItem.create({
        data: {
          tenantId,
          channel: 'YOUTUBE',
          title: youtubeTitles[i % youtubeTitles.length],
          contentType: 'video',
          publishDate: new Date(Date.now() - (i * 604800000)),
          rawData: JSON.stringify({ videoId: `yt_${tenantSlug}_${i}` }),
          metrics: {
            create: {
              views: Math.floor(seededRandom(i + tenantSlug.length) * 50000) + 1000,
              watchTime: seededRandom(i + tenantSlug.length) * 1000 + 100,
              avgViewDuration: seededRandom(i + tenantSlug.length) * 600 + 60,
              likes: Math.floor(seededRandom(i + tenantSlug.length) * 500) + 50,
              comments: Math.floor(seededRandom(i + tenantSlug.length) * 100) + 5,
              subscribersGained: Math.floor(seededRandom(i + tenantSlug.length) * 200) + 10,
              commentText: `Great content! Really helpful for my project.`,
            },
          },
        },
      });
    }
  };

  // Create content for all tenants using helper function
  console.log('Creating content for all tenants...');
  for (const tenant of createdTenants) {
    await createContentForTenant(tenant.id, tenant.slug);
  }

  // OLD MANUAL SEEDING (commented out - replaced by helper function above)
  /*
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
            impressions: Math.floor(seededRandom(i) * 5000) + 500,
            reach: Math.floor(seededRandom(i) * 3000) + 300,
            likes: Math.floor(seededRandom(i) * 150) + 10,
            comments: Math.floor(seededRandom(i) * 50) + 2,
            shares: Math.floor(seededRandom(i) * 20) + 1,
            ctr: seededRandom(i) * 5 + 0.5,
            followerGrowth: Math.floor(seededRandom(i) * 50),
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
            wordCount: Math.floor(seededRandom(i) * 3000) + 1000,
            sessions: Math.floor(seededRandom(i) * 1000) + 100,
            timeOnPage: seededRandom(i) * 300 + 30,
            bounceRate: seededRandom(i) * 80 + 10,
            conversions: Math.floor(seededRandom(i) * 20) + 1,
            searchTraffic: Math.floor(seededRandom(i) * 500) + 50,
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
            views: Math.floor(seededRandom(i) * 50000) + 1000,
            watchTime: seededRandom(i) * 1000 + 100,
            avgViewDuration: seededRandom(i) * 600 + 60,
            likes: Math.floor(seededRandom(i) * 500) + 50,
            comments: Math.floor(seededRandom(i) * 100) + 5,
            subscribersGained: Math.floor(seededRandom(i) * 200) + 10,
            commentText: `Great content! Really helpful for my project.`,
          },
        },
      },
    });
  }

  // Seed ContentItems for growthstack
  console.log('Seeding content for growthstack...');

  const emailSubjects = [
    '5 SaaS Metrics Every Founder Should Watch',
    'Customer-Led Growth: A Playbook for B2B',
    'How to Run a Product-Led Sales Motion',
    'The State of B2B Content Marketing in 2024',
    'Email Open Rates by Industry: New Benchmarks',
    'Building a Self-Serve Onboarding Flow',
    'Why Your Demo Requests Are Dropping (And How to Fix It)',
    'A/B Testing Your Pricing Page',
    'The No-Fluff Guide to LinkedIn Ads for SaaS',
    'Using Case Studies to Accelerate Enterprise Sales',
    'Customer Retention: The Growth Lever No One Talks About',
    'How to Create a Content Engine That Runs Itself',
    'Sales Enablement Content That Actually Closes Deals',
    'The 30-60-90 Day Plan for New B2B Marketers',
    'SEO for SaaS: Targeting High-Intent Keywords',
    'Product Updates That Drive Activation',
    'Community-Led Growth vs Sales-Led Growth',
    'The Real Cost of Bad Data in Your CRM',
    'How to Build a Competitive Battlecard',
    'Quarterly Planning for Marketing Teams',
  ];

  const b2bLinkedInTitles = [
    '5 Signs Your GTM Motion Needs a Rethink',
    'Customer Success Is the New Sales',
    'Why PLG and Enterprise Sales Can Coexist',
    'The B2B SaaS Metrics That Matter at Every Stage',
    'How We Cut Churn by 40% in 6 Months',
    'Building a Category, Not Just a Product',
    'The ROI of Community-Led Growth',
    'Stop Selling Features, Start Selling Outcomes',
    'How to Write Case Studies That Convert',
    "A Founder's Guide to B2B Demand Generation",
    'Pricing Pages That Convert: What We Learned',
    "Why Your MQLs Aren't Converting (And What To Do)",
    'The Modern Marketing Tech Stack for Startups',
    'From Lead Gen to Pipeline: A Realistic Playbook',
    'How to Position Against Larger Competitors',
  ];

  const redditThreads = [
    "What's the best channel for B2B SaaS leads in 2024?",
    'How do you reduce churn without a dedicated CS team?',
    'SaaS founders, what is your top growth lever?',
    'Cold email vs LinkedIn outreach: what\'s working?',
    'How to build a product-led growth motion from scratch',
    'Best tools for marketing attribution in B2B?',
    'What are realistic CAC payback periods for SaaS?',
    'How to get useful testimonials from enterprise customers',
    'Freemium vs free trial: what converted better for you?',
    'Email nurture sequences that actually get replies',
  ];

  // 20 Email campaigns
  for (let i = 1; i <= 20; i++) {
    await prisma.contentItem.create({
      data: {
        tenantId: growthStack.id,
        channel: 'EMAIL_NEWSLETTER',
        title: emailSubjects[i - 1],
        contentType: 'email',
        publishDate: new Date(Date.now() - (i * 604800000)),
        rawData: JSON.stringify({ campaignId: `email_${i}` }),
        metrics: {
          create: {
            openRate: seededRandom(i) * 50 + 20,
            ctr: seededRandom(i) * 10 + 1,
            conversions: Math.floor(seededRandom(i) * 30) + 2,
            leadsGenerated: Math.floor(seededRandom(i) * 50) + 5,
            unsubscribes: Math.floor(seededRandom(i) * 10),
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
        title: b2bLinkedInTitles[i - 1],
        contentType: 'text',
        publishDate: new Date(Date.now() - (i * 86400000)),
        rawData: JSON.stringify({ postId: `li_gs_${i}` }),
        metrics: {
          create: {
            impressions: Math.floor(seededRandom(i) * 8000) + 1000,
            reach: Math.floor(seededRandom(i) * 5000) + 500,
            likes: Math.floor(seededRandom(i) * 200) + 20,
            comments: Math.floor(seededRandom(i) * 80) + 5,
            shares: Math.floor(seededRandom(i) * 30) + 2,
            ctr: seededRandom(i) * 6 + 0.8,
            followerGrowth: Math.floor(seededRandom(i) * 100) + 10,
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
        title: redditThreads[i - 1],
        contentType: 'discussion',
        publishDate: new Date(Date.now() - (i * 345600000)),
        rawData: JSON.stringify({ threadId: `reddit_${i}` }),
        metrics: {
          create: {
            upvotes: Math.floor(seededRandom(i) * 5000) + 100,
            comments: Math.floor(seededRandom(i) * 200) + 10,
            trendVelocity: seededRandom(i) * 100,
            mentionFrequency: Math.floor(seededRandom(i) * 50) + 5,
            commentText: `This is exactly what I was looking for!`,
          },
        },
      },
    });
  }
  */

  // Seed competitors for all tenants
  console.log('Seeding competitors for all tenants...');

  const competitorData = [
    { name: 'dev.to', url: 'https://dev.to', niche: 'developer education', posts: 45, audience: '1.2M monthly readers', topics: ['AI & Machine Learning', 'Cloud Architecture', 'DevOps', 'API Design', 'Security'], strengths: ['High publishing frequency', 'Strong community engagement', 'Broad topic coverage'] },
    { name: 'CSS-Tricks', url: 'https://css-tricks.com', niche: 'developer education', posts: 30, audience: '500K monthly readers', topics: ['Frontend Frameworks', 'CSS', 'Performance', 'Accessibility', 'Web Design'], strengths: ['Deep technical tutorials', 'Excellent SEO', 'Strong design community'] },
    { name: 'Buffer', url: 'https://buffer.com', niche: 'B2B SaaS marketing', posts: 60, audience: '800K monthly readers', topics: ['Social Media Strategy', 'Content Marketing', 'Remote Work', 'Customer Stories', 'Analytics'], strengths: ['Consistent publishing cadence', 'Data-driven original research', 'Strong social distribution'] },
    { name: 'Contentful', url: 'https://contentful.com', niche: 'B2B SaaS marketing', posts: 35, audience: '300K monthly readers', topics: ['Headless CMS', 'Omnichannel Content', 'Developer Experience', 'Case Studies', 'Content Operations'], strengths: ['Product-led storytelling', 'Developer-focused content', 'Enterprise case studies'] },
    { name: 'TechCrunch', url: 'https://techcrunch.com', niche: 'technology news', posts: 100, audience: '5M monthly readers', topics: ['Startups', 'Venture Capital', 'AI', 'Enterprise Software', 'Mobile'], strengths: ['Breaking news coverage', 'Industry influence', 'Large audience reach'] },
    { name: 'HubSpot', url: 'https://hubspot.com', niche: 'digital marketing', posts: 80, audience: '2M monthly readers', topics: ['Inbound Marketing', 'Sales', 'Customer Service', 'CRM', 'Automation'], strengths: ['Comprehensive resource library', 'Strong SEO', 'Educational focus'] },
    { name: 'GitHub Blog', url: 'https://github.com/blog', niche: 'developer tools', posts: 40, audience: '1M monthly readers', topics: ['Open Source', 'Developer Tools', 'Security', 'CI/CD', 'Collaboration'], strengths: ['Developer trust', 'Technical depth', 'Community-driven'] },
    { name: 'Y Combinator', url: 'https://ycombinator.com', niche: 'startup advice', posts: 25, audience: '500K monthly readers', topics: ['Startup Advice', 'Fundraising', 'Product Management', 'Growth', 'Hiring'], strengths: ['Prestige and authority', 'Real startup data', 'Founder network'] },
    { name: 'AWS Blog', url: 'https://aws.amazon.com/blogs', niche: 'cloud computing', posts: 70, audience: '3M monthly readers', topics: ['Cloud Services', 'Architecture', 'Security', 'Machine Learning', 'DevOps'], strengths: ['Technical expertise', 'Product updates', 'Enterprise credibility'] },
    { name: 'OpenAI Blog', url: 'https://openai.com/blog', niche: 'artificial intelligence', posts: 20, audience: '2M monthly readers', topics: ['AI Research', 'GPT', 'Machine Learning', 'Safety', 'Applications'], strengths: ['Cutting-edge research', 'Industry leadership', 'High engagement'] },
  ];

  for (const tenant of createdTenants) {
    // Add 2-3 competitors per tenant based on niche
    const tenantNiche = tenant.niche || '';
    const relevantCompetitors = competitorData.filter(c => 
      c.niche === tenantNiche || 
      ['developer education', 'developer tools', 'technology news'].includes(c.niche) && tenantNiche.includes('developer') ||
      ['B2B SaaS marketing', 'digital marketing'].includes(c.niche) && tenantNiche.includes('marketing')
    ).slice(0, 3);

    for (const comp of relevantCompetitors) {
      await prisma.competitor.create({
        data: {
          tenantId: tenant.id,
          name: comp.name,
          url: comp.url,
          niche: comp.niche,
          isAuto: false,
          rawData: JSON.stringify({
            estimatedMonthlyPosts: comp.posts,
            audienceSize: comp.audience,
            topTopics: comp.topics,
            strengths: comp.strengths,
          }),
        },
      });
    }
  }

  await seedPersonas(createdTenants);

  console.log('✅ Database seeded successfully!');
}

async function seedPersonas(tenants: any[]) {
  console.log('Seeding personas for all tenants...');

  const personaData = [
    {
      personaId: 'tech_enthusiast',
      name: 'Tech Enthusiast',
      description: 'Developers and engineers interested in new technologies, frameworks, and best practices',
      keywords: JSON.stringify(['react', 'javascript', 'typescript', 'python', 'api', 'backend', 'frontend', 'devops', 'cloud', 'docker', 'kubernetes', 'ai', 'machine learning', 'database', 'architecture', 'performance', 'security']),
    },
    {
      personaId: 'decision_maker',
      name: 'Decision Maker',
      description: 'CTOs, VPs of Engineering, and technical leaders evaluating tools and strategies',
      keywords: JSON.stringify(['strategy', 'leadership', 'management', 'team', 'hiring', 'budget', 'roi', 'scale', 'enterprise', 'compliance', 'security', 'cost', 'vendor', 'evaluation', 'decision']),
    },
    {
      personaId: 'student_learner',
      name: 'Student/Learner',
      description: 'Students and beginners learning programming and software development',
      keywords: JSON.stringify(['tutorial', 'beginner', 'learn', 'how to', 'guide', 'getting started', 'introduction', 'basics', 'fundamentals', 'course', 'education', 'study', 'practice', 'example', 'step by step']),
    },
    {
      personaId: 'founder_entrepreneur',
      name: 'Founder/Entrepreneur',
      description: 'Startup founders and entrepreneurs building products and businesses',
      keywords: JSON.stringify(['startup', 'founder', 'entrepreneur', 'business', 'growth', 'marketing', 'sales', 'funding', 'investment', 'pitch', 'product', 'launch', 'customer', 'revenue', 'scale', 'mvp']),
    },
    {
      personaId: 'content_creator',
      name: 'Content Creator',
      description: 'Marketers and content creators focused on audience engagement and growth',
      keywords: JSON.stringify(['content', 'marketing', 'social media', 'engagement', 'audience', 'growth', 'brand', 'campaign', 'strategy', 'analytics', 'reach', 'traffic', 'conversion', 'seo', 'copywriting']),
    },
  ];

  for (const tenant of tenants) {
    for (const persona of personaData) {
      await prisma.persona.create({
        data: {
          tenantId: tenant.id,
          personaId: persona.personaId,
          name: persona.name,
          description: persona.description,
          keywords: persona.keywords,
          enabled: true,
        },
      });
    }
  }

  console.log('✅ Personas seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
