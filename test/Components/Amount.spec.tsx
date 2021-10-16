import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import Amount, { AmountProps } from '../../src/Components/Amount';
import { ThousangGroupingStyle } from '../../src/utils/amount-formatter';

const renderAmount = (props: Partial<AmountProps> = {}) => {
  const defaultProps: AmountProps = {
    /** Unique identifier of the field */
    name: 'reactAmount',
    /** Unique identifier of the field */
    dataTestId: 'reactAmount',
  };
  return render(<Amount {...defaultProps} {...props} />);
};

describe('<Amount />', () => {
  test('should display an input field of text type', async () => {
    renderAmount();
    const inputField = screen.getByTestId('reactAmount');
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveAttribute('type', 'text');
    expect(inputField).toHaveValue('');
  });

  test('should display a textonly value', async () => {
    const { container } = renderAmount({ textOnly: true });

    const field = container.firstChild;
    expect(field).toBeInTheDocument();
    expect(field).toHaveClass('amount-text-wrapper');
    expect(field).toHaveClass('textonly');
    expect(field).toHaveTextContent('-');
  });

  test('should display a value required', async () => {
    renderAmount({
      required: true,
    });

    const inputField = screen.getByTestId('reactAmount');
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveAttribute('type', 'text');
    expect(inputField).toHaveAttribute('required');
    expect(inputField).toHaveValue('');
  });

  test('user types valid values to the amount field in US format', async () => {
    const onChange = jest.fn();
    renderAmount({ onChange });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '1234');
    expect(inputField).toHaveValue('1,234');
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1,234',
      float: 1234,
      raw: '1234',
    });

    userEvent.type(inputField, '567.89');
    expect(inputField).toHaveValue('1,234,567.89');
    expect(onChange).toHaveBeenCalledTimes(10);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1,234,567.89',
      float: 1_234_567.89,
      raw: '1234567.89',
    });

    userEvent.type(inputField, '5');
    expect(inputField).toHaveValue('1,234,567.89');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1,234,567.89',
      float: 1_234_567.89,
      raw: '1234567.89',
    });
  });

  test('user types valid values to the amount field in mixed Lakh format with European format', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
      decimalSeparator: ',',
      thousandSeparator: ' ',
      thousandGrouping: ThousangGroupingStyle.LAKH,
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('1 23 45 678,90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1 23 45 678,90',
      float: 12_345_678.9,
      raw: '12345678.90',
    });
  });

  test('user types very long series of digits', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
    });

    const inputField = screen.getByTestId<HTMLInputElement>('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12,345,678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345,678.90',
      float: 12_345_678.9,
      raw: '12345678.90',
    });

    userEvent.type(inputField, '{arrowleft}'.repeat(4) + '9'.repeat(10));
    expect(inputField).toHaveValue('123,456,799,999,999,998.90');
    expect(onChange).toHaveBeenCalledTimes(21);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '123,456,799,999,999,998.90',
      // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
      float: 123_456_799_999_999_998.9,
      raw: '123456799999999998.90',
    });
  });

  test('user types backspace or delete on empty field', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
      decimalSeparator: ',',
      thousandSeparator: ' ',
      thousandGrouping: ThousangGroupingStyle.WAN,
    });

    const inputField = screen.getByTestId('reactAmount');

    // User hist backspace
    userEvent.type(inputField, '{backspace}');
    expect(inputField).toHaveValue('');
    expect(onChange).toHaveBeenCalledTimes(0);

    // User hist delete
    userEvent.type(inputField, '{delete}');
    expect(inputField).toHaveValue('');
    expect(onChange).toHaveBeenCalledTimes(0);
  });

  test('user types backspace on decimal separator', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
      decimalSeparator: ',',
      thousandSeparator: ' ',
      thousandGrouping: ThousangGroupingStyle.WAN,
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('1234 5678,90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1234 5678,90',
      float: 12_345_678.9,
      raw: '12345678.90',
    });

    userEvent.type(inputField, '{arrowleft}{arrowleft}{backspace}');
    expect(inputField).toHaveValue('12 3456 7890');
    expect(onChange).toHaveBeenCalledTimes(12);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12 3456 7890',
      float: 1_234_567_890,
      raw: '1234567890',
    });
  });

  test('user types delete on decimal separator', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
      decimalSeparator: ',',
      thousandSeparator: ' ',
      thousandGrouping: ThousangGroupingStyle.WAN,
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('1234 5678,90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1234 5678,90',
      float: 12_345_678.9,
      raw: '12345678.90',
    });

    userEvent.type(inputField, '{arrowleft}'.repeat(3) + '{delete}');
    expect(inputField).toHaveValue('12 3456 7890');
    expect(onChange).toHaveBeenCalledTimes(12);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12 3456 7890',
      float: 1_234_567_890,
      raw: '1234567890',
    });
  });

  test('user types backspace on thousand separator', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12,345,678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345,678.90',
      float: 12_345_678.9,
      raw: '12345678.90',
    });

    userEvent.type(inputField, '{arrowleft}'.repeat(6) + '{backspace}');
    expect(inputField).toHaveValue('1,234,678.90');
    expect(onChange).toHaveBeenCalledTimes(12);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1,234,678.90',
      float: 1_234_678.9,
      raw: '1234678.90',
    });
  });

  test('user types delete on thousand separator', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12,345,678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345,678.90',
      float: 12_345_678.9,
      raw: '12345678.90',
    });

    userEvent.type(inputField, '{arrowleft}'.repeat(7) + '{delete}');
    expect(inputField).toHaveValue('1,234,578.90');
    expect(onChange).toHaveBeenCalledTimes(12);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1,234,578.90',
      float: 1_234_578.9,
      raw: '1234578.90',
    });
  });

  test('user types backspace on digits causing thousand separator to disappear', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12,345,678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345,678.90',
      float: 12_345_678.9,
      raw: '12345678.90',
    });

    userEvent.type(
      inputField,
      '{arrowleft}'.repeat(3) + '{backspace}'.repeat(3),
    );
    expect(inputField).toHaveValue('12,345.90');
    expect(onChange).toHaveBeenCalledTimes(14);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345.90',
      float: 12_345.9,
      raw: '12345.90',
    });
  });

  test('user types backspace on digits causing thousand empty separator', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
      thousandSeparator: '',
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12345678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12345678.90',
      float: 12_345_678.9,
      raw: '12345678.90',
    });

    userEvent.type(
      inputField,
      '{arrowleft}'.repeat(6) + '{backspace}'.repeat(3),
    );
    expect(inputField).toHaveValue('12678.90');
    expect(onChange).toHaveBeenCalledTimes(14);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12678.90',
      float: 12_678.9,
      raw: '12678.90',
    });
  });

  test('user types delete on digits causing thousand empty separator', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
      thousandSeparator: '',
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12345678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12345678.90',
      float: 12_345_678.9,
      raw: '12345678.90',
    });

    userEvent.type(inputField, '{arrowleft}'.repeat(10) + '{delete}'.repeat(3));
    expect(inputField).toHaveValue('15678.90');
    expect(onChange).toHaveBeenCalledTimes(14);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '15678.90',
      float: 15_678.9,
      raw: '15678.90',
    });
  });

  test('user types delete on a selection', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange,
    });

    const inputField = screen.getByTestId<HTMLInputElement>('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12,345,678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345,678.90',
      float: 12_345_678.9,
      raw: '12345678.90',
    });

    inputField.setSelectionRange(8, 13);
    userEvent.type(inputField, '{delete}');
    expect(inputField).toHaveValue('123,456');
    expect(onChange).toHaveBeenCalledTimes(12);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '123,456',
      float: 123_456,
      raw: '123456',
    });
  });

  test('user types when there is no onChange callback', async () => {
    const onChange = jest.fn();
    renderAmount({ onChange: undefined });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '1234');
    expect(inputField).toHaveValue('1,234');
    expect(onChange).toHaveBeenCalledTimes(0);
  });

  test('developper updates the initial value programmatically', async () => {
    const onChange = jest.fn();

    const { rerender } = render(
      <Amount
        name="reactAmount"
        dataTestId="reactAmount"
        onChange={onChange}
      />,
    );

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '1');
    expect(inputField).toHaveValue('1');
    expect(onChange).toHaveBeenCalledTimes(1);

    userEvent.type(inputField, '2');
    expect(inputField).toHaveValue('12');
    expect(onChange).toHaveBeenCalledTimes(2);

    userEvent.type(inputField, '3');
    expect(inputField).toHaveValue('123');
    expect(onChange).toHaveBeenCalledTimes(3);

    userEvent.type(inputField, '4');
    expect(inputField).toHaveValue('1,234');
    expect(onChange).toHaveBeenCalledTimes(4);

    rerender(
      <Amount
        name="reactAmount"
        dataTestId="reactAmount"
        value="4567"
        onChange={onChange}
      />,
    );
    expect(inputField).toHaveValue('4,567');
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  test('user types when there is no onChange callback', async () => {
    const onChange = jest.fn();
    renderAmount({ onChange: undefined });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '1234');
    expect(inputField).toHaveValue('1,234');
    expect(onChange).toHaveBeenCalledTimes(0);
  });

  test('Wrapper should have focus class after click on the input', async () => {
    const { container } = render(
      <Amount
        name="reactAmount"
        dataTestId="reactAmount"
        className="reactAmountClass"
      />,
    );
    expect(container.firstChild).toHaveClass('amount-input-wrapper');
    expect(container.firstChild).toHaveClass('reactAmountClass');
    expect(container.firstChild).not.toHaveClass('focus');
    expect(container.firstChild).not.toHaveClass('textonly');

    const inputField = screen.getByTestId('reactAmount');

    userEvent.click(inputField);
    expect(container.firstChild).toHaveClass('amount-input-wrapper');
    expect(container.firstChild).toHaveClass('reactAmountClass');
    expect(container.firstChild).toHaveClass('focus');
    expect(container.firstChild).not.toHaveClass('textonly');

    userEvent.click(container);
    expect(container.firstChild).toHaveClass('amount-input-wrapper');
    expect(container.firstChild).toHaveClass('reactAmountClass');
    expect(container.firstChild).not.toHaveClass('focus');
    expect(container.firstChild).not.toHaveClass('textonly');
  });

  test('Wrapper should have textonly class', async () => {
    const { container } = render(
      <Amount textOnly name="reactAmount" dataTestId="reactAmount" />,
    );
    expect(container.firstChild).toHaveClass('amount-text-wrapper');
    expect(container.firstChild).toHaveClass('textonly');
    expect(container.firstChild).not.toHaveClass('focus');

    expect(container.firstElementChild).toBeDefined();

    userEvent.click(container.firstElementChild!);
    expect(container.firstChild).toHaveClass('amount-text-wrapper');
    expect(container.firstChild).toHaveClass('textonly');
    expect(container.firstChild).not.toHaveClass('focus');

    userEvent.click(container);
    expect(container.firstChild).toHaveClass('amount-text-wrapper');
    expect(container.firstChild).toHaveClass('textonly');
    expect(container.firstChild).not.toHaveClass('focus');
  });

  test('Wrapper should have textonly class', async () => {
    const { container } = render(
      <Amount
        textOnly
        name="reactAmount"
        prefix="prefix"
        suffix="suffix"
        value="1234.5"
        dataTestId="reactAmount"
      />,
    );
    expect(container.firstChild).toHaveClass('amount-text-wrapper');
    expect(container.firstChild).toHaveClass('textonly');
    expect(container.firstChild).not.toHaveClass('focus');
    expect(container.firstChild).toHaveTextContent('prefix 1,234.50 suffix');
  });
});
