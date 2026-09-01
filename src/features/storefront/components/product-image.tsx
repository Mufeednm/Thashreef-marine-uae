"use client";

import Image from "next/image";
import { useState, type ReactElement } from "react";

const fallbackImage = "/product-images/marine-essential.svg";

export function ProductImage({
  alt,
  className,
  height,
  imageUrl,
  loading,
  priority,
  sizes,
  width,
}: {
  alt: string;
  className?: string;
  height: number;
  imageUrl: string | null | undefined;
  loading?: "eager" | "lazy";
  priority?: boolean;
  sizes?: string;
  width: number;
}): ReactElement {
  const [source, setSource] = useState(imageUrl || fallbackImage);

  return (
    <Image
      alt={alt}
      className={className}
      height={height}
      loading={priority ? undefined : loading}
      onError={() => setSource(fallbackImage)}
      priority={priority}
      sizes={sizes}
      src={source}
      unoptimized={source.startsWith("/")}
      width={width}
    />
  );
}
