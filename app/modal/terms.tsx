import { MarkdownView } from '@/components/markdown-view';
import { Screen } from '@/components/screen';
import { termsOfServiceMarkdown } from '@/content/terms-of-service';

export default function TermsScreen() {
  return (
    <Screen edges={['bottom', 'left', 'right']}>
      <MarkdownView markdown={termsOfServiceMarkdown} />
    </Screen>
  );
}
