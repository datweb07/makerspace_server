import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from "../schemaValidation/products.schema";
import { productsModel } from "../models/products.model";

export const productsController = {
  async listProducts(query: ListProductsQuery, lang: string = "vi") {
    const products = await productsModel.list(lang);
    const filtered = query?.category ? products.filter((product) => product.category === query.category) : products;

    return {
      data: filtered,
      total: filtered.length,
    };
  },
  async listCategories(lang: string = "vi") {
    return {
      data: await productsModel.listCategories(lang),
    };
  },
  async createCategory(input: { name: string; slug?: string }, lang: string = "vi") {
    return {
      data: await productsModel.addCategory(input, lang),
    };
  },
  async getProductById(id: number, lang: string = "vi") {
    return await productsModel.findById(id, lang);
  },
  async createProduct(input: CreateProductInput, lang: string = "vi") {
    return await productsModel.create(input, lang);
  },
  async updateProduct(id: number, input: UpdateProductInput, lang: string = "vi") {
    return await productsModel.update(id, input, lang);
  },
  async deleteProduct(id: number, lang: string = "vi") {
    return await productsModel.delete(id, lang);
  },
  async getCategoryById(id: number, lang: string = "vi") {

  },
  async updateCategory(id: number, input: { name: string; slug?: string }, lang: string = "vi") {
    return await productsModel.updateCategory(id, input, lang);
  },
  async deleteCategory(id: number, lang: string = "vi") {
    return await productsModel.deleteCategory(id, lang);
  },
  async toggleCategoryDraft(id: number, draft: boolean, lang: string = "vi") {
    return await productsModel.toggleCategoryDraft(id, draft, lang);
  },
  async toggleItemDraft(id: number, draft: boolean, lang: string = "vi") {
    return await productsModel.toggleItemDraft(id, draft, lang);
  },
};
