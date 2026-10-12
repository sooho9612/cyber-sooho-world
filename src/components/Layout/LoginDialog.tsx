import { useEffect, useState, type FormEvent } from 'react';
import type { AuthApi } from '../../hooks/useAuth';
import { classicAlert } from '../../lib/messageBox';
import { translateThrown, useLocale } from '../../i18n/LocaleContext';
import { AuthDialogChrome, authChromeBtn, authInputStyle } from './AuthDialogChrome';

interface LoginDialogProps {
  open: boolean;
  auth: AuthApi;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export function LoginDialog({
  open,
  auth,
  onClose,
  onSwitchToSignup,
  onForgotPassword,
}: LoginDialogProps) {
  const { t } = useLocale();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saveUsername, setSaveUsername] = useState(true);
  const [autoLogin, setAutoLogin] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setUsername(auth.savedUsername);
    setPassword('');
    setSaveUsername(auth.saveUsernamePref || Boolean(auth.savedUsername));
    setAutoLogin(auth.autoLoginPref);
    setError('');
  }, [open, auth.savedUsername, auth.saveUsernamePref, auth.autoLoginPref]);

  if (!open) return null;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { profile } = await auth.signIn({ username, password, saveUsername, autoLogin });
      onClose();
      const name = profile?.nickname?.trim() || username.trim();
      void classicAlert(t('auth.welcome', { name }));
    } catch (err) {
      setError(
        err instanceof Error ? translateThrown(err.message, t) : t('auth.loginFailed')
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthDialogChrome title={t('auth.login')} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {t('auth.username')}
          <input
            style={{ ...authInputStyle, marginTop: '4px' }}
            value={username}
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {t('auth.password')}
          <input
            type="password"
            style={{ ...authInputStyle, marginTop: '4px' }}
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <input
            type="checkbox"
            checked={saveUsername}
            onChange={(e) => setSaveUsername(e.target.checked)}
          />
          {t('auth.saveUsername')}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <input
            type="checkbox"
            checked={autoLogin}
            onChange={(e) => setAutoLogin(e.target.checked)}
          />
          {t('auth.autoLogin')}
        </label>

        {error && (
          <div style={{ color: '#a00', fontSize: '12px', fontWeight: 'bold' }}>{error}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
          <button type="submit" disabled={busy} style={authChromeBtn}>
            {busy ? t('common.loading') : t('common.ok')}
          </button>
          <button type="button" disabled={busy} style={authChromeBtn} onClick={onClose}>
            {t('common.cancel')}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '8px',
            marginTop: '4px',
            fontSize: '12px',
          }}
        >
          <button
            type="button"
            onClick={onSwitchToSignup}
            style={{
              background: 'none',
              border: 'none',
              color: '#0000ee',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
              fontSize: '12px',
            }}
          >
            {t('auth.switchToSignup')}
          </button>
          <button
            type="button"
            onClick={onForgotPassword}
            style={{
              background: 'none',
              border: 'none',
              color: '#0000ee',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
              fontSize: '12px',
            }}
          >
            {t('auth.forgotLink')}
          </button>
        </div>
      </form>
    </AuthDialogChrome>
  );
}
