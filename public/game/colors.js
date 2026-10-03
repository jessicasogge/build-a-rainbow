// The rainbow's six colors, shared by every level. Outside stripe first.
// Indigo is left out, the usual simplification for young kids.

export const COLORS = [
  { id: 'red', name: 'Red', hex: '#E5383B' },
  { id: 'orange', name: 'Orange', hex: '#F77F00' },
  { id: 'yellow', name: 'Yellow', hex: '#FCBF49' },
  { id: 'green', name: 'Green', hex: '#43AA8B' },
  { id: 'blue', name: 'Blue', hex: '#277DA1' },
  { id: 'purple', name: 'Purple', hex: '#7B4FA0' },
];

export const COLOR_IDS = COLORS.map((c) => c.id);

// Not a rainbow stripe, but used as an extra: a paint in Paint a rainbow,
// and the seventh letter box in Word scramble.
export const PINK = { id: 'pink', name: 'Pink', hex: '#F28AB2' };

// Look up a rainbow color by its id ('red', 'orange', ...).
export function colorById(id) {
  const found = COLORS.find((c) => c.id === id);
  if (!found) throw new Error(`No color called ${id}`);
  return found;
}
