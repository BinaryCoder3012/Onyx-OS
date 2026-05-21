import type { OnyxModuleId } from "@/types";

export interface FeatureModule {
  id: OnyxModuleId;
  enabled: boolean;
  version: string;
}

const featureRegistry = new Map<OnyxModuleId, FeatureModule>();

export function registerFeature(module: FeatureModule): void {
  featureRegistry.set(module.id, module);
}

export function getFeature(id: OnyxModuleId): FeatureModule | undefined {
  return featureRegistry.get(id);
}

export function getEnabledFeatures(): FeatureModule[] {
  return Array.from(featureRegistry.values()).filter((f) => f.enabled);
}
