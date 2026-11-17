import { ButtonsActions } from './_components/buttons-revalidation';
import './styles.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb, LoadingComponent } from '@a12e/accessmonitor-ds';

import { useTranslation } from 'react-i18next';
import type { JSX } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useFetchData } from '../../hooks/useFetchData';

import { downloadCSV } from '../../utils/utils';

import { pathURL } from '../../App';

interface PageCodeLocationState {
  contentHtml?: string | null;
  file?: File | null;
}

export default function PageCode(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { theme } = useTheme();
  const themeClass = theme === 'light' ? '' : 'dark_mode-code';

  const state = location.state as PageCodeLocationState | null;
  const contentHtml = state?.contentHtml ?? '';
  const file = state?.file ?? null;

  const segments = location.pathname.split('/').filter(Boolean);
  const urlSegment = segments[segments.length - 2] ?? '';
  const isHtml = urlSegment === 'html';
  const decodedUrl = isHtml ? '' : decodeURIComponent(urlSegment);

  // Mesma chave que o Resume: o resultado vem da cache; só reavalia (via
  // SSE) se a página for aberta diretamente.
  const {
    dataProcess,
    loadingProgress,
    pageCode,
    error: fetchError,
  } = useFetchData(isHtml ? 'html' : urlSegment, contentHtml, decodedUrl, file);

  const error = fetchError
    ? t(`MISC.errors.${fetchError}`, {
        defaultValue: t('MISC.unexpected_error'),
      })
    : false;

  const handleGoBack = (): void => {
    if (isHtml) {
      navigate(`${pathURL}results/html`, {
        state: { contentHtml: pageCode, file },
      });
    } else {
      navigate(`${pathURL}results/${urlSegment}`);
    }
  };

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
            downloadCSV={() => downloadCSV(dataProcess, t)}
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
