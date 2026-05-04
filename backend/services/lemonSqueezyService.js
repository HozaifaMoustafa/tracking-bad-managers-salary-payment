const LS_BASE = 'https://api.lemonsqueezy.com/v1';

function lsHeaders() {
  return {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
  };
}

async function lsRequest(method, path, body) {
  const res = await fetch(`${LS_BASE}${path}`, {
    method,
    headers: lsHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`LemonSqueezy ${method} ${path} → ${res.status}`);
    err.lsBody = text;
    err.status = 502;
    throw err;
  }
  return res.json();
}

async function createCheckout({ userId, email, name, billingCycle = 'monthly' }) {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  // Resolve variant: prefer cycle-specific var, fall back to generic LEMONSQUEEZY_VARIANT_ID
  const variantId =
    billingCycle === 'annual'
      ? (process.env.LEMONSQUEEZY_VARIANT_ID_ANNUAL || process.env.LEMONSQUEEZY_VARIANT_ID)
      : (process.env.LEMONSQUEEZY_VARIANT_ID_MONTHLY || process.env.LEMONSQUEEZY_VARIANT_ID);

  if (!storeId || !variantId || !process.env.LEMONSQUEEZY_API_KEY) {
    const err = new Error('LemonSqueezy is not configured on this server.');
    err.status = 503;
    throw err;
  }

  const result = await lsRequest('POST', '/checkouts', {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email,
          name: name || email,
          custom: { user_id: String(userId) },
        },
        product_options: {
          redirect_url: `${appUrl}/billing?success=1`,
        },
      },
      relationships: {
        store: { data: { type: 'stores', id: String(storeId) } },
        variant: { data: { type: 'variants', id: String(variantId) } },
      },
    },
  });

  return result.data.attributes.url;
}

// Fetches the customer's self-service portal URL from LemonSqueezy
async function getCustomerPortalUrl(customerId) {
  const result = await lsRequest('GET', `/customers/${customerId}`);
  return result.data.attributes.urls?.customer_portal ?? null;
}

module.exports = { createCheckout, getCustomerPortalUrl };
