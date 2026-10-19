import { useEffect, useState, type JSX } from 'react';
import { TableDetails } from './_components/TableDetails';
import './styles.css';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Breadcrumb, Icon, LoadingComponent } from '@a12e/accessmonitor-ds';

import { ruleset } from '@a12e/accessmonitor-rulesets';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { useFetchData } from '../../hooks/useFetchData';

import { pathURL } from '../../App';
import type { AssertionEvidenceItem, EvaluationData } from '../../types';

interface DetailsProps {
  setAllData: (data: EvaluationData) => void;
}

interface RulesetEntry {
  test: string;
  ref: string;
}

const typedRuleset = ruleset as unknown as Record<string, RulesetEntry>;

export default function Details({ setAllData }: DetailsProps): JSX.Element {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { details } = useParams<{ details: string }>();
  const { theme } = useTheme();

  const [error] = useState<string | false>(false);

  const contentHtml: string | null =
    (location.state as { contentHtml?: string } | null)?.contentHtml ?? null;

  const themeClass = theme === 'light' ? '' : 'dark_mode-details';

  const segments = location.pathname.split('/').filter(Boolean);
  const urlSegment = segments[segments.length - 2] ?? '';
  const isHtml = urlSegment === 'html';
  const decodedUrl = isHtml ? '' : decodeURIComponent(urlSegment);

  const { dataProcess, loadingProgress, originalData } = useFetchData(
    isHtml ? 'html' : urlSegment,
    contentHtml ?? '',
    decodedUrl,
  );
  const url = dataProcess?.metadata?.url;

  const handleGoBack = (): void => {
    if (isHtml) {
      navigate(`${pathURL}results/html`, {
        state: { contentHtml },
      });
    } else {
      navigate(`${pathURL}results/${urlSegment}`);
    }
  };

  let resultKey: string | null = null;
  let testName: string | null = null;
  for (const key in typedRuleset) {
    if (!typedRuleset[key]) continue;
    if (typedRuleset[key].test === details) {
      resultKey = key;
      testName = typedRuleset[key].test;
      break;
    }
  }
  if (!resultKey) {
    for (const key in typedRuleset) {
      if (!typedRuleset[key]) continue;
      if (typedRuleset[key].ref === details) {
        resultKey = key;
        testName = typedRuleset[key].test;
        break;
      }
    }
  }

  const [evidence, setEvidence] = useState<AssertionEvidenceItem[]>([]);

  const occurrences = evidence.reduce(
    (acc, item) => acc + item.elements.length,
    0,
  );

  const testResultType = occurrences === 1 ? 's' : 'p';
  const testResult = resultKey
    ? t(`TESTS_RESULTS.${resultKey}.${testResultType}`)
    : '';

  const dataBreadCrumb = [
    { title: 'Access Monitor', href: `${pathURL}` },
    { title: url || 'html', href: '' },
    {
      title: testResult
        .replace('{{value}}', String(occurrences))
        .replace(/<[^>]*>/g, ''),
      href: '#',
    },
  ];

  useEffect(() => {
    if (!originalData?.evaluationData) return;
    const data = originalData.evaluationData;
    setAllData(data);
    const dataReport = originalData.evaluationReport.scoring.assertionEvidence;

    if (!dataReport) {
      setEvidence([]);
      return;
    }

    const testKey = testName ?? details;
    if (!testKey) {
      setEvidence([]);
      return;
    }
    const items: AssertionEvidenceItem[] = [
      ...(originalData.evaluationReport?.scoring?.assertionEvidence?.[
        testKey
      ] ?? []),
    ];
    setEvidence(items);
  }, [originalData, details, testName, setAllData]);

  const verdict = evidence[0]?.verdict;

  let iconName: string;
  if (verdict === 'failed') {
    iconName = 'AMA-Wrong-Line';
  } else if (verdict === 'warning') {
    iconName = 'AMA-Middle-Line';
  } else {
    iconName = 'AMA-Check-Line';
  }

  let tdClassName: string;
  if (verdict === 'failed') {
    tdClassName = 'error-cell';
  } else if (verdict === 'warning') {
    tdClassName = 'warning-cell';
  } else {
    tdClassName = 'success-cell';
  }

  return (
    <>
      <div className={`container ${themeClass}`}>
        <div className="link_breadcrumb_container">
          <Breadcrumb
            data={dataBreadCrumb}
            onClick={handleGoBack}
            darkTheme={theme}
            tagHere={t('HEADER.DROPDOWN.youarehere')}
          />
        </div>

        <div className="report_container">
          <h1 className="report_container_title mb-5">
            {t('ELEMENT_RESULTS.subtitle')}
          </h1>
        </div>

        {loadingProgress ? (
          <section className={`loading_container bg-white`}>
            <LoadingComponent
              loadingText={t('MISC.loading')}
              darkTheme={theme}
            />
          </section>
        ) : !error ? (
          <>
            <div className="bg-white show_details">
              <div className="d-flex flex-row justify-content-between align-items-center show_details-container">
                <div className="d-flex flex-row align-items-center">
                  <div
                    className={`d-flex align-items-center justify-content-center m-2 p-3 ${tdClassName}`}
                  >
                    <Icon name={iconName} />
                  </div>

                  <span
                    className="textHeader ama-typography-body-large bold"
                    dangerouslySetInnerHTML={{
                      __html: testResult.replace(
                        '{{value}}',
                        String(occurrences),
                      ),
                    }}
                  />
                </div>

                <div className="result_left_container">
                  <span className="ama-typography-display-6 bold p-2 ps-4">
                    {occurrences}
                  </span>
                  <span className="ama-typography-body p-2">
                    {t('ELEMENT_RESULTS.total_elements')}
                  </span>
                </div>
              </div>
            </div>

            <div className="tabContent_container-details">
              <TableDetails evidence={evidence} domainUrl={url} />
            </div>
          </>
        ) : (
          <h3>{error}</h3>
        )}
      </div>
    </>
  );
}
