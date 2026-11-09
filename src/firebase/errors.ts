const messages: Record<string, string> = {
  'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة.',
  'auth/missing-email': 'أدخل البريد الإلكتروني للمتابعة.',
  'auth/user-not-found': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/wrong-password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/invalid-login-credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/email-already-in-use': 'هذا البريد مرتبط بحساب موجود. يمكنك تسجيل الدخول بدلاً من ذلك.',
  'auth/weak-password': 'كلمة المرور ضعيفة. استخدم ٨ أحرف على الأقل.',
  'auth/missing-password': 'أدخل كلمة المرور للمتابعة.',
  'auth/too-many-requests': 'محاولات كثيرة خلال وقت قصير. حاول بعد قليل.',
  'auth/network-request-failed': 'تعذّر الاتصال. تحقق من اتصالك بالإنترنت وحاول مجدداً.',
  'auth/user-disabled': 'تم تعطيل هذا الحساب. تواصل مع الدعم للمساعدة.',
  'auth/operation-not-allowed': 'تسجيل الدخول بالبريد الإلكتروني غير متاح حالياً.',
  'auth/requires-recent-login': 'أعد تسجيل الدخول ثم حاول مرة أخرى.',
  'auth/expired-action-code': 'انتهت صلاحية الرابط. اطلب رابطاً جديداً.',
  'auth/invalid-action-code': 'الرابط غير صالح أو تم استخدامه من قبل.',
  'auth/account-exists-with-different-credential': 'هذا البريد مرتبط بطريقة دخول مختلفة.',
  'auth/popup-closed-by-user': 'أغلقت نافذة Google قبل إكمال تسجيل الدخول.',
  'auth/popup-blocked': 'منع المتصفح نافذة Google. اسمح بالنوافذ المنبثقة وحاول مرة أخرى.',
  'auth/cancelled-popup-request': 'يوجد طلب تسجيل دخول آخر قيد التنفيذ.',
  'auth/operation-not-supported-in-this-environment': 'تسجيل الدخول عبر Google غير متاح في هذا المتصفح.',
  'auth/internal-error': 'تعذّر إكمال العملية. حاول مرة أخرى.',
  'auth/user-token-expired': 'انتهت صلاحية الجلسة. سجّل الدخول من جديد.',
  'auth/no-current-user': 'تحتاج إلى تسجيل الدخول لإكمال هذه العملية.',
  'auth/multi-factor-auth-required': 'يتطلب الحساب خطوة تحقق إضافية.',
  'auth/unauthorized-continue-uri': 'تعذّر إكمال العملية. حاول لاحقاً.',
  'auth/invalid-continue-uri': 'تعذّر إكمال العملية. حاول لاحقاً.',
};

const fallbackMessage = 'تعذّر إكمال العملية. حاول مرة أخرى.';

export function errorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string') return code;
  }
  return null;
}

export function isErrorCode(error: unknown, ...codes: string[]): boolean {
  const code = errorCode(error);
  return code !== null && codes.includes(code);
}

/** User-facing Arabic message for an error. Codes and internals stay hidden. */
export function authErrorMessage(error: unknown): string {
  const code = errorCode(error);
  if (code && messages[code]) return messages[code];

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'لا يوجد اتصال بالإنترنت. تحقق من الاتصال وحاول مجدداً.';
  }

  return fallbackMessage;
}
