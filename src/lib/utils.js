export function muffle(callback) {
  try {
    return callback();
  } catch (e) {
    // console.error(e);
  }
}
