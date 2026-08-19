import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { getServerEnvironment } from "@/config/env";

const catalogImageDirectorySchema = z.enum(["brands", "categories", "products"]);
const catalogImageFileNameSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i);
const catalogImagePathSchema = z.object({
  directory: catalogImageDirectorySchema,
  fileName: catalogImageFileNameSchema,
});

type CatalogImageDirectory = z.infer<typeof catalogImageDirectorySchema>;

const imageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const imageContentTypes = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

function getUploadsRoot(): string {
  const configuredDirectory = getServerEnvironment().CATALOG_UPLOADS_DIRECTORY;
  if (configuredDirectory) return path.resolve(configuredDirectory);

  return path.join(
    process.env.NODE_ENV === "production" ? homedir() : path.join(process.cwd(), "data"),
    "catalog-uploads",
  );
}

export async function persistCatalogImage(
  file: File | null,
  directory: CatalogImageDirectory,
): Promise<string | undefined> {
  if (!file || file.size === 0) return undefined;
  const extension = imageExtensions[file.type as keyof typeof imageExtensions];
  if (!extension) return undefined;

  const directoryPath = path.join(getUploadsRoot(), directory);
  await mkdir(directoryPath, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directoryPath, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${directory}/${fileName}`;
}

export async function readCatalogImage(segments: string[]): Promise<
  | { contentType: string; data: ArrayBuffer }
  | undefined
> {
  const parsed = catalogImagePathSchema.safeParse({
    directory: segments[0],
    fileName: segments[1],
  });
  if (!parsed.success || segments.length !== 2) return undefined;

  const extension = parsed.data.fileName.split(".").at(-1) as keyof typeof imageContentTypes;
  try {
    const file = await readFile(path.join(getUploadsRoot(), parsed.data.directory, parsed.data.fileName));
    const data = new Uint8Array(file.byteLength);
    data.set(file);
    return { contentType: imageContentTypes[extension], data: data.buffer };
  } catch (error) {
    if (isFileNotFoundError(error)) return undefined;
    throw error;
  }
}

function isFileNotFoundError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
