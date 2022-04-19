import React, { useState, KeyboardEvent, useEffect, useCallback } from 'react';

import { useRunAfterUpdate } from '../hooks/use-run-after-update';

import {
  formatInputForDisplay,
  formatInputForInput,
  interpretValue,
  ThousandGroupingStyle,
} from '../utils/amount-formatter';

export interface FormattedValues {
  formatted: string;
  float: number;
  raw: string;
}

export interface AmountProps {
  /** Value to be rendered as amount (default: undefined) */
  value?: string | number | undefined;
  /** Field is read only (default: false) */
  readOnly?: boolean;
  /** Field is disabled (default: false) */
  disabled?: boolean;
  /** Field is absent, an only formated value is available (default: false) */
  textOnly?: boolean;
  /** Unique identifier of the field (used as id and key) */
  name: string;
  /** Class to be added to the wrapper of the input field */
  className?: string;
  /** OnChange handler */
  onChange?: (updatedObject: FormattedValues) => void;
  /** Number of decimals (default: 2) */
  decimals?: number;
  /** Decimal separator (default: '.') */
  decimalSeparator?: string;
  /** Thousand separator (default: ',') */
  thousandSeparator?: string;
  /** Thousand style grouping (default: 'thousand') */
  thousandGrouping?: ThousandGroupingStyle;
  /** Value displayed on invalid input in textOnly (default: '-') */
  displayOnInvalid?: string;
  /** Test id */
  dataTestId?: string;
  /** Is field required */
  required?: boolean;
  /** Prefix */
  prefix?: string;
  /** Suffix */
  suffix?: string;
}

const Amount = (props: AmountProps): React.ReactElement => {
  const {
    name,
    value,
    readOnly,
    disabled,
    textOnly,
    className,
    onChange,
    decimals,
    decimalSeparator,
    thousandSeparator,
    thousandGrouping,
    displayOnInvalid,
    dataTestId,
    required,
    prefix,
    suffix,
  } = props;

  /**
   *  Short hands using formatting preferences
   */
  const getUnformattedValue = (value: string | number | undefined): string =>
    interpretValue(value, decimals, decimalSeparator, thousandSeparator);
  const getFormattedValue = useCallback(
    (value: string | number | undefined): string =>
      textOnly
        ? formatInputForDisplay(
            value,
            decimals,
            decimalSeparator,
            thousandSeparator,
            thousandGrouping,
            displayOnInvalid,
          )
        : formatInputForInput(
            value,
            decimals,
            decimalSeparator,
            thousandSeparator,
            thousandGrouping,
          ),
    [
      textOnly,
      decimals,
      decimalSeparator,
      thousandSeparator,
      thousandGrouping,
      displayOnInvalid,
    ],
  );

  /**
   * States: formatted value, focus
   */
  const [formattedValue, setFormattedValue] = useState<string>(
    getFormattedValue(value),
  );

  const [focus, setFocus] = useState<boolean>(false);

  // Initialize value at load time or whenever the value is updated
  useEffect(() => {
    setFormattedValue(getFormattedValue(value));
  }, [value, getFormattedValue]);

  /**
   * Hook managing the recursor position
   */
  const runAfterUpdate = useRunAfterUpdate();

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const input = event.currentTarget;
    const cursor = input.selectionStart;
    const { value } = event.currentTarget;

    const newFormattedValue = getFormattedValue(value);
    const newUnformattedValue = getUnformattedValue(value);

    if (cursor !== null && decimalSeparator) {
      // Check the position of the decimal separator one step before in case of deletion
      const deletion = newFormattedValue.length < formattedValue.length ? 1 : 0;

      // Update the position of the cursor after decimal separator
      if (
        newFormattedValue.slice(0, cursor - deletion).includes(decimalSeparator)
      ) {
        runAfterUpdate(() => {
          input.setSelectionRange(cursor, cursor);
        });
      }

      // Update the position of cursor before decimal separator
      else {
        const newCursor = newFormattedValue.length - value.length + cursor;
        runAfterUpdate(() => {
          input.setSelectionRange(
            Math.max(0, newCursor),
            Math.max(0, newCursor),
          );
        });
      }
    }

    setFormattedValue(newFormattedValue);

    if (onChange) {
      onChange({
        formatted: newFormattedValue,
        float: Number(newUnformattedValue),
        raw: String(newUnformattedValue),
      });
    }
  };

  /**
   * Adjust the position of the cursor before deletion to skip the thousand separator
   * When there is a selection, nothing special
   * If backspace on thousandSeparator, deletion of the digit before it
   * If delete on thousandSeparator, deletion of the digit after it
   *
   * @param event: KeyboardEvent<HTMLInputElement>
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const cursorStart = input.selectionStart;
    const cursorEnd = input.selectionEnd;
    const { value } = event.currentTarget;

    // In case of selection, we do not do anything
    if (cursorStart === null || cursorStart !== cursorEnd) {
      return;
    }

    // Handle backspace
    if ('key' in event && event.key === 'Backspace') {
      // If backspace on thousandSeparator, deletion of the digit before it
      if (
        cursorStart - 1 >= 0 &&
        value[cursorStart - 1] === thousandSeparator
      ) {
        input.setSelectionRange(cursorStart - 1, cursorStart - 1);
      }
    }

    // Handle delete
    else if (
      'key' in event &&
      event.key === 'Delete' && // If delete on thousandSeparator, deletion of the digit after it
      cursorStart + 1 <= value.length &&
      value[cursorStart] === thousandSeparator
    ) {
      input.setSelectionRange(cursorStart + 1, cursorStart + 1);
    }
  };

  if (textOnly)
    return (
      <div className="amount-text-wrapper textonly">{`${
        prefix ? prefix + ' ' : ''
      }${formattedValue}${suffix ? ' ' + suffix : ''}`}</div>
    );

  return (
    <div
      className={`amount-input-wrapper ${focus ? 'focus' : ''} ${
        className ? className : ''
      }`}>
      <div className="prefix">{prefix}</div>
      <input
        key={name}
        type="text"
        id={name}
        autoComplete="off"
        inputMode="decimal"
        value={formattedValue}
        name={name}
        data-testid={dataTestId}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        onChange={handleOnChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setFocus(true);
        }}
        onBlur={() => {
          setFocus(false);
        }}
      />
      <div className="suffix">{suffix}</div>
    </div>
  );
};

Amount.defaultProps = {
  value: undefined,
  readOnly: false,
  disabled: false,
  textOnly: false,
  decimals: 2,
  required: false,
  decimalSeparator: '.',
  thousandSeparator: ',',
  thousandGrouping: ThousandGroupingStyle.THOUSAND,
  displayOnInvalid: '-',
  dataTestId: undefined,
  prefix: undefined,
  suffix: undefined,
};

export default Amount;
