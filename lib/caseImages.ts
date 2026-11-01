import fs from "fs";
import path from "path";

/** Lists the artwork files in /public/cases so the admin can pick one. */
export function listCaseImages(): string[] {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), "public", "cases"))
      .filter((f) => /\.(svg|png|jpe?g|webp)$/i.test(f))
      .sort()
      .map((f) => `/cases/${f}`);
  } catch {
    return [];
  }
}
