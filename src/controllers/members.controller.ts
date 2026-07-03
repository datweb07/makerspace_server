import type { MemberRegistrationInput } from "../schemaValidation/members.schema";
import { membersModel } from "../models/members.model";

export const membersController = {
  listRegistrations() {
    return {
      data: membersModel.listRegistrations(),
    };
  },
  createRegistration(input: MemberRegistrationInput) {
    return membersModel.createRegistration(input);
  },
};
