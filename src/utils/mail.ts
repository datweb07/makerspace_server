export const buildMailPayload = (subject: string, body: string) => ({
  subject,
  text: body,
});
