import { NextResponse } from "next/server";
import { readCatalogImage } from "@/infrastructure/catalog/persistent-catalog-image-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ segments: string[] }> },
): Promise<Response> {
  const { segments } = await params;

  try {
    const image = await readCatalogImage(segments);
    if (!image) return NextResponse.json({ message: "Image not found." }, { status: 404 });

    return new Response(image.data, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": image.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Catalog image could not be read", error);
    return NextResponse.json({ message: "Image is temporarily unavailable." }, { status: 500 });
  }
}
