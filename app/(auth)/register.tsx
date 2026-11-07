import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CredentialsForm } from '@/components/auth/credentials-form';
import { Screen } from '@/components/screen';
import { Text } from '@/components/ui/text';
import { signUpWithPassword } from '@/features/auth/service';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} contentClassName="grow justify-center">
      {notice ? <Text className="mb-4 text-sm text-emerald-700 dark:text-emerald-300">{notice}</Text> : null}
      <CredentialsForm
        mode="register"
        requireEula
        onSubmit={async (email, password) => {
          const session = await signUpWithPassword(email, password);
          if (!session) setNotice(t('auth.checkEmail'));
        }}
      />
    </Screen>
  );
}
