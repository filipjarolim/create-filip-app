import { isUiPreviewEnabled } from '@/config/env';
import { requireSupabase } from '@/config/supabase';

export type ReportReason = 'harassment' | 'sexual' | 'violence' | 'other';

export class ModerationUnavailableError extends Error {
  constructor(readonly reason: 'preview') {
    super(reason);
  }
}

export async function reportContent(input: { reason: ReportReason; details: string; targetUserId?: string }) {
  if (isUiPreviewEnabled()) {
    throw new ModerationUnavailableError('preview');
  }
  const { error } = await requireSupabase().functions.invoke('report-content', { body: input });
  if (error) throw error;
}

export async function blockUser(targetUserId: string) {
  if (isUiPreviewEnabled()) return;
  const { error } = await requireSupabase().functions.invoke('report-content', {
    body: { action: 'block', targetUserId, reason: 'other', details: 'block' },
  });
  if (error) throw error;
}
