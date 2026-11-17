import { Button, Icon, LoadingComponent } from '@a12e/accessmonitor-ds';
import { useTranslation } from 'react-i18next';
import type { JSX } from 'react';
import type { EvaluationState, Theme } from '../../../types';
import './styles.css';

interface QueueStatusProps {
  evaluation: EvaluationState;
  theme: Theme;
  onCancel: () => void;
}

export function QueueStatus({
  evaluation,
  theme,
  onCancel,
}: QueueStatusProps): JSX.Element {
  const { t } = useTranslation();

  let title = t('MISC.loading');
  let details: string[] = [];

  if (evaluation.phase === 'queued') {
    const { queuePosition, activeSlots, maxSlots } = evaluation.queue;
    const ahead = Math.max(queuePosition - 1, 0);
    title = t('MISC.queue.title');
    details = [
      t('MISC.queue.position', { position: queuePosition }),
      ahead > 0
        ? t('MISC.queue.ahead', { count: ahead })
        : t('MISC.queue.next'),
      t('MISC.queue.slots', { active: activeSlots, max: maxSlots }),
      t('MISC.queue.hint'),
    ];
  } else if (evaluation.phase === 'processing') {
    title = t('MISC.queue.evaluating');
    details = [t('MISC.queue.evaluating_hint')];
  }

  return (
    <div className="queue_status d-flex flex-column align-items-center gap-3">
      <LoadingComponent loadingText={title} darkTheme={theme} />
      {details.length > 0 && (
        <div className="queue_status_details" role="status" aria-live="polite">
          {evaluation.phase === 'queued' && (
            <p className="queue_status_position" aria-hidden="true">
              <strong>#{evaluation.queue.queuePosition}</strong>
            </p>
          )}
          {details.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
      <Button
        darkTheme={theme}
        size="md"
        text={t('MISC.cancel')}
        iconRight={<Icon name="AMA-Wrong-Line" />}
        onClick={onCancel}
      />
    </div>
  );
}
