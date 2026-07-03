import type { MemberRegistrationInput } from "../schemaValidation/members.schema";

const memberRegistrations: MemberRegistrationInput[] = [];

export const membersModel = {
  listRegistrations() {
    return memberRegistrations;
  },
  createRegistration(input: MemberRegistrationInput) {
    memberRegistrations.push(input);
    return input;
  },
};
