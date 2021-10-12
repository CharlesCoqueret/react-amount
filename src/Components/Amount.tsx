import React, { useState, KeyboardEvent, useEffect } from 'react';

import { useRunAfterUpdate } from '../hooks/useRunAfterUpdate';

import {
  formatInputForDisplay,
  formatInputForInput,
  interpretValue,
  ThousangGroupingStyle,
} from '../utils/amountFormatter';

export interface FormattedValues {
  formatted: string;
  float: number;
  raw: string;
}

export interface AmountProps {
  /** Value to be rendered as amount (default: undefined) */
  value?: string | number | undefined;
  /** Field is read only (default: false) */
  readonly?: boolean;
  /** Unique identifier of the field (used as id and key)*/
  name: string;
  /** class to be added to the wrapper of the input field */
  className?: string;
  /** onChange handler */
  onChange?: (updatedObject: FormattedValues) => void | Promise<void>;
  /** number of decimals (default: 2) */
  decimals?: number;
  /** decimal separator (default: '.') */
  decimalSeparator?: string;
  /** thousand separator (default: ',') */
  thousandSeparator?: string;
  /** thousand style grouping (default: 'thousand') */
  thousandGrouping?: ThousangGroupingStyle;
  /** value displayed on invalid input in readonly (default: '-') */
  displayOnInvalid?: string;
  /** test id */
  dataTestId?: string;
  /** is field required */
  required?: boolean;
  /** prefix */
  prefix?: string;
  /** suffix */
  suffix?: string;
}

const Amount = (props: AmountProps): React.ReactElement => {
  const {
    name,
    value,
    readonly,
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
  const getFormattedValue = (value: string | number | undefined): string =>
    readonly
      ? formatInputForDisplay(
          value,
          decimals,
          decimalSeparator,
          thousandSeparator,
          thousandGrouping,
          displayOnInvalid
        )
      : formatInputForInput(
          value,
          decimals,
          decimalSeparator,
          thousandSeparator,
          thousandGrouping
        );

  /**
   * States: formatted value, focus
   */
  const [formattedValue, setFormattedValue] = useState<string>(
    getFormattedValue(value)
  );

  const [focus, setFocus] = useState<boolean>(false);

  // Initialize value at load time or whenever the value is updated
  useEffect(() => {
    setFormattedValue(getFormattedValue(value));
  }, [value]);

  /**
   * Hook managing the recursor position
   */
  const runAfterUpdate = useRunAfterUpdate();

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const input = event.currentTarget;
    const cursor = input.selectionStart;
    const value = event.currentTarget.value;

    const newFormattedValue = getFormattedValue(value);
    const newUnformattedValue = getUnformattedValue(value);

    if (cursor !== null && decimalSeparator) {
      // check the position of the decimal separator one step before in case of deletion
      const deletion = newFormattedValue.length < formattedValue.length ? 1 : 0;

      // Update the position of cursor before decimal separator
      if (
        !newFormattedValue
          .slice(0, cursor - deletion)
          .includes(decimalSeparator)
      ) {
        const newCursor = newFormattedValue.length - value.length + cursor;
        runAfterUpdate(() => {
          input.setSelectionRange(
            Math.max(0, newCursor),
            Math.max(0, newCursor)
          );
        });
      }

      // Update the position of the cursor after decimal separator
      else {
        runAfterUpdate(() => {
          input.setSelectionRange(cursor, cursor);
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
    const value = event.currentTarget.value;

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
    else if ('key' in event && event.key === 'Delete') {
      // If delete on thousandSeparator, deletion of the digit after it
      if (
        cursorStart + 1 <= value.length &&
        value[cursorStart] === thousandSeparator
      ) {
        input.setSelectionRange(cursorStart + 1, cursorStart + 1);
      }
    }
  };

  return (
    <div
      className={`input-wrapper ${focus ? 'focus' : ''} ${
        readonly ? 'readonly' : ''
      } ${className ? className : ''}`}
    >
      <div className="prefix">{prefix}</div>
      <input
        type="text"
        key={name}
        id={name}
        autoComplete="off"
        value={formattedValue}
        name={name}
        onChange={handleOnChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setFocus(true);
        }}
        onBlur={() => {
          setFocus(false);
        }}
        data-testid={dataTestId}
        readOnly={readonly}
        required={required}
        size={readonly ? formattedValue.length - 1 : undefined}
      />

      <div className="suffix">{suffix}</div>
    </div>
  );
};

Amount.defaultProps = {
  value: undefined,
  readonly: false,
  decimals: 2,
  required: false,
  decimalSeparator: '.',
  thousandSeparator: ',',
  thousandGrouping: ThousangGroupingStyle.THOUSAND,
  displayOnInvalid: '-',
  dataTestId: undefined,
  prefix: undefined,
  suffix: undefined,
};

export default Amount;
