import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  MessageBoxDialog,
  type MessageBoxRequest,
} from '../components/Layout/MessageBoxDialog';
import {
  defaultIcon,
  nextMessageId,
  registerMessageBox,
  registerMessageBoxTitles,
  unregisterMessageBox,
} from '../lib/messageBox';
import type { MessageBoxIcon, MessageBoxKind } from '../components/Layout/MessageBoxDialog';
import { useLocale } from '../i18n/LocaleContext';

export function MessageBoxProvider({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const [queue, setQueue] = useState<MessageBoxRequest[]>([]);
  const current = queue[0] ?? null;

  const open = useCallback(
    (opts: {
      kind: MessageBoxKind;
      message: string;
      title?: string;
      icon?: MessageBoxIcon;
      defaultValue?: string;
    }) => {
      return new Promise<boolean | string | null>((resolve) => {
        const fallback =
          opts.kind === 'confirm'
            ? t('common.confirm')
            : opts.kind === 'prompt'
              ? t('common.prompt')
              : t('common.alert');
        const req: MessageBoxRequest = {
          id: nextMessageId(),
          kind: opts.kind,
          title: opts.title ?? fallback,
          message: opts.message,
          icon: opts.icon ?? defaultIcon(opts.kind),
          defaultValue: opts.defaultValue,
          resolve: (value) => {
            resolve(value);
            setQueue((q) => q.filter((item) => item.id !== req.id));
          },
        };
        setQueue((q) => [...q, req]);
      });
    },
    [t]
  );

  useEffect(() => {
    registerMessageBoxTitles((kind) =>
      kind === 'confirm' ? t('common.confirm') : kind === 'prompt' ? t('common.prompt') : t('common.alert')
    );
    registerMessageBox(open);
    return () => unregisterMessageBox(open);
  }, [open, t]);

  return (
    <>
      {children}
      <MessageBoxDialog
        request={
          current
            ? {
                ...current,
                resolve: (value) => {
                  current.resolve(value);
                },
              }
            : null
        }
      />
    </>
  );
}
