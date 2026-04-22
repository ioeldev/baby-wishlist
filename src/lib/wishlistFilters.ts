import type { CategoryWithItems, Item } from "../types";

export function filterCategoriesForView(
  categories: CategoryWithItems[],
  selectedCategoryId: number | "all",
  itemInclude: (item: Item) => boolean,
) {
  return categories
    .filter(category => selectedCategoryId === "all" || category.id === selectedCategoryId)
    .map(category => ({
      ...category,
      items: category.items.filter(itemInclude),
    }))
    .filter(category => category.items.length > 0);
}
