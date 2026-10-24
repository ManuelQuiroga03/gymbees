import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Inicializar cliente de Mercado Pago con el Access Token
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

export const mpClient = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 7000,
  },
});

export interface CreatePreferenceParams {
  orderNumber: string;
  items: Array<{
    title: string;
    unit_price: number;
    quantity: number;
    picture_url?: string;
  }>;
  customer: {
    email: string;
    fullName: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    postalCode: string;
    city?: string;
    state?: string;
  };
  shippingCost?: number;
  discountAmount?: number;
}

export async function createMercadoPagoPreference(params: CreatePreferenceParams) {
  const preference = new Preference(mpClient);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Si hay costo de envío, lo añadimos como concepto
  const preferenceItems = params.items.map((item, index) => ({
    id: `item-${index + 1}`,
    title: item.title,
    unit_price: item.unit_price,
    quantity: item.quantity,
    currency_id: 'MXN',
    picture_url: item.picture_url,
  }));

  if (params.shippingCost && params.shippingCost > 0) {
    preferenceItems.push({
      id: 'shipping-express',
      title: 'Costo de Envío Express Nacional (DHL / Estafeta)',
      unit_price: params.shippingCost,
      quantity: 1,
      currency_id: 'MXN',
      picture_url: undefined,
    });
  }

  // Dividir nombre completo para Mercado Pago
  const nameParts = params.customer.fullName.trim().split(' ');
  const firstName = nameParts[0] || 'Cliente';
  const lastName = nameParts.slice(1).join(' ') || 'Gymbees';

  const response = await preference.create({
    body: {
      items: preferenceItems,
      payer: {
        name: firstName,
        surname: lastName,
        email: params.customer.email,
        phone: {
          area_code: '52',
          number: params.customer.phone.replace(/\D/g, '').slice(0, 10),
        },
        address: {
          street_name: params.shippingAddress.street,
          zip_code: params.shippingAddress.postalCode,
        },
      },
      back_urls: {
        success: `${appUrl}/orden/${params.orderNumber}?status=approved`,
        failure: `${appUrl}/checkout?status=failed&order=${params.orderNumber}`,
        pending: `${appUrl}/orden/${params.orderNumber}?status=pending`,
      },
      auto_return: 'approved',
      external_reference: params.orderNumber,
      statement_descriptor: 'GYMBEES MEX',
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      payment_methods: {
        excluded_payment_types: [],
        installments: 12, // Permite hasta 12 cuotas
      },
    },
  });

  return {
    id: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point,
  };
}

export async function getMercadoPagoPayment(paymentId: string | number) {
  const payment = new Payment(mpClient);
  return await payment.get({ id: String(paymentId) });
}
