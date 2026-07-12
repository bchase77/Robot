export type Vector3 = [number, number, number];

export type Material = "drywall" | "wood" | "glass" | "concrete" | "metal";

export type RadioTech = "ble" | "900mhz" | "wifi24" | "uwb";

export interface SceneObject {
  id: string;
  name: string;
  /** Center of the box, meters */
  position: Vector3;
  /** Width (x), height (y), depth (z), meters */
  size: Vector3;
  material: Material;
}

export interface Tag {
  id: string;
  name: string;
  position: Vector3;
  radio: RadioTech;
  txPowerDbm: number;
  hasCamera: boolean;
  hasLightSensor: boolean;
  /** Battery capacity, mAh — used for rough life-estimate under active TX */
  batteryCapacityMah: number;
}

export interface RadioProfile {
  label: string;
  freqMHz: number;
  /** Receiver sensitivity floor, dBm — below this the link is considered dead */
  sensitivityDbm: number;
  /** Approximate active-transmit current draw, mA — used for battery life estimate */
  txCurrentMa: number;
}

export const RADIO_PROFILES: Record<RadioTech, RadioProfile> = {
  ble: { label: "Bluetooth LE (2.4 GHz)", freqMHz: 2400, sensitivityDbm: -95, txCurrentMa: 8 },
  "900mhz": { label: "Sub-GHz (900 MHz)", freqMHz: 915, sensitivityDbm: -100, txCurrentMa: 30 },
  wifi24: { label: "Wi-Fi (2.4 GHz)", freqMHz: 2400, sensitivityDbm: -85, txCurrentMa: 120 },
  uwb: { label: "UWB (6.5 GHz)", freqMHz: 6500, sensitivityDbm: -85, txCurrentMa: 60 },
};

/**
 * Rough extra path loss (dB) contributed by a single obstruction of this
 * material, indexed at 2.4 GHz. Scaled by frequency in radioModel.ts since
 * higher frequencies generally attenuate more through common building
 * materials, and metal is treated as near-opaque to RF regardless of band.
 */
export const MATERIAL_BASE_LOSS_DB: Record<Material, number> = {
  glass: 2,
  drywall: 3,
  wood: 4,
  concrete: 12,
  metal: 25,
};
