import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import {
  readAutoLogin,
  readSaveUsername,
  readSavedUsername,
  writeAutoLogin,
  writeSaveUsername,
  writeSavedUsername,
} from '../lib/authStorage';
import {
  isValidEmail,
  isValidNickname,
  isValidSignupPassword,
  isValidUsername,
  normalizeNickname,
  normalizeUsername,
} from '../lib/authValidators';

export type UserRole = 'owner' | 'member';

export type Profile = {
  id: string;
  username: string;
  nickname: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
};

type SignUpInput = {
  username: string;
  password: string;
  passwordConfirm: string;
  email: string;
  nickname: string;
};

type SignInInput = {
  username: string;
  password: string;
  saveUsername: boolean;
  autoLogin: boolean;
};

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, nickname, email, role, avatar_url')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('fetchProfile', error);
    return null;
  }
  return data as Profile | null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedUsername, setSavedUsername] = useState(() => readSavedUsername());
  const [saveUsernamePref, setSaveUsernamePref] = useState(() => readSaveUsername());
  const [autoLoginPref, setAutoLoginPref] = useState(() => readAutoLogin());

  const hydrate = useCallback(async (next: Session | null): Promise<Profile | null> => {
    setSession(next);
    setUser(next?.user ?? null);
    if (next?.user) {
      const p = await fetchProfile(next.user.id);
      setProfile(p);
      return p;
    }
    setProfile(null);
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      await hydrate(data.session);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      void hydrate(next);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [hydrate]);

  const checkUsernameTaken = useCallback(async (username: string) => {
    const { data, error } = await supabase.rpc('is_username_taken', {
      p_username: normalizeUsername(username),
    });
    if (error) throw error;
    return Boolean(data);
  }, []);

  const checkNicknameTaken = useCallback(async (nickname: string) => {
    const { data, error } = await supabase.rpc('is_nickname_taken', {
      p_nickname: normalizeNickname(nickname),
    });
    if (error) throw error;
    return Boolean(data);
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const username = normalizeUsername(input.username);
    const nickname = normalizeNickname(input.nickname);
    const email = input.email.trim().toLowerCase();

    if (!isValidUsername(username)) {
      throw new Error('auth.err.usernameFormat');
    }
    if (!isValidNickname(nickname)) {
      throw new Error('auth.err.nicknameFormat');
    }
    if (!isValidEmail(email)) {
      throw new Error('auth.err.emailFormat');
    }
    if (!isValidSignupPassword(input.password)) {
      throw new Error('auth.err.passwordShort');
    }
    if (input.password !== input.passwordConfirm) {
      throw new Error('auth.err.passwordMismatch');
    }
    if (await checkUsernameTaken(username)) {
      throw new Error('auth.err.usernameTaken');
    }
    if (await checkNicknameTaken(nickname)) {
      throw new Error('auth.err.nicknameTaken');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        // role is never trusted from client — DB trigger always inserts 'member'
        data: { username, nickname },
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error('auth.err.signupFailed');

    // Ensure profile role stays member (trigger may insert)
    await supabase
      .from('profiles')
      .update({ nickname, username, email })
      .eq('id', data.user.id);

    return data;
  }, [checkNicknameTaken, checkUsernameTaken]);

  const signIn = useCallback(async (input: SignInInput) => {
    const username = normalizeUsername(input.username);
    if (!username || !input.password) {
      throw new Error('auth.err.needUserPass');
    }

    writeAutoLogin(input.autoLogin);
    writeSaveUsername(input.saveUsername);
    setAutoLoginPref(input.autoLogin);
    setSaveUsernamePref(input.saveUsername);
    if (input.saveUsername) {
      writeSavedUsername(username);
      setSavedUsername(username);
    } else {
      writeSavedUsername('');
      setSavedUsername('');
    }

    const { data: email, error: resolveErr } = await supabase.rpc('resolve_login_email', {
      p_username: username,
    });
    if (resolveErr) throw resolveErr;
    if (!email || typeof email !== 'string') {
      throw new Error('auth.err.badCredentials');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });
    if (error) {
      throw new Error('auth.err.badCredentials');
    }
    const profile = await hydrate(data.session);
    return { session: data.session, profile };
  }, [hydrate]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const updateNickname = useCallback(
    async (nextNicknameRaw: string) => {
      if (!user) throw new Error('auth.err.needLogin');
      const nickname = normalizeNickname(nextNicknameRaw);
      if (!isValidNickname(nickname)) {
        throw new Error('auth.err.nicknameFormat');
      }
      const taken = await checkNicknameTaken(nickname);
      if (
        taken &&
        (!profile || profile.nickname.toLowerCase() !== nickname.toLowerCase())
      ) {
        throw new Error('auth.err.nicknameTaken');
      }
      const { error } = await supabase
        .from('profiles')
        .update({ nickname, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      const p = await fetchProfile(user.id);
      setProfile(p);
    },
    [checkNicknameTaken, profile, user]
  );

  const resetPassword = useCallback(async (emailRaw: string) => {
    const email = emailRaw.trim().toLowerCase();
    if (!isValidEmail(email)) throw new Error('auth.err.emailFormat');
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }, []);

  const isOwner = profile?.role === 'owner';
  const isLoggedIn = Boolean(session && profile);

  return useMemo(
    () => ({
      loading,
      session,
      user,
      profile,
      isLoggedIn,
      isOwner,
      savedUsername,
      saveUsernamePref,
      autoLoginPref,
      signUp,
      signIn,
      signOut,
      updateNickname,
      resetPassword,
      checkUsernameTaken,
      checkNicknameTaken,
    }),
    [
      loading,
      session,
      user,
      profile,
      isLoggedIn,
      isOwner,
      savedUsername,
      saveUsernamePref,
      autoLoginPref,
      signUp,
      signIn,
      signOut,
      updateNickname,
      resetPassword,
      checkUsernameTaken,
      checkNicknameTaken,
    ]
  );
}

export type AuthApi = ReturnType<typeof useAuth>;
