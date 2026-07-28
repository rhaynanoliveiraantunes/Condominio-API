export const DEFAULT_PRODUCT_IMAGE =
  "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=600";

const PRODUCT_IMAGE_DICTIONARY: Record<string, string> = {
  queijo: "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=600",
  feijao: "https://images.pexels.com/photos/2291345/pexels-photo-2291345.jpeg?auto=compress&cs=tinysrgb&w=600",
  arroz: "https://images.pexels.com/photos/162790/dish-food-rice-corn-162790.jpeg?auto=compress&cs=tinysrgb&w=600",
  detergente: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80",
  sabao: "https://images.unsplash.com/photo-1607006482172-3ba7b6a48f98?auto=format&fit=crop&w=600&q=80",
  cafe: "https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=600",
  leite: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=600",
  azeite: "https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=600",
  oleo: "https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=600",
  carne: "https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=600",
  frango: "https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=600",
  papel: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=600&q=80",
  agua: "https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=600",
  acucar: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
  pao: "https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=600",
  cerveja: "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=600",
  refrigerante: "https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=600",
  macarrao: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600",
  massa: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600",
};

/**
 * Returns a precise, high-quality image URL for product names.
 * Performs normalization (lowercasing, accent stripping, trimming).
 * If the term is unknown or generic (e.g. "Neymar"), returns DEFAULT_SUPERMARKET_IMAGE.
 */
export function getPreciseProductImageUrl(productName?: string): string {
  if (!productName) return DEFAULT_PRODUCT_IMAGE;

  const normalized = productName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  for (const [key, imageUrl] of Object.entries(PRODUCT_IMAGE_DICTIONARY)) {
    if (normalized.includes(key)) {
      return imageUrl;
    }
  }

  return DEFAULT_PRODUCT_IMAGE;
}

export function handleMappedImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
}
