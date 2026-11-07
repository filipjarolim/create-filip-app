import { Layers } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { CurrencyConverter } from '@/components/premade/CurrencyConverter';
import { MapViewer } from '@/components/premade/MapViewer';
import { PhotoCompressor } from '@/components/premade/PhotoCompressor';
import { PublicImagePicker } from '@/components/premade/PublicImagePicker';
import { WeatherWidget } from '@/components/premade/WeatherWidget';
import { SortableList } from '@/components/ui/sortable-list';
import { Text } from '@/components/ui/text';
import { useUiStore } from '@/store/ui-store';

const WIDGETS = {
  map: MapViewer,
  photo: PhotoCompressor,
  weather: WeatherWidget,
  currency: CurrencyConverter,
  media: PublicImagePicker,
} as const;

type WidgetId = keyof typeof WIDGETS;
const TABS = ['all', 'map', 'photo', 'weather', 'currency', 'media'] as const;

export function ShowcaseBoard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('all');
  const order = useUiStore((state) => state.showcaseOrder);
  const setShowcaseOrder = useUiStore((state) => state.setShowcaseOrder);
  const ids = (order.length ? order : Object.keys(WIDGETS)).filter((id): id is WidgetId => id in WIDGETS);
  const visible = activeTab === 'all' ? ids : ids.filter((id) => id === activeTab);

  return (
    <View>
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Layers size={28} className="text-indigo-600 dark:text-indigo-400" />
          <Text variant="title">{t('showcase.title')}</Text>
        </View>
        <Text variant="muted">{t('showcase.subtitle')}</Text>
      </View>
      <View className="mt-4 flex-row flex-wrap gap-2">
        {TABS.map((tab) => {
          const selected = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`rounded-full border px-3.5 py-1.5 ${selected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}
            >
              <Text className={`text-xs font-semibold ${selected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                {t(`showcase.tabs.${tab}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {activeTab === 'all' ? <Text variant="muted" className="mt-3">{t('showcase.dragHint')}</Text> : null}
      <View className="mt-5">
        <SortableList
          items={visible.map((id) => ({ id }))}
          onReorder={(next) => {
            if (activeTab !== 'all') return;
            setShowcaseOrder(next.map((item) => item.id));
          }}
          renderItem={(item) => {
            const Widget = WIDGETS[item.id as WidgetId];
            return <Widget />;
          }}
        />
      </View>
    </View>
  );
}
