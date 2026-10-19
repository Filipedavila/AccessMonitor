import { ButtonsActions } from './_components/buttons-revalidation';
import './styles.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb, LoadingComponent } from '@a12e/accessmonitor-ds';
import { processData } from '../../services';
import { getEvalData } from '../../config/api';

import { useTranslation } from 'react-i18next';
import { useState, useEffect, type JSX } from 'react';
import { useTheme } from '../../context/ThemeContext';

import { downloadCSV } from '../../utils/utils';

import LZString from 'lz-string';

import { pathURL } from '../../App';
import { EvaluationResponse, ProcessedDataFull } from '@/types';

interface PageCodeLocationState {
  content?: ProcessedDataFull | null;
  original?: EvaluationResponse | null;
  code?: string | null;
}

export default function PageCode(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [error, setError] = useState<string | false>(false);

  const [dataProcess, setDataProcess] = useState<ProcessedDataFull | null>(
    null,
  );
  const [loadingProgress, setLoadingProgress] = useState<boolean>(true);
  const [originalData, setOriginalData] = useState<EvaluationResponse | null>(
    null,
  );
  const [pageCode, setPageCode] = useState<string | undefined>();

  const { theme } = useTheme();
  const themeClass = theme === 'light' ? '' : 'dark_mode-code';

  const state = location.state as PageCodeLocationState | null;
  const dataProcessPrev = state?.content ?? null;
  const originalDataPrev = state?.original ?? null;
  const code = state?.code ?? null;

  const handleGoBack = (): void => {
    if (!dataProcess?.metadata?.url) {
      navigate(`${pathURL}results/html`, {
        state: { contentHtml: pageCode },
      });
    } else {
      const test = location.pathname.split('/');
      navigate(`${pathURL}results/${test[test.length - 2]}`);
    }
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoadingProgress(true);

      try {
        if (dataProcessPrev && originalDataPrev && code) {
          setOriginalData(originalDataPrev);
          setDataProcess(dataProcessPrev);
          setPageCode(code);
          setLoadingProgress(false);
          return;
        }
        const compressedData = localStorage.getItem('evaluation');
        const storedData = compressedData
          ? LZString.decompressFromUTF16(compressedData)
          : null;
        const storedUrl = localStorage.getItem('evaluationUrl');
        const test = location.pathname.split('/');
        const urlSegment = test[test.length - 2];
        const currentUrl = decodeURIComponent(urlSegment);
        if (storedData && storedUrl === currentUrl) {
          const parsedStoredData = JSON.parse(storedData) as EvaluationResponse;
          setOriginalData(parsedStoredData);
          setDataProcess(
            processData(parsedStoredData.evaluationReport, urlSegment),
          );
          setPageCode(
            parsedStoredData.evaluationReport?.snapshot?.html || 'html',
          );
          setLoadingProgress(false);
          return;
        }
        const response = await getEvalData('url', currentUrl);
        if (!response) {
          setError(t('MISC.unexpected_error'));
          setLoadingProgress(false);
        } else {
          if (urlSegment !== 'html') {
            const compressed = LZString.compressToUTF16(
              JSON.stringify(response),
            );
            localStorage.setItem('evaluation', compressed);
            localStorage.setItem('evaluationUrl', currentUrl);
          }

          setOriginalData(response);
          setDataProcess(processData(response.evaluationReport, urlSegment));
          setPageCode(response.evaluationReport?.snapshot?.html || 'html');
          setLoadingProgress(false);
        }
      } catch (err) {
        console.error('Erro', err);
        setLoadingProgress(false);
        setError(t('MISC.unexpected_error'));
      }
    };

    fetchData();
  }, []);

  const dataBreadCrumb = [
    { title: 'AccessMonitor', href: `${pathURL}` },
    {
      title: dataProcess?.metadata?.url || 'html',
      href: '',
    },
    {
      title: t('HEADER.NAV.code'),
    },
  ];

  return (
    <div className={`container ${themeClass} `}>
      <div className="link_breadcrumb_container">
        <Breadcrumb
          data={dataBreadCrumb}
          onClick={handleGoBack}
          darkTheme={theme}
        />
      </div>
      <div className="report_container">
        <div className="acess_monitor" lang="en">
          AccessMonitor
        </div>
        <h1 className="report_container_title py-3">
          {dataProcess?.metadata?.url || 'html'}
        </h1>
        <p className="report_container_subtitle">{t('HEADER.NAV.code')}</p>
        {loadingProgress ? (
          <section className={`loading_container bg-white`}>
            <LoadingComponent
              loadingText={t('MISC.loading')}
              darkTheme={theme}
            />
          </section>
        ) : !error ? (
          <ButtonsActions
            downloadCSV={() =>
              downloadCSV(dataProcess, originalData?.evaluationData ?? null, t)
            }
            handleGoBack={() => handleGoBack()}
            themeClass={themeClass}
          />
        ) : (
          <h3>{error}</h3>
        )}
      </div>
      {!loadingProgress && !error ? (
        <section className="html_code">
          <pre tabIndex={0}>{pageCode || `<></>`}</pre>
        </section>
      ) : null}
    </div>
  );
}
