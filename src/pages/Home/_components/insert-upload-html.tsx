import { useTranslation } from 'react-i18next';
import {
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
  type JSX,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useTheme } from '../../../context/ThemeContext';
import { evaluationQueryKey } from '../../../hooks/useFetchData';

import { Button, Icon } from '@a12e/accessmonitor-ds';

import { pathURL } from '../../../App';

export function InsertHtmlUpload(): JSX.Element {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<string | null>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selected = event.target.files?.[0];

    if (selected && selected.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = async () => {
        const html = reader.result as string;
        setFile(getDOM(html));
      };
      reader.readAsText(selected);
    } else {
      setFile(null);
    }
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    try {
      const type = 'html';
      if (file) {
        void queryClient.removeQueries({
          queryKey: evaluationQueryKey('html', file),
        });
      }
      navigate(`${pathURL}results/${type}`, {
        state: { contentHtml: file },
      });
    } catch (error) {
      console.log('Erro', error);
    }
  }

  const getDOM = (content: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    return doc.documentElement.outerHTML;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label
          htmlFor={'escrever_ficheiro'}
          className="margin-bottom upload_label"
        >
          {t('HOME_PAGE.file_title')}
        </label>
        <div className="input-group mb-3 d-flex justify-content-start align-items-start">
          <button className="btn" type="button" onClick={handleButtonClick}>
            {t('HOME_PAGE.file_label')}
          </button>
          <input
            id={'escrever_ficheiro'}
            ref={fileInputRef}
            type="file"
            className="form-control"
            aria-label="Upload"
            onChange={handleChange}
          />
        </div>
      </div>

      <Button
        darkTheme={theme}
        text={t('HOME_PAGE.submit')}
        size="lg"
        id="btn-upload"
        disabled={!file}
        iconRight={<Icon name="AMA-Setalongaoficial-Line" />}
        type="submit"
      />
    </form>
  );
}
