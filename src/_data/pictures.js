import fs from "node:fs";
import path from "node:path";

const SUPPORTED_EXT_RE = /\.(avif|gif|jpe?g|png|svg|webp)$/i;

function filenameToAlt(filename) {
  const base = filename.replace(SUPPORTED_EXT_RE, "");
  return base.replace(/[-_]+/g, " ").trim();
}

export default function () {
  const picturesDir = path.join(process.cwd(), "src", "assets", "pictures");

  if (!fs.existsSync(picturesDir)) {
    return [];
  }

  const files = fs
    .readdirSync(picturesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => SUPPORTED_EXT_RE.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  return files.map((name) => {
    const url = `/assets/pictures/${encodeURIComponent(name)}`;
    return {
      name,
      url,
      alt: filenameToAlt(name) || "Picture"
    };
  });
}
