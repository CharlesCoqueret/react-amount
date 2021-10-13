import { Amount, ThousangGroupingStyle } from '../src/index';

describe('index main export', () => {
  test('should export all references', async () => {
    expect(Amount).toBeTruthy();
    expect(ThousangGroupingStyle).toBeTruthy();
  });
});
