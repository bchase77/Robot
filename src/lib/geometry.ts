import type { SceneObject, Vector3 } from "./types";

/**
 * Slab-method segment-vs-axis-aligned-box intersection test. Used to find
 * which scene objects sit on the line-of-sight path between two tags.
 */
export function intersectSegmentAABB(p0: Vector3, p1: Vector3, obj: SceneObject): boolean {
  const min: Vector3 = [
    obj.position[0] - obj.size[0] / 2,
    obj.position[1] - obj.size[1] / 2,
    obj.position[2] - obj.size[2] / 2,
  ];
  const max: Vector3 = [
    obj.position[0] + obj.size[0] / 2,
    obj.position[1] + obj.size[1] / 2,
    obj.position[2] + obj.size[2] / 2,
  ];
  const dir: Vector3 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];

  let tMin = 0;
  let tMax = 1;

  for (let i = 0; i < 3; i++) {
    if (Math.abs(dir[i]) < 1e-9) {
      if (p0[i] < min[i] || p0[i] > max[i]) return false;
      continue;
    }
    const invD = 1 / dir[i];
    let t0 = (min[i] - p0[i]) * invD;
    let t1 = (max[i] - p0[i]) * invD;
    if (t0 > t1) [t0, t1] = [t1, t0];
    tMin = Math.max(tMin, t0);
    tMax = Math.min(tMax, t1);
    if (tMin > tMax) return false;
  }
  return true;
}
