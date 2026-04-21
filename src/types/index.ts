export type ItemLink = {
  id: number;
  item_id: number;
  url: string;
  title: string | null;
  image: string | null;
  shop_name: string | null;
  price: string | null;
  created_at: string;
};

export type Item = {
  id: number;
  category_id: number;
  name: string;
  note: string | null;
  is_checked: boolean;
  is_reserved: boolean;
  reserved_first_name: string | null;
  reserved_last_name: string | null;
  reserved_at: string | null;
  assigned_to: string | null;
  price_estimate: number | null;
  created_at: string;
  updated_at: string;
  links: ItemLink[];
};

export type Category = {
  id: number;
  name: string;
  sort_order: number;
  checked_count: number;
  reserved_count: number;
  total_count: number;
};

export type CategoryWithItems = Category & {
  items: Item[];
};

export type NewCategoryInput = {
  name: string;
  sort_order?: number;
};

export type UpdateCategoryInput = Partial<NewCategoryInput>;

export type LinkPreview = {
  url: string;
  title: string | null;
  image: string | null;
  price: string | null;
  shop_name: string | null;
};

export type NewItemInput = {
  category_id: number;
  name: string;
  note?: string | null;
  assigned_to?: string | null;
  price_estimate?: number | null;
};

export type UpdateItemInput = Partial<NewItemInput>;

export type ReserveItemInput = {
  first_name: string;
  last_name: string;
};
