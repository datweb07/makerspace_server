import type { ContactInquiryInput } from "../schemaValidation/contacts.schema";
import { contactsModel } from "../models/contacts.model";

export const contactsController = {
  getContactDetails() {
    return contactsModel.getDetails();
  },
  listInquiries() {
    return {
      data: contactsModel.listInquiries(),
    };
  },
  createInquiry(input: ContactInquiryInput) {
    return contactsModel.createInquiry(input);
  },
};
