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
  amount?: number;
  metadata?: { trackId?: string };
  transaction?: { txid: string; verified?: boolean } | null;
  status?: {
    developer_approved?: boolean;
    transaction_verified?: boolean;
    developer_completed?: boolean;
    cancelled?: boolean;
    user_cancelled?: boolean;
  };
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
