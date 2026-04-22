export type PropertiesDataMode = "mock" | "live";

export function getDataMode(): PropertiesDataMode {
  const raw =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_PROPERTIES_DATA_MODE
      : undefined;
  return raw === "live" ? "live" : "mock";
}

export function isMockMode(): boolean {
  return getDataMode() === "mock";
}
