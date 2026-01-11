export interface IOTPGenerator {
  generate: (length: number) => string;
}

export type verifyOtpResponse = {
  reason: string;
  isValid: boolean;
};
