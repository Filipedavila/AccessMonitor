import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '@a12e/accessmonitor-ds';

import { useTheme } from '../../context/ThemeContext';
import { pathURL } from '../../App';
import './styles.css';

export const ErrorPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const themeClass = theme === 'light' ? '' : 'dark_mode-error';

  return (
    <div className={`container_error ${themeClass}`}>
      <h1>{t('MISC._404.title')}</h1>
      <p>{t('MISC._404.description')}</p>
      <Button
        darkTheme={theme}
        text={t('MISC._404.homepage')}
        size="small"
        id="btn-url"
        onClick={() => navigate(`${pathURL}`)}
        iconRight={<Icon name="AMA-Entrar-Line" />}
      />
    </div>
  );
};

export default ErrorPage;
