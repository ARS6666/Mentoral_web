import { normalizePhoneNumber } from "./phone";

test.each([
  ["09123456789", "09123456789"],
  ["۰۹۱۲۳۴۵۶۷۸۹", "09123456789"],
  ["٠٩١٢٣٤٥٦٧٨٩", "09123456789"],
  ["۰۹۱۲ ۳۴۵ ۶۷۸۹", "09123456789"],
])("normalizes phone number %s", (input, expected) => {
  expect(normalizePhoneNumber(input)).toBe(expected);
});
