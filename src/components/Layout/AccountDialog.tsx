import { useEffect, useState, type FormEvent } from 'react';
import type { AuthApi } from '../../hooks/useAuth';
import { AuthDialogChrome, authChromeBtn, authInputStyle } from './AuthDialogChrome';
import { classicAlert } from '../../lib/messageBox';
import { translateThrown, useLocale } from '../../i18n/LocaleContext';

interface AccountDialogProps {
  open: boolean;
  auth: AuthApi;
  onClose: () => void;
}

export function AccountDialog({ open, auth, onClose }: AccountDialogProps) {
  const { t } = useLocale();
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setNickname(auth.profile?.nickname ?? '');
    setError('');
  }, [open, auth.profile?.nickname]);

  if (!open) return null;

  if (!auth.profile) {
    return (
      <AuthDialogChrome title={t('auth.account')} onClose={onClose}>
        <p style={{ fontSize: '13px' }}>{t('auth.needLogin')}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" style={authChromeBtn} onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </AuthDialogChrome>
    );
  }

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      await auth.updateNickname(nickname);
      void classicAlert(t('auth.nicknameSaved'));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? translateThrown(err.message, t) : t('auth.saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthDialogChrome title={t('auth.account')} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px' }}>
          <div>
            <b>{t('auth.username')}:</b> {auth.profile.username}
          </div>
          <div style={{ marginTop: '4px' }}>
            <b>{t('auth.email')}:</b> {auth.profile.email}
          </div>
          {auth.isOwner && (
            <div style={{ marginTop: '4px', color: '#000080', fontWeight: 'bold' }}>
              {t('auth.admin')}
            </div>
          )}
        </div>

        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {t('auth.nickname')}
          <input
            style={{ ...authInputStyle, marginTop: '4px' }}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>

        <p style={{ fontSize: '11px', color: '#404040', margin: 0 }}>{t('auth.accountHint')}</p>

        {error && (
          <div style={{ color: '#a00', fontSize: '12px', fontWeight: 'bold' }}>{error}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="submit" disabled={busy} style={authChromeBtn}>
            {t('common.save')}
          </button>
          <button type="button" disabled={busy} style={authChromeBtn} onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </form>
    </AuthDialogChrome>
  );
}
