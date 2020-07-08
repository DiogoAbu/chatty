import { TFunction } from 'i18next';

export function humanizeEmailError(error: Record<string, string> | undefined, t: TFunction): string {
  if (error?.isNotEmpty) {
    return t('error.emailEmpty');
  }

  if (error?.isEmail) {
    return t('error.invalid.email');
  }

  if (error?.length) {
    const length = error.length.split(',');

    const min = parseInt(length[0], 10);
    const max = parseInt(length[1], 10);

    if (min && max) {
      return t('error.inputLength', { min, max });
    }
    if (min) {
      return t('error.inputShort', { count: min });
    }
    if (max) {
      return t('error.inputLong', { count: max });
    }
    return t('error.invalid.email');
  }

  return '';
}

export function humanizePasswordError(error: Record<string, string> | undefined, t: TFunction): string {
  if (error?.isNotEmpty) {
    return t('error.passwordEmpty');
  }

  if (error?.isPassword) {
    return t('error.invalid.password');
  }

  if (error?.length) {
    const length = error.length.split(',');

    const min = parseInt(length[0], 10);
    const max = parseInt(length[1], 10);

    if (min && max) {
      return t('error.inputLength', { min, max });
    }
    if (min) {
      return t('error.inputShort', { count: min });
    }
    if (max) {
      return t('error.inputLong', { count: max });
    }
    return t('error.invalid.password');
  }

  return '';
}
