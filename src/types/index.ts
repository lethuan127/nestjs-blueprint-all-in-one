export type FilterConditionally<Source, Condition> = Pick<
  Source,
  { [K in keyof Source]: Source[K] extends Condition ? K : never }[keyof Source]
>;

export type KeyofConditionally<Source, Condition> = {
  [K in keyof Source]: Source[K] extends Condition ? K : never;
}[keyof Source];

export type JsonObject = { [Key in string]?: JsonValue };

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON array.
 */
export type JsonArray = Array<JsonValue>;

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches any valid JSON value.
 */
export type JsonValue = string | number | boolean | JsonObject | JsonArray | null;

export type ValueOf<T> = T[keyof T];
