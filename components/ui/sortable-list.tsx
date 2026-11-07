import { GripVertical } from 'lucide-react-native';
import { useRef, useState, type ReactNode } from 'react';
import { PanResponder, View } from 'react-native';

import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

type SortableItem = { id: string };

type SortableListProps<T extends SortableItem> = {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => ReactNode;
};

function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to) return items;
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function SortableList<T extends SortableItem>({ items, onReorder, renderItem }: SortableListProps<T>) {
  const scheme = useAppColorScheme();
  const [drag, setDrag] = useState<{ index: number; dy: number; row: number } | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const grip = scheme === 'dark' ? '#94A3B8' : '#64748B';

  return (
    <View className="gap-3">
      {items.map((item, index) => (
        <SortableRow
          key={item.id}
          active={drag?.index === index}
          offset={drag?.index === index ? drag.dy : 0}
          grip={grip}
          onDrag={(dy, row) => setDrag({ index, dy, row })}
          onDrop={(dy, row) => {
            const shift = Math.round(dy / Math.max(row, 1));
            const target = Math.min(itemsRef.current.length - 1, Math.max(0, index + shift));
            onReorder(moveItem(itemsRef.current, index, target));
            setDrag(null);
          }}
          onCancel={() => setDrag(null)}
        >
          {renderItem(item)}
        </SortableRow>
      ))}
    </View>
  );
}

function SortableRow({
  children,
  active,
  offset,
  grip,
  onDrag,
  onDrop,
  onCancel,
}: {
  children: ReactNode;
  active: boolean;
  offset: number;
  grip: string;
  onDrag: (dy: number, row: number) => void;
  onDrop: (dy: number, row: number) => void;
  onCancel: () => void;
}) {
  const row = useRef(88);
  const dragRef = useRef(onDrag);
  const dropRef = useRef(onDrop);
  const cancelRef = useRef(onCancel);
  dragRef.current = onDrag;
  dropRef.current = onDrop;
  cancelRef.current = onCancel;
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => dragRef.current(gesture.dy, row.current),
      onPanResponderRelease: (_, gesture) => dropRef.current(gesture.dy, row.current),
      onPanResponderTerminate: () => cancelRef.current(),
    }),
  ).current;

  return (
    <View
      onLayout={(event) => {
        row.current = event.nativeEvent.layout.height + 12;
      }}
      style={{ transform: [{ translateY: active ? offset : 0 }], zIndex: active ? 2 : 0, opacity: active ? 0.92 : 1 }}
      className="flex-row items-start gap-2"
    >
      <View
        accessibilityLabel="Drag to reorder"
        className="mt-3 h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
        style={{ touchAction: 'none' }}
        {...pan.panHandlers}
      >
        <GripVertical color={grip} size={18} />
      </View>
      <View className="flex-1">{children}</View>
    </View>
  );
}
