const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function sampleBackground(data: Uint8ClampedArray, width: number, height: number) {
  const patch = Math.max(2, Math.round(Math.min(width, height) * 0.009))
  const positions = [[0, 0], [width - patch, 0], [Math.round(width * 0.2), 0], [Math.round(width * 0.4), 0], [Math.round(width * 0.6), 0], [Math.round(width * 0.8), 0]]
  let red = 0
  let green = 0
  let blue = 0
  let count = 0
  for (const [startX, startY] of positions) {
    const x0 = clamp(startX, 0, width - patch)
    const y0 = clamp(startY, 0, height - patch)
    for (let y = y0; y < y0 + patch; y += 1) for (let x = x0; x < x0 + patch; x += 1) {
      const index = (y * width + x) * 4
      red += data[index]
      green += data[index + 1]
      blue += data[index + 2]
      count += 1
    }
  }
  const rgb = [Math.round(red / count), Math.round(green / count), Math.round(blue / count)] as const
  return rgb
}

export function chromaKey(data: Uint8ClampedArray, width: number, height: number, hardEdge = false) {
  const background = sampleBackground(data, width, height)
  const redWeight = 0.35
  const greenWeight = 0.65
  const blueWeight = 0.35
  // These thresholds map the old Lab soft edge to RGB distance around the
  // sampled green screen; sqrt is needed only for pixels inside that edge.
  const lowThresholdSquared = 18 * 18
  const highThresholdSquared = 53 * 53
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i] - background[0]
    const green = data[i + 1] - background[1]
    const blue = data[i + 2] - background[2]
    const distanceSquared = red * red * redWeight + green * green * greenWeight + blue * blue * blueWeight
    const alpha = hardEdge
      ? (distanceSquared < 28 * 28 ? 0 : 1)
      : distanceSquared <= lowThresholdSquared ? 0
        : distanceSquared >= highThresholdSquared ? 1
          : smoothstep(18, 53, Math.sqrt(distanceSquared))
    if (hardEdge && distanceSquared < 70 * 70) {
      const distance = Math.sqrt(distanceSquared)
      const strongestNonGreen = Math.max(data[i], data[i + 2])
      const spill = Math.max(0, data[i + 1] - strongestNonGreen - 7)
      data[i + 1] = Math.max(strongestNonGreen, data[i + 1] - Math.round(spill * (1 - distance / 52)))
    }
    if (alpha < 0.015) { data[i + 3] = 0; continue }
    if (alpha < 0.995) {
      const keyScale = 1 / alpha
      data[i] = clamp(Math.round((data[i] - background[0] * (1 - alpha)) * keyScale), 0, 255)
      data[i + 1] = clamp(Math.round((data[i + 1] - background[1] * (1 - alpha)) * keyScale), 0, 255)
      data[i + 2] = clamp(Math.round((data[i + 2] - background[2] * (1 - alpha)) * keyScale), 0, 255)
      data[i + 3] = Math.round(255 * alpha)
    }
  }
}
