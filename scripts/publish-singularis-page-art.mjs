import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = path.resolve(process.cwd(), "../../Singularis - Documents/Design/Art Direction");
const destinationDirectory = path.resolve(process.cwd(), "public/images/singularis");

const assets = [
  { name: "SIN_IMG_OrbitalCarrierAndEscort_v01", width: 2400, quality: 82 },
  { name: "SIN_IMG_OrbitalRingConstruction_v01", width: 1500, quality: 80 },
  { name: "SIN_IMG_CommandHallBriefing_v01", width: 1500, quality: 80 },
  { name: "SIN_IMG_CityLaunchSpectators_v01", width: 1500, quality: 80 },
];

await mkdir(destinationDirectory, { recursive: true });
const results = [];

for (const asset of assets) {
  const sourcePath = path.join(sourceDirectory, `${asset.name}.jpg`);
  const destinationPath = path.join(destinationDirectory, `${asset.name}.webp`);
  const sourceStat = await stat(sourcePath);
  const output = await sharp(sourcePath)
    .resize({ width: asset.width, withoutEnlargement: true })
    .webp({ quality: asset.quality, effort: 6, smartSubsample: true })
    .toFile(destinationPath);
  results.push({
    source: path.basename(sourcePath),
    output: path.relative(process.cwd(), destinationPath).replaceAll("\\", "/"),
    sourceBytes: sourceStat.size,
    outputBytes: output.size,
    width: output.width,
    height: output.height,
    metadataPolicy: "Web delivery derivative strips embedded authoring metadata; semantic metadata is supplied by the page.",
  });
}

console.log(JSON.stringify(results, null, 2));
