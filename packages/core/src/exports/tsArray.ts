/**
 * Serializes rows as a TypeScript array literal.
 */
export function serializeTSArray(
  rows: Record<string, unknown>[],
  variableName: string = 'data',
): string {
  const jsonData = JSON.stringify(rows, null, 2);

  return `export const ${variableName} = ${jsonData} as const;
`;
}
