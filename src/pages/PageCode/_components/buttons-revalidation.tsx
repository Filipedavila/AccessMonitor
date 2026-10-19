/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Icon } from '@a12e/accessmonitor-ds';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { JSX } from 'react';
import './styles.css';

import { pathURL } from '../../../App';

interface ButtonsActionsProps {
  downloadCSV: () => void;
  handleGoBack: () => void;
  themeClass: string;
}

export function ButtonsActions({
  downloadCSV,
  handleGoBack,
  themeClass,
}: ButtonsActionsProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const goToNewEvaluation = (): void => {
    queryClient.clear();
    navigate(`${pathURL}`);
  };

  return (
    <>
      <div className={`d-flex justify-content-between ${themeClass}`}>
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
            text={t('RESULTS.actions.back')}
            iconLeft={<Icon name="AMA-SetacurtaoficialEsq-Line" />}
            onClick={handleGoBack}
          />

          <Button
            size="md"
            id="btn-download-code"
            variant="secondary"
            text={t('RESULTS.actions.download')}
            iconRight={<Icon name="AMA-DownloadSetacurta-Line" />}
            onClick={downloadCSV}
            download="eval.csv"
          />
        </div>
      </div>
    </>
  );
}
