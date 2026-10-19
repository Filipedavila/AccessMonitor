/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Icon } from '@a12e/accessmonitor-ds';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState, type JSX } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import './styles.css';

import { pathURL } from '../../../App';

interface ButtonsActionsProps {
  reRequest: () => void;
  seeCode: () => void;
  downloadCSV: () => void;
  href: string | undefined;
  themeClass: string;
}

export function ButtonsActions({
  reRequest,
  seeCode,
  downloadCSV,
  href,
  themeClass,
}: ButtonsActionsProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [seePage, setSeePage] = useState<boolean>(false);

  const openPageLinks = (): void => {
    setSeePage(!seePage);
  };

  const goToNewEvaluation = (): void => {
    queryClient.clear();
    navigate(`${pathURL}`);
  };

  return (
    <>
      <div
        className={`d-flex flex-row justify-content-between deskGroup ${themeClass}`}
      >
        <Button
          size="md"
          text={t('HEADER.evaluate_new_page')}
          iconRight={<Icon name="AMA-Setalongaoficial-Line" />}
          onClick={goToNewEvaluation}
        />

        <div className="d-flex flex-row gap-3 other">
          <Button
            size="md"
            variant="secondary"
            text={t('RESULTS.actions.re_evaluate')}
            iconRight={<Icon name="AMA-Reload-Line" />}
            onClick={() => reRequest()}
          />

          <div>
            <Button
              id="dropdownMenuButton"
              size="md"
              variant="secondary"
              text={t('RESULTS.actions.see_page')}
              iconRight={
                <Icon
                  name={seePage ? 'AMA-SetaCima3-Line' : 'AMA-SetaBaixo3-Line'}
                />
              }
              onClick={openPageLinks}
              aria-expanded={seePage}
            />
            {seePage && (
              <u
                className="dropdown-content show_dropdown"
                aria-labelledby="dropdownMenuButton"
              >
                <li>
                  <button onClick={() => seeCode()}>
                    <span>{t('RESULTS.actions.pagecode')}</span>
                    <Icon name="AMA-Code-Line" />
                  </button>
                </li>
                <li>
                  <a href={href} rel="noreferrer">
                    <span className="open-webpage-text">
                      {t('RESULTS.actions.open_webpage')}
                    </span>
                    <Icon name="AMA-Externo-Line" />
                  </a>
                </li>
              </u>
            )}
          </div>

          <div>
            <Button
              size="md"
              variant="secondary"
              text={t('RESULTS.actions.download')}
              iconRight={<Icon name="AMA-DownloadSetacurta-Line" />}
              onClick={downloadCSV}
              download="eval.csv"
            />
          </div>
        </div>
      </div>

      <div className={`group_mobile ${themeClass}`}>
        <div className="firstGroupContainer">
          <Button
            size="md"
            text={t('HEADER.evaluate_new_page')}
            iconRight={<Icon name="AMA-Setalongaoficial-Line" />}
            onClick={goToNewEvaluation}
          />

          <div>
            <Button
              id="dropdownMenuButton"
              size="md"
              variant="secondary"
              text={t('RESULTS.actions.see_page')}
              iconRight={
                <Icon
                  name={seePage ? 'AMA-SetaCima3-Line' : 'AMA-SetaBaixo3-Line'}
                />
              }
              onClick={openPageLinks}
              aria-expanded={seePage}
            />
            {seePage && (
              <u
                className="dropdown-content show_dropdown"
                aria-labelledby="dropdownMenuButton"
              >
                <li>
                  <button onClick={() => seeCode()}>
                    <span>{t('RESULTS.actions.pagecode')}</span>
                    <Icon name="AMA-Code-Line" />
                  </button>
                </li>
                <li>
                  <a href={href} rel="noreferrer">
                    <span>{t('RESULTS.actions.open_webpage')}</span>
                    <Icon name="AMA-Externo-Line" />
                  </a>
                </li>
              </u>
            )}
          </div>
        </div>

        <div className="secondGroupContainer">
          <Button
            size="md"
            variant="secondary"
            text={t('RESULTS.actions.re_evaluate')}
            iconRight={<Icon name="AMA-Reload-Line" />}
            onClick={() => reRequest()}
          />

          <div>
            <Button
              size="md"
              variant="secondary"
              text={t('RESULTS.actions.download')}
              iconRight={<Icon name="AMA-DownloadSetacurta-Line" />}
              onClick={downloadCSV}
              download="eval.csv"
            />
          </div>
        </div>
      </div>
    </>
  );
}
