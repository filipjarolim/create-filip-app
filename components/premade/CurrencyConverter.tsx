import { ArrowRightLeft, DollarSign, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useAppQuery } from '@/hooks/useAppQuery';

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CZK'];

export function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

  // Frankfurter free foreign exchange API (European Central Bank data)
  const ratesQuery = useAppQuery({
    queryKey: ['frankfurter-rates', fromCurrency],
    queryFn: async () => {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}`);
      if (!res.ok) throw new Error('Failed to fetch exchange rates');
      return res.json() as Promise<{
        amount: number;
        base: string;
        date: string;
        rates: Record<string, number>;
      }>;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  const parsedAmount = parseFloat(amount) || 0;
  const currentRate =
    fromCurrency === toCurrency ? 1 : ratesQuery.data?.rates[toCurrency] ?? null;
  const convertedAmount = currentRate ? (parsedAmount * currentRate).toFixed(2) : null;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <Card className="gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <DollarSign size={22} className="text-indigo-600 dark:text-indigo-400" />
          <Text variant="heading">Currency Converter</Text>
        </View>
        <Text variant="muted">Frankfurter (Free)</Text>
      </View>

      {/* Amount Input */}
      <View className="gap-1.5">
        <Text variant="label">Amount</Text>
        <Input
          placeholder="Enter amount…"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* From and To Selector with Swap */}
      <View className="flex-row items-center justify-between gap-2">
        {/* From Picker */}
        <View className="flex-1 gap-1">
          <Text variant="muted" className="text-xs">
            From
          </Text>
          <View className="flex-row flex-wrap gap-1">
            {SUPPORTED_CURRENCIES.slice(0, 4).map((curr) => {
              const isSelected = curr === fromCurrency;
              return (
                <Pressable
                  key={curr}
                  onPress={() => setFromCurrency(curr)}
                  className={`rounded-lg px-2 py-1 border ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {curr}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Swap Button */}
        <Pressable
          accessibilityLabel="Swap currencies"
          onPress={handleSwap}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <ArrowRightLeft size={16} className="text-slate-700 dark:text-slate-200" />
        </Pressable>

        {/* To Picker */}
        <View className="flex-1 gap-1">
          <Text variant="muted" className="text-xs">
            To
          </Text>
          <View className="flex-row flex-wrap gap-1">
            {SUPPORTED_CURRENCIES.slice(0, 4).map((curr) => {
              const isSelected = curr === toCurrency;
              return (
                <Pressable
                  key={curr}
                  onPress={() => setToCurrency(curr)}
                  className={`rounded-lg px-2 py-1 border ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {curr}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Result Card */}
      <View className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
        {ratesQuery.isLoading ? (
          <Skeleton className="h-10 w-40" />
        ) : (
          <View className="gap-1">
            <Text variant="muted" className="text-xs text-indigo-700 dark:text-indigo-300">
              {parsedAmount} {fromCurrency} =
            </Text>
            <Text className="text-3xl font-bold text-indigo-950 dark:text-indigo-100">
              {convertedAmount ?? '–'} {toCurrency}
            </Text>
            {currentRate ? (
              <View className="flex-row items-center gap-1 pt-1">
                <TrendingUp size={14} className="text-indigo-600 dark:text-indigo-400" />
                <Text variant="muted" className="text-xs text-indigo-700 dark:text-indigo-300">
                  1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency} (ECB live rate)
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* Quick Rates Overview Table */}
      {ratesQuery.data?.rates ? (
        <View className="gap-1.5 pt-1">
          <Text variant="label">Popular Rates vs {fromCurrency}</Text>
          <View className="flex-row flex-wrap gap-2">
            {['EUR', 'GBP', 'JPY', 'CAD', 'CHF']
              .filter((c) => c !== fromCurrency)
              .map((c) => {
                const rate = ratesQuery.data?.rates[c];
                return (
                  <View
                    key={c}
                    className="flex-1 min-w-[90px] rounded-xl bg-slate-50 p-2 dark:bg-slate-800/50"
                  >
                    <Text variant="muted" className="text-[11px]">
                      {c}
                    </Text>
                    <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {rate ? rate.toFixed(3) : '–'}
                    </Text>
                  </View>
                );
              })}
          </View>
        </View>
      ) : null}
    </Card>
  );
}
