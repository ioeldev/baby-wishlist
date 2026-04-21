import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  CategoryWithItems,
  Item,
  ItemLink,
  LinkPreview,
  NewCategoryInput,
  NewItemInput,
  ReserveItemInput,
  UpdateCategoryInput,
  UpdateItemInput,
} from "../types";

function adminToken() {
  return localStorage.getItem("adminToken") ?? "";
}

async function api<T>(path: string, init?: RequestInit & { admin?: boolean }): Promise<T> {
  const { admin, ...requestInit } = init ?? {};
  const headers: HeadersInit = {
    ...(requestInit.body ? { "Content-Type": "application/json" } : {}),
    ...(admin ? { "x-admin-token": adminToken() } : {}),
    ...requestInit.headers,
  };

  const response = await fetch(path, {
    headers,
    ...requestInit,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      // Keep status fallback.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function useWishlist(admin = false, enabled = true) {
  return useQuery({
    queryKey: ["wishlist", admin ? "admin" : "public"],
    queryFn: () => api<CategoryWithItems[]>(admin ? "/api/admin/items" : "/api/items", { admin }),
    enabled,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api<Category[]>("/api/categories"),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewCategoryInput) =>
      api<Category>("/api/categories", {
        method: "POST",
        admin: true,
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCategoryInput }) =>
      api<Category>(`/api/categories/${id}`, {
        method: "PATCH",
        admin: true,
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api<{ ok: boolean }>(`/api/categories/${id}`, { method: "DELETE", admin: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewItemInput) =>
      api<Item>("/api/items", {
        method: "POST",
        admin: true,
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateItemInput }) =>
      api<Item>(`/api/items/${id}`, {
        method: "PATCH",
        admin: true,
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useReserveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ReserveItemInput }) =>
      api<Item>(`/api/items/${id}/reserve`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useClearReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api<Item>(`/api/items/${id}/reservation`, {
        method: "PATCH",
        admin: true,
        body: JSON.stringify({ clear: true }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api<{ ok: boolean }>(`/api/items/${id}`, { method: "DELETE", admin: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function usePreviewLink() {
  return useMutation({
    mutationFn: (url: string) => api<LinkPreview>(`/api/preview?url=${encodeURIComponent(url)}`),
  });
}

export function useAddItemLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: number; input: Omit<ItemLink, "id" | "item_id" | "created_at"> }) =>
      api<ItemLink>(`/api/items/${itemId}/links`, {
        method: "POST",
        admin: true,
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useDeleteItemLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api<{ ok: boolean }>(`/api/item-links/${id}`, { method: "DELETE", admin: true }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previous = queryClient.getQueriesData<CategoryWithItems[]>({ queryKey: ["wishlist"] });

      for (const [queryKey, data] of previous) {
        if (!data) continue;
        queryClient.setQueryData<CategoryWithItems[]>(
          queryKey,
          data.map(category => ({
            ...category,
            items: category.items.map(item => ({
              ...item,
              links: item.links.filter(link => link.id !== id),
            })),
          })),
        );
      }

      return { previous };
    },
    onError: (_error, _id, context) => {
      for (const [queryKey, data] of context?.previous ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}
