import { ShowcaseBoard } from '@/components/premade/showcase-board';
import { Screen } from '@/components/screen';

export default function ComponentsScreen() {
  return (
    <Screen bottomInset={140}>
      <ShowcaseBoard />
    </Screen>
  );
}
