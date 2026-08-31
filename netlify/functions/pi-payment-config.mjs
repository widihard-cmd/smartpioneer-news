import { response } from './pi-payment-utils.mjs';

export default async () => response({
  enabled: Boolean(process.env.PI_API_KEY),
  sandbox: process.env.PI_SANDBOX !== 'false',
  pricePi: 0.314,
});
