import type { CategoryWithItems, Item } from "../types";

export function getPrimaryItemImageUrl(item: Item) {
  return item.links.find(link => link.image)?.image ?? null;
}

export function findItemInWishlist(
  categories: CategoryWithItems[],
  itemId: number,
): { item: Item; categoryId: number; categoryName: string } | null {
  for (const category of categories) {
    const found = category.items.find(i => i.id === itemId);
    if (found) {
      return { item: found, categoryId: category.id, categoryName: category.name };
    }
  }
  return null;
}
