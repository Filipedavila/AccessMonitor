import { useState, type ChangeEvent, type FormEvent, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { evaluationQueryKey } from '../../../hooks/useFetchData';
import { useTheme } from '../../../context/ThemeContext';

import { TextArea, Button, Icon } from '@a12e/accessmonitor-ds';

import { pathURL } from '../../../App';

export function InsertHtml(): JSX.Element {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [htmlValue, setHtmlValue] = useState<string>('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    try {
      const type = 'html';
      void queryClient.removeQueries({
        queryKey: evaluationQueryKey('html', htmlValue),
      });
      navigate(`${pathURL}results/${type}`, {
        state: { contentHtml: htmlValue },
      });
    } catch (error) {
      console.log('Erro', error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextArea
        darkTheme={theme}
        id="html"
        label={t('HOME_PAGE.html_label')}
        placeholder={t('HOME_PAGE.html_placeholder')}
        value={htmlValue}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setHtmlValue(e.target.value)
        }
      />

      <Button
        darkTheme={theme}
        text={t('HOME_PAGE.submit')}
        size="lg"
        id="btn-html"
        disabled={htmlValue === ''}
        type="submit"
        iconRight={<Icon name="AMA-Setalongaoficial-Line" />}
      />
    </form>
  );
}
