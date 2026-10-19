export interface ElementDetails {
  readonly htmlCode: string;
  readonly pointer: string;
  readonly accessibleName?: string;
}

export interface AssertionEvidenceItem {
  readonly verdict: 'passed' | 'failed' | 'warning';
  readonly description: string;
  readonly resultCode: string;
  readonly elements: readonly ElementDetails[];
  readonly attributes: readonly string[];
}

export interface AssertionEvidence {
  readonly [ruleKey: string]: readonly AssertionEvidenceItem[];
}

export interface EvaluationReportMetadata {
  readonly title: string;
  readonly url: string;
  readonly evaluatedAt: string;
}

export interface EvaluationReportSnapshot {
  readonly html: string;
  readonly sizeInBytes: number;
  readonly hash: string;
}

export interface EvaluationReportTelemetry {
  readonly elementCounters: Record<string, number>;
  readonly roles: Record<string, number>;
  readonly tagCounter: Record<string, number>;
  readonly totalHtmlTags: number;
}

export interface EvaluationReportScoring {
  readonly conform: string;
  readonly totalTests: number;
  readonly score: string;
  readonly rulesOccurrences: Record<string, number>;
  readonly assertionEvidence: AssertionEvidence;
  readonly conformanceResults: Record<string, string>;
}

export interface EvaluationReport {
  readonly metadata: EvaluationReportMetadata;
  readonly snapshot: EvaluationReportSnapshot;
  readonly telemetry: EvaluationReportTelemetry;
  readonly scoring: EvaluationReportScoring;
}

export interface EvaluationData {
  readonly title: string;
  readonly score: string;
  readonly A: number;
  readonly AA: number;
  readonly AAA: number;
  readonly createdAt: string;
  readonly tagCount: number;
}

export interface EvaluationResponse {
  readonly evaluationReport: EvaluationReport;
  readonly evaluationData: EvaluationData;
}

export type Level = 'A' | 'AA' | 'AAA';
export type TestColor = 'ok' | 'err' | 'war';

export interface SuccessCriterion {
  readonly sc: string;
  readonly lvl: string;
  readonly link: string;
}

export interface TestViewItem {
  txt: string;
  tot: number | string;
  ele?: string;
  html_validator?: boolean;
}

export interface TestResult {
  readonly ico: string;
  readonly color: TestColor;
  readonly lvl: Level;
  readonly msg: string;
  readonly ref: string;
  readonly ref_website: string;
  readonly relation: string;
  readonly ref_related_sc: SuccessCriterion[];
  readonly value: number | string;
  readonly prio: number;
  readonly tech_list: TestViewItem;
}

export interface ProcessedDataFull {
  readonly metadata: {
    readonly url: string;
    readonly title: string;
    readonly n_elements: number;
    readonly score: number | string;
    readonly size: string;
    readonly last_update: string;
    readonly count_results: number;
    readonly validator: boolean;
  };
  readonly results: TestResult[];
  readonly infoak: Record<Level, Record<TestColor, number>>;
}
