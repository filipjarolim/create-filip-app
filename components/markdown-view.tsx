import { Linking, View } from 'react-native';

import { Text } from '@/components/ui/text';

type MarkdownViewProps = {
  markdown: string;
};

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string };

function parseMarkdown(markdown: string): Block[] {
  return markdown
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0)
    .map((line): Block => {
      const heading = /^(#{1,3})\s+(.*)$/.exec(line);
      if (heading?.[1] && heading[2]) {
        return { type: 'heading', level: heading[1].length, text: heading[2] };
      }
      if (line.startsWith('- ')) {
        return { type: 'bullet', text: line.slice(2) };
      }
      return { type: 'paragraph', text: line };
    });
}

function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return (
    <Text className={className}>
      {parts.map((part, index) => {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link?.[1] && link[2]) {
          const label = link[1];
          const url = link[2];
          return (
            <Text
              key={`${label}-${index}`}
              accessibilityRole="link"
              className="text-indigo-600 underline dark:text-indigo-300"
              onPress={() => {
                void Linking.openURL(url);
              }}
            >
              {label}
            </Text>
          );
        }
        return <Text key={`${part}-${index}`}>{part}</Text>;
      })}
    </Text>
  );
}

export function MarkdownView({ markdown }: MarkdownViewProps) {
  const blocks = parseMarkdown(markdown);
  return (
    <View className="gap-3">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <Text key={index} variant={block.level === 1 ? 'title' : 'heading'} accessibilityRole="header">
              {block.text}
            </Text>
          );
        }
        if (block.type === 'bullet') {
          return (
            <View key={index} className="flex-row gap-2 pl-1">
              <Text>•</Text>
              <RichText text={block.text} className="flex-1" />
            </View>
          );
        }
        return <RichText key={index} text={block.text} />;
      })}
    </View>
  );
}
