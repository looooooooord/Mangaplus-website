/**
 * حسابات المطوّرين: أضف بريد الحساب في هذه القائمة ليظهر شعار «مطوّر» الذهبي
 * على صفحة الحساب. يمكن أيضاً ضبط VITE_DEVELOPER_EMAILS وقت البناء بقائمة
 * بريد مفصولة بفواصل، دون تعديل الكود.
 */
export const DEVELOPER_EMAILS: string[] = [];

const extraEmails = (import.meta.env.VITE_DEVELOPER_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const developerEmails = new Set([
  ...DEVELOPER_EMAILS.map((email) => email.trim().toLowerCase()),
  ...extraEmails,
]);

export function isDeveloperEmail(email: string | null | undefined): boolean {
  return Boolean(email) && developerEmails.has(String(email).trim().toLowerCase());
}
