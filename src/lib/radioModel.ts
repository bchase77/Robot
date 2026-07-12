import { intersectSegmentAABB } from "./geometry";
import {
  MATERIAL_BASE_LOSS_DB,
  RADIO_PROFILES,
  type Material,
  type RadioTech,
  type SceneObject,
  type Vector3,
} from "./types";

export function distanceM(a: Vector3, b: Vector3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Free-space path loss, dB. Standard form: 20log10(d_m) + 20log10(f_MHz) - 27.55 */
export function freeSpacePathLossDb(distanceMeters: number, freqMHz: number): number {
  const d = Math.max(distanceMeters, 0.01);
  return 20 * Math.log10(d) + 20 * Math.log10(freqMHz) - 27.55;
}

/** Extra loss from a single obstruction, scaled from the 2.4 GHz baseline. */
export function materialLossDb(material: Material, freqMHz: number): number {
  const base = MATERIAL_BASE_LOSS_DB[material];
  const scale = freqMHz / 2400;
  return base * Math.sqrt(scale);
}

export function obstaclesBetween(a: Vector3, b: Vector3, objects: SceneObject[]): SceneObject[] {
  return objects.filter((obj) => intersectSegmentAABB(a, b, obj));
}

export interface LinkBudget {
  distanceM: number;
  obstacles: SceneObject[];
  fspLossDb: number;
  obstacleLossDb: number;
  totalLossDb: number;
  rssiDbm: number;
  marginDb: number;
  connected: boolean;
}

export function computeLinkBudget(
  a: Vector3,
  b: Vector3,
  radio: RadioTech,
  txPowerDbm: number,
  objects: SceneObject[],
): LinkBudget {
  const profile = RADIO_PROFILES[radio];
  const d = distanceM(a, b);
  const obstacles = obstaclesBetween(a, b, objects);
  const fspLossDb = freeSpacePathLossDb(d, profile.freqMHz);
  const obstacleLossDb = obstacles.reduce((sum, o) => sum + materialLossDb(o.material, profile.freqMHz), 0);
  const totalLossDb = fspLossDb + obstacleLossDb;
  const rssiDbm = txPowerDbm - totalLossDb;
  const marginDb = rssiDbm - profile.sensitivityDbm;
  return {
    distanceM: d,
    obstacles,
    fspLossDb,
    obstacleLossDb,
    totalLossDb,
    rssiDbm,
    marginDb,
    connected: marginDb > 0,
  };
}

/** Rough battery life, hours, assuming the radio transmits continuously. Optimistic upper bound. */
export function batteryLifeHours(batteryCapacityMah: number, txCurrentMa: number): number {
  return batteryCapacityMah / txCurrentMa;
}
