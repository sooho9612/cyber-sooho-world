import type { MessageBoxIcon, MessageBoxKind } from '../components/Layout/MessageBoxDialog';

type OpenFn = (opts: {
  kind: MessageBoxKind;
  message: string;
  title?: string;
  icon?: MessageBoxIcon;
  defaultValue?: string;
}) => Promise<boolean | string | null>;

type TitleResolver = (kind: MessageBoxKind) => string;

let openImpl: OpenFn | null = null;
let titleResolver: TitleResolver | null = null;
let seq = 0;

export function registerMessageBox(open: OpenFn): void {
  openImpl = open;
}

export function unregisterMessageBox(open: OpenFn): void {
  if (openImpl === open) openImpl = null;
}

export function registerMessageBoxTitles(resolve: TitleResolver): void {
  titleResolver = resolve;
}

function defaultIcon(kind: MessageBoxKind): MessageBoxIcon {
  if (kind === 'confirm' || kind === 'prompt') return 'question';
  return 'info';
}

function defaultTitle(kind: MessageBoxKind): string {
  if (titleResolver) return titleResolver(kind);
  if (kind === 'confirm') return '확인';
  if (kind === 'prompt') return '입력';
  return '알림';
}

/** Win Classic alert — replaces window.alert */
export async function classicAlert(
  message: string,
  title?: string,
  icon: MessageBoxIcon = 'info'
): Promise<void> {
  if (!openImpl) {
    window.alert(message);
    return;
  }
  await openImpl({ kind: 'alert', message, title: title ?? defaultTitle('alert'), icon });
}

/** Win Classic confirm — replaces window.confirm */
export async function classicConfirm(
  message: string,
  title?: string,
  icon: MessageBoxIcon = 'question'
): Promise<boolean> {
  if (!openImpl) {
    return window.confirm(message);
  }
  const result = await openImpl({
    kind: 'confirm',
    message,
    title: title ?? defaultTitle('confirm'),
    icon,
  });
  return result === true;
}

/** Win Classic prompt — replaces window.prompt */
export async function classicPrompt(
  message: string,
  defaultValue = '',
  title?: string,
  icon: MessageBoxIcon = 'question'
): Promise<string | null> {
  if (!openImpl) {
    return window.prompt(message, defaultValue);
  }
  const result = await openImpl({
    kind: 'prompt',
    message,
    title: title ?? defaultTitle('prompt'),
    defaultValue,
    icon,
  });
  return typeof result === 'string' ? result : null;
}

export function nextMessageId(): number {
  seq += 1;
  return seq;
}

export type { MessageBoxIcon };
export { defaultIcon };
