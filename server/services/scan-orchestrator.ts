import { randomUUID } from 'crypto';
import type {
  ScanRequest, ScanResult, AggregatedDetection, ProviderResult,
  DetectionVerdict, ContentType,
} from '../../shared/types.js';
import { providerRegistry } from '../providers/provider-registry.js';
import type { DetectionInput } from '../providers/base.js';
import { complianceEngine } from './compliance-engine.js';
import { DETECTION_THRESHOLDS } from '../../shared/constants.js';

export async function runScan(
  request: ScanRequest,
  filePath?: string
): Promise<ScanResult> {
  const scanStart = Date.now();
  const scanId = randomUUID();

  // Build detection input
  const input: DetectionInput = {
    contentType: request.contentType,
    filePath,
    textContent: request.textContent,
    mimeType: request.mimeType,
    fileName: request.fileName,
  };

  // Get all configured providers for this content type
  const providers = providerRegistry.getConfiguredProviders(request.contentType);

  if (providers.length === 0) {
    throw new Error(`No detection providers configured for content type: ${request.contentType}`);
  }

  // Run all providers in parallel
  const results = await Promise.allSettled(
    providers.map((p) => p.detect(input))
  );

  const providerResults: ProviderResult[] = results
    .filter((r): r is PromiseFulfilledResult<ProviderResult> => r.status === 'fulfilled')
    .map((r) => r.value);

  // Aggregate detection results
  const detection = aggregateDetections(providerResults);

  // Run compliance check
  const compliance = complianceEngine.evaluate(request, detection);

  return {
    id: scanId,
    scanRequest: request,
    detection,
    compliance,
    createdAt: new Date().toISOString(),
    processingTimeMs: Date.now() - scanStart,
  };
}

function aggregateDetections(results: ProviderResult[]): AggregatedDetection {
  if (results.length === 0) {
    return {
      overallVerdict: 'uncertain',
      overallConfidence: 0,
      providerResults: [],
      consensusCount: 0,
    };
  }

  // Filter out errored results for aggregation
  const validResults = results.filter((r) => !r.error);

  if (validResults.length === 0) {
    return {
      overallVerdict: 'uncertain',
      overallConfidence: 0,
      providerResults: results,
      consensusCount: 0,
    };
  }

  // Weighted confidence based on provider reliability
  const weights: Record<string, number> = {
    openai: 3.0,       // GPT-4o Vision — strong visual analysis
    hive: 3.0,         // External AI API — highest trust
    sensity: 3.0,
    arya: 2.5,
    resemble: 2.5,
    huggingface: 2.5,  // Visual AI detection — free, ViT-based
    c2pa: 2.0,         // Metadata-based — reliable but can be absent
    heuristic: 1.0,    // Heuristic — lowest weight
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const result of validResults) {
    const weight = weights[result.provider] || 1;
    weightedSum += result.confidence * weight;
    totalWeight += weight;
  }

  const weightedConfidence = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Determine consensus
  const verdictCounts: Record<string, number> = {};
  for (const result of validResults) {
    verdictCounts[result.verdict] = (verdictCounts[result.verdict] || 0) + 1;
  }

  // Overall verdict from weighted confidence
  const overallVerdict: DetectionVerdict =
    weightedConfidence >= DETECTION_THRESHOLDS.AI_GENERATED ? 'ai_generated' :
    weightedConfidence >= DETECTION_THRESHOLDS.AI_MODIFIED ? 'ai_modified' :
    weightedConfidence >= DETECTION_THRESHOLDS.UNCERTAIN ? 'uncertain' :
    'likely_human';

  // Consensus = how many providers agree with the overall verdict
  const consensusCount = validResults.filter((r) => r.verdict === overallVerdict).length;

  // Pick generative model from the most confident provider that identified one
  const modelResult = validResults
    .filter((r) => r.generativeModel)
    .sort((a, b) => b.confidence - a.confidence)[0];

  return {
    overallVerdict,
    overallConfidence: weightedConfidence,
    providerResults: results,
    consensusCount,
    generativeModel: modelResult?.generativeModel,
  };
}
