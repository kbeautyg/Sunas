'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Функция входа пользователя
export async function signIn(
  _prevState: any,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const returnUrl = formData.get('returnUrl') as string | undefined;

  if (!email || !email.includes('@')) {
    return { message: 'Please enter a valid email address' };
  }

  if (!password || password.length < 6) {
    return { message: 'Password must be at least 6 characters' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: error.message || 'Could not authenticate user' };
  }

  // Успешный вход, возвращаем редирект
  return { success: true, redirectTo: returnUrl || '/dashboard' };
}

// Функция регистрации пользователя с автоподтверждением
export async function signUp(
  _prevState: any,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const returnUrl = formData.get('returnUrl') as string | undefined;

  if (!email || !email.includes('@')) {
    return { message: 'Please enter a valid email address' };
  }
  if (!password || password.length < 6) {
    return { message: 'Password must be at least 6 characters' };
  }
  if (password !== confirmPassword) {
    return { message: 'Passwords do not match' };
  }

  const supabase = await createClient();
  // Без options.emailRedirectTo — не отправляем письмо
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { message: error.message || 'Could not create account' };
  }

  // Поскольку в config.toml enable_confirmations=false,
  // сессия сразу доступна
  return { success: true, redirectTo: returnUrl || '/dashboard' };
}

// Функция отправки письма для сброса пароля
export async function forgotPassword(
  _prevState: any,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const origin = formData.get('origin') as string;

  if (!email || !email.includes('@')) {
    return { message: 'Please enter a valid email address' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    return { message: error.message || 'Could not send password reset email' };
  }

  return {
    success: true,
    message: 'Check your email for a password reset link',
  };
}

// Функция сброса пароля
export async function resetPassword(
  _prevState: any,
  formData: FormData
) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 6) {
    return { message: 'Password must be at least 6 characters' };
  }
  if (password !== confirmPassword) {
    return { message: 'Passwords do not match' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { message: error.message || 'Could not update password' };
  }

  return {
    success: true,
    message: 'Password updated successfully',
  };
}

// Функция выхода из системы
export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { message: error.message || 'Could not sign out' };
  }

  // Перенаправление после выхода
  return redirect('/');
}
