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

/**
 * Remove all non digits characters from a string
 *
 * @param value incomin string
 *
 * @returns string with only digits
 */
export const getDigitsOnly = (value: string) => {
  return value.replace(/\D/g, '');
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
  decimals: number | undefined,
): string => {
  // If value is undefined or decimals or decimalSeparator are not defined, do not do anything
  if (decimals === undefined) {
    return value;
  }

  // Making sure precision is finite and positive
  const precision = Number.isFinite(Number(decimals)) ? Math.abs(decimals) : 0;

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

  return [sign, value.replace(/[+-]/g, '')];
};

/**
 * Converts a string with custom decimal and thousand separators to standard.
 *
 * @param value incoming value
 * @param decimalSeparator custom decimal separator
 * @param thousandSeparator custom thousand separator
 *
 * @returns string with standard separator
 */
export const toStandardSeparator = (
  value: string,
  decimalSeparator: string,
  thousandSeparator: string,
): string => {
  thousandSeparator = thousandSeparator.replace('.', '\\.');
  decimalSeparator = decimalSeparator.replace('.', '\\.');
  return value
    .replace(new RegExp(`${thousandSeparator}`, 'g'), '')
    .replace(new RegExp(`${decimalSeparator}`, 'g'), '.');
};

/**
 * Provides the thousand grouping style regex
 *
 * @param thousandsGroupStyle
 *
 * @returns corresponding regex
 */
const getThousandsGroupRegex = (thousandsGroupStyle: ThousangGroupingStyle) => {
  switch (thousandsGroupStyle) {
    case ThousangGroupingStyle.LAKH:
      return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g;
    case ThousangGroupingStyle.WAN:
      return /(\d)(?=(\d{4})+(?!\d))/g;
    case ThousangGroupingStyle.THOUSAND:
    default:
      return /(\d)(?=(\d{3})+(?!\d))/g;
  }
};

/**
 * Trim zeros on the left, leaving one if the trimmed version is an empty string
 *
 * @param value incoming string
 *
 * @returns value trimmed on the left of its zeros
 */
const ltrim = (value: string | undefined): string => {
  value = value?.replace(/^0+/g, '') ?? '';

  if (value === '') {
    return '0';
  }

  return value;
};

/**
 * Trim zeros on the right
 *
 * @param value incoming value
 *
 * @returnsvalue trimmed on the right of its zeros
 */
const rtrim = (value: string | undefined): string => {
  return value?.replace(/0+$/g, '') ?? '';
};

/**
 * Apply thousand separator to the incoming value
 *
 * @param value incoming value
 * @param thousandSeparator custom thousandSeparator
 * @param thousandsGroupStyle custom thousand grouping style
 *
 * @returns formatted value to custom thousand grouping style
 */
const applyThousandSeparator = (
  value: string,
  thousandSeparator: string,
  thousandsGroupStyle: ThousangGroupingStyle,
) => {
  const thousandsGroupRegex = getThousandsGroupRegex(thousandsGroupStyle);
  let index = value.search(/[1-9]/);
  index = index === -1 ? value.length : index;
  return (
    value.slice(0, Math.max(0, index)) +
    value
      .slice(index, value.length)
      .replace(thousandsGroupRegex, '$1' + thousandSeparator)
  );
};

/**
 * Indicates if the value is valid
 *
 * @param value incoming value
 *
 * @returns boolean indicating that the value is valid or approximated
 */
export const validateNumber = (value: number | string | undefined): boolean => {
  if (value === undefined) {
    return true;
  }

  if (typeof value === 'number') {
    return !Number.isFinite(value);
  }

  const result = String(value).match(/-?\d*\.\d*|-?\d+/g);
  if (!result || result.length === 0) {
    return true;
  }

  if (result.length > 1) {
    return true;
  }

  return result[0] !== value;
};

/**
 * Extracts sign, integer and decimal part and flag if approximated
 *
 * @param value incoming value
 * @param decimals number of decimal digits expected
 * @param decimalSeparator custom decimal separator
 * @param thousandSeparator custom decimal separator
 *
 * @throws errors:
 *  - 'decimalSeparator must be a single character long'
 *  - 'thousandSeparator must be either an empty character or a single character long'
 *  - 'decimalSeparator must be a non blank character'
 *  - 'thousandSeparator and decimalSeparator must be different'
 *
 * @returns Object with sign, integer and decimal values and approximation
 */
export const commonValidation = (
  value: string | number | undefined,
  decimals: number = defaultDecimals,
  decimalSeparator: string = defaultDecimalSeparator,
  thousandSeparator: string = defaultThousandSeparator,
): {
  sign: string;
  integer: string;
  decimal: string | undefined;
  approximation: boolean;
} => {
  if (decimalSeparator.length !== 1) {
    throw new Error('decimalSeparator must be a single character long');
  }

  if (thousandSeparator.length > 1) {
    throw new Error(
      'thousandSeparator must be either an empty character or a single character long',
    );
  }

  if (decimalSeparator.replace(/\s/g, '') === '') {
    throw new Error('decimalSeparator must be a non blank character');
  }

  if (decimalSeparator === thousandSeparator) {
    throw new Error('thousandSeparator and decimalSeparator must be different');
  }

  if (typeof value === 'string') {
    value = toStandardSeparator(value, decimalSeparator, thousandSeparator);
  }

  const approximation = validateNumber(value);

  const [sign, number] = manageSign(String(value));

  const precision = Number.isFinite(Number(decimals)) ? Math.abs(decimals) : 0;

  const truncatedValue = truncateValue(number, precision);

  const [integer, decimal] = truncatedValue.split('.');

  return { sign, integer, decimal, approximation };
};

/**
 * Builds string from the incoming value
 *
 * @param value incoming value
 * @param decimals number of decimal digits
 * @param decimalSeparator custom decimal separator
 * @param thousandSeparator custom thousand separator
 *
 * @returns signle intepreted string as standard js number
 */
export const interpretValue = (
  value: string | number | undefined,
  decimals: number = defaultDecimals,
  decimalSeparator: string = defaultDecimalSeparator,
  thousandSeparator: string = defaultThousandSeparator,
): string => {
  const { sign, integer, decimal } = commonValidation(
    value,
    decimals,
    decimalSeparator,
    thousandSeparator,
  );

  return sign + integer + (decimal === undefined ? '' : '.' + decimal);
};

/**
 *  Format incoming value for display only
 *
 * @param value incoming value
 * @param decimals number of decimal digits
 * @param decimalSeparator custom decimal separator
 * @param thousandSeparator custom thousand separator
 * @param thousandGrouping custom thousand grouping style
 * @param displayOnInvalid display on invalid character
 *
 * @returns formatted incoming value for display
 */
export const formatInputForDisplay = (
  value: string | number | undefined,
  decimals: number = defaultDecimals,
  decimalSeparator: string = defaultDecimalSeparator,
  thousandSeparator: string = defaultThousandSeparator,
  thousandGrouping: ThousangGroupingStyle = defaultThousandGrouping,
  displayOnInvalid: string = defaultDisplayOnInvalid,
): string => {
  const { sign, integer, decimal, approximation } = commonValidation(
    value,
    decimals,
    decimalSeparator,
    thousandSeparator,
  );

  if (approximation) return displayOnInvalid;

  const precision = Number.isFinite(Number(decimals)) ? Math.abs(decimals) : 0;

  // Apply thousand grouping formatting
  let formattedInteger =
    sign +
    applyThousandSeparator(
      // Trim all 0 on the left
      ltrim(integer),
      thousandSeparator,
      thousandGrouping,
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

/**
 *  Format incoming value for input only
 *
 * @param value incoming value
 * @param decimals number of decimal digits
 * @param decimalSeparator custom decimal separator
 * @param thousandSeparator custom thousand separator
 * @param thousandGrouping custom thousand grouping style
 *
 * @returns formatted incoming value for input
 */
export const formatInputForInput = (
  value: string | number | undefined,
  decimals: number = defaultDecimals,
  decimalSeparator: string = defaultDecimalSeparator,
  thousandSeparator: string = defaultThousandSeparator,
  thousandGrouping: ThousangGroupingStyle = defaultThousandGrouping,
): string => {
  const { sign, integer, decimal } = commonValidation(
    value,
    decimals,
    decimalSeparator,
    thousandSeparator,
  );

  // Apply thousand grouping formatting
  const formattedInteger =
    sign + applyThousandSeparator(integer, thousandSeparator, thousandGrouping);

  return (
    formattedInteger + (decimal === undefined ? '' : decimalSeparator + decimal)
  );
};
