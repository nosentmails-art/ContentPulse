import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Agent types enum for reference
const AGENT_TYPES = [
  'AUDIENCE_BEHAVIOR',
  'CHANNEL_PERFORMANCE',
  'SENTIMENT_ANALYSIS',
  'CONTENT_GAPS',
  'COMPETITOR_BENCHMARKING',
  'ENGAGEMENT_OPTIMIZER',
  'TREND_SPOTTER',
];

// Agent attributes per agent type
const AGENT_ATTRIBUTES: Record<string, Array<{ key: string; label: string; value: boolean }>> = {
  AUDIENCE_BEHAVIOR: [
    { key: 'track_demographics', label: 'Track Demographics', value: true },
    { key: 'track_psychographics', label: 'Track Psychographics', value: true },
    { key: 'segment_by_region', label: 'Segment by Region', value: false },
  ],
  CHANNEL_PERFORMANCE: [
    { key: 'compare_channels', label: 'Compare Channels', value: true },
    { key: 'include_roi_analysis', label: 'Include ROI Analysis', value: true },
  ],
  SENTIMENT_ANALYSIS: [
    { key: 'detect_emotions', label: 'Detect Emotions', value: true },
    { key: 'track_brand_mentions', label: 'Track Brand Mentions', value: true },
    { key: 'competitor_sentiment', label: 'Competitor Sentiment', value: true },
  ],
  CONTENT_GAPS: [
    { key: 'analyze_keywords', label: 'Analyze Keywords', value: true },
    { key: 'identify_topics', label: 'Identify Missing Topics', value: true },
  ],
  COMPETITOR_BENCHMARKING: [
    { key: 'track_competitors', label: 'Track Competitors', value: true },
    { key: 'compare_metrics', label: 'Compare Key Metrics', value: true },
  ],
  ENGAGEMENT_OPTIMIZER: [
    { key: 'optimize_timing', label: 'Optimize Posting Times', value: true },
    { key: 'format_recommendations', label: 'Format Recommendations', value: true },
  ],
  TREND_SPOTTER: [
    { key: 'detect_trends', label: 'Detect Emerging Trends', value: true },
    { key: 'predict_peaks', label: 'Predict Traffic Peaks', value: true },
  ],
};

async function main() {
  console.log('🌱 Seeding ContentPulse database...\n');

  // Clean up existing data
  await prisma.competitor.deleteMany();
  await prisma.channelMetrics.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.agentAttribute.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.tenant.deleteMany();

  // Create Tenant 1: DevInsights Blog
  console.log('📝 Creating tenant: DevInsights Blog');
  const devinsightsTenant = await prisma.tenant.create({
    data: {
      name: 'DevInsights Blog',
      slug: 'devinsights',
    },
  });
  console.log(`✓ Tenant created: ${devinsightsTenant.name} (ID: ${devinsightsTenant.id})\n`);

  // Create Tenant 2: GrowthStack Weekly
  console.log('📝 Creating tenant: GrowthStack Weekly');
  const growthstackTenant = await prisma.tenant.create({
    data: {
      name: 'GrowthStack Weekly',
      slug: 'growthstack',
    },
  });
  console.log(`✓ Tenant created: ${growthstackTenant.name} (ID: ${growthstackTenant.id})\n`);

  // Seed agents for each tenant
  for (const tenant of [devinsightsTenant, growthstackTenant]) {
    console.log(`🤖 Seeding agents for ${tenant.name}:`);

    for (const agentType of AGENT_TYPES) {
      // Create agent
      const agent = await prisma.agent.create({
        data: {
          tenantId: tenant.id,
          type: agentType,
          status: 'ENABLED',
        },
      });

      // Create attributes for this agent
      const attributes = AGENT_ATTRIBUTES[agentType] || [];
      for (const attr of attributes) {
        await prisma.agentAttribute.create({
          data: {
            agentId: agent.id,
            key: attr.key,
            label: attr.label,
            value: attr.value,
          },
        });
      }

      console.log(`  ✓ ${agentType} (${attributes.length} attributes)`);
    }
    console.log('');
  }

  console.log('✅ Seeding complete!\n');
  console.log('📊 Summary:');
  console.log(`  • 2 tenants created`);
  console.log(`  • 14 agents created (7 per tenant)`);
  console.log(`  • All agent attributes seeded`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
