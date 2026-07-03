import type { ContactInquiryInput } from "../schemaValidation/contacts.schema";

const contactDetails = {
  address: "Cơ sở B, 279 Nguyễn Tri Phương, Phường 5, Quận 10, TP. Hồ Chí Minh",
  hotline: "0123 456 789",
  email: "makerspace@ueh.edu.vn",
  workHours: "Thứ 2 - Thứ 6: 08:00 - 17:00",
};

const contactInquiries: ContactInquiryInput[] = [];

export const contactsModel = {
  getDetails() {
    return contactDetails;
  },
  listInquiries() {
    return contactInquiries;
  },
  createInquiry(input: ContactInquiryInput) {
    contactInquiries.push(input);
    return input;
  },
};
