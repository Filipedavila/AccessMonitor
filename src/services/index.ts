/* eslint-disable no-array-constructor */

import {
  ruleset,
  testColors,
  successCriteria,
} from '@a12e/accessmonitor-rulesets';
import { refWebsite, testView } from '../pages/Resume/utils';

import { convertBytes } from '../utils/utils';
import type {
  ElementData,
  EvaluationReport,
  Level,
  Node,
  NodeElement,
  NodeWithElements,
  ProcessedDataFull,
  SuccessCriterion,
  TestColor,
  TestResult,
  TestResultCode,
  TestResultsData,
} from '../types/report';

interface RulesetEntry {
  test: string;
  level: string;
  ref: string;
  elem: string;
  scs: string[];
}

interface SuccessCriterionEntry {
  level: string;
  name: string;
}

const typedRuleset = ruleset as unknown as Record<string, RulesetEntry>;
const typedTestColors = testColors as unknown as Record<string, TestResultCode>;
const typedSuccessCriteria = successCriteria as unknown as Record<
  string,
  SuccessCriterionEntry
>;

export function processData(
  report: EvaluationReport | null | undefined,
  url: string,
): ProcessedDataFull | null {
  if (report === null || report === undefined) {
    return null;
  }

  const metadata = report.metadata ?? {};
  const snapshot = report.snapshot ?? {};
  const telemetry = report.telemetry ?? {};
  const scoring = report.scoring ?? {};

  const elems = (telemetry.elementCounters ?? {}) as Record<string, unknown>;
  const results = (scoring.rulesOccurrences ?? {}) as Record<string, unknown>;

  const datax: ProcessedDataFull = {
    metadata: {
      url: String(metadata.url ?? url ?? ''),
      title: String(metadata.title ?? ''),
      n_elements: telemetry.totalHtmlTags ?? 0,
      score: (scoring.score as number | string) ?? 0,
      size: convertBytes(Number(snapshot.sizeInBytes ?? 0)),
      last_update: String(metadata.evaluatedAt ?? ''),
      count_results: Object.keys(results).length,
      validator: false,
    },
    results: [],
    infoak: {
      A: { ok: 0, err: 0, war: 0 },
      AA: { ok: 0, err: 0, war: 0 },
      AAA: { ok: 0, err: 0, war: 0 },
    },
  };

  for (const test in typedRuleset) {
    if (!test) continue;
    if (!results[test]) continue;

    const entry = typedRuleset[test];
    let tes = entry.test;
    const lev = entry.level;
    const ref = entry.ref;
    const ele = entry.elem;

    let color: TestColor;
    const colorCode = typedTestColors[test];
    if (colorCode === 'R') {
      color = 'err';
    } else if (colorCode === 'Y') {
      color = 'war';
    } else {
      color = 'ok';
    }

    const level = lev.toUpperCase() as Level;
    datax.infoak[level][color]++;

    let tnum: number | string;

    if (elems[tes] !== undefined) {
      if (tes === 'titleOk') {
        tnum = String(metadata.title ?? '');
      } else if (tes === 'lang') {
        tnum = 'pt';
      } else if (tes === 'langNo') {
        tnum = 'lang';
      } else if (tes === 'titleLong') {
        tnum = String(metadata.title ?? '').length;
      } else {
        tnum = elems[tes] as number | string;
      }
    } else if (tes === 'imgAltNo') {
      tnum = elems['img'] as number | string;
      tes = 'img';
    } else if (tes === 'inputLabelNo') {
      tnum = elems['label'] as number | string;
    } else {
      tnum = elems[ele] as number | string;
    }

    const result: TestResult = {
      ico: 'assets/images/ico' + color + '.png',
      color,
      lvl: level,
      msg: test,
      ref,
      ref_website: refWebsite(ref),
      relation: /^[A-Za-z]\d+$|^[A-Z]{4}\d+$/.test(ref)
        ? 'relationT'
        : 'relationACT',
      ref_related_sc: [],
      value: tnum,
      prio: color === 'ok' ? 3 : color === 'err' ? 1 : 2,
      tech_list: testView(tes, tes, tes, color, tnum, url),
    };

    const scstmp = entry.scs;
    for (let s of scstmp) {
      s = s.trim();
      if (s !== '') {
        const scEntry = typedSuccessCriteria[s];
        if (scEntry) {
          const li: SuccessCriterion = {
            sc: s,
            lvl: scEntry.level,
            link:
              'https://www.w3.org/WAI/WCAG21/Understanding/' +
              scEntry.name +
              '.html',
          };
          result.ref_related_sc.push(li);
        }
      }
    }

    datax.results.push(result);
  }

  return datax;
}

export function getTestResults(
  test: string,
  report: EvaluationReport,
): TestResultsData {
  return getElements(report, test);
}

export function getElements(
  report: EvaluationReport,
  ele: string,
): TestResultsData {
  const dataTransform = processData(report, '');

  if (ele === 'form') {
    ele = 'formSubmitNo';
  }

  const evidence = report.scoring?.assertionEvidence?.[ele] ?? [];
  const elements: ElementData[] = evidence.flatMap((item) =>
    item.elements.map((el) => ({
      ele: getTagNameFromHtml(el.htmlCode),
      code: el.htmlCode,
      showCode: el.htmlCode,
      pointer: el.pointer,
    })),
  );

  let result: TestResultCode = 'G';
  const results = dataTransform?.results.map((r) => r.msg) ?? [];
  for (const test in typedRuleset) {
    const _test = typedRuleset[test];
    if (_test.test === ele && results.includes(test)) {
      result = typedTestColors[test];
      break;
    }
  }

  return {
    type: 'html',
    result,
    elements,
    size: elements.length,
    finalUrl: dataTransform?.metadata.url,
  };
}

export function getTagNameFromHtml(htmlCode: string): string {
  let name = htmlCode.slice(1);

  let k = 0;
  for (let i = 0; i < name.length; i++, k++) {
    if (name[i] === ' ' || name[i] === '>') {
      break;
    }
  }

  name = name.substring(0, k);

  return name;
}
export function getTagName(element: Node | NodeElement): string {
  return getTagNameFromHtml(element.htmlCode ?? '');
}

export function fixCode(
  code: string,
  _report?: EvaluationReport,
  showCode?: boolean,
): string {
  code = code.replace(/_cssrules="true"/g, '');
  code = code.replace(/_documentselector="undefined"/g, '');

  let index = code.indexOf('_selector="');
  while (index !== -1) {
    let foundEnd = false;
    let foundStart = false;
    let k = index;
    while (!foundEnd) {
      k++;
      if (code[k] === '"') {
        if (!foundStart) {
          foundStart = true;
        } else {
          foundEnd = true;
        }
      }
    }

    code = code.replace(code.substring(index, k), '');
    index = code.indexOf('_selector="');
  }
  return showCode ? (removeImgStyles(code) ?? code) : code;
}

function isNodeWithElements(node: Node): node is NodeWithElements {
  return (node as NodeWithElements).elements !== undefined;
}

export function getElementsList(
  nodes: Node[] | undefined,
  report?: EvaluationReport,
): ElementData[] {
  const elements: ElementData[] = [];

  for (const node of nodes ?? []) {
    if (isNodeWithElements(node)) {
      const first = node.elements[0];

      if (!first) continue;

      const ele = getTagName(first);

      elements.push({
        ele,
        code:
          ele === 'style'
            ? (first.attributes ?? '')
            : fixCode(first.htmlCode, report),
        showCode:
          ele === 'style' ? undefined : fixCode(first.htmlCode, report, true),
        pointer: first.pointer,
      });
    } else {
      const ele = getTagName(node);

      elements.push({
        ele,
        code:
          ele === 'style'
            ? (node.attributes ?? '')
            : fixCode(node.htmlCode ?? '', report),
        showCode:
          ele === 'style'
            ? undefined
            : fixCode(node.htmlCode ?? '', report, true),
        pointer: node.pointer,
      });
    }
  }

  return elements;
}

function removeImgStyles(code: string | null | undefined): string | undefined {
  if (code == null || typeof code !== 'string') return code ?? undefined;
  const htmlString = code.replace(/<img[^>]*>/g, function (imgTag) {
    imgTag = imgTag.replace(/style="[^"]*"/g, '');
    imgTag = imgTag.replace(/width="[^"]*"/g, '');
    imgTag = imgTag.replace(/height="[^"]*"/g, '');
    imgTag = imgTag.replace(/\s+/g, ' ').trim();
    return imgTag;
  });
  return htmlString;
}
