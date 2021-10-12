import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import Amount, { AmountProps } from '../../src/Components/Amount';
import { ThousangGroupingStyle } from '../../src/utils/amountFormatter';

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

  test('should display a readonly value', async () => {
    renderAmount({ readonly: true });

    const inputField = screen.getByTestId('reactAmount');
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveAttribute('type', 'text');
    expect(inputField).toHaveAttribute('readOnly');
    expect(inputField).toHaveValue('-');
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
    renderAmount({ onChange: onChange });

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
      float: 1234567.89,
      raw: '1234567.89',
    });

    userEvent.type(inputField, '5');
    expect(inputField).toHaveValue('1,234,567.89');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1,234,567.89',
      float: 1234567.89,
      raw: '1234567.89',
    });
  });

  test('user types valid values to the amount field in mixed Lakh format with European format', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange: onChange,
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
      float: 12345678.9,
      raw: '12345678.90',
    });
  });

  test('user types backspace or delete on empty field', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange: onChange,
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
      onChange: onChange,
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
      float: 12345678.9,
      raw: '12345678.90',
    });

    userEvent.type(inputField, '{arrowleft}{arrowleft}{backspace}');
    expect(inputField).toHaveValue('12 3456 7890');
    expect(onChange).toHaveBeenCalledTimes(12);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12 3456 7890',
      float: 1234567890,
      raw: '1234567890',
    });
  });

  test('user types delete on decimal separator', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange: onChange,
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
      float: 12345678.9,
      raw: '12345678.90',
    });

    userEvent.type(inputField, '{arrowleft}{arrowleft}{arrowleft}{delete}');
    expect(inputField).toHaveValue('12 3456 7890');
    expect(onChange).toHaveBeenCalledTimes(12);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12 3456 7890',
      float: 1234567890,
      raw: '1234567890',
    });
  });

  test('user types backspace on thousand separator', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange: onChange,
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12,345,678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345,678.90',
      float: 12345678.9,
      raw: '12345678.90',
    });

    userEvent.type(
      inputField,
      '{arrowleft}{arrowleft}{arrowleft}{arrowleft}{arrowleft}{arrowleft}{backspace}'
    );
    expect(inputField).toHaveValue('1,234,678.90');
    expect(onChange).toHaveBeenCalledTimes(12);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1,234,678.90',
      float: 1234678.9,
      raw: '1234678.90',
    });
  });

  test('user types delete on thousand separator', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange: onChange,
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12,345,678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345,678.90',
      float: 12345678.9,
      raw: '12345678.90',
    });

    userEvent.type(
      inputField,
      '{arrowleft}{arrowleft}{arrowleft}{arrowleft}{arrowleft}{arrowleft}{arrowleft}{delete}'
    );
    expect(inputField).toHaveValue('1,234,578.90');
    expect(onChange).toHaveBeenCalledTimes(12);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '1,234,578.90',
      float: 1234578.9,
      raw: '1234578.90',
    });
  });

  test('user types delete on digits causing thousand separator to disappear', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange: onChange,
    });

    const inputField = screen.getByTestId('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12,345,678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345,678.90',
      float: 12345678.9,
      raw: '12345678.90',
    });

    userEvent.type(
      inputField,
      '{arrowleft}{arrowleft}{arrowleft}{backspace}{backspace}{backspace}'
    );
    expect(inputField).toHaveValue('12,345.90');
    expect(onChange).toHaveBeenCalledTimes(14);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345.90',
      float: 12345.9,
      raw: '12345.90',
    });
  });

  test('user types delete on a selection', async () => {
    const onChange = jest.fn();
    renderAmount({
      onChange: onChange,
    });

    const inputField = screen.getByTestId<HTMLInputElement>('reactAmount');

    userEvent.type(inputField, '12345678.90');
    expect(inputField).toHaveValue('12,345,678.90');
    expect(onChange).toHaveBeenCalledTimes(11);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '12,345,678.90',
      float: 12345678.9,
      raw: '12345678.90',
    });

    inputField.setSelectionRange(8, 13);
    userEvent.type(inputField, '{delete}');
    expect(inputField).toHaveValue('123,456');
    expect(onChange).toHaveBeenCalledTimes(12);
    expect(onChange).toHaveBeenLastCalledWith({
      formatted: '123,456',
      float: 123456,
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
      <Amount name="reactAmount" dataTestId="reactAmount" onChange={onChange} />
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
        onChange={onChange}
        value="4567"
      />
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
        className={'reactAmountClass'}
      />
    );
    expect(container.firstChild).toHaveClass('input-wrapper');
    expect(container.firstChild).toHaveClass('reactAmountClass');
    expect(container.firstChild).not.toHaveClass('focus');
    expect(container.firstChild).not.toHaveClass('readonly');

    const inputField = screen.getByTestId('reactAmount');

    userEvent.click(inputField);
    expect(container.firstChild).toHaveClass('input-wrapper');
    expect(container.firstChild).toHaveClass('reactAmountClass');
    expect(container.firstChild).toHaveClass('focus');
    expect(container.firstChild).not.toHaveClass('readonly');

    userEvent.click(container);
    expect(container.firstChild).toHaveClass('input-wrapper');
    expect(container.firstChild).toHaveClass('reactAmountClass');
    expect(container.firstChild).not.toHaveClass('focus');
    expect(container.firstChild).not.toHaveClass('readonly');
  });

  test('Wrapper should have readonly class', async () => {
    const { container } = render(
      <Amount name="reactAmount" dataTestId="reactAmount" readonly />
    );
    expect(container.firstChild).toHaveClass('input-wrapper');
    expect(container.firstChild).toHaveClass('readonly');
    expect(container.firstChild).not.toHaveClass('focus');

    const inputField = screen.getByTestId('reactAmount');

    userEvent.click(inputField);
    expect(container.firstChild).toHaveClass('input-wrapper');
    expect(container.firstChild).toHaveClass('readonly');
    expect(container.firstChild).toHaveClass('focus');

    userEvent.click(container);
    expect(container.firstChild).toHaveClass('input-wrapper');
    expect(container.firstChild).toHaveClass('readonly');
    expect(container.firstChild).not.toHaveClass('focus');
  });
});
