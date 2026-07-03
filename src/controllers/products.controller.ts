import type { CreateProductInput, ListProductsQuery } from "../schemaValidation/products.schema";
import { productsModel } from "../models/products.model";

export const productsController = {
  listProducts(query?: ListProductsQuery) {
    const products = productsModel.list();
    const filtered = query?.category ? products.filter((product) => product.category === query.category) : products;

    return {
      data: filtered,
      total: filtered.length,
    };
  },
  listCategories() {
    return {
      data: productsModel.listCategories(),
    };
  },
  getProductById(id: number) {
    return productsModel.findById(id);
  },
  createProduct(input: CreateProductInput) {
    return productsModel.create(input);
  },
};
