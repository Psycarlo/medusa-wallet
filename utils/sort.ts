function sortTimestampDesc(a: number, b: number) {
  return b - a
}

function sortTimestampAsc(a: number, b: number) {
  return a - b
}

export default { sortTimestampDesc, sortTimestampAsc }
