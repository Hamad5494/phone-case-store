/** Which rear-camera layout a phone model has. Used to draw an accurate-looking case for each model. */
export type CameraKind =
  | "single" // iPhone 16e / 17e
  | "ios-vertical" // iPhone 11, 12, 12 mini
  | "ios-diagonal" // iPhone 13, 14, 15 (non-Pro)
  | "pill-vertical" // iPhone 16 / 16 Plus
  | "plateau-dual" // iPhone 17
  | "plateau-single" // iPhone Air
  | "pro-triple" // iPhone 11 Pro ... 16 Pro Max
  | "plateau-triple" // iPhone 17 Pro, 18 Pro
  | "s-module-3" // Galaxy S20, S20+, S20 FE
  | "s-module-4" // Galaxy S20 Ultra
  | "s-contour-3" // Galaxy S21, S21+, S21 FE
  | "s-contour-4" // Galaxy S21 Ultra
  | "s-discrete-3" // Galaxy S22 ... S26 (non-Ultra)
  | "s-discrete-4" // Galaxy S22 Ultra ... S26 Ultra
  | "s-pill-2"; // Galaxy S25 Edge

export function cameraKindFor(modelName: string): CameraKind {
  const n = modelName.trim();

  // ---- Apple
  if (n === "iPhone 16e" || n === "iPhone 17e") return "single";
  if (n === "iPhone Air") return "plateau-single";
  if (n === "iPhone 17") return "plateau-dual";
  if (/^iPhone 1[78] Pro/.test(n)) return "plateau-triple";
  if (/^iPhone 1[1-6] Pro/.test(n)) return "pro-triple";
  if (n === "iPhone 16" || n === "iPhone 16 Plus") return "pill-vertical";
  if (n === "iPhone 11" || n === "iPhone 12" || n === "iPhone 12 mini") return "ios-vertical";
  if (/^iPhone (13|14|15)/.test(n)) return "ios-diagonal";

  // ---- Samsung
  const m = /^Galaxy S(\d+)/.exec(n);
  if (m) {
    const gen = Number(m[1]);
    const ultra = /Ultra/.test(n);
    if (/Edge/.test(n)) return "s-pill-2";
    if (gen === 20) return ultra ? "s-module-4" : "s-module-3";
    if (gen === 21) return ultra ? "s-contour-4" : "s-contour-3";
    return ultra ? "s-discrete-4" : "s-discrete-3";
  }
  return "ios-diagonal";
}
