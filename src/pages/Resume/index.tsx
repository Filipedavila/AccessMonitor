import { useEffect, useState, type JSX } from 'react';
import {
  Breadcrumb,
  Gauge,
  StatsTable,
  TableComponent,
} from '@a12e/accessmonitor-ds';

import { useFetchData } from '../../hooks/useFetchData';
import { QueueStatus } from './_components/queue-status';
import { ButtonsActions } from './_components/buttons-revalidation';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { downloadCSV } from '../../utils/utils';
import { useTheme } from '../../context/ThemeContext';
import { optionForAccordion, callbackImgT } from './utils';
import './styles.css';

import { pathURL } from '../../App';
import type { AuditReport } from '../../types';

interface ResumeProps {
  setEle: (ele: string) => void;
}

export default function Resume(_props: ResumeProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState<string | false>(false);
  const locationState = location.state as {
    contentHtml?: string;
    file?: File;
  } | null;
  const contentHtml: string | null = locationState?.contentHtml ?? null;
  const file: File | null = locationState?.file ?? null;
  const { content } = useParams<{ content: string }>();

  const { theme } = useTheme();
  const themeClass = theme === 'light' ? '' : 'dark_mode-resume';

  const {
    dataProcess,
    loadingProgress,
    evaluation,
    originalData,
    pageCode,
    error: fetchError,
    invalidate,
    cancel,
  } = useFetchData(content, contentHtml ?? '', content ?? '', file);

  useEffect(() => {
    setError(fetchError ?? false);
  }, [fetchError]);

  const elementCounter = originalData?.telemetry?.totalHtmlTags ?? 0;

  const reRequest = async (): Promise<void> => {
    setError(false);
    await invalidate();
  };

  const cancelEvaluation = async (): Promise<void> => {
    await cancel();
    navigate(`${pathURL}`);
  };

  const seeCode = (): void => {
    const encodedURL = encodeURIComponent(content ?? '');
    navigate(`${pathURL}results/${encodedURL}/code`, {
      state: {
        content: dataProcess,
        original: originalData,
        code: pageCode,
        contentHtml,
        file,
      },
    });
  };

  function setAllDataResult(ele: string, report: AuditReport | null): void {
    if (!report) return;
    const rawUrl = report.metadata?.url ?? '';

    if (content === 'html') {
      if (ele.startsWith('http://') || ele.startsWith('https://')) {
        window.open(ele, '_blank');
      } else {
        navigate(`${pathURL}results/html/${ele}`, {
          state: { contentHtml: pageCode },
        });
      }
    } else {
      if (ele.startsWith('http://') || ele.startsWith('https://')) {
        window.open(ele, '_blank');
      } else {
        const encodedURL = encodeURIComponent(rawUrl);
        navigate(`${pathURL}results/${encodedURL}/${ele}`);
      }
    }
  }

  const dataBreadCrumb = [
    { title: 'AccessMonitor', href: `${pathURL}` },
    {
      title: dataProcess?.metadata?.url || 'html',
      href: dataProcess?.metadata?.url,
    },
  ];

  const scoreData = dataProcess?.metadata?.score;
  let scoreDataFormatted =
    scoreData !== undefined && scoreData !== null ? scoreData.toString() : '0';

  if (scoreDataFormatted === '10.0') {
    scoreDataFormatted = '10';
  }

  return (
    <div className={`container ${themeClass}`}>
      <div className="link_breadcrumb_container">
        <Breadcrumb
          data={dataBreadCrumb}
          darkTheme={theme}
          tagHere={t('HEADER.DROPDOWN.youarehere')}
        />
      </div>

      <div className="report_container">
        <h1 className="report_container_subtitle">{t('RESULTS.title')}</h1>
        {loadingProgress ? (
          <section className={`loading_container bg-white`}>
            <QueueStatus
              evaluation={evaluation}
              theme={theme}
              onCancel={() => void cancelEvaluation()}
            />
          </section>
        ) : !error ? (
          <ButtonsActions
            reRequest={() => void reRequest()}
            seeCode={seeCode}
            downloadCSV={() => downloadCSV(dataProcess, t)}
            href={dataProcess?.metadata?.url}
            themeClass={themeClass}
          />
        ) : (
          <div className="error_container" role="alert">
            <h3>
              {t(`MISC.errors.${error || 'unexpected'}`, {
                defaultValue: t('MISC.unexpected_error'),
              })}
            </h3>
            <button type="button" onClick={() => void reRequest()}>
              {t('RESULTS.actions.re_evaluate')}
            </button>
          </div>
        )}
      </div>
      {!loadingProgress && !error && dataProcess && (
        <>
          <section className="sumary_container bg-white">
            <h2>{t('RESULTS.summary.title')}</h2>
            <div className="d-flex flex-row mt-5 mb-5 justify-content-between container_uri_chart">
              <div className="chart_container">
                <Gauge
                  percentage={scoreDataFormatted}
                  darkTheme={theme}
                  title={[t('RESULTS.summary.score')]}
                  screenReaderTitle={t('RESULTS.summary.gauge.title', {
                    value: scoreDataFormatted,
                  })}
                />
              </div>
              <div className="resume_info_about_uri d-flex flex-column gap-4">
                <div className="d-flex flex-column">
                  <span>URL</span>
                  <span className="break_url">
                    {dataProcess?.metadata?.url}
                  </span>
                </div>

                <div className="d-flex flex-column">
                  <span>{t('RESULTS.summary.metadata.title_label')}</span>
                  <span>{dataProcess?.metadata?.title}</span>
                </div>
              </div>
            </div>
            <div className="d-flex flex-row justify-content-between size_and_table_container">
              <div className="size_container d-flex flex-column gap-4">
                <div className="d-flex flex-column">
                  <span>{elementCounter || ''}</span>
                  <span>{t('RESULTS.summary.metadata.n_elements_label')}</span>
                </div>

                <div className="d-flex flex-column">
                  <span>{dataProcess?.metadata?.size}</span>
                  <span>{t('RESULTS.summary.metadata.page_size_label')}</span>
                </div>
              </div>
              <div className="table_container_sumary">
                <StatsTable
                  data={{ data: dataProcess }}
                  darkTheme={theme}
                  ok={t('RESULTS.summary.table.labels.ok')}
                  warning={t('RESULTS.summary.table.labels.warn')}
                  error={t('RESULTS.summary.table.labels.err')}
                  title={t('RESULTS.summary.table.title')}
                  caption={t('RESULTS.summary.metadata.caption')}
                  type={t('RESULTS.summary.table.typeLabel')}
                />
              </div>
            </div>
          </section>
          <section className="bg-white avaliation_container">
            <h2 className="avaliation_title mb-3">
              {t('RESULTS.results.title')}
            </h2>
            <TableComponent
              data={optionForAccordion(t, dataProcess)}
              onClick={(ele: string) => setAllDataResult(ele, originalData)}
              imageTitlesCallback={(img: string) => callbackImgT(t, img)}
              caption={t('RESULTS.results.caption')}
              headingLevel="h3"
              col1={t('RESULTS.results.practice')}
              col2={t('RESULTS.results.lvl')}
              col3={t('RESULTS.results.details')}
              lvlTitle={t('RESULTS.results.lvl') + ': '}
              ariaLabel={t('RESULTS.results.details')}
              darkTheme={theme}
              ariaLabels={{
                button: t('RESULTS.results.details'),
                A: t('RESULTS.results.ariaLabels.A'),
                AA: t('RESULTS.results.ariaLabels.AA'),
                AAA: t('RESULTS.results.ariaLabels.AAA'),
              }}
            />
          </section>
        </>
      )}
    </div>
  );
}
