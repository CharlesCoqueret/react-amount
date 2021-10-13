import {
  getDigitsOnly,
  manageSign,
  truncateValue,
  toStandardSeparator,
  validateNumber,
  commonValidation,
  interpretValue,
  formatInputForDisplay,
  ThousangGroupingStyle,
  formatInputForInput,
} from '../../src/utils/amount-formatter';

it('getDigitsOnly should only return digits', () => {
  expect(getDigitsOnly('-12frewqt34ffdasd.,[{}\'"fsae')).toEqual('1234');
  expect(getDigitsOnly('+frewqtffdasd.,[{}\'"fsae')).toEqual('');
});

it('truncateValue should return the value untouched when decimals is undefined', () => {
  expect(truncateValue('1234.56789', undefined)).toEqual('1234.56789');
  expect(truncateValue('foobar', undefined)).toEqual('foobar');
});

it('truncateValue should return the integer (number only) part of the value when decimals is not finite', () => {
  expect(truncateValue('1234.56789', 1 / 0)).toEqual('1234');
  expect(truncateValue('foo.12bar', 1 / 0)).toEqual('');
  expect(truncateValue('12foo.bar', 1 / 0)).toEqual('12');
});

it('truncateValue should return the number with truncation', () => {
  expect(truncateValue('1234.56789', 0)).toEqual('1234');
  expect(truncateValue('foo.12bar', 2)).toEqual('.12');
  expect(truncateValue('12foo.bar', 2)).toEqual('12.');
  expect(truncateValue('12foobar', 2)).toEqual('12');
});

it('manageSign should maintain a single - sign', () => {
  expect(manageSign('-12')).toEqual(['-', '12']);
  expect(manageSign('12.foo-bar.')).toEqual(['-', '12.foobar.']);
});

it('manageSign should remove any + sign', () => {
  expect(manageSign('12+')).toEqual(['', '12']);
  expect(manageSign('12.foobar+')).toEqual(['', '12.foobar']);
  expect(manageSign('12A+.')).toEqual(['', '12A.']);
});

it('manageSign should remove - sign when they are in an even number', () => {
  expect(manageSign('--+12foobar')).toEqual(['', '12foobar']);
  expect(manageSign('-1-2-+-12foobar')).toEqual(['', '1212foobar']);
  expect(manageSign('112fooba++r2.+')).toEqual(['', '112foobar2.']);
});

it('toStandardSeparator replace the decimal separator and thousand separator', () => {
  expect(toStandardSeparator('12 345,6789', ',', ' ')).toEqual('12345.6789');
  expect(toStandardSeparator('12345.6789', '.', '')).toEqual('12345.6789');
  expect(toStandardSeparator("12'345.6789", '.', "'")).toEqual('12345.6789');
  expect(toStandardSeparator("12'3456789", '.', "'")).toEqual('123456789');
  expect(toStandardSeparator(',', ',', ' ')).toEqual('.');
});

it('validateNumber should exact match number', () => {
  expect(validateNumber(1234)).toEqual(false);
  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  expect(validateNumber(112_233_445_566_778.800_99)).toEqual(false);
  expect(validateNumber('1234')).toEqual(false);
  expect(validateNumber('1234.56789')).toEqual(false);
  expect(validateNumber('-.')).toEqual(false);
  expect(validateNumber('-1234.56789')).toEqual(false);
  expect(validateNumber('.')).toEqual(false);
});

it('validateNumber should best fit the number', () => {
  expect(validateNumber(undefined)).toEqual(true);
  expect(validateNumber(1 / 0)).toEqual(true);
  expect(validateNumber('-1234.567.89')).toEqual(true);
  expect(validateNumber('.-')).toEqual(true);
  expect(validateNumber('-')).toEqual(true);
  expect(validateNumber('-foobar+')).toEqual(true);
  expect(validateNumber('-')).toEqual(true);
});

it('commonValidation should throw error when input are incorrect', () => {
  expect(() => {
    commonValidation('100000', 2, '.', '.');
  }).toThrow('thousandSeparator and decimalSeparator must be different');
  expect(() => {
    commonValidation('100000', 2, ' .', '.');
  }).toThrow('decimalSeparator must be a single character long');
  expect(() => {
    commonValidation('100000', 2, '.', ' . ');
  }).toThrow(
    'thousandSeparator must be either an empty character or a single character long',
  );
  expect(() => {
    commonValidation('100000', 2, ' ', '.');
  }).toThrow('decimalSeparator must be a non blank character');
});

it('commonValidation extract information from input', () => {
  expect(commonValidation('-23.')).toEqual({
    sign: '-',
    integer: '23',
    decimal: undefined,
    approximation: false,
  });

  expect(commonValidation('-23.', 2, '.', ',')).toEqual({
    sign: '-',
    integer: '23',
    decimal: '',
    approximation: false,
  });

  expect(commonValidation('-23', 0, '.', ',')).toEqual({
    sign: '-',
    integer: '23',
    decimal: undefined,
    approximation: false,
  });

  expect(commonValidation('-2 309,43', 2, ',', ' ')).toEqual({
    sign: '-',
    integer: '2309',
    decimal: '43',
    approximation: false,
  });

  expect(commonValidation('3245223,09,43', 2, ',', '')).toEqual({
    sign: '',
    integer: '3245223',
    decimal: '09',
    approximation: true,
  });

  expect(commonValidation('3245223,09,43', 0, ',', ' ')).toEqual({
    sign: '',
    integer: '3245223',
    decimal: undefined,
    approximation: true,
  });

  expect(commonValidation('32452ER23,0TRE9,43', 6, ',', ' ')).toEqual({
    sign: '',
    integer: '3245223',
    decimal: '0943',
    approximation: true,
  });

  expect(commonValidation(undefined, 2, ',', ' ')).toEqual({
    sign: '',
    integer: '',
    decimal: undefined,
    approximation: true,
  });

  expect(commonValidation(',', 2, ',', ' ')).toEqual({
    sign: '',
    integer: '',
    decimal: '',
    approximation: false,
  });
});

it('Basic interpretting', () => {
  expect(interpretValue('1,235', 0, '.', ',')).toEqual('1235');
  expect(interpretValue('1,235')).toEqual('1235');
  expect(interpretValue('1 234,56', 2, ',', ' ')).toEqual('1234.56');
  expect(interpretValue('1234.57', 2, '.', '')).toEqual('1234.57');
  expect(interpretValue('67,00', 2, ',', '.')).toEqual('67.00');
  expect(interpretValue('1,000')).toEqual('1000');
  expect(interpretValue('67.31', 0, '.', ',')).toEqual('67');
  expect(interpretValue('1,000.6', 0, '.', ',')).toEqual('1000');
  expect(interpretValue('67.000,00000', 5, ',', '.')).toEqual('67000.00000');
  expect(interpretValue('1', 0, '.', ',')).toEqual('1');
  expect(interpretValue('1.2345.6789,00000', 5, ',', '.')).toEqual(
    '123456789.00000',
  );
  expect(interpretValue('123456789,00000', 5, ',', '')).toEqual(
    '123456789.00000',
  );
  expect(interpretValue('12.34.56.789,00000', 5, ',', '.')).toEqual(
    '123456789.00000',
  );
  expect(interpretValue('12.34.56.789.00000', 0, '.', ',')).toEqual('12');
  expect(interpretValue('12.34.56.789.000,00', 0, '.', ',')).toEqual('12');
});

it('Errornous formatting', () => {
  expect(interpretValue(undefined)).toEqual('');
  expect(interpretValue(undefined, 2, ',', '')).toEqual('');
  expect(interpretValue('L', 2, ',', '.')).toEqual('');
  expect(interpretValue('L', 2, ',', '')).toEqual('');
  expect(() => {
    interpretValue('100000', 2, '.', '.');
  }).toThrow('thousandSeparator and decimalSeparator must be different');
  expect(() => {
    interpretValue('100000', 2, '.', ' . ');
  }).toThrow(
    'thousandSeparator must be either an empty character or a single character long',
  );
});

it('Basic formatting for display of positive values', () => {
  expect(formatInputForDisplay(1234.56)).toEqual('1,234');
  expect(formatInputForDisplay(1234.56, 2, ',', ' ')).toEqual('1 234,56');
  expect(formatInputForDisplay(1234.5678, 2, '.', '')).toEqual('1234.56');
  expect(formatInputForDisplay(67, 2, ',', '.')).toEqual('67,00');
  expect(formatInputForDisplay(1000)).toEqual('1,000');
  expect(formatInputForDisplay(67.311, 2)).toEqual('67.31');
  expect(formatInputForDisplay(1000.551, 1)).toEqual('1,000.5');
  expect(formatInputForDisplay(67_000, 5, ',', '.')).toEqual('67.000,00000');
  expect(formatInputForDisplay(0.9, 0)).toEqual('0');
  expect(
    formatInputForDisplay(123_456_789, 5, ',', '.', ThousangGroupingStyle.WAN),
  ).toEqual('1.2345.6789,00000');
  expect(
    formatInputForDisplay(123_456_789, 5, ',', '.', ThousangGroupingStyle.LAKH),
  ).toEqual('12.34.56.789,00000');
  expect(formatInputForDisplay(11_223_344_556_677.123, 4, '.', '')).toEqual(
    '11223344556677.1230',
  );
  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  expect(formatInputForDisplay(11_223_344_556_677.1234, 4)).toEqual(
    '11,223,344,556,677.1230',
  );
});

it('Basic formatting for display of negative values', () => {
  expect(formatInputForDisplay(-1234.56)).toEqual('-1,234');
  expect(formatInputForDisplay(-1234.56, 2, ',', ' ')).toEqual('-1 234,56');
  expect(formatInputForDisplay(-1234.5678, 2, '.', '')).toEqual('-1234.56');
  expect(formatInputForDisplay(-67, 2, ',', '.')).toEqual('-67,00');
  expect(formatInputForDisplay(-1000)).toEqual('-1,000');
  expect(formatInputForDisplay(-67.311, 2)).toEqual('-67.31');
  expect(formatInputForDisplay(-1000.551, 1)).toEqual('-1,000.5');
  expect(formatInputForDisplay(-67_000, 5, ',', '.')).toEqual('-67.000,00000');
  expect(formatInputForDisplay(-0.9, 0)).toEqual('0');
  expect(
    formatInputForDisplay(-123_456_789, 5, ',', '.', ThousangGroupingStyle.WAN),
  ).toEqual('-1.2345.6789,00000');
  expect(
    formatInputForDisplay(
      -123_456_789,
      5,
      ',',
      '.',
      ThousangGroupingStyle.LAKH,
    ),
  ).toEqual('-12.34.56.789,00000');

  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  expect(formatInputForDisplay(-11_223_344_556_677.1234, 4)).toEqual(
    '-11,223,344,556,677.1230',
  );
});

it('String formatting for display', () => {
  expect(formatInputForDisplay('1.20', 2)).toEqual('1.20');
  expect(formatInputForDisplay('1.20', 4)).toEqual('1.2000');
  expect(formatInputForDisplay('1.2000', 3)).toEqual('1.200');
  expect(formatInputForDisplay('1234.56')).toEqual('1,234');
  expect(formatInputForDisplay('1234.56', 2, ',', ' ')).toEqual('1 234,56');
  expect(formatInputForDisplay('1234.5678', 2, '.', '')).toEqual('1234.56');
  expect(formatInputForDisplay('67', 2, ',', '.')).toEqual('67,00');
  expect(formatInputForDisplay('1000')).toEqual('1,000');
  expect(formatInputForDisplay('67.311', 2)).toEqual('67.31');
  expect(formatInputForDisplay('1000.551', 1)).toEqual('1,000.5');
  expect(formatInputForDisplay('67000', 5, ',', '.')).toEqual('67.000,00000');
  expect(formatInputForDisplay('0.9', 0)).toEqual('0');
  expect(formatInputForDisplay('-0.01', -1)).toEqual('0.0');
  expect(formatInputForDisplay('11223344556677.12340', 4)).toEqual(
    '11,223,344,556,677.1234',
  );
});

it('Errornous formatting for display', () => {
  expect(formatInputForDisplay(undefined)).toEqual('-');
  expect(formatInputForDisplay(undefined, 2, ',', '')).toEqual('-');
  expect(formatInputForDisplay('L', 2, ',', ' ')).toEqual('-');
  expect(formatInputForDisplay('L', -2, ',', '')).toEqual('-');
  expect(formatInputForDisplay('12.34.56.789.00000')).toEqual('-');
  expect(formatInputForDisplay(1 / 0)).toEqual('-');
  expect(formatInputForDisplay(10, 1 / 0)).toEqual('10');
  expect(
    formatInputForDisplay(
      1 / 0,
      5,
      ',',
      '.',
      ThousangGroupingStyle.THOUSAND,
      '*',
    ),
  ).toEqual('*');

  expect(() => {
    formatInputForDisplay('100000', -2, '.', '.');
  }).toThrow('thousandSeparator and decimalSeparator must be different');
});

it('Basic formatting for input of positive values', () => {
  expect(formatInputForInput(1234.56)).toEqual('1,234');
  expect(formatInputForInput(1234.56, 2, ',', ' ')).toEqual('1 234,56');
  expect(formatInputForInput(1234.5678, 2, '.', '')).toEqual('1234.56');
  expect(formatInputForInput(67, 2, ',', '.')).toEqual('67');
  expect(formatInputForInput(1000)).toEqual('1,000');
  expect(formatInputForInput(67.311, 2)).toEqual('67.31');
  expect(formatInputForInput(1000.551, 1)).toEqual('1,000.5');
  expect(formatInputForInput(67_000, 5, ',', '.')).toEqual('67.000');
  expect(formatInputForInput(0.9, 0)).toEqual('0');
  expect(
    formatInputForInput(123_456_789, 5, ',', '.', ThousangGroupingStyle.WAN),
  ).toEqual('1.2345.6789');
  expect(
    formatInputForInput(123_456_789, 5, ',', '.', ThousangGroupingStyle.LAKH),
  ).toEqual('12.34.56.789');

  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  expect(formatInputForInput(11_223_344_556_677.1234, 4)).toEqual(
    '11,223,344,556,677.123',
  );
});

it('Basic formatting for input of negative values', () => {
  expect(formatInputForInput(-1234.56)).toEqual('-1,234');
  expect(formatInputForInput(-1234.56, 2, ',', ' ')).toEqual('-1 234,56');
  expect(formatInputForInput(-1234.5678, 2, '.', '')).toEqual('-1234.56');
  expect(formatInputForInput(-67, 2, ',', '.')).toEqual('-67');
  expect(formatInputForInput(-1000)).toEqual('-1,000');
  expect(formatInputForInput(-67.311, 2)).toEqual('-67.31');
  expect(formatInputForInput(-1000.551, 1)).toEqual('-1,000.5');
  expect(formatInputForInput(-67_000, 5, ',', '.')).toEqual('-67.000');
  expect(formatInputForInput(-0.9, 0)).toEqual('-0');
  expect(
    formatInputForInput(-123_456_789, 5, ',', '.', ThousangGroupingStyle.WAN),
  ).toEqual('-1.2345.6789');
  expect(
    formatInputForInput(-123_456_789, 5, ',', '.', ThousangGroupingStyle.LAKH),
  ).toEqual('-12.34.56.789');

  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  expect(formatInputForInput(-11_223_344_556_677.1234, 4)).toEqual(
    '-11,223,344,556,677.123',
  );
});

it('String formatting for input of positive values', () => {
  expect(formatInputForInput('1.20', 2)).toEqual('1.20');
  expect(formatInputForInput('1.20', 4)).toEqual('1.20');
  expect(formatInputForInput('1.2000', 3)).toEqual('1.200');
  expect(formatInputForInput('1234.56')).toEqual('1,234');
  expect(formatInputForInput('1234.56', 2, ',', ' ')).toEqual('1 234,56');
  expect(formatInputForInput('1234.5678', 2, '.', '')).toEqual('1234.56');
  expect(formatInputForInput('67', 2, ',', '.')).toEqual('67');
  expect(formatInputForInput('1000')).toEqual('1,000');
  expect(formatInputForInput('67.311', 2)).toEqual('67.31');
  expect(formatInputForInput('1000.551', 1)).toEqual('1,000.5');
  expect(formatInputForInput('67000', 5, ',', '.')).toEqual('67.000');
  expect(formatInputForInput('0.9', 0)).toEqual('0');
  expect(formatInputForInput('11223344556677.12340', 4)).toEqual(
    '11,223,344,556,677.1234',
  );
});

it('String formatting for input of negative values', () => {
  expect(formatInputForInput('-1.20', 2)).toEqual('-1.20');
  expect(formatInputForInput('-1.20', 4)).toEqual('-1.20');
  expect(formatInputForInput('-1.2000', 3)).toEqual('-1.200');
  expect(formatInputForInput('-1234.56')).toEqual('-1,234');
  expect(formatInputForInput('-1234.56', 2, ',', ' ')).toEqual('-1 234,56');
  expect(formatInputForInput('-1234.5678', 2, '.', '')).toEqual('-1234.56');
  expect(formatInputForInput('-67', 2, ',', '.')).toEqual('-67');
  expect(formatInputForInput('-1000')).toEqual('-1,000');
  expect(formatInputForInput('-67.311', 2)).toEqual('-67.31');
  expect(formatInputForInput('-1000.551', 1)).toEqual('-1,000.5');
  expect(formatInputForInput('-67000', 5, ',', '.')).toEqual('-67.000');
  expect(formatInputForInput('-0.9', 0)).toEqual('-0');
  expect(formatInputForInput('-000001.', 2)).toEqual('-000001.');
  expect(formatInputForInput('-11223344556677.12340', 4)).toEqual(
    '-11,223,344,556,677.1234',
  );
  expect(formatInputForInput('12.34.56.789.00000')).toEqual('12');
  expect(formatInputForInput('-12.34.--56.789.00000')).toEqual('-12');
});

it('Errornous formatting for input', () => {
  expect(formatInputForInput(undefined)).toEqual('');
  expect(formatInputForInput(undefined, 2, ',', '')).toEqual('');
  expect(formatInputForInput('L', 2, ',', ' ')).toEqual('');
  expect(formatInputForInput('L', -2, ',', '')).toEqual('');
  expect(formatInputForInput('-')).toEqual('-');

  expect(() => {
    formatInputForInput('100000', -2, '.', '.');
  }).toThrow('thousandSeparator and decimalSeparator must be different');
  expect(() => {
    formatInputForInput('100000', -2, ' .', '.');
  }).toThrow('decimalSeparator must be a single character long');
  expect(() => {
    formatInputForInput('100000', -2, '.', ' . ');
  }).toThrow(
    'thousandSeparator must be either an empty character or a single character long',
  );
});
