import type {
  ScanRequest, AggregatedDetection, ComplianceReport,
  ComplianceStatus, RuleCheck,
} from '../../shared/types.js';
import { COMPLIANCE_RULES, EXEMPTIONS, getRulesForContentType } from '../../shared/rules.js';
import { getGrade } from '../../shared/constants.js';

class ComplianceEngine {
  evaluate(request: ScanRequest, detection: AggregatedDetection): ComplianceReport {
    const applicableRules = getRulesForContentType(request.contentType);
    const ruleChecks: RuleCheck[] = [];
    const exemptionsApplied: string[] = [];

    const isAI = detection.overallVerdict === 'ai_generated' || detection.overallVerdict === 'ai_modified';
    const isUncertain = detection.overallVerdict === 'uncertain';

    for (const rule of applicableRules) {
      const check = this.evaluateRule(rule, request, detection, isAI, isUncertain);
      ruleChecks.push(check);

      if (check.status === 'exempt') {
        const exemptionIds = rule.exemptions.filter((eId) =>
          this.checkExemption(eId, request)
        );
        exemptionsApplied.push(...exemptionIds);
      }
    }

    // Calculate score
    const score = this.calculateScore(ruleChecks);
    const grade = getGrade(score);
    const overallStatus = this.determineOverallStatus(ruleChecks, score);
    const summary = this.generateSummary(ruleChecks, detection, request, overallStatus);

    return {
      overallStatus,
      score,
      grade,
      ruleChecks,
      exemptionsApplied: [...new Set(exemptionsApplied)],
      summary,
      generatedAt: new Date().toISOString(),
    };
  }

  private evaluateRule(
    rule: typeof COMPLIANCE_RULES[0],
    request: ScanRequest,
    detection: AggregatedDetection,
    isAI: boolean,
    isUncertain: boolean,
  ): RuleCheck {
    // If content is likely human-made and not uncertain, most rules are N/A
    if (!isAI && !isUncertain && rule.checkType !== 'platform') {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        section: rule.section,
        description: rule.description,
        status: 'not_applicable',
        finding: 'Content detected as likely human-created. This rule applies only to AI-generated/modified content.',
        severity: rule.severity,
      };
    }

    // Check exemptions first
    if (isAI && rule.exemptions.length > 0) {
      const applicableExemptions = rule.exemptions.filter((eId) =>
        this.checkExemption(eId, request)
      );
      if (applicableExemptions.length > 0) {
        const exemption = EXEMPTIONS.find((e) => e.id === applicableExemptions[0]);
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          section: rule.section,
          description: rule.description,
          status: 'exempt',
          finding: `Exempt under ${exemption?.section}: ${exemption?.name}. ${exemption?.description}`,
          severity: rule.severity,
        };
      }
    }

    // Evaluate based on check type
    switch (rule.checkType) {
      case 'label':
        return this.checkLabel(rule, request, detection, isAI, isUncertain);
      case 'metadata':
        return this.checkMetadata(rule, request, detection, isAI, isUncertain);
      case 'disclosure':
        return this.checkDisclosure(rule, request, detection, isAI, isUncertain);
      case 'platform':
        return this.checkPlatform(rule, request, detection);
      default:
        return this.makeCheck(rule, 'needs_review', 'Unable to evaluate this rule automatically.');
    }
  }

  private checkLabel(
    rule: typeof COMPLIANCE_RULES[0],
    request: ScanRequest,
    detection: AggregatedDetection,
    isAI: boolean,
    isUncertain: boolean,
  ): RuleCheck {
    const labels = request.labels || [];
    const hasAiLabel = labels.some((l) => {
      const lower = l.toLowerCase();
      return lower.includes('ai') || lower.includes('generated') ||
        lower.includes('synthetic') || lower.includes('artificial');
    });

    if (isAI) {
      if (hasAiLabel) {
        return this.makeCheck(rule, 'compliant',
          'Content is AI-generated/modified and carries an AI content label.',
        );
      }
      return this.makeCheck(rule, 'non_compliant',
        `Content detected as ${detection.overallVerdict} (${detection.overallConfidence}% confidence) but NO AI label found.`,
        `Add a visible label: "This content was ${detection.overallVerdict === 'ai_generated' ? 'generated' : 'modified'} using AI${detection.generativeModel ? ` (${detection.generativeModel})` : ''}."`,
      );
    }

    if (isUncertain) {
      return this.makeCheck(rule, 'needs_review',
        `Detection is uncertain (${detection.overallConfidence}% confidence). Manual review recommended to determine if AI labeling is required.`,
        'Consider adding a precautionary AI disclosure label or running additional detection.',
      );
    }

    return this.makeCheck(rule, 'not_applicable', 'Content appears to be human-created.');
  }

  private checkMetadata(
    rule: typeof COMPLIANCE_RULES[0],
    request: ScanRequest,
    detection: AggregatedDetection,
    isAI: boolean,
    isUncertain: boolean,
  ): RuleCheck {
    if (!isAI && !isUncertain) {
      return this.makeCheck(rule, 'not_applicable', 'Content appears human-created; metadata rule not applicable.');
    }

    // Check if C2PA provider found metadata
    const c2paResult = detection.providerResults.find((r) => r.provider === 'c2pa');
    const hasC2PA = c2paResult && !c2paResult.error && (c2paResult.metadata as any)?.hasC2PA;

    if (rule.id === 'META-001') {
      if (hasC2PA) {
        return this.makeCheck(rule, 'compliant',
          'C2PA Content Credentials metadata detected. AI provenance information is embedded.',
        );
      }
      if (isAI) {
        return this.makeCheck(rule, 'non_compliant',
          'Content detected as AI-generated but no machine-readable provenance metadata (C2PA/IPTC) found.',
          'Embed C2PA Content Credentials or IPTC DigitalSourceType metadata indicating AI origin.',
        );
      }
      return this.makeCheck(rule, 'needs_review',
        'Unable to confirm AI provenance metadata. Manual verification recommended.',
      );
    }

    if (rule.id === 'META-002') {
      // Platform metadata preservation — can only check if original metadata exists
      if (hasC2PA) {
        return this.makeCheck(rule, 'compliant', 'Metadata appears intact (C2PA manifest present).');
      }
      return this.makeCheck(rule, 'needs_review',
        'Cannot verify metadata preservation without original file comparison.',
        'Ensure your platform pipeline preserves C2PA and IPTC metadata during upload and processing.',
      );
    }

    if (rule.id === 'META-003') {
      if (hasC2PA && detection.generativeModel) {
        return this.makeCheck(rule, 'compliant',
          `Provenance trail present. AI tool identified: ${detection.generativeModel}.`,
        );
      }
      if (isAI) {
        return this.makeCheck(rule, 'non_compliant',
          'AI content lacks a verifiable provenance trail from creation to publication.',
          'Implement C2PA Content Credentials to establish a provenance chain.',
        );
      }
      return this.makeCheck(rule, 'needs_review', 'Provenance trail could not be verified.');
    }

    return this.makeCheck(rule, 'needs_review', 'Rule evaluation inconclusive.');
  }

  private checkDisclosure(
    rule: typeof COMPLIANCE_RULES[0],
    request: ScanRequest,
    detection: AggregatedDetection,
    isAI: boolean,
    isUncertain: boolean,
  ): RuleCheck {
    if (!isAI && !isUncertain) {
      return this.makeCheck(rule, 'not_applicable', 'Content appears human-created.');
    }

    const labels = request.labels || [];
    const hasDisclosure = labels.some((l) => {
      const lower = l.toLowerCase();
      return lower.includes('disclosure') || lower.includes('generated by') ||
        lower.includes('created with') || lower.includes('made with') ||
        lower.includes('ai-generated') || lower.includes('synthetic');
    });

    if (rule.id === 'LABEL-003') {
      // Synthetic media depicting real people — we can't detect "real person" here,
      // so flag for review if AI content
      if (isAI) {
        return this.makeCheck(rule, 'needs_review',
          'Content detected as AI-generated. If it depicts a real person, a mandatory deepfake disclosure is required.',
          'If this content depicts a real person, add: "This is computer-generated content and does not represent reality."',
        );
      }
    }

    if (rule.id === 'PUB-001' || rule.id === 'PUB-002') {
      if (!request.publisherName) {
        return this.makeCheck(rule, 'not_applicable',
          'No publisher information provided. This rule applies to news/current affairs publishers.',
        );
      }
      if (isAI) {
        if (hasDisclosure) {
          return this.makeCheck(rule, 'compliant',
            `Publisher "${request.publisherName}" has declared AI usage.${detection.generativeModel ? ` Tool: ${detection.generativeModel}` : ''}`,
          );
        }
        return this.makeCheck(rule, 'non_compliant',
          `Publisher "${request.publisherName}" — AI content detected but no self-declaration of AI usage found.`,
          `Add disclosure: "This content was created/modified using AI tools${detection.generativeModel ? ` (${detection.generativeModel})` : ''}."`,
        );
      }
    }

    if (isAI && !hasDisclosure) {
      return this.makeCheck(rule, 'non_compliant',
        'AI-generated content lacks required disclosure.',
        'Add an appropriate AI usage disclosure.',
      );
    }

    if (isAI && hasDisclosure) {
      return this.makeCheck(rule, 'compliant', 'AI disclosure present.');
    }

    return this.makeCheck(rule, 'needs_review', 'Detection uncertain; disclosure status cannot be confirmed.');
  }

  private checkPlatform(
    rule: typeof COMPLIANCE_RULES[0],
    request: ScanRequest,
    _detection: AggregatedDetection,
  ): RuleCheck {
    if (!request.platformName) {
      return this.makeCheck(rule, 'not_applicable',
        'No platform specified. Platform obligation rules apply to social media intermediaries.',
      );
    }

    // Platform rules are informational — we note the obligation
    switch (rule.id) {
      case 'PLAT-001':
        return this.makeCheck(rule, 'needs_review',
          `Platform "${request.platformName}" is obligated to deploy AI content detection. This scan contributes to that obligation.`,
          'Deploy automated AI detection across all user-uploaded content.',
        );
      case 'PLAT-002':
        return this.makeCheck(rule, 'needs_review',
          `Platform "${request.platformName}" must provide user-facing AI content flagging.`,
          'Implement a "Report AI Content" option in content action menus.',
        );
      case 'PLAT-003':
        return this.makeCheck(rule, 'needs_review',
          `Platform "${request.platformName}" must publish periodic AI compliance reports.`,
          'Publish quarterly reports on AI content detected, labeled, and actions taken.',
        );
      case 'PLAT-004':
        return this.makeCheck(rule, 'needs_review',
          `Platform "${request.platformName}" must extend grievance mechanisms for AI content complaints.`,
          'Add AI content mislabeling as a complaint category in your grievance system.',
        );
      default:
        return this.makeCheck(rule, 'needs_review', 'Platform obligation noted.');
    }
  }

  private checkExemption(exemptionId: string, request: ScanRequest): boolean {
    const labels = request.labels || [];
    const lowerLabels = labels.map((l) => l.toLowerCase());

    switch (exemptionId) {
      case 'EXEMPT-001': // Minor technical adjustments
        return lowerLabels.some((l) =>
          l.includes('color correct') || l.includes('crop') || l.includes('resize') ||
          l.includes('noise reduction') || l.includes('brightness') || l.includes('contrast') ||
          l.includes('compression') || l.includes('format convert')
        );
      case 'EXEMPT-002': // Accessibility
        return lowerLabels.some((l) =>
          l.includes('accessibility') || l.includes('caption') || l.includes('audio description') ||
          l.includes('sign language') || l.includes('text-to-speech') || l.includes('alt text')
        );
      case 'EXEMPT-003': // Translation
        return lowerLabels.some((l) =>
          l.includes('translat') || l.includes('subtitle') || l.includes('interpretation')
        );
      case 'EXEMPT-004': // Standard editorial
        return lowerLabels.some((l) =>
          l.includes('grammar') || l.includes('spell') || l.includes('formatting') ||
          l.includes('autocomplete') || l.includes('predictive')
        );
      default:
        return false;
    }
  }

  private makeCheck(
    rule: typeof COMPLIANCE_RULES[0],
    status: ComplianceStatus,
    finding: string,
    recommendation?: string,
  ): RuleCheck {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      section: rule.section,
      description: rule.description,
      status,
      finding,
      recommendation,
      severity: rule.severity,
    };
  }

  private calculateScore(checks: RuleCheck[]): number {
    const applicable = checks.filter((c) => c.status !== 'not_applicable' && c.status !== 'exempt');
    if (applicable.length === 0) return 100;

    const severityWeights = { critical: 4, major: 2, minor: 1, info: 0.5 };
    let totalWeight = 0;
    let earnedWeight = 0;

    for (const check of applicable) {
      const weight = severityWeights[check.severity];
      totalWeight += weight;

      switch (check.status) {
        case 'compliant':
          earnedWeight += weight;
          break;
        case 'needs_review':
          earnedWeight += weight * 0.5;
          break;
        case 'non_compliant':
          earnedWeight += 0;
          break;
      }
    }

    return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
  }

  private determineOverallStatus(checks: RuleCheck[], score: number): ComplianceStatus {
    const hasCriticalFail = checks.some(
      (c) => c.status === 'non_compliant' && c.severity === 'critical'
    );
    if (hasCriticalFail) return 'non_compliant';
    if (score >= 80) return 'compliant';
    if (score >= 50) return 'needs_review';
    return 'non_compliant';
  }

  private generateSummary(
    checks: RuleCheck[],
    detection: AggregatedDetection,
    request: ScanRequest,
    status: ComplianceStatus,
  ): string {
    const compliant = checks.filter((c) => c.status === 'compliant').length;
    const nonCompliant = checks.filter((c) => c.status === 'non_compliant').length;
    const review = checks.filter((c) => c.status === 'needs_review').length;
    const exempt = checks.filter((c) => c.status === 'exempt').length;
    const na = checks.filter((c) => c.status === 'not_applicable').length;

    let summary = `Scanned ${request.contentType} content. Detection: ${detection.overallVerdict} (${detection.overallConfidence}% confidence).`;

    if (detection.generativeModel) {
      summary += ` Likely AI tool: ${detection.generativeModel}.`;
    }

    summary += ` Compliance: ${compliant} passed, ${nonCompliant} failed, ${review} need review, ${exempt} exempt, ${na} not applicable.`;

    if (status === 'non_compliant') {
      const criticals = checks.filter((c) => c.status === 'non_compliant' && c.severity === 'critical');
      if (criticals.length > 0) {
        summary += ` CRITICAL: ${criticals.map((c) => c.ruleName).join(', ')}.`;
      }
    }

    return summary;
  }
}

export const complianceEngine = new ComplianceEngine();
