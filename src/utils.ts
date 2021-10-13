export function isString(obj: unknown): obj is string {
  return typeof obj === 'string';
}

export function isObject(obj: unknown): obj is Record<string, unknown> {
  return !!obj && typeof obj === 'object' && !Array.isArray(obj);
}

export function getMemberVarName(objectVarName: string, key: string): string {
  return objectVarName !== '' ? `${objectVarName}[${JSON.stringify(key)}]` : key;
}

export function arrayDifference<T>(a: T[], b: T[]): T[] {
  // naive algorithm O(N^2)
  // TODO(perf): replace with O(NlogN) algorithm
  return a.filter((e) => !b.includes(e));
}

export function arrayIintersection<T>(a: T[], b: T[]): T[] {
  // naive algorithm O(N^2)
  // TODO(perf): replace with O(NlogN) algorithm
  return a.filter((e) => b.includes(e));
}
