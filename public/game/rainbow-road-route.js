// Where the car goes on Rainbow road's roundabout, and which way it faces.
//
// The car comes up the road from the bottom, joins the ring, drives around
// it counterclockwise (the way traffic goes when cars drive on the right),
// and leaves by one of three exits: left, top or right. Its heading follows
// the road, so it turns as it goes around the ring.
//
// All numbers are in the picture's coordinates (rainbow-road.html's
// 600 × 460 viewBox). Angles are in degrees; 0 means the car points up.

export const CENTER = { x: 300, y: 250 };
export const RADIUS = 85; // the middle of the ring
export const START = { x: 300, y: 420 }; // where the car waits

// The exits in the same order as the roads in the page: left, top, right.
// `angle` is where the exit leaves the ring, measured like a clock hand on
// the screen (0 = right, 90 = down, 180 = left, 270 = up). `end` is just past
// the edge of the picture, so the car drives out of sight.
export const EXITS = [
  { id: 'left', angle: 180, end: { x: -60, y: 250 } },
  { id: 'top', angle: 270, end: { x: 300, y: -60 } },
  { id: 'right', angle: 0, end: { x: 660, y: 250 } },
];

const ENTRY_ANGLE = 90; // the bottom of the ring
const rad = (deg) => (deg * Math.PI) / 180;
const onRing = (deg) => ({ x: CENTER.x + RADIUS * Math.cos(rad(deg)), y: CENTER.y + RADIUS * Math.sin(rad(deg)) });

// Counterclockwise on the screen means the angle goes down: from the bottom
// (90) to the right (0), the top (-90), then the left (-180).
function sweepTo(exitAngle) {
  let sweep = ENTRY_ANGLE - exitAngle;
  while (sweep <= 0) sweep += 360;
  return sweep;
}

// The route to an exit, as three pieces: up the road, around the ring, out.
export function route(exitIndex) {
  const exit = EXITS[exitIndex];
  if (!exit) throw new Error(`No exit ${exitIndex}`);
  const join = onRing(ENTRY_ANGLE);
  const sweep = sweepTo(exit.angle);
  const leave = onRing(ENTRY_ANGLE - sweep);
  const pieces = [
    { kind: 'line', from: START, to: join, length: Math.hypot(join.x - START.x, join.y - START.y) },
    { kind: 'arc', fromAngle: ENTRY_ANGLE, sweep, length: rad(sweep) * RADIUS },
    { kind: 'line', from: leave, to: exit.end, length: Math.hypot(exit.end.x - leave.x, exit.end.y - leave.y) },
  ];
  return { pieces, length: pieces.reduce((sum, p) => sum + p.length, 0) };
}

// Heading for travel from one point to another, 0 = up.
const headingOf = (dx, dy) => (Math.atan2(dy, dx) * 180) / Math.PI + 90;

// Where the car is, and which way it faces, `distance` along a route.
export function poseAt(r, distance) {
  let d = Math.max(0, Math.min(distance, r.length));
  for (const piece of r.pieces) {
    if (d <= piece.length || piece === r.pieces[r.pieces.length - 1]) {
      const t = piece.length ? Math.min(d / piece.length, 1) : 1;
      if (piece.kind === 'line') {
        const dx = piece.to.x - piece.from.x;
        const dy = piece.to.y - piece.from.y;
        return { x: piece.from.x + dx * t, y: piece.from.y + dy * t, heading: headingOf(dx, dy) };
      }
      const angle = piece.fromAngle - piece.sweep * t;
      // Going counterclockwise, the car's heading works out to be the same
      // number as its angle around the ring: facing right at the bottom (90),
      // up on the right side (0), left at the top (-90).
      return { ...onRing(angle), heading: angle };
    }
    d -= piece.length;
  }
  return { ...START, heading: 0 };
}

// Turn from one heading toward another by at most `maxStep` degrees, the
// short way round. The page uses this so the car swings smoothly into and
// out of the ring instead of snapping around.
export function turnToward(current, target, maxStep) {
  const diff = ((((target - current) % 360) + 540) % 360) - 180;
  if (Math.abs(diff) <= maxStep) return target;
  return current + Math.sign(diff) * maxStep;
}

// The car's SVG transform for a pose.
export function carTransform({ x, y, heading }) {
  const round = (n) => Math.round(n * 10) / 10;
  return `translate(${round(x)} ${round(y)}) rotate(${round(heading)})`;
}
