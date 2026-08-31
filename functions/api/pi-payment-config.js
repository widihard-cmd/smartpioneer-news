import { PRICE_PI, response } from '../_lib/pi-payment.js';

export async function onRequestGet({ env }) {
  return response({ enabled: Boolean(env.PI_API_KEY), sandbox: env.PI_SANDBOX !== 'false', pricePi: PRICE_PI });
}
