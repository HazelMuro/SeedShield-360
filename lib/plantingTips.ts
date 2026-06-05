const tips: Record<string, string> = {
  SC403:
    "Plant at the onset of effective rains. Use recommended spacing and follow local agronomist guidance.",
  SC513:
    "Suitable for medium to high rainfall areas. Ensure good fertiliser application and weed control.",
  SC719:
    "Suitable for longer season areas. Plant early where possible and manage moisture carefully."
};

export function getPlantingTip(varietyCode?: string) {
  return (
    (varietyCode && tips[varietyCode.toUpperCase()]) ||
    "Use certified seed, plant with adequate moisture, follow recommended spacing, and consult an agronomist."
  );
}
