export type SafetyReason = 'intimate' | 'minor' | 'injection';

export type SafetyVerdict = {
  allowed: boolean;
  reason?: SafetyReason;
};

const INTIMATE =
  /\b(porn|porno|nude|naked|nsfw|erotic|xxx|sex|sexual|orgasm|genital|desnudo|er[oó]tico|nah[ýáé]|erotick\w*)\b/i;
const MINOR = /\b(child|children|minor|underage|kid|loli|shota|d[ií]t[eě]|nezletil\w*|menor de edad)\b/i;
const INJECTION = /ignore (all |any )?(previous|prior|above) instructions|reveal (your |the )?system prompt/i;

export function assessPrompt(input: string): SafetyVerdict {
  const text = input.normalize('NFKC');
  if (INJECTION.test(text)) {
    return { allowed: false, reason: 'injection' };
  }
  const intimate = INTIMATE.test(text);
  const minor = MINOR.test(text);
  if (intimate && minor) {
    return { allowed: false, reason: 'minor' };
  }
  if (intimate) {
    return { allowed: false, reason: 'intimate' };
  }
  return { allowed: true };
}
