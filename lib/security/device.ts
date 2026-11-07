export class DeviceCompromisedError extends Error {
  readonly code = 'compromised';

  constructor() {
    super('Purchases are unavailable on a modified device.');
  }
}
