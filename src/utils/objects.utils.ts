export function isEmptyObject(object: Record<string, any>) {
  if (object) {
    return Object.keys(object).length === 0;
  }

  return true;
}
