export const DEFAULT_PRODUCT_FALLBACK =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  feijao: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80",
  arroz: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  detergente: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80",
  sabaot: "https://images.unsplash.com/photo-1607006482172-3ba7b6a48f98?auto=format&fit=crop&w=600&q=80",
  cafe: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
  leite: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
  azeite: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
  oleo: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
  carne: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80",
  papel: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=600&q=80",
  agua: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
  acucar: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
};

export function getProductImageUrl(name?: string): string {
  if (!name) return DEFAULT_PRODUCT_FALLBACK;
  const cleanName = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  for (const [key, url] of Object.entries(PRODUCT_IMAGE_MAP)) {
    if (cleanName.includes(key)) {
      return url;
    }
  }

  return `https://source.unsplash.com/featured/?${encodeURIComponent(name)}`;
}

export function handleProductImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.src = DEFAULT_PRODUCT_FALLBACK;
}
