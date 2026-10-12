import { useEffect, useState, type FormEvent } from 'react';
import type { AuthApi } from '../../hooks/useAuth';
import { AuthDialogChrome, authChromeBtn, authInputStyle } from './AuthDialogChrome';
import { classicAlert } from '../../lib/messageBox';
import { translateThrown, useLocale } from '../../i18n/LocaleContext';

interface SignupDialogProps {
  open: boolean;
  auth: AuthApi;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function SignupDialog({ open, auth, onClose, onSwitchToLogin }: SignupDialogProps) {
  const { t } = useLocale();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  useEffect(() => {
    if (!open) return;
    setUsername('');
    setPassword('');
    setPasswordConfirm('');
    setEmail('');
    setNickname('');
    setError('');
    setHint('');
  }, [open]);

  if (!open) return null;

  const blurUsername = async () => {
    if (!username.trim()) return;
    try {
      const taken = await auth.checkUsernameTaken(username);
      setHint(taken ? t('auth.usernameTaken') : t('auth.usernameOk'));
    } catch {
      /* ignore */
    }
  };

  const blurNickname = async () => {
    if (!nickname.trim()) return;
    try {
      const taken = await auth.checkNicknameTaken(nickname);
      setHint(taken ? t('auth.nicknameTaken') : t('auth.nicknameOk'));
    } catch {
      /* ignore */
    }
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      await auth.signUp({ username, password, passwordConfirm, email, nickname });
      void classicAlert(t('auth.signupDone'));
      onSwitchToLogin();
    } catch (err) {
      setError(
        err instanceof Error ? translateThrown(err.message, t) : t('auth.signupFailed')
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthDialogChrome title={t('auth.signup')} onClose={onClose} width={380}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {t('auth.username')}
          <input
            style={{ ...authInputStyle, marginTop: '4px' }}
            value={username}
            autoComplete="username"
            placeholder={t('auth.usernamePlaceholder')}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={blurUsername}
          />
        </label>
        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {t('auth.password')}
          <input
            type="password"
            style={{ ...authInputStyle, marginTop: '4px' }}
            value={password}
            autoComplete="new-password"
            placeholder={t('auth.passwordPlaceholder')}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {t('auth.passwordConfirm')}
          <input
            type="password"
            style={{ ...authInputStyle, marginTop: '4px' }}
            value={passwordConfirm}
            autoComplete="new-password"
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </label>
        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {t('auth.emailForReset')}
          <input
            type="email"
            style={{ ...authInputStyle, marginTop: '4px' }}
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {t('auth.nickname')}
          <input
            style={{ ...authInputStyle, marginTop: '4px' }}
            value={nickname}
            placeholder={t('auth.nicknamePlaceholder')}
            onChange={(e) => setNickname(e.target.value)}
            onBlur={blurNickname}
          />
        </label>

        {hint && <div style={{ fontSize: '12px', color: '#000080' }}>{hint}</div>}
        {error && (
          <div style={{ color: '#a00', fontSize: '12px', fontWeight: 'bold' }}>{error}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
          <button type="submit" disabled={busy} style={authChromeBtn}>
            {busy ? t('common.loading') : t('auth.signupSubmit')}
          </button>
          <button type="button" disabled={busy} style={authChromeBtn} onClick={onClose}>
            {t('common.cancel')}
          </button>
        </div>

        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#0000ee',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
            fontSize: '12px',
            alignSelf: 'flex-start',
          }}
        >
          {t('auth.haveAccount')}
        </button>
      </form>
    </AuthDialogChrome>
  );
}
