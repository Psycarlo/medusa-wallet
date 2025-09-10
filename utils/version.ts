function gt(a: string, b: string) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)

  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na > nb) return true
    if (na < nb) return false
  }
  return false
}

export default { gt }
