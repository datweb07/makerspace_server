import type { ServiceQuoteRequestInput } from "../schemaValidation/services.schema";
import { servicesModel } from "../models/services.model";

export const servicesController = {
  listCatalog() {
    return {
      data: servicesModel.listCatalog(),
    };
  },
  createQuoteRequest(input: ServiceQuoteRequestInput) {
    return servicesModel.createQuoteRequest(input);
  },
  listQuoteRequests() {
    return {
      data: servicesModel.listQuoteRequests(),
    };
  },
};
