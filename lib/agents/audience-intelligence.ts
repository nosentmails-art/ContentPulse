/**
 * Audience Intelligence Agent
 * Uses uploaded engagement data and optional platform audience fields.
 */

import prisma from '../db';
import { mockLLMAnalyze } from './llm-helper';
import { calculateEngagement, calculateReach, toNumber } from './utils';

type RawRow = Record<string, unknown>;

interface Aggregate {
  label: string;
  contentCount: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  leads: number;
  score: number;
  contentTypes: Map<string, number>;
  weakContentTypes: Map<string, number>;
  demographics: Record<string, Map<string, number>>;
  sources: Set<string>;
}

export interface AudienceIntelligenceResult {
  summary: string;
  personaEngagement: Array<{
    personaId: string;
    name: string;
    contentCount: number;
    currentEngagement: number;
    currentEngagementRate: string;
    topContentTypes: string[];
    weakContentTypes: string[];
    topChannels: string[];
    observedSignals: Record<string, string[]>;
    recommendation: string;
  }>;
  observedSegments: Array<{
    segmentName: string;
    segmentType: string;
    whyThisSegmentExists: string;
    observedDemographics: Record<string, string[]>;
    topChannels: string[];
    contentTypesEngagingWith: string[];
    currentEngagement: number;
    currentEngagementRate: string;
    acquisitionSignals: string[];
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  demographicInsights: Array<{
    field: string;
    topValues: string[];
    source: 'observed';
  }>;
  dataQuality: {
    rowsAnalyzed: number;
    channelsWithData: number;
    optionalAudienceFieldsFound: string[];
    missingUsefulFields: string[];
    note: string;
  };
  topInsight: string;
  recommendation: string;
  segments: Array<{
    name: string;
    description: string;
    topContent: string;
    bestTime: string;
    engagementRate: string;
  }>;
}

export interface AgentResult {
  success: boolean;
  data?: AudienceIntelligenceResult;
  error?: string;
}

const AUDIENCE_FIELDS = [
  'age_group',
  'gender',
  'country',
  'region',
  'city',
  'job_title',
  'seniority',
  'department',
  'industry',
  'company_size',
  'follower_type',
  'subscribed_status',
  'new_vs_returning_viewers',
  'new_vs_returning',
  'traffic_source',
  'device_type',
  'browser',
  'lifecycle_stage',
  'audience_segment',
  'lead_quality',
  'flair',
  'theme',
  'sentiment',
  'pain_point',
];

const PRIORITY_FIELDS = [
  'audience_segment',
  'job_title',
  'seniority',
  'age_group',
  'country',
  'traffic_source',
  'device_type',
  'lifecycle_stage',
  'subscribed_status',
  'theme',
  'pain_point',
];

function toText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function parseRawData(rawData: string): RawRow {
  try {
    return JSON.parse(rawData) as RawRow;
  } catch {
    return {};
  }
}

function createAggregate(label: string): Aggregate {
  return {
    label,
    contentCount: 0,
    impressions: 0,
    engagement: 0,
    clicks: 0,
    conversions: 0,
    leads: 0,
    score: 0,
    contentTypes: new Map(),
    weakContentTypes: new Map(),
    demographics: {},
    sources: new Set(),
  };
}

function addCount(map: Map<string, number>, key: string | null, amount: number) {
  if (!key || amount <= 0) return;
  map.set(key, (map.get(key) || 0) + amount);
}

function sortedKeys(map: Map<string, number>, limit = 3): string[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function formatRate(engagement: number, impressions: number): string {
  if (impressions <= 0) return '0.0%';
  const rate = (engagement / impressions) * 100;
  return `${rate.toFixed(1)}%`;
}

function confidence(aggregate: Aggregate): 'HIGH' | 'MEDIUM' | 'LOW' {
  const demographicSignals = Object.keys(aggregate.demographics).length;
  if (aggregate.contentCount >= 10 && demographicSignals >= 3) return 'HIGH';
  if (aggregate.contentCount >= 3 || demographicSignals >= 1) return 'MEDIUM';
  return 'LOW';
}

function addObservation(
  aggregate: Aggregate,
  item: { channel: string; contentType: string | null; rawData: string; metrics: any }
) {
  const raw = parseRawData(item.rawData);
  const metrics = item.metrics || {};
  const impressions = calculateReach(metrics);
  const clicks = toNumber(metrics.clicks);
  const conversions = toNumber(metrics.conversions);
  const leads = toNumber(metrics.leadsGenerated);
  const engagement = calculateEngagement(metrics);
  const contentType =
    item.contentType ||
    toText(raw.post_type) ||
    toText(raw.format) ||
    toText(raw.category) ||
    toText(raw.flair) ||
    'Unknown';

  aggregate.contentCount += 1;
  aggregate.impressions += impressions;
  aggregate.engagement += engagement;
  aggregate.clicks += clicks;
  aggregate.conversions += conversions;
  aggregate.leads += leads;
  aggregate.score += engagement + clicks * 2 + conversions * 5 + leads * 5;
  aggregate.sources.add(item.channel);

  addCount(aggregate.contentTypes, contentType, engagement || 1);
  if (engagement <= 0 && impressions > 0) {
    addCount(aggregate.weakContentTypes, contentType, 1);
  }

  for (const field of AUDIENCE_FIELDS) {
    const value = toText(raw[field]);
    if (!value) continue;
    if (!aggregate.demographics[field]) aggregate.demographics[field] = new Map();
    addCount(aggregate.demographics[field], value, engagement || 1);
  }
}

function getObservedDemographics(aggregate: Aggregate): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(aggregate.demographics).map(([field, values]) => [
      field,
      sortedKeys(values, 3),
    ])
  );
}

function getSegmentKey(item: { channel: string; contentType: string | null; rawData: string }) {
  const raw = parseRawData(item.rawData);
  for (const field of PRIORITY_FIELDS) {
    const value = toText(raw[field]);
    if (value) {
      return { key: `${field}:${value}`, name: value, type: field };
    }
  }
  return {
    key: `${item.channel}:${item.contentType || 'Unknown'}`,
    name: `${item.channel} ${item.contentType || 'Audience'}`,
    type: 'behavioral',
  };
}

function buildMissingFields(foundFields: string[]) {
  return AUDIENCE_FIELDS.filter((field) => !foundFields.includes(field)).slice(0, 8);
}

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function personaKeywords(persona: {
  personaId: string;
  name: string;
  description: string | null;
  keywords: string;
}) {
  const sourceTerms = [
    persona.name,
    persona.description || '',
    ...parseJsonArray(persona.keywords),
  ];

  return Array.from(
    new Set(
      sourceTerms
        .join(' ')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((word) => word.trim())
        .filter((word) => word.length >= 4)
    )
  );
}

function itemSearchText(item: { title: string | null; contentType: string | null; rawData: string }) {
  return `${item.title || ''} ${item.contentType || ''} ${item.rawData || ''}`.toLowerCase();
}

export async function analyze(
  tenantId: string,
  enabledAttributes: string[] = []
): Promise<AgentResult> {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return { success: false, error: `Tenant not found: ${tenantId}` };

    const contentItems = await prisma.contentItem.findMany({
      where: { tenantId },
      include: { metrics: true },
      orderBy: { createdAt: 'desc' },
      take: 250,
    });

    if (contentItems.length === 0) {
      return {
        success: true,
        data: {
          summary: 'No uploaded content data is available yet for audience intelligence.',
          personaEngagement: [],
          observedSegments: [],
          demographicInsights: [],
          dataQuality: {
            rowsAnalyzed: 0,
            channelsWithData: 0,
            optionalAudienceFieldsFound: [],
            missingUsefulFields: AUDIENCE_FIELDS.slice(0, 8),
            note: 'Upload channel performance data first. Optional audience columns can be left blank when unavailable.',
          },
          topInsight: 'No current engagement data is available yet.',
          recommendation: 'Upload at least one channel CSV to identify audience priorities.',
          segments: [],
        },
      };
    }

    // Fetch personas from database
    const personas = await prisma.persona.findMany({
      where: { 
        tenantId,
        enabled: true 
      }
    });
    
    const channelMap = new Map<string, Aggregate>();
    const segmentMap = new Map<string, Aggregate>();
    const personaMap = new Map<string, Aggregate>();
    const demographicMap: Record<string, Map<string, number>> = {};
    const foundAudienceFields = new Set<string>();

    // Persona matching based on keywords
  for (const persona of personas) {
    personaMap.set(persona.personaId, createAggregate(persona.name));
  }

    for (const item of contentItems) {
      const channelAggregate = channelMap.get(item.channel) || createAggregate(item.channel);
      addObservation(channelAggregate, item);
      channelMap.set(item.channel, channelAggregate);

      const searchText = itemSearchText(item);
      // Persona matching based on keywords
      for (const persona of personas) {
        const keywords = personaKeywords(persona);
        const matched = keywords.length === 0 || keywords.some((keyword) => searchText.includes(keyword));
        if (!matched) continue;
        const personaAggregate = personaMap.get(persona.personaId) || createAggregate(persona.name);
        addObservation(personaAggregate, item);
        personaMap.set(persona.personaId, personaAggregate);
      }

      const segment = getSegmentKey(item);
      const segmentAggregate = segmentMap.get(segment.key) || createAggregate(segment.name);
      addObservation(segmentAggregate, item);
      segmentMap.set(segment.key, segmentAggregate);

      const raw = parseRawData(item.rawData);
      for (const field of AUDIENCE_FIELDS) {
        const value = toText(raw[field]);
        if (!value) continue;
        foundAudienceFields.add(field);
        if (!demographicMap[field]) demographicMap[field] = new Map();
        addCount(demographicMap[field], value, 1);
      }
    }

    const observedSegments = [...segmentMap.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 5)
      .map(([key, segment]) => {
        const segmentType = key.split(':')[0] || 'behavioral';
        const acquisitionSignals = [
          segment.conversions > 0 ? `${segment.conversions.toFixed(0)} conversions` : null,
          segment.leads > 0 ? `${segment.leads.toFixed(0)} leads` : null,
          segment.clicks > 0 ? `${segment.clicks.toFixed(0)} clicks` : null,
        ].filter(Boolean) as string[];

        return {
          segmentName: segment.label,
          segmentType,
          whyThisSegmentExists: `${segment.contentCount} rows show engagement from this ${segmentType.replace(/_/g, ' ')} segment.`,
          observedDemographics: getObservedDemographics(segment),
          topChannels: [...segment.sources].slice(0, 3),
          contentTypesEngagingWith: sortedKeys(segment.contentTypes, 3),
          currentEngagement: Number(segment.engagement.toFixed(0)),
          currentEngagementRate: formatRate(segment.engagement, segment.impressions),
          acquisitionSignals:
            acquisitionSignals.length > 0 ? acquisitionSignals : ['No conversion or lead signal uploaded for this segment'],
          confidence: confidence(segment),
        };
      });

    const personaEngagement = personas
      .map((persona) => {
        const aggregate = personaMap.get(persona.personaId) || createAggregate(persona.name);
        const topContentTypes = sortedKeys(aggregate.contentTypes, 3);
        const weakContentTypes = sortedKeys(aggregate.weakContentTypes, 3);
        const topChannels = [...aggregate.sources].slice(0, 3);

        return {
          personaId: persona.personaId,
          name: persona.name,
          contentCount: aggregate.contentCount,
          currentEngagement: Number(aggregate.engagement.toFixed(0)),
          currentEngagementRate: formatRate(aggregate.engagement, aggregate.impressions),
          topContentTypes,
          weakContentTypes,
          topChannels,
          observedSignals: getObservedDemographics(aggregate),
          recommendation:
            aggregate.contentCount > 0
              ? `This persona is engaging most with ${topContentTypes[0] || 'available content'}${topChannels[0] ? ` on ${topChannels[0]}` : ''}. Create more content in that pattern and validate with the next upload.`
              : `No uploaded content clearly maps to this persona yet. Add persona/audience fields or create content targeting ${persona.name}.`,
        };
      })
      .sort((a, b) => b.currentEngagement - a.currentEngagement)
      .slice(0, 5);

    const demographicInsights = Object.entries(demographicMap).map(([field, values]) => ({
      field,
      topValues: sortedKeys(values, 5),
      source: 'observed' as const,
    }));

    const strongestPersona = personaEngagement[0];
    const strongestSegment = observedSegments[0];

    // Base insights from statistical analysis
    const baseTopInsight = strongestPersona
      ? `${strongestPersona.name} has the strongest matched engagement with ${strongestPersona.currentEngagement} current engagement actions.`
      : strongestSegment
      ? `${strongestSegment.segmentName} is the strongest observed audience segment.`
      : 'No audience segment has enough current engagement data to rank yet.';
    const baseRecommendation = strongestPersona
      ? `Prioritize ${strongestPersona.topContentTypes[0] || 'proven'} content for ${strongestPersona.name}, especially on ${strongestPersona.topChannels[0] || 'the strongest observed channel'}.`
      : 'Upload optional audience fields such as job title, seniority, age group, country, and lifecycle stage to improve audience intelligence.';
    const baseSegments = observedSegments.map((segment) => ({
      name: segment.segmentName,
      description: segment.whyThisSegmentExists,
      topContent: segment.contentTypesEngagingWith.join(', ') || 'Not available',
      bestTime: 'Not available in uploaded data',
      engagementRate: segment.currentEngagementRate,
    }));

    // Use LLM to enhance segment descriptions, top insight, and recommendation
    let enhancedSegments = baseSegments;
    let enhancedTopInsight = baseTopInsight;
    let enhancedRecommendation = baseRecommendation;

    try {
      const llmPrompt = JSON.stringify({
        totalRows: contentItems.length,
        totalPersonas: personas.length,
        strongestPersona: strongestPersona ? { name: strongestPersona.name, engagement: strongestPersona.currentEngagement, topContentTypes: strongestPersona.topContentTypes, topChannels: strongestPersona.topChannels } : null,
        strongestSegment: strongestSegment ? { name: strongestSegment.segmentName, engagement: strongestSegment.currentEngagement, engagementRate: strongestSegment.currentEngagementRate } : null,
        baseSegments: baseSegments.map(s => ({ name: s.name, topContent: s.topContent, engagementRate: s.engagementRate }))
      });
      const systemPrompt = 'You are an audience intelligence analyst. Analyze the provided audience statistics and return JSON with enhanced insights. Return ONLY valid JSON with this structure: { "segmentDescriptions": [{"name": string, "description": string}], "topInsight": string, "recommendation": string }';
      const llmResult = await mockLLMAnalyze(systemPrompt, llmPrompt);
      
      if (llmResult.segmentDescriptions && Array.isArray(llmResult.segmentDescriptions)) {
        enhancedSegments = baseSegments.map(seg => {
          const enhanced = llmResult.segmentDescriptions.find((d: any) => d.name === seg.name);
          return enhanced ? { ...seg, description: enhanced.description } : seg;
        });
      }
      
      if (llmResult.topInsight) {
        enhancedTopInsight = llmResult.topInsight;
      }
      
      if (llmResult.recommendation) {
        enhancedRecommendation = llmResult.recommendation;
      }
    } catch (error) {
      console.warn('[audience-intelligence] LLM enhancement failed, using statistical fallback:', error);
    }

    return {
      success: true,
      data: {
        summary: `Analyzed ${contentItems.length} uploaded rows and ${personas.length} configured personas. Audience Intelligence focuses on who is engaging and which content types they respond to.`,
        personaEngagement,
        observedSegments,
        demographicInsights,
        dataQuality: {
          rowsAnalyzed: contentItems.length,
          channelsWithData: channelMap.size,
          optionalAudienceFieldsFound: [...foundAudienceFields],
          missingUsefulFields: buildMissingFields([...foundAudienceFields]),
          note:
            enabledAttributes.length > 0
              ? `Enabled attributes: ${enabledAttributes.join(', ')}. Missing optional CSV columns are treated as unavailable, not inferred.`
              : 'Missing optional CSV columns are treated as unavailable, not inferred.',
        },
        topInsight: enhancedTopInsight,
        recommendation: enhancedRecommendation,
        segments: enhancedSegments,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[audience-intelligence] Error: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}
