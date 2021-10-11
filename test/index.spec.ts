import { Amount, ThousangGroupingStyle } from '../src/index';

describe('index main export', () => {
  test('should export all references', async () => {
    // Les méthodes publiques de `utils` sont maintenant des fonctions simulées
    expect(Amount).toBeTruthy();
    expect(ThousangGroupingStyle).toBeTruthy();
  });
});
