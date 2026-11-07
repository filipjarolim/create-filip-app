import { MarkdownView } from '@/components/markdown-view';
import { Screen } from '@/components/screen';
import { privacyPolicyMarkdown } from '@/content/privacy-policy';

export default function PrivacyScreen() {
  return (
    <Screen edges={['bottom', 'left', 'right']}>
      <MarkdownView markdown={privacyPolicyMarkdown} />
    </Screen>
  );
}
