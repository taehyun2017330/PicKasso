type ImageQuality = "low" | "medium" | "high" | "auto";
type ImageFormat = "png" | "jpeg" | "webp";
type ImageBackground = "opaque" | "auto";

const imageGenerationDefaults = {
  size: "1024x1024",
  quality: "medium" as ImageQuality,
  outputFormat: "png" as ImageFormat,
  background: "auto" as ImageBackground,
  outputCompression: null as number | null
};

export function getImageSize() {
  return imageGenerationDefaults.size;
}

export function getImageQuality() {
  return imageGenerationDefaults.quality;
}

export function getImageOutputFormat() {
  return imageGenerationDefaults.outputFormat;
}

export function getImageBackground() {
  return imageGenerationDefaults.background;
}

export function getImageOutputCompression() {
  return imageGenerationDefaults.outputCompression;
}
