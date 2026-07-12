"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  RADIO_PROFILES,
  type Material,
  type RadioTech,
  type SceneObject,
  type Tag,
  type Vector3,
} from "@/lib/types";
import { batteryLifeHours, computeLinkBudget } from "@/lib/radioModel";

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });

const MATERIALS: Material[] = ["drywall", "wood", "glass", "concrete", "metal"];
const RADIOS = Object.keys(RADIO_PROFILES) as RadioTech[];

function id() {
  return Math.random().toString(36).slice(2, 9);
}

const INITIAL_OBJECTS: SceneObject[] = [
  { id: id(), name: "Interior wall", position: [3, 1.2, 0], size: [0.15, 2.4, 4], material: "drywall" },
  { id: id(), name: "Metal cabinet", position: [1, 0.6, 1.5], size: [0.6, 1.2, 0.6], material: "metal" },
];

const INITIAL_TAGS: Tag[] = [
  {
    id: id(),
    name: "tag-A",
    position: [-2, 0.8, 0],
    radio: "ble",
    txPowerDbm: 4,
    hasCamera: false,
    hasLightSensor: false,
    batteryCapacityMah: 220,
  },
  {
    id: id(),
    name: "tag-B",
    position: [5, 0.8, 0],
    radio: "ble",
    txPowerDbm: 4,
    hasCamera: false,
    hasLightSensor: false,
    batteryCapacityMah: 220,
  },
];

function vecField(vec: Vector3, i: number, onChange: (v: Vector3) => void) {
  return (
    <input
      key={i}
      type="number"
      step="0.1"
      className="w-16 rounded border border-gray-300 px-1 py-0.5 text-sm text-gray-800"
      value={vec[i]}
      onChange={(e) => {
        const next: Vector3 = [...vec];
        next[i] = Number(e.target.value);
        onChange(next);
      }}
    />
  );
}

export default function Home() {
  const [objects, setObjects] = useState<SceneObject[]>(INITIAL_OBJECTS);
  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);

  const updateObject = (objId: string, patch: Partial<SceneObject>) =>
    setObjects((prev) => prev.map((o) => (o.id === objId ? { ...o, ...patch } : o)));

  const updateTag = (tagId: string, patch: Partial<Tag>) =>
    setTags((prev) => prev.map((t) => (t.id === tagId ? { ...t, ...patch } : t)));

  const links = useMemo(() => {
    const out: {
      a: Tag;
      b: Tag;
      compatible: boolean;
      budget?: ReturnType<typeof computeLinkBudget>;
    }[] = [];
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const a = tags[i];
        const b = tags[j];
        if (a.radio !== b.radio) {
          out.push({ a, b, compatible: false });
          continue;
        }
        const txPowerDbm = (a.txPowerDbm + b.txPowerDbm) / 2;
        const budget = computeLinkBudget(a.position, b.position, a.radio, txPowerDbm, objects);
        out.push({ a, b, compatible: true, budget });
      }
    }
    return out;
  }, [tags, objects]);

  const sceneLinks = links
    .filter((l) => l.budget)
    .map((l) => ({ a: l.a, b: l.b, connected: l.budget!.connected }));

  return (
    <main className="min-h-screen bg-white p-6 text-gray-800">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">wheresmystuff</h1>
        <p className="text-sm text-gray-600">
          3D simulation environment for RF tag localization — place objects and tags, choose radio
          technology, and see how line-of-sight obstructions degrade each link.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        <div className="h-[560px] overflow-hidden rounded-lg border border-gray-300">
          <Scene3D objects={objects} tags={tags} links={sceneLinks} />
        </div>

        <div className="flex flex-col gap-6">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-medium">Objects</h2>
              <button
                className="rounded bg-gray-800 px-2 py-1 text-xs text-white"
                onClick={() =>
                  setObjects((prev) => [
                    ...prev,
                    {
                      id: id(),
                      name: `object-${prev.length + 1}`,
                      position: [0, 0.5, 0],
                      size: [0.5, 1, 0.5],
                      material: "drywall",
                    },
                  ])
                }
              >
                + Add object
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {objects.map((obj) => (
                <div key={obj.id} className="rounded border border-gray-200 p-2 text-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <input
                      className="flex-1 rounded border border-gray-300 px-1 py-0.5 text-gray-800"
                      value={obj.name}
                      onChange={(e) => updateObject(obj.id, { name: e.target.value })}
                    />
                    <select
                      className="rounded border border-gray-300 px-1 py-0.5 text-gray-800"
                      value={obj.material}
                      onChange={(e) => updateObject(obj.id, { material: e.target.value as Material })}
                    >
                      {MATERIALS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <button
                      className="text-xs text-red-600"
                      onClick={() => setObjects((prev) => prev.filter((o) => o.id !== obj.id))}
                    >
                      remove
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span>pos</span>
                    {[0, 1, 2].map((i) =>
                      vecField(obj.position, i, (v) => updateObject(obj.id, { position: v })),
                    )}
                    <span>size</span>
                    {[0, 1, 2].map((i) => vecField(obj.size, i, (v) => updateObject(obj.id, { size: v })))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-medium">Tags</h2>
              <button
                className="rounded bg-gray-800 px-2 py-1 text-xs text-white"
                onClick={() =>
                  setTags((prev) => [
                    ...prev,
                    {
                      id: id(),
                      name: `tag-${prev.length + 1}`,
                      position: [0, 0.8, 0],
                      radio: "ble",
                      txPowerDbm: 4,
                      hasCamera: false,
                      hasLightSensor: false,
                      batteryCapacityMah: 220,
                    },
                  ])
                }
              >
                + Add tag
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="rounded border border-gray-200 p-2 text-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <input
                      className="flex-1 rounded border border-gray-300 px-1 py-0.5 text-gray-800"
                      value={tag.name}
                      onChange={(e) => updateTag(tag.id, { name: e.target.value })}
                    />
                    <select
                      className="rounded border border-gray-300 px-1 py-0.5 text-gray-800"
                      value={tag.radio}
                      onChange={(e) => updateTag(tag.id, { radio: e.target.value as RadioTech })}
                    >
                      {RADIOS.map((r) => (
                        <option key={r} value={r}>
                          {RADIO_PROFILES[r].label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="text-xs text-red-600"
                      onClick={() => setTags((prev) => prev.filter((t) => t.id !== tag.id))}
                    >
                      remove
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span>pos</span>
                    {[0, 1, 2].map((i) => vecField(tag.position, i, (v) => updateTag(tag.id, { position: v })))}
                    <span>tx dBm</span>
                    <input
                      type="number"
                      className="w-14 rounded border border-gray-300 px-1 py-0.5 text-gray-800"
                      value={tag.txPowerDbm}
                      onChange={(e) => updateTag(tag.id, { txPowerDbm: Number(e.target.value) })}
                    />
                    <span>battery mAh</span>
                    <input
                      type="number"
                      className="w-16 rounded border border-gray-300 px-1 py-0.5 text-gray-800"
                      value={tag.batteryCapacityMah}
                      onChange={(e) => updateTag(tag.id, { batteryCapacityMah: Number(e.target.value) })}
                    />
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={tag.hasCamera}
                        onChange={(e) => updateTag(tag.id, { hasCamera: e.target.checked })}
                      />
                      camera
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={tag.hasLightSensor}
                        onChange={(e) => updateTag(tag.id, { hasLightSensor: e.target.checked })}
                      />
                      light sensor
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 font-medium">Link budgets</h2>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-2">Link</th>
                <th className="p-2">Radio</th>
                <th className="p-2">Distance (m)</th>
                <th className="p-2">Obstacles</th>
                <th className="p-2">Path loss (dB)</th>
                <th className="p-2">RSSI (dBm)</th>
                <th className="p-2">Margin (dB)</th>
                <th className="p-2">Status</th>
                <th className="p-2">Battery life (h)</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l, i) => (
                <tr key={i} className="border-t border-gray-200 text-gray-800">
                  <td className="p-2">
                    {l.a.name} &harr; {l.b.name}
                  </td>
                  {!l.compatible || !l.budget ? (
                    <td className="p-2 text-gray-600" colSpan={7}>
                      incompatible radios ({l.a.radio} vs {l.b.radio})
                    </td>
                  ) : (
                    <>
                      <td className="p-2">{RADIO_PROFILES[l.a.radio].label}</td>
                      <td className="p-2">{l.budget.distanceM.toFixed(2)}</td>
                      <td className="p-2 text-gray-600">
                        {l.budget.obstacles.length === 0
                          ? "none"
                          : l.budget.obstacles.map((o) => o.name).join(", ")}
                      </td>
                      <td className="p-2">{l.budget.totalLossDb.toFixed(1)}</td>
                      <td className="p-2">{l.budget.rssiDbm.toFixed(1)}</td>
                      <td className="p-2">{l.budget.marginDb.toFixed(1)}</td>
                      <td className={`p-2 font-medium ${l.budget.connected ? "text-green-700" : "text-red-700"}`}>
                        {l.budget.connected ? "connected" : "dead"}
                      </td>
                      <td className="p-2">
                        {batteryLifeHours(
                          (l.a.batteryCapacityMah + l.b.batteryCapacityMah) / 2,
                          RADIO_PROFILES[l.a.radio].txCurrentMa,
                        ).toFixed(0)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          Path loss = free-space path loss + per-material obstruction loss for every scene object that
          intersects the line-of-sight segment between the two tags. Battery life assumes continuous
          transmit and is an optimistic upper bound, not an accurate duty-cycled estimate.
        </p>
      </section>
    </main>
  );
}
