export const getDigitsOnly = (value: string) => {
  return value.replace(/[^\d]/g, '');
};

/**
 * Truncates the value and eliminating all non digits elements
 *
 * @param value incoming value
 * @param decimals number of decimal to be preserved
 *
 * @returns integer part followed by the decimal separator and the given number of decimals if available
 */
export const truncateValue = (
  value: string,
  decimals: number | undefined
): string => {
  // if value is undefined or decimals or decimalSeparator are not defined, do not do anything
  if (decimals === undefined) {
    return value;
  }

  // Making sure precision is finite and positive
  const precision = !isFinite(Number(decimals)) ? 0 : Math.abs(decimals);

  // Look for the first decimal separator
  const index = value.indexOf('.');

  const integer =
    index >= 0 ? getDigitsOnly(value.slice(0, index)) : getDigitsOnly(value);

  // We have not found the decimalSeparator
  if (index < 0 || precision === 0) {
    return integer;
  }

  // Getting decimal values
  const decimal = getDigitsOnly(value.slice(index + 1)).slice(0, precision);

  // If digits are expected, return the integer and decimal part
  return integer + '.' + decimal;
};

/**
 * If there is an odd number of - sign in value, we add it at the beginning
 * All - or + signs are removed
 *
 * @param value input value
 * @returns [sign, value] sign can be '' or '-'
 */
export const manageSign = (value: string): [string, string] => {
  // Count the number of - sign
  const countMinus = value.match(/-/gi)?.length;

  const sign =
    countMinus === undefined || (countMinus && countMinus % 2 === 0) ? '' : '-';

  return [sign, value.replace(/\-|\+/g, '')];
};
/**
 *
 * @param value
 * @param decimalSeparator
 * @param thousandSeparator
 * @returns
 */
export const toStandardSeparator = (
  value: string,
  decimalSeparator: string,
  thousandSeparator: string
): string => {
  thousandSeparator = thousandSeparator.replace('.', '\\.');
  decimalSeparator = decimalSeparator.replace('.', '\\.');
  return value
    .replace(new RegExp(`${thousandSeparator}`, 'g'), '')
    .replace(new RegExp(`${decimalSeparator}`, 'g'), '.');
};

/**
 *
 * @param number
 * @returns
 */
export const validateNumber = (
  number: number | string | undefined
): boolean => {
  if (number === undefined) {
    return true;
  }

  if (typeof number === 'number') {
    if (!Number.isFinite(number)) {
      return true;
    }
    return false;
  }

  const result = String(number).match(/-?\d*\.\d*|-?\d+/g);
  if (!result || result.length === 0) {
    return true;
  } else if (result.length > 1) {
    return true;
  }
  return result[0] !== number;
};

export enum ThousangGroupingStyle {
  THOUSAND = 'thousand',
  WAN = 'wan',
  LAKH = 'lakh',
}

const defaultDecimals = 0;
const defaultDecimalSeparator = '.';
const defaultThousandSeparator = ',';
const defaultThousandGrouping = ThousangGroupingStyle.THOUSAND;
const defaultDisplayOnInvalid = '-';

export const commonValidation = (
  value: string | number | undefined,
  decimals: number = defaultDecimals,
  decimalSeparator: string = defaultDecimalSeparator,
  thousandSeparator: string = defaultThousandSeparator
): {
  sign: string;
  integer: string;
  decimal: string | undefined;
  approximation: boolean;
} => {
  if (decimalSeparator.trim() === thousandSeparator.trim()) {
    throw Error('thousandSeparator and decimalSeparator must be different');
  }

  if (decimalSeparator.trim() === '') {
    throw Error('decimalSeparator must be a non blank character');
  }

  if (typeof value === 'string') {
    value = toStandardSeparator(value, decimalSeparator, thousandSeparator);
  }

  const approximation = validateNumber(value);

  const [sign, number] = manageSign(String(value));

  const precision = !isFinite(Number(decimals)) ? 0 : Math.abs(decimals);

  const truncatedValue = truncateValue(number, precision);

  const [integer, decimal] = truncatedValue.split('.');

  return { sign, integer, decimal, approximation };
};

export const interpretValue = (
  value: string | number | undefined,
  decimals: number = defaultDecimals,
  decimalSeparator: string = defaultDecimalSeparator,
  thousandSeparator: string = defaultThousandSeparator
): string => {
  const { sign, integer, decimal } = commonValidation(
    value,
    decimals,
    decimalSeparator,
    thousandSeparator
  );

  return sign + integer + (decimal !== undefined ? '.' + decimal : '');
};

export const formatInputForDisplay = (
  value: string | number | undefined,
  decimals: number = defaultDecimals,
  decimalSeparator: string = defaultDecimalSeparator,
  thousandSeparator: string = defaultThousandSeparator,
  thousandGrouping: ThousangGroupingStyle = defaultThousandGrouping,
  displayOnInvalid: string = defaultDisplayOnInvalid
): string => {
  const { sign, integer, decimal, approximation } = commonValidation(
    value,
    decimals,
    decimalSeparator,
    thousandSeparator
  );

  if (approximation) return displayOnInvalid;

  const precision = !isFinite(Number(decimals)) ? 0 : Math.abs(decimals);

  // Apply thousand grouping formatting
  let formattedInteger =
    sign +
    applyThousandSeparator(
      // Trim all 0 on the left
      ltrim(integer),
      thousandSeparator,
      thousandGrouping
    );

  // Trim all 0 on the right
  let formattedDecimal = rtrim(decimal);

  // Handle special -0.000 or -0 case
  if (
    formattedInteger === '-0' &&
    (precision === 0 || formattedDecimal === '')
  ) {
    formattedInteger = '0';
  }

  // Adding decimal formatting
  formattedDecimal =
    precision > 0
      ? decimalSeparator +
        formattedDecimal +
        '0'.repeat(precision - formattedDecimal.length)
      : '';

  return formattedInteger + formattedDecimal;
};

export const formatInputForInput = (
  value: string | number | undefined,
  decimals: number = defaultDecimals,
  decimalSeparator: string = defaultDecimalSeparator,
  thousandSeparator: string = defaultThousandSeparator,
  thousandGrouping: ThousangGroupingStyle = defaultThousandGrouping
): string => {
  const { sign, integer, decimal } = commonValidation(
    value,
    decimals,
    decimalSeparator,
    thousandSeparator
  );

  // Apply thousand grouping formatting
  let formattedInteger =
    sign + applyThousandSeparator(integer, thousandSeparator, thousandGrouping);

  return (
    formattedInteger + (decimal !== undefined ? decimalSeparator + decimal : '')
  );
};

/**
 * Provides the thousand grouping style regex
 *
 * @param thousandsGroupStyle
 * @returns corresponding regex
 */
const getThousandsGroupRegex = (thousandsGroupStyle: ThousangGroupingStyle) => {
  switch (thousandsGroupStyle) {
    case ThousangGroupingStyle.LAKH:
      return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g;
    case ThousangGroupingStyle.WAN:
      return /(\d)(?=(\d{4})+(?!\d))/g;
    case ThousangGroupingStyle.THOUSAND:
      return /(\d)(?=(\d{3})+(?!\d))/g;
  }
};

const ltrim = (inputString: string): string => {
  inputString = inputString.replace(/^0+/g, '') || '';

  if (inputString === '') {
    return '0';
  }

  return inputString;
};

const rtrim = (inputString: string | undefined): string => {
  return inputString?.replace(new RegExp('[0]+$', 'g'), '') || '';
};

const applyThousandSeparator = (
  str: string,
  thousandSeparator: string,
  thousandsGroupStyle: ThousangGroupingStyle
) => {
  const thousandsGroupRegex = getThousandsGroupRegex(thousandsGroupStyle);
  let index = str.search(/[1-9]/);
  index = index === -1 ? str.length : index;
  return (
    str.substring(0, index) +
    str
      .substring(index, str.length)
      .replace(thousandsGroupRegex, '$1' + thousandSeparator)
  );
};
