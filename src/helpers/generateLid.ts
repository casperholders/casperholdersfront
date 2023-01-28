function randomInteger() {
  return Math.floor(Math.random() * 9999999);
}

/**
 * Generate a unique local ID (avoid using given ids).
 *
 * @param avoidLids
 */
export default function generateLid(avoidLids = []) {
  let randomLid = randomInteger();
  while (avoidLids.indexOf(randomLid) !== -1) {
    randomLid = randomInteger();
  }

  return randomLid;
}
