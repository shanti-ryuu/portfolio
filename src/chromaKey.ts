const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

// Lookup tables keep the per-frame Lab conversion inexpensive enough for the
// cropped character frame while retaining the requested perceptual key.
const linearRgb = new Float32Array(256)
for (let i = 0; i < 256; i += 1) {
  const channel = i / 255
  linearRgb[i] = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}
const labCurve = new Float32Array(8192)
for (let i = 0; i < labCurve.length; i += 1) {
  const value = (i / (labCurve.length - 1)) * 1.1
  labCurve[i] = value > 0.008856 ? Math.cbrt(value) : value / 0.128 + 4 / 29
}

function rgbToLab(r: number, g: number, b: number) {
  const red = linearRgb[r]
  const green = linearRgb[g]
  const blue = linearRgb[b]
  const x = (0.4124564 * red + 0.3575764 * green + 0.1804375 * blue) / 0.95047
  const y = (0.2126729 * red + 0.7151522 * green + 0.072175 * blue)
  const z = (0.0193339 * red + 0.119192 * green + 0.9503041 * blue) / 1.08883
  const fx = labCurve[clamp(Math.round(x * (labCurve.length - 1) / 1.1), 0, labCurve.length - 1)]
  const fy = labCurve[clamp(Math.round(y * (labCurve.length - 1) / 1.1), 0, labCurve.length - 1)]
  const fz = labCurve[clamp(Math.round(z * (labCurve.length - 1) / 1.1), 0, labCurve.length - 1)]
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)] as const
}

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
  return { rgb, lab: rgbToLab(rgb[0], rgb[1], rgb[2]) }
}

export function chromaKey(data: Uint8ClampedArray, width: number, height: number, hardEdge = false) {
  const sample = sampleBackground(data, width, height)
  const background = sample.lab
  for (let i = 0; i < data.length; i += 4) {
    const [l, a, b] = rgbToLab(data[i], data[i + 1], data[i + 2])
    const dl = l - background[0]
    const da = a - background[1]
    const db = b - background[2]
    const distance = Math.sqrt(dl * dl + da * da + db * db)
    const alpha = hardEdge ? (distance < 13 ? 0 : 1) : smoothstep(6, 18, distance)
    if (hardEdge && distance < 52) {
      const strongestNonGreen = Math.max(data[i], data[i + 2])
      const spill = Math.max(0, data[i + 1] - strongestNonGreen - 7)
      data[i + 1] = Math.max(strongestNonGreen, data[i + 1] - Math.round(spill * (1 - distance / 52)))
    }
    if (alpha < 0.015) { data[i + 3] = 0; continue }
    if (alpha < 0.995) {
      const keyScale = 1 / alpha
      data[i] = clamp(Math.round((data[i] - sample.rgb[0] * (1 - alpha)) * keyScale), 0, 255)
      data[i + 1] = clamp(Math.round((data[i + 1] - sample.rgb[1] * (1 - alpha)) * keyScale), 0, 255)
      data[i + 2] = clamp(Math.round((data[i + 2] - sample.rgb[2] * (1 - alpha)) * keyScale), 0, 255)
      data[i + 3] = Math.round(255 * alpha)
    }
  }
}
