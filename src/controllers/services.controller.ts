import type { ServiceQuoteRequestInput } from "../schemaValidation/services.schema";
import { servicesModel } from "../models/services.model";
import { sendServiceQuoteEmail, sendServiceQuoteAdminEmail } from "../utils/mail";

export const servicesController = {
  listCatalog() {
    return {
      data: servicesModel.listCatalog(),
    };
  },
  async createQuoteRequest(input: ServiceQuoteRequestInput, lang: string = "vi") {
    const result = await servicesModel.createQuoteRequest(input, lang);
    try {
      await Promise.all([
        sendServiceQuoteEmail(input.email, input.fullName),
        sendServiceQuoteAdminEmail(input)
      ]);
    } catch (error) {
      console.error("Failed to send service quote email:", error);
    }
    return result;
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
