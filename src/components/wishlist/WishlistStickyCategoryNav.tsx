type Category = { id: number; name: string };

type Props<T extends string> = {
  categories: Category[];
  allLabel: string;
  selectedCategoryId: number | "all";
  onSelectCategory: (id: number | "all") => void;
  filterOptions: Array<{ id: T; label: string }>;
  selectedFilter: T;
  onSelectFilter: (id: T) => void;
};

const categoryActive =
  "shrink-0 whitespace-nowrap rounded-[10px] px-[18px] py-2 text-[13px] font-semibold transition border border-transparent bg-gradient-to-br from-[oklch(68%_0.16_295)] to-[oklch(52%_0.20_295)] text-white shadow-[0_4px_14px_oklch(52%_0.20_295_/_0.3)]";
const categoryIdle =
  "shrink-0 whitespace-nowrap rounded-[10px] px-[18px] py-2 text-[13px] font-semibold transition border-[1.5px] border-[oklch(80%_0.12_295)] bg-white text-[oklch(38%_0.18_295)]";

const filterActive =
  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition border border-transparent bg-[oklch(92%_0.07_295)] text-[oklch(38%_0.18_295)]";
const filterIdle =
  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition border-[1.5px] border-[oklch(92%_0.07_295)] bg-transparent text-[oklch(62%_0.08_295)]";

export function WishlistStickyCategoryNav<T extends string>({
  categories,
  allLabel,
  selectedCategoryId,
  onSelectCategory,
  filterOptions,
  selectedFilter,
  onSelectFilter,
}: Props<T>) {
  return (
    <nav className="sticky top-0 z-20 -mx-4 mb-4 grid gap-3 border-b border-[oklch(92%_0.07_295)] bg-[oklch(97.5%_0.018_295_/_0.95)] py-3 backdrop-blur-xl sm:-mx-6">
      <div className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={selectedCategoryId === "all" ? categoryActive : categoryIdle}
        >
          {allLabel}
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className={selectedCategoryId === category.id ? categoryActive : categoryIdle}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 px-4 sm:px-6">
        {filterOptions.map(option => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelectFilter(option.id)}
            className={selectedFilter === option.id ? filterActive : filterIdle}
          >
            {option.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
