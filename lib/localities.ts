export const LOCALITIES = [
  { code: "zion-sao-paulo", name: "Zion Sao Paulo" },
  { code: "zion-lisboa", name: "Zion Lisboa" },
] as const;

export const LOCALITY_PATHS = {
  "sao-paulo": "zion-sao-paulo",
  lisboa: "zion-lisboa",
} as const;

export type LocalityPath = keyof typeof LOCALITY_PATHS;

export type LocalityCode = (typeof LOCALITIES)[number]["code"];

export const DEFAULT_LOCALITY: LocalityCode = "zion-sao-paulo";

export function normalizeLocalityCode(
  value: string | null | undefined,
): LocalityCode {
  if (!value) return DEFAULT_LOCALITY;
  const normalized = value.trim().toLowerCase();
  const exists = LOCALITIES.some((locality) => locality.code === normalized);
  return exists ? (normalized as LocalityCode) : DEFAULT_LOCALITY;
}

export function inferLocalityFromBrowser(
  timeZone?: string,
  language?: string,
): LocalityCode {
  const normalizedTimeZone = (timeZone || "").toLowerCase();
  if (normalizedTimeZone.includes("lisbon")) return "zion-lisboa";
  if (normalizedTimeZone.includes("sao_paulo")) return "zion-sao-paulo";

  const normalizedLanguage = (language || "").toLowerCase();
  if (normalizedLanguage.startsWith("pt-pt")) return "zion-lisboa";

  return DEFAULT_LOCALITY;
}

export function localityCodeFromPath(
  path: string | null | undefined,
): LocalityCode | null {
  if (!path) return null;
  const normalizedPath = path.trim().toLowerCase() as LocalityPath;
  const code = LOCALITY_PATHS[normalizedPath];
  return code || null;
}

export function localityPathFromCode(code: LocalityCode): LocalityPath {
  const entry = Object.entries(LOCALITY_PATHS).find(
    ([, value]) => value === code,
  );
  return (entry?.[0] || "sao-paulo") as LocalityPath;
}
