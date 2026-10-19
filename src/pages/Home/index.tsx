import { InsertHtmlUpload } from './_components/insert-upload-html';
import { InsertUrl } from './_components/insert-url';
import { InsertHtml } from './_components/insert-html';
import './styles.css';

import { type JSX } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Breadcrumb, Tabs } from '@a12e/accessmonitor-ds';

import { useTranslation } from 'react-i18next';

import { pathURL } from '../../App';

export default function Home(): JSX.Element {
  const { t } = useTranslation();

  const tabs = [
    {
      eventKey: 'tab1',
      title: t('HEADER.dialog.insert_url'),
      component: <InsertUrl />,
    },
    {
      eventKey: 'tab2',
      title: t('HEADER.dialog.insert_html'),
      component: <InsertHtml />,
    },
    {
      eventKey: 'tab3',
      title: t('HEADER.dialog.upload_html'),
      component: <InsertHtmlUpload />,
    },
  ];

  const breadcrumbs = [{ title: 'AccessMonitor' }];

  const { theme } = useTheme();
  const main_content_home = theme === 'light' ? '' : 'main_content_home';
  const imgUrl =
    theme === 'light'
      ? `${pathURL}img/verify.svg`
      : `${pathURL}img/verify-dark.svg`;

  return (
    <>
      <div className="container">
        <div className="link_breadcrumb_container">
          <Breadcrumb
            data={breadcrumbs}
            darkTheme={theme}
            tagHere={t('HEADER.DROPDOWN.youarehere')}
          />
        </div>

        <section className="bg-white px-5 py-2 mb-1 text-end">
          <p className="p-0 m-0">
            <span
              aria-label="consulte também"
              role="img"
              style={{ marginRight: '0.2em' }}
            >
              🔗
            </span>
            <a href="https://chromewebstore.google.com/detail/accessmonitor-extension/knjdoonhhnjfmigigfgoehhihodndaii?hl=pt-PT&utm_source=ext_sidebar">
              Extensão para Chrome
            </a>{' '}
            |{' '}
            <a href="https://amagovpt.github.io/accessmonitor-rulesets/">
              Testes AccessMonitor
            </a>
            .
          </p>
        </section>

        <section
          className={`bg-white validator_container ${main_content_home}`}
        >
          <div className="d-flex flex-column align-items-stretch left_container">
            <div className="d-flex flex-column mb-4">
              <p className="validator_container_description">
                {t('HOME_PAGE.intro_text')}
              </p>

              <p className="validator_container_description">
                {t('HOME_PAGE.intro_text_content')}
              </p>
            </div>

            <Tabs tabs={tabs} defaultActiveKey="tab1" vertical={false} />
          </div>

          <div className="d-flex flex-row align-items-start right_container">
            <img src={imgUrl} className="verify_img" alt="" />
          </div>
        </section>
      </div>
    </>
  );
}
