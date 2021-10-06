export function isString(obj: unknown): obj is string {
  return typeof obj === 'string';
}

export function isObject(obj: unknown): obj is Record<string, unknown> {
  return !!obj && typeof obj === 'object' && !Array.isArray(obj);
}

export function getMemberVarName(objectVarName: string, key: string): string {
  return objectVarName !== '' ? `${objectVarName}[${JSON.stringify(key)}]` : key;
}
