# React component supporting the following

[![GitHub open issues](https://img.shields.io/github/issues/CharlesCoqueret/react-amount?style=flat-square)](https://github.com/CharlesCoqueret/react-amount/issues)
[![MIT](https://img.shields.io/npm/l/react-amount?style=flat-square)](https://github.com/CharlesCoqueret/react-amount/blob/master/LICENSE.txt)
[![Coverage Status](https://coveralls.io/repos/github/CharlesCoqueret/react-amount/badge.svg?branch=master)](https://coveralls.io/github/CharlesCoqueret/react-amount?branch=master)

## Installation

```
yarn add react-amount
```

or

```
npm install react-amount
```

## Usage

```typescript
import React, { useState } from 'react';
import Amount from 'react-amount';

import '~/react-amount/dist/style/index.min.css';

interface MyComponentProps {
  value: string | number | undefined;
}

const MyComponent = (props: MyComponentProps): React.Element => {
  const { value } = props;

  const [currentValue, setCurrentValue] = useState(value);

  return (
    <Amount
      value={currentValue}
      suffix="€"
      onChange={(newValue) => setCurrentValue(newValue.float)}
    />
  );
};

export default MyComponent;
```

## Options

|      Option       |                         Type                         | Default value | Description                                       |
| :---------------: | :--------------------------------------------------: | :-----------: | ------------------------------------------------- |
|       value       |                   string \| number                   |   undefined   | Initial value of the control                      |
|     readonly      |                       boolean                        |     false     | Value is not editable                             |
|       name        |                        string                        |   mandatory   | Name of the input field                           |
|     className     |                        string                        |   undefined   | Class to be added to the wrapper of the component |
|     onChange      |          (update: FormattedValues) => void           |   undefined   | Callback function to handle value changes         |
|     decimals      |                        number                        |       2       | Number of decimals                                |
| decimalSeparator  |                        string                        |       .       | Decimal separator                                 |
| thousandSeparator |                        string                        |       ,       | Thousand separator                                |
| thousandGrouping  | ThousangGroupingStyle: "thousand" \| "wan" \| "lakh" |   thousand    | Thousand grouping style                           |
| displayOnInvalid  |                        string                        |       -       | Value displayed on invalid input in readonly      |
|    dataTestId     |                        string                        |   undefined   | Id value for testing                              |
|     required      |                       boolean                        |     false     | Required of the input field                       |
|      prefix       |                        string                        |   undefined   | Prefix                                            |
|      suffix       |                        string                        |   undefined   | Suffix                                            |

## Contributing

We very much welcome contributions.

- Submit [GitHub issues](http://github.com/CharlesCoqueret/react-amount/issues) to report bugs or ask questions.
- Propose [Pull Request](http://github.com/CharlesCoqueret/react-amount/pulls) to improve our code.
