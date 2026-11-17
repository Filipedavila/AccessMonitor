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
import {
  evaluationQueryKey,
  fileQueryTarget,
} from '../../../hooks/useFetchData';
import { MAX_FILE_BYTES } from '../../../config/api';

import { Button, Icon } from '@a12e/accessmonitor-ds';

import { pathURL } from '../../../App';

export function InsertHtmlUpload(): JSX.Element {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Validação no cliente (o servidor valida de novo): .html e <= 10 MB.
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      setError(null);
    } else if (!/\.html?$/i.test(selected.name)) {
      setFile(null);
      setError(t('HOME_PAGE.file_type_error'));
    } else if (selected.size === 0 || selected.size > MAX_FILE_BYTES) {
      setFile(null);
      setError(t('HOME_PAGE.file_size_error'));
    } else {
      setFile(selected);
      setError(null);
    }
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!file) return;
    void queryClient.removeQueries({
      queryKey: evaluationQueryKey('html', fileQueryTarget(file)),
    });
    navigate(`${pathURL}results/html`, { state: { file } });
  }

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
            accept=".html,.htm,text/html"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'escrever_ficheiro_erro' : undefined}
            onChange={handleChange}
          />
        </div>
        {error && (
          <p id="escrever_ficheiro_erro" role="alert">
            {error}
          </p>
        )}
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
