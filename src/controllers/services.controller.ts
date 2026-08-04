import type { ServiceQuoteRequestInput } from "../schemaValidation/services.schema";
import { servicesModel } from "../models/services.model";

export const servicesController = {
  listCatalog() {
    return {
      data: servicesModel.listCatalog(),
    };
  },
  createQuoteRequest(input: ServiceQuoteRequestInput, lang: string = "vi") {
    return servicesModel.createQuoteRequest(input, lang);
  },
  async listQuoteRequests(lang: string = "vi") {
    return {
      data: await servicesModel.listQuoteRequests(lang),
    };
  },
  async deleteQuoteRequest(id: string, lang: string = "vi") {
    return servicesModel.deleteQuoteRequest(id, lang);
  }
};
