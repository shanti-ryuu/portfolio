import AppKit
import CoreImage
import Foundation
import ImageIO
import Vision

let sourceDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
let width = Int(CommandLine.arguments[3]) ?? 0
let preserveText = CommandLine.arguments.count > 4 && CommandLine.arguments[4] == "text"
let context = CIContext()
try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
let frames = try FileManager.default.contentsOfDirectory(at: sourceDirectory, includingPropertiesForKeys: nil)
  .filter { $0.pathExtension == "jpg" }
  .sorted { $0.lastPathComponent < $1.lastPathComponent }
var previousMask: [UInt8]?

for (index, frameURL) in frames.enumerated() {
  autoreleasepool {
    guard let imageSource = CGImageSourceCreateWithURL(frameURL as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) else { fatalError("Cannot read \(frameURL.path)") }
    let request = VNGenerateForegroundInstanceMaskRequest()
    let handler = VNImageRequestHandler(cgImage: image)
    do {
      try handler.perform([request])
      let width = image.width
      let height = image.height
      let grayBytes = UnsafeMutablePointer<UInt8>.allocate(capacity: width * height)
      grayBytes.initialize(repeating: 0, count: width * height)
      if let result = request.results?.first {
        let maskBuffer = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)
        let ciMask = CIImage(cvPixelBuffer: maskBuffer)
        guard let mask = context.createCGImage(ciMask, from: ciMask.extent) else { fatalError("Cannot render foreground mask") }
        let bitmap = NSBitmapImageRep(cgImage: mask)
        guard let bytes = bitmap.bitmapData else { fatalError("Cannot read foreground mask pixels") }
        for y in 0..<height {
          for x in 0..<width {
            grayBytes[y * width + x] = bytes[y * bitmap.bytesPerRow + x * 4]
          }
        }
        previousMask = Array(UnsafeBufferPointer(start: grayBytes, count: width * height))
      } else if let previousMask, previousMask.count == width * height {
        print("No Vision subject mask for \(frameURL.lastPathComponent); reusing the previous frame's silhouette.")
        for (offset, value) in previousMask.enumerated() { grayBytes[offset] = value }
      } else {
        fatalError("No foreground mask for first frame \(frameURL.path)")
      }
      // The thank-you clip also carries baked-in black text. Preserve it with a narrow
      // luminance key on the left side while Vision supplies the cat silhouettes.
      if preserveText && width > 0 {
        let textLimit = Int(Double(width) * 0.62)
        let frameRep = NSBitmapImageRep(cgImage: image)
        guard let colorBytes = frameRep.bitmapData else { fatalError("Cannot read source pixels") }
        let colorRow = frameRep.bytesPerRow
        for y in 0..<frameRep.pixelsHigh {
          for x in 0..<min(textLimit, frameRep.pixelsWide) {
            let p = colorBytes + y * colorRow + x * 4
            let luminance = (Int(p[0]) * 299 + Int(p[1]) * 587 + Int(p[2]) * 114) / 1000
            let textAlpha = UInt8(max(0, min(255, (165 - luminance) * 4)))
            let offset = y * width + x
            grayBytes[offset] = max(grayBytes[offset], textAlpha)
          }
        }
      }
      previousMask = Array(UnsafeBufferPointer(start: grayBytes, count: width * height))
      let outputURL = outputDirectory.appendingPathComponent(frameURL.deletingPathExtension().lastPathComponent + ".png")
      let gray = CGContext(data: grayBytes, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width, space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGImageAlphaInfo.none.rawValue)
      guard let grayImage = gray?.makeImage(),
            let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, "public.png" as CFString, 1, nil) else { fatalError("Cannot write mask") }
      CGImageDestinationAddImage(destination, grayImage, nil)
      CGImageDestinationFinalize(destination)
      grayBytes.deallocate()
    } catch { fatalError("Foreground segmentation failed: \(error)") }
  }
  if (index + 1) % 120 == 0 { print("Segmented \(index + 1)/\(frames.count) frames") }
}
print("Segmented \(frames.count) frames")
