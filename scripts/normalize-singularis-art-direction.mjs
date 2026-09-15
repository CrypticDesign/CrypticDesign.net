import { createHash } from "node:crypto";
import { readFile, readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = path.resolve(process.cwd(), "../../Singularis - Documents/Design/Art Direction");
const manifestPath = path.join(sourceDirectory, "SIN_IMG_ArtDirection_AssetManifest_v01.json");

const descriptions = [
  [1, "OrbitalVesselAscent", "Orbital vessel ascending above a cloud-covered planet", ["orbital vessel", "ascent", "planet"]],
  [2, "OrbitalCarrierAndEscort", "Orbital carrier traveling with escort craft above a planet", ["orbital carrier", "escort craft", "fleet"]],
  [7, "InterceptorGroundCrew", "Interceptor spacecraft with its ground crew on a landing field", ["interceptor", "ground crew", "landing field"]],
  [8, "OrbitalTransitVessel", "Large transit vessel moving through planetary orbit", ["transit vessel", "planetary orbit", "spacecraft"]],
  [9, "PilotAndInterceptor", "Pilot standing before an interceptor at a flight facility", ["pilot", "interceptor", "flight facility"]],
  [10, "PilotBesideInterceptor", "Pilot beside an interceptor on an active flight line", ["pilot", "interceptor", "flight line"]],
  [11, "CapitalShipOverOcean", "Capital ship crossing above a planetary ocean", ["capital ship", "ocean", "planetary flight"]],
  [12, "CapitalShipInOrbit", "Capital ship and support craft in planetary orbit", ["capital ship", "support craft", "orbit"]],
  [13, "InterceptorRearView", "Rear view of an interceptor with illuminated engines", ["interceptor", "rear view", "engine design"]],
  [14, "InterceptorRunwayProfile", "Profile view of an interceptor prepared on a runway", ["interceptor", "profile", "runway"]],
  [15, "LaunchCeremony", "Public ceremony during the launch of a monumental spacecraft", ["launch", "ceremony", "public gathering"]],
  [16, "CommandHallBriefing", "Uniformed officer addressing a futuristic command hall", ["command hall", "briefing", "officer"]],
  [17, "FleetOperationsBriefing", "Senior officer delivering a fleet operations briefing", ["fleet operations", "briefing", "spacecraft"]],
  [18, "CityLaunchSpectators", "Spectators watching a spacecraft launch from a future city", ["future city", "launch", "spectators"]],
  [19, "FlightDirectorAtPodium", "Flight director speaking at a podium inside a hangar", ["flight director", "podium", "hangar"]],
  [20, "HangarCommandAssembly", "Command assembly gathered around a spacecraft in a vast hangar", ["hangar", "command assembly", "spacecraft"]],
  [21, "OrbitalRingConstruction", "Industrial orbital ring and vessel under construction above a planet", ["orbital ring", "construction", "industrial infrastructure"]],
  [22, "PlanetaryShipyard", "Monumental spacecraft at a planetary shipyard", ["shipyard", "spacecraft", "planetary infrastructure"]],
  [23, "PilotSuitPortraitStudy", "Portrait study of a white and blue Singularis pilot suit", ["pilot suit", "portrait", "costume study"]],
  [24, "PilotSuitFullBodyStudy", "Full-body design study of Singularis pilot suits", ["pilot suit", "full body", "costume study"]],
  [25, "PilotSuitTurnaroundStudy", "Front and back turnaround study of Singularis pilot suits", ["pilot suit", "turnaround", "costume study"]],
  [26, "PilotSuitChestDetail", "Close detail study of a Singularis pilot suit chest assembly", ["pilot suit", "chest detail", "costume study"]],
  [27, "PilotSuitTorsoDetail", "Torso detail study of a Singularis pilot suit", ["pilot suit", "torso detail", "costume study"]],
];

const assets = descriptions.flatMap(([number, descriptionToken, description, keywords]) =>
  ["png", "jpg"].map((extension) => ({
    originalName: `image ${number}.${extension}`,
    filename: `SIN_IMG_${descriptionToken}_v01.${extension}`,
    description,
    keywords,
    role: extension === "png" ? "archival master" : "delivery master",
  })),
);

function xml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function controlledXmp(asset) {
  const title = asset.filename.replace(/\.(png|jpg)$/i, "").replaceAll("_", " ");
  const subjects = ["Singularis", "Cryptic Design", "approved art direction", ...asset.keywords]
    .map((keyword) => `<rdf:li>${xml(keyword)}</rdf:li>`).join("");
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Cryptic Design controlled asset metadata">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${xml(title)}</rdf:li></rdf:Alt></dc:title>
      <dc:description><rdf:Alt><rdf:li xml:lang="x-default">${xml(asset.description)}</rdf:li></rdf:Alt></dc:description>
      <dc:creator><rdf:Seq><rdf:li>Cryptic Design, LLC</rdf:li></rdf:Seq></dc:creator>
      <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">Copyright © 2026 Cryptic Design, LLC. All rights reserved.</rdf:li></rdf:Alt></dc:rights>
      <dc:subject><rdf:Bag>${subjects}</rdf:Bag></dc:subject>
      <xmp:MetadataDate>2026-09-15T00:00:00-05:00</xmp:MetadataDate>
      <xmpRights:Marked>True</xmpRights:Marked>
      <photoshop:Credit>Cryptic Design, LLC</photoshop:Credit>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return chunk;
}

function normalizePngMetadata(input, xmp) {
  const signature = Buffer.from("89504e470d0a1a0a", "hex");
  if (!input.subarray(0, 8).equals(signature)) throw new Error("Invalid PNG signature");
  const output = [signature];
  let offset = 8;
  while (offset < input.length) {
    const length = input.readUInt32BE(offset);
    const type = input.toString("ascii", offset + 4, offset + 8);
    const end = offset + 12 + length;
    const data = input.subarray(offset + 8, offset + 8 + length);
    const isControlledMetadata = type === "eXIf" || (["iTXt", "tEXt", "zTXt"].includes(type) && data.subarray(0, 17).toString("utf8") === "XML:com.adobe.xmp");
    if (type === "IEND") {
      const keyword = Buffer.from("XML:com.adobe.xmp\0\0\0\0\0", "binary");
      output.push(pngChunk("iTXt", Buffer.concat([keyword, Buffer.from(xmp, "utf8")])))
    }
    if (!isControlledMetadata) output.push(input.subarray(offset, end));
    offset = end;
  }
  return Buffer.concat(output);
}

function normalizeJpegMetadata(input, xmp) {
  if (input[0] !== 0xff || input[1] !== 0xd8) throw new Error("Invalid JPEG signature");
  const xmpPayload = Buffer.concat([Buffer.from("http://ns.adobe.com/xap/1.0/\0", "ascii"), Buffer.from(xmp, "utf8")]);
  const xmpSegment = Buffer.alloc(4 + xmpPayload.length);
  xmpSegment[0] = 0xff;
  xmpSegment[1] = 0xe1;
  xmpSegment.writeUInt16BE(xmpPayload.length + 2, 2);
  xmpPayload.copy(xmpSegment, 4);
  const output = [input.subarray(0, 2), xmpSegment];
  let offset = 2;
  while (offset < input.length) {
    if (input[offset] !== 0xff) throw new Error(`Invalid JPEG marker at ${offset}`);
    const marker = input[offset + 1];
    if (marker === 0xda || marker === 0xd9) {
      output.push(input.subarray(offset));
      break;
    }
    const length = input.readUInt16BE(offset + 2);
    const end = offset + 2 + length;
    const payload = input.subarray(offset + 4, end);
    const isExifOrXmp = marker === 0xe1 && (payload.subarray(0, 6).toString("ascii") === "Exif\0\0" || payload.subarray(0, 29).toString("ascii") === "http://ns.adobe.com/xap/1.0/");
    const isIptc = marker === 0xed;
    if (!isExifOrXmp && !isIptc) output.push(input.subarray(offset, end));
    offset = end;
  }
  return Buffer.concat(output);
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function decodedPixels(filePath) {
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  return { hash: sha256(data), width: info.width, height: info.height, channels: info.channels };
}

const presentNames = (await readdir(sourceDirectory)).filter((name) => /^image \d+\.(png|jpg)$/i.test(name));
const expectedNames = new Set(assets.map((asset) => asset.originalName));
const unexpected = presentNames.filter((name) => !expectedNames.has(name));
const missing = assets.filter((asset) => !presentNames.includes(asset.originalName));
if (unexpected.length || missing.length) throw new Error(`Preflight failed. Unexpected: ${unexpected.join(", ") || "none"}. Missing: ${missing.map((asset) => asset.originalName).join(", ") || "none"}.`);

const records = [];
for (const asset of assets) {
  const sourcePath = path.join(sourceDirectory, asset.originalName);
  const destinationPath = path.join(sourceDirectory, asset.filename);
  const temporaryPath = path.join(sourceDirectory, `.${asset.filename}.pending`);
  try {
    await stat(destinationPath);
    throw new Error(`Destination already exists: ${asset.filename}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const source = await readFile(sourcePath);
  const beforeMetadata = await sharp(source).metadata();
  const beforePixels = await decodedPixels(sourcePath);
  const xmp = controlledXmp(asset);
  const normalized = asset.filename.endsWith(".png") ? normalizePngMetadata(source, xmp) : normalizeJpegMetadata(source, xmp);
  await writeFile(temporaryPath, normalized);
  const afterMetadata = await sharp(temporaryPath).metadata();
  const afterPixels = await decodedPixels(temporaryPath);
  if (beforePixels.hash !== afterPixels.hash || beforePixels.width !== afterPixels.width || beforePixels.height !== afterPixels.height || beforePixels.channels !== afterPixels.channels) throw new Error(`Decoded-pixel verification failed for ${asset.originalName}`);
  if (!normalized.includes(Buffer.from(xmp, "utf8"))) throw new Error(`Controlled XMP was not detected for ${asset.originalName}`);
  records.push({
    originalName: asset.originalName,
    filename: asset.filename,
    role: asset.role,
    description: asset.description,
    keywords: asset.keywords,
    width: afterMetadata.width,
    height: afterMetadata.height,
    sourceBytes: source.length,
    normalizedBytes: normalized.length,
    sourceSha256: sha256(source),
    normalizedSha256: sha256(normalized),
    decodedPixelSha256: afterPixels.hash,
    sourceMetadata: { exifBytes: beforeMetadata.exif?.length ?? 0, iccBytes: beforeMetadata.icc?.length ?? 0, xmpBytes: beforeMetadata.xmp?.length ?? 0 },
    normalizedMetadata: { exifBytes: afterMetadata.exif?.length ?? 0, iccBytes: afterMetadata.icc?.length ?? 0, xmpBytes: Buffer.byteLength(xmp, "utf8") },
    pixelVerified: true,
  });
  console.log(`Prepared ${asset.originalName} -> ${asset.filename}`);
}

for (const asset of assets) {
  const sourcePath = path.join(sourceDirectory, asset.originalName);
  const temporaryPath = path.join(sourceDirectory, `.${asset.filename}.pending`);
  await rename(sourcePath, `${sourcePath}.superseded`);
  await rename(temporaryPath, path.join(sourceDirectory, asset.filename));
}

const manifest = {
  schemaVersion: 1,
  collection: "Singularis approved art direction",
  authority: "Approved for use by Robert Keith Croft in Codex on 2026-09-15",
  owner: "Cryptic Design, LLC",
  rights: "Copyright © 2026 Cryptic Design, LLC. All rights reserved.",
  namingStandard: "SIN_[TYPE]_[Description]_[Version]",
  metadataPolicy: "Controlled XMP replaces unapproved EXIF, XMP, and IPTC authoring metadata. Compressed image payloads and decoded pixels remain unchanged.",
  generatedAt: "2026-09-15T00:00:00-05:00",
  assets: records,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
for (const asset of assets) await unlink(path.join(sourceDirectory, `${asset.originalName}.superseded`));

console.log(JSON.stringify({ manifestPath, assetCount: records.length, pixelVerified: records.every((record) => record.pixelVerified) }, null, 2));
