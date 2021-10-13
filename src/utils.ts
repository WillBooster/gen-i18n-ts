export function isString(obj: unknown): obj is string {
  return typeof obj === 'string';
}

export function isObject(obj: unknown): obj is Record<string, unknown> {
  return !!obj && typeof obj === 'object' && !Array.isArray(obj);
}

export function getMemberVarName(objectVarName: string, key: string): string {
  return objectVarName !== '' ? `${objectVarName}[${JSON.stringify(key)}]` : key;
}

export function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const elem of setB) {
    if (setA.has(elem)) {
      result.add(elem);
    }
  }
  return result;
}

export function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const result = new Set(setA);
  for (const elem of setB) {
    result.delete(elem);
  }
  return result;
}
