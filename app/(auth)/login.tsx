import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CredentialsForm } from '@/components/auth/credentials-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { isUiPreviewEnabled } from '@/config/env';
import { signInWithPassword } from '@/features/auth/service';
import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { enterPreview } = useAuth();

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} contentClassName="grow justify-center">
      <CredentialsForm mode="login" onSubmit={signInWithPassword} />
      {isUiPreviewEnabled() ? (
        <View className="mt-4">
          <Button label={t('auth.preview')} variant="secondary" onPress={enterPreview} />
        </View>
      ) : null}
      <View className="mt-6">
        <OAuthButtons />
      </View>
    </Screen>
  );
}
