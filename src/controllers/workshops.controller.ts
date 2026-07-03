import type { CreateWorkshopRegistrationInput, ListWorkshopsQuery } from "../schemaValidation/workshops.schema";
import { workshopsModel } from "../models/workshops.model";

export const workshopsController = {
  listWorkshops(query?: ListWorkshopsQuery) {
    const workshops = workshopsModel.list();
    const filtered = query?.tag ? workshops.filter((workshop) => workshop.tag === query.tag) : workshops;

    return {
      data: filtered,
      total: filtered.length,
    };
  },
  listFeaturedWorkshops() {
    return {
      data: workshopsModel.listFeatured(),
    };
  },
  createRegistration(input: CreateWorkshopRegistrationInput) {
    return workshopsModel.createRegistration(input);
  },
  listRegistrations() {
    return {
      data: workshopsModel.listRegistrations(),
    };
  },
};
