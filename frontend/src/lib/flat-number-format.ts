/**
 * Build a suggested flat number from tower/block settings.
 * Pattern tokens: {prefix} {floor} {unit} — unit is zero-padded to 2 digits by default.
 */
export function formatFlatNumberFromTower(
  prefix: string | undefined,
  floor: number | string | undefined,
  unitIndex = 1,
): string {
  const p = (prefix || '').trim();
  const f = floor === '' || floor === undefined || floor === null ? '' : String(floor);
  const u = String(Math.max(1, Number(unitIndex) || 1)).padStart(2, '0');
  if (!p && !f) return '';
  if (!f) return p;
  return `${p}${f}${u}`;
}

export function towerAreaDefaults(tower: {
  defaultSuperBuiltUpArea?: number | null;
  defaultBuiltUpArea?: number | null;
  defaultCarpetArea?: number | null;
  superBuiltUpArea?: number | null;
  builtUpArea?: number | null;
  carpetArea?: number | null;
}) {
  return {
    superBuiltUpArea:
      tower.defaultSuperBuiltUpArea ?? tower.superBuiltUpArea ?? undefined,
    builtUpArea: tower.defaultBuiltUpArea ?? tower.builtUpArea ?? undefined,
    carpetArea: tower.defaultCarpetArea ?? tower.carpetArea ?? undefined,
  };
}
