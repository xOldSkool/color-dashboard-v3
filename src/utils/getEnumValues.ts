export function getEnumValue<T extends string>(value: unknown, allowed: readonly T[], defaultValue: T): T {
  return allowed.includes(value as T) ? (value as T) : defaultValue;
}
