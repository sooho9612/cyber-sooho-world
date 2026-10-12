import { useEffect, useState, type FormEvent } from 'react';
import type { AuthApi } from '../../hooks/useAuth';
import { AuthDialogChrome, authChromeBtn, authInputStyle } from './AuthDialogChrome';
import { classicAlert } from '../../lib/messageBox';
import { translateThrown, useLocale } from '../../i18n/LocaleContext';

interface ForgotPasswordDialogProps {
  open: boolean;
  auth: AuthApi;
  onClose: () => void;
}

export function ForgotPasswordDialog({ open, auth, onClose }: ForgotPasswordDialogProps) {
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setEmail('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      await auth.resetPassword(email);
      void classicAlert(t('auth.resetSent'));
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? translateThrown(err.message, t) : t('auth.requestFailed')
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthDialogChrome title={t('auth.forgot')} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '12px', margin: 0 }}>{t('auth.forgotHint')}</p>
        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {t('auth.email')}
          <input
            type="email"
            style={{ ...authInputStyle, marginTop: '4px' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {error && (
          <div style={{ color: '#a00', fontSize: '12px', fontWeight: 'bold' }}>{error}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="submit" disabled={busy} style={authChromeBtn}>
            {t('common.send')}
          </button>
          <button type="button" disabled={busy} style={authChromeBtn} onClick={onClose}>
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </AuthDialogChrome>
  );
}
