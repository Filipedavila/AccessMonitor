import {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type FormEvent,
  type JSX,
} from 'react';
import { validateURL } from '../../../utils/utils';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { evaluationQueryKey } from '../../../hooks/useFetchData';
import './styles.css';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../context/ThemeContext';

import { Button, Icon, Input } from '@a12e/accessmonitor-ds';

import { pathURL } from '../../../App';

export function InsertUrl(): JSX.Element {
  const [url, setURL] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setURL(value);
    setError(validateURL(value) ? null : t('HOME_PAGE.url_error'));
  };

  const handleSubmit = (event?: FormEvent<HTMLFormElement>): void => {
    event?.preventDefault();
    if (error || !validateURL(url)) {
      return;
    }
    void queryClient.removeQueries({
      queryKey: evaluationQueryKey('url', url),
    });
    const encodedURL = encodeURIComponent(url);
    navigate(`${pathURL}results/${encodedURL}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isDisabled()) {
      handleSubmit();
    }
  };

  const isDisabled = (): boolean => {
    return !validateURL(url) || !url;
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        darkTheme={theme}
        id="url"
        label={t('HOME_PAGE.url_label')}
        placeholder="http(s)"
        type="url"
        error={error ?? undefined}
        onChange={handleUrlChange}
        onKeyDown={handleKeyDown}
      />
      <Button
        darkTheme={theme}
        text={t('HOME_PAGE.submit')}
        size="lg"
        id="btn-url"
        disabled={isDisabled()}
        iconRight={<Icon name="AMA-Setalongaoficial-Line" />}
        type="submit"
      />
    </form>
  );
}
