import {
  getPreciseProductImageUrl,
  handleMappedImageError,
  DEFAULT_PRODUCT_IMAGE,
} from "./productImageMapper";

export const DEFAULT_PRODUCT_FALLBACK = DEFAULT_PRODUCT_IMAGE;

export function getProductImageUrl(name?: string): string {
  return getPreciseProductImageUrl(name);
}

export function handleProductImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  handleMappedImageError(e);
}
