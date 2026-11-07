import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

type CredentialsFormProps = {
  mode: 'login' | 'register';
  onSubmit: (email: string, password: string) => Promise<void>;
  requireEula?: boolean;
};

export function CredentialsForm({ mode, onSubmit, requireEula = false }: CredentialsFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isRegister = mode === 'register';

  const submit = async () => {
    const trimmed = email.trim();
    if (!trimmed.includes('@')) {
      setError(t('auth.emailInvalid'));
      return;
    }
    if (password.length < 8) {
      setError(t('auth.passwordShort'));
      return;
    }
    if (requireEula && !accepted) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(trimmed, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('auth.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-4">
      <Text variant="title">{isRegister ? t('auth.createTitle') : t('auth.welcome')}</Text>
      <Text variant="muted">{isRegister ? t('auth.registerHint') : t('auth.signInHint')}</Text>
      <Input
        accessibilityLabel={t('auth.email')}
        autoComplete="email"
        keyboardType="email-address"
        placeholder={t('auth.email')}
        textContentType="username"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        accessibilityLabel={t('auth.password')}
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        placeholder={t('auth.password')}
        secureTextEntry
        textContentType={isRegister ? 'newPassword' : 'password'}
        value={password}
        onChangeText={setPassword}
      />
      {requireEula ? (
        <Pressable
          accessibilityRole="checkbox"
          aria-checked={accepted}
          accessibilityState={{ checked: accepted }}
          className="min-h-12 flex-row items-center gap-3"
          onPress={() => setAccepted((value) => !value)}
        >
          <View className={`h-6 w-6 rounded-md border ${accepted ? 'bg-indigo-600 border-indigo-600' : 'border-slate-400'}`} />
          <Text className="flex-1 text-sm">{t('auth.eula')}</Text>
        </Pressable>
      ) : null}
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
      <Button
        label={isRegister ? t('auth.createAccount') : t('auth.signIn')}
        loading={loading}
        disabled={requireEula && !accepted}
        onPress={() => void submit()}
      />
      <Link href={isRegister ? '/(auth)/login' : '/(auth)/register'} asChild>
        <Text accessibilityRole="link" className="text-center text-sm font-medium text-indigo-600 dark:text-indigo-300">
          {isRegister ? t('auth.haveAccount') : t('auth.needAccount')}
        </Text>
      </Link>
      <View className="flex-row justify-center gap-4">
        <Link href="/modal/privacy" asChild>
          <Text accessibilityRole="link" className="text-sm text-slate-500">
            {t('auth.privacy')}
          </Text>
        </Link>
        <Link href="/modal/terms" asChild>
          <Text accessibilityRole="link" className="text-sm text-slate-500">
            {t('auth.terms')}
          </Text>
        </Link>
      </View>
    </View>
  );
}
