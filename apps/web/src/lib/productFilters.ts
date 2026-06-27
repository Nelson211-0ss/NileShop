export interface ProductBrowseFilters {
  q?: string;
  category_id?: string;
  brand_id?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  direction?: string;
  is_featured?: string;
}

const FILTER_KEYS = [
  'q',
  'category_id',
  'brand_id',
  'min_price',
  'max_price',
  'sort',
  'direction',
  'is_featured',
] as const;

export function parseProductFilters(params: URLSearchParams): ProductBrowseFilters {
  const filters: ProductBrowseFilters = {};

  FILTER_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) filters[key] = value;
  });

  if (params.get('featured') === '1') {
    filters.is_featured = '1';
  }

  return filters;
}

export function buildProductFilterParams(filters: ProductBrowseFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.q?.trim()) params.q = filters.q.trim();
  if (filters.category_id) params.category_id = filters.category_id;
  if (filters.brand_id) params.brand_id = filters.brand_id;
  if (filters.min_price) params.min_price = filters.min_price;
  if (filters.max_price) params.max_price = filters.max_price;
  if (filters.sort) params.sort = filters.sort;
  if (filters.direction) params.direction = filters.direction;
  if (filters.is_featured === '1') params.is_featured = '1';

  return params;
}

export function countActiveFilters(filters: ProductBrowseFilters): number {
  let count = 0;
  if (filters.category_id) count += 1;
  if (filters.brand_id) count += 1;
  if (filters.min_price) count += 1;
  if (filters.max_price) count += 1;
  if (filters.is_featured === '1') count += 1;
  if (filters.sort && filters.sort !== 'created_at') count += 1;
  return count;
}
