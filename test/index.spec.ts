import { Amount, ThousandGroupingStyle } from '../src/index';

describe('index main export', () => {
  test('should export all references', async () => {
    expect(Amount).toBeTruthy();
    expect(ThousandGroupingStyle).toBeTruthy();
  });
});
