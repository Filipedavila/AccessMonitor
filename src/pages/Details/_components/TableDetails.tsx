import './styles.css';
import { useTranslation } from 'react-i18next';
import type { JSX } from 'react';
import type { AssertionEvidenceItem } from '../../../types';
import { getTagNameFromHtml } from '../../../services';

const isAbsoluteUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith('//');
  }
};

const extractDomain = (url: string | undefined): string => {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url.split('/').slice(0, 3).join('/');
    }
    return `https://${url}`;
  }
};

const processImageSources = (
  htmlString: string | undefined,
  domainUrl: string | undefined,
): string | undefined => {
  if (!htmlString) return htmlString;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  const imgTags = tempDiv.querySelectorAll('img');

  imgTags.forEach((img) => {
    const src = img.getAttribute('src');

    if (!src || !src.trim() || isAbsoluteUrl(src)) {
      return;
    }

    const currentOrigin = extractDomain(domainUrl);

    const newSrc = src.startsWith('/')
      ? currentOrigin + src
      : currentOrigin + '/' + src.replace(/^\.\//, '');

    img.setAttribute('src', newSrc);
  });

  return tempDiv.innerHTML;
};

const renderHTML = (
  htmlString: string | undefined,
  domainUrl: string | undefined,
): { __html: string } => {
  const processedHtml = processImageSources(htmlString, domainUrl);
  return { __html: processedHtml ?? '' };
};

interface TableDetailsProps {
  evidence: AssertionEvidenceItem[];
  domainUrl: string | undefined;
}

export function TableDetails({
  evidence,
  domainUrl,
}: TableDetailsProps): JSX.Element {
  const { t } = useTranslation();

  const rows = evidence.flatMap((item) =>
    item.elements.map((el) => ({
      ele: getTagNameFromHtml(el.htmlCode),
      code: el.htmlCode,
      showCode: el.htmlCode,
      pointer: el.pointer,
      description: item.description,
      attributes: item.attributes,
    })),
  );

  return (
    <table className="table1 table">
      <caption className="visually-hidden">
        {t('ELEMENT_RESULTS.result.caption')}
      </caption>
      <thead>
        <tr>
          <th scope="col" className="th_size">
            {t('ELEMENT_RESULTS.result.ocurrenceNumber')}
          </th>
          <th scope="col">{t('ELEMENT_RESULTS.result.ocurrenceDetail')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item, index) => (
          <tr key={index}>
            <td className="ama-typography-display-4 align-middle text-center">
              {index + 1}
            </td>
            <td>
              <dl className="text-start">
                <dt className="mb-2">{t('ELEMENT_RESULTS.result.element')}</dt>
                <dd className="mb-4">{item.ele}</dd>
                <dt className="mb-2">{t('ELEMENT_RESULTS.result.code')}</dt>
                <dd className="mb-4">
                  <code>{item.code}</code>
                </dd>
                <dt>{t('ELEMENT_RESULTS.result.content')}</dt>
                <dd className="mb-4">
                  <div
                    className="big-width"
                    dangerouslySetInnerHTML={renderHTML(
                      item.showCode,
                      domainUrl,
                    )}
                  />
                </dd>
                <dt className="mb-2">{t('ELEMENT_RESULTS.result.location')}</dt>
                <dd>{item.pointer}</dd>
              </dl>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
