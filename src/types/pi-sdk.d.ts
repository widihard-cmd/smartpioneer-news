interface PiUser {
  uid: string;
  username: string;
}

interface PiAuthResult {
  user: PiUser;
  accessToken: string;
}

interface PiPayment {
  identifier: string;
}

interface PiSdk {
  init: (options: { version: '2.0'; sandbox: boolean }) => Promise<void>;
  authenticate: (scopes: string[], onIncompletePaymentFound: (payment: PiPayment) => void) => Promise<PiAuthResult>;
  createPayment: (payment: { amount: number; memo: string; metadata: { trackId: string } }, callbacks: {
    onReadyForServerApproval: (paymentId: string) => Promise<void>;
    onReadyForServerCompletion: (paymentId: string, txid: string) => Promise<void>;
    onCancel: (paymentId: string) => void;
    onError: (error: unknown, payment?: PiPayment) => void;
  }) => void;
}

interface Window {
  Pi?: PiSdk;
}
