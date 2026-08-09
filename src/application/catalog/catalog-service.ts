import { randomUUID } from "node:crypto";
import type { SessionUser } from "@/domain/auth/user";
import type { Category, CategoryTreeNode, CreateCategoryInput, UpdateCategoryInput } from "@/domain/catalog/category";
import type { CategoryField } from "@/domain/catalog/category-field";
import type { CreateProductInput, Product } from "@/domain/catalog/product";
import type { ProductVariant } from "@/domain/catalog/product-variant";
import type { Brand, DemoStoreRepository, HomepageBanner } from "@/domain/demo-store/demo-store-repository";
import { ensureUniqueSlug, slugify } from "@/shared/utils/slug";

export type CreateProductResult =
  | { ok: true; product: Product }
  | { ok: false; reason: "duplicate-sku" | "invalid-brand" | "invalid-category" | "unauthorized" };

export type CreateCategoryResult =
  { category: Category; ok: true } | { ok: false; reason: "duplicate-category" | "unauthorized" };

type AdminMutationResult = { ok: true } | { ok: false; reason: string };

export async function createProductForAdmin(
  repository: DemoStoreRepository,
  actor: SessionUser | null,
  input: CreateProductInput,
): Promise<CreateProductResult> {
  if (!actor || actor.role !== "admin") {
    return { ok: false, reason: "unauthorized" };
  }

  const existingProducts = await repository.listProducts();
  const hasDuplicateSku = existingProducts.some(
    (product) => product.sku.toLowerCase() === input.sku.toLowerCase(),
  );

  if (hasDuplicateSku) {
    return { ok: false, reason: "duplicate-sku" };
  }

  const categories = await repository.listCategories();
  const selectedCategory = categories.find((category) => category.id === input.categoryId);

  if (!selectedCategory?.parentCategoryId) {
    return { ok: false, reason: "invalid-category" };
  }

  const brands = await repository.listBrands();
  if (!brands.some((brand) => brand.name === input.brand)) {
    return { ok: false, reason: "invalid-brand" };
  }

  const slug = ensureUniqueSlug(
    slugify(input.name),
    existingProducts.map((product) => product.slug),
  );

  const product = await repository.addProduct({
    ...input,
    id: randomUUID(),
    slug,
    createdAt: new Date().toISOString(),
    createdByUserId: actor.id,
  });

  return { ok: true, product };
}

export async function createBrandForAdmin(
  repository: DemoStoreRepository, actor: SessionUser | null, input: Omit<Brand, "id" | "slug">,
): Promise<AdminMutationResult> {
  if (!actor || actor.role !== "admin") return { ok: false, reason: "unauthorized" };
  const brands = await repository.listBrands();
  if (brands.some((brand) => brand.name.toLowerCase() === input.name.trim().toLowerCase())) return { ok: false, reason: "duplicate" };
  await repository.addBrand({ ...input, slug: ensureUniqueSlug(slugify(input.name), brands.map((brand) => brand.slug)) });
  return { ok: true };
}

export async function updateBrandForAdmin(
  repository: DemoStoreRepository, actor: SessionUser | null, id: number, input: Omit<Brand, "id" | "slug">,
): Promise<AdminMutationResult> {
  if (!actor || actor.role !== "admin") return { ok: false, reason: "unauthorized" };
  const brands = await repository.listBrands();
  if (brands.some((brand) => brand.id !== id && brand.name.toLowerCase() === input.name.trim().toLowerCase())) return { ok: false, reason: "duplicate" };
  return (await repository.updateBrand(id, input)) ? { ok: true } : { ok: false, reason: "missing" };
}

export async function deleteBrandForAdmin(repository: DemoStoreRepository, actor: SessionUser | null, id: number): Promise<AdminMutationResult> {
  if (!actor || actor.role !== "admin") return { ok: false, reason: "unauthorized" };
  const [brands, products] = await Promise.all([repository.listBrands(), repository.listProducts()]);
  if (products.some((product) => product.brand === brands.find((brand) => brand.id === id)?.name)) return { ok: false, reason: "in-use" };
  await repository.deleteBrand(id);
  return { ok: true };
}

export async function updateCategoryForAdmin(repository: DemoStoreRepository, actor: SessionUser | null, id: number, input: UpdateCategoryInput): Promise<AdminMutationResult> {
  if (!actor || actor.role !== "admin") return { ok: false, reason: "unauthorized" };
  if (input.parentCategoryId === id) return { ok: false, reason: "self-parent" };
  const categories = await repository.listCategories();
  if (categories.some((category) => category.id !== id && category.name.toLowerCase() === input.name.trim().toLowerCase())) return { ok: false, reason: "duplicate" };
  return (await repository.updateCategory(id, input)) ? { ok: true } : { ok: false, reason: "missing" };
}

export async function deleteCategoryForAdmin(repository: DemoStoreRepository, actor: SessionUser | null, id: number): Promise<AdminMutationResult> {
  if (!actor || actor.role !== "admin") return { ok: false, reason: "unauthorized" };
  const [categories, products] = await Promise.all([repository.listCategories(), repository.listProducts()]);
  if (categories.some((category) => category.parentCategoryId === id) || products.some((product) => product.categoryId === id)) return { ok: false, reason: "in-use" };
  await repository.deleteCategory(id);
  return { ok: true };
}

export async function listCatalogProducts(repository: DemoStoreRepository): Promise<Product[]> {
  const products = await repository.listProducts();

  return [...products].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function createCategoryForAdmin(
  repository: DemoStoreRepository,
  actor: SessionUser | null,
  input: CreateCategoryInput,
): Promise<CreateCategoryResult> {
  if (!actor || actor.role !== "admin") {
    return { ok: false, reason: "unauthorized" };
  }

  const existingCategories = await repository.listCategories();
  const slug = ensureUniqueSlug(
    slugify(input.name),
    existingCategories.map((category) => category.slug),
  );
  const duplicateName = existingCategories.some(
    (category) => category.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
  );

  if (duplicateName) {
    return { ok: false, reason: "duplicate-category" };
  }

  const category = await repository.addCategory({
    ...input,
    slug,
  });

  await Promise.all(
    input.fieldLabels.map((label, index) =>
      repository.addCategoryField({
        categoryId: category.id,
        displayOrder: index + 1,
        fieldKey: slugify(label),
        label,
      }),
    ),
  );

  return { category, ok: true };
}

export async function listCatalogCategories(repository: DemoStoreRepository): Promise<Category[]> {
  return repository.listCategories();
}

export async function listCatalogCategoryTree(
  repository: DemoStoreRepository,
): Promise<CategoryTreeNode[]> {
  return buildCategoryTree(await repository.listCategories());
}

export async function listCatalogAssignableCategories(
  repository: DemoStoreRepository,
): Promise<Category[]> {
  const categories = await repository.listCategories();

  return categories.filter((category) => category.parentCategoryId !== null);
}

export async function listCatalogCategoryFields(
  repository: DemoStoreRepository,
): Promise<CategoryField[]> {
  return repository.listCategoryFields();
}

export async function listCatalogBrands(repository: DemoStoreRepository): Promise<Brand[]> {
  return repository.listBrands();
}

export async function listHomepageBanners(repository: DemoStoreRepository): Promise<HomepageBanner[]> {
  return repository.listHomepageBanners();
}

export async function listCatalogVariants(
  repository: DemoStoreRepository,
): Promise<ProductVariant[]> {
  return repository.listProductVariants();
}

function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const nodes = new Map<number, CategoryTreeNode>();

  for (const category of categories) {
    nodes.set(category.id, {
      ...category,
      children: [],
      depth: 0,
    });
  }

  const roots: CategoryTreeNode[] = [];

  for (const node of nodes.values()) {
    if (node.parentCategoryId && nodes.has(node.parentCategoryId)) {
      const parent = nodes.get(node.parentCategoryId);
      parent?.children.push(node);
      continue;
    }

    roots.push(node);
  }

  function sortAndSetDepth(items: CategoryTreeNode[], depth: number): void {
    items.sort((left, right) => left.displayOrder - right.displayOrder || left.name.localeCompare(right.name));

    for (const item of items) {
      item.depth = depth;
      sortAndSetDepth(item.children, depth + 1);
    }
  }

  sortAndSetDepth(roots, 0);

  return roots;
}
