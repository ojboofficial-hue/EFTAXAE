/**
 * Payment Gateway Configuration
 * Supports multiple payment processors and methods
 */

export const PAYMENT_CONFIG = {
  // Primary Payment Processors
  processors: {
    stripe: {
      enabled: false, // Set via .env: VITE_STRIPE_ENABLED=true
      publicKey: '', // Set via .env: VITE_STRIPE_PUBLIC_KEY
      apiUrl: 'https://api.stripe.com/v1',
    },
    paypal: {
      enabled: false, // Set via .env: VITE_PAYPAL_ENABLED=true
      clientId: '', // Set via .env: VITE_PAYPAL_CLIENT_ID
      apiUrl: 'https://api.paypal.com/v1',
    },
    twocheckout: {
      enabled: false, // Set via .env: VITE_2CHECKOUT_ENABLED=true
      merchantCode: '', // Set via .env: VITE_2CHECKOUT_MERCHANT_CODE
      apiUrl: 'https://api.2checkout.com/v1',
    },
    emirates_nbd: {
      enabled: false, // Set via .env: VITE_ENBD_ENABLED=true
      merchantId: '', // Set via .env: VITE_ENBD_MERCHANT_ID
      apiUrl: 'https://api.emiratesnbd.com/payments',
    },
    fabd: {
      enabled: false, // Set via .env: VITE_FABD_ENABLED=true
      merchantId: '', // Set via .env: VITE_FABD_MERCHANT_ID
      apiUrl: 'https://api.fabd.ae/payments',
    },
  },

  // Supported Payment Methods
  paymentMethods: {
    creditCard: {
      enabled: true,
      types: ['Visa', 'Mastercard', 'American Express'],
      requiresThreeDS: true,
      requiresCVV: true,
    },
    debitCard: {
      enabled: true,
      types: ['Visa Debit', 'Mastercard Debit'],
      requiresThreeDS: true,
      requiresCVV: true,
    },
    mobileWallet: {
      enabled: false, // Set via .env: VITE_MOBILE_WALLET_ENABLED=true
      types: ['Apple Pay', 'Google Pay'],
    },
    bankTransfer: {
      enabled: false, // Set via .env: VITE_BANK_TRANSFER_ENABLED=true
      accountHolder: 'Federal Tax Authority',
      accountNumber: '', // Set via .env: VITE_FTA_ACCOUNT_NUMBER
      bankName: 'Emirates Central Bank',
      swiftCode: 'ECBKAEAA',
    },
    installments: {
      enabled: false, // Set via .env: VITE_INSTALLMENTS_ENABLED=true
      providers: ['Tamara', 'Tabby'],
      maxTermMonths: 12,
    },
  },

  // OTP Configuration
  otp: {
    enabled: true,
    provider: 'mock', // mock, twilio, aws-sns, azure (change to twilio for production)
    length: 6,
    expirySeconds: 120,
    maxRetries: 3,
    twilio: {
      accountSid: '', // Set via .env: VITE_TWILIO_ACCOUNT_SID
      authToken: '', // Set via .env: VITE_TWILIO_AUTH_TOKEN
      fromNumber: '', // Set via .env: VITE_TWILIO_FROM_NUMBER
    },
    aws: {
      region: 'me-south-1',
      accessKeyId: '', // Set via .env: VITE_AWS_ACCESS_KEY_ID
      secretAccessKey: '', // Set via .env: VITE_AWS_SECRET_ACCESS_KEY
    },
  },

  // Email Configuration for Receipts
  email: {
    enabled: true,
    provider: 'mock', // mock, sendgrid, aws-ses, gmail (change to sendgrid for production)
    from: 'payments@payaetax.online',
    replyTo: 'support@payaetax.online',
    sendgrid: {
      apiKey: '', // Set via .env: VITE_SENDGRID_API_KEY
    },
    awsSes: {
      region: 'me-south-1',
      source: '', // Set via .env: VITE_AWS_SES_EMAIL
    },
  },

  // Security Configuration
  security: {
    requireSSL: true,
    enablePCI: true,
    enableThreeDS: true,
    tokenizeCards: true,
    encryptionMethod: 'AES-256-GCM',
    certificatePinning: false, // Set via .env: VITE_CERT_PINNING_ENABLED=true
  },

  // VAT-Specific Payment Rules
  vat: {
    minimumAmount: 1, // AED
    maximumAmount: 1000000, // AED
    acceptedCurrencies: ['AED', 'USD'],
    allowedForStatuses: ['Outstanding', 'Overdue'],
    receiptEmailTo: 'fta@payaetax.online',
    receiptCcTo: [], // Additional CC recipients
  },

  // Corporate Tax Payment Rules
  corporateTax: {
    minimumAmount: 100, // AED
    maximumAmount: 5000000, // AED
    acceptedCurrencies: ['AED'],
    allowedForStatuses: ['Outstanding', 'Overdue'],
    receiptEmailTo: 'fta@payaetax.online',
  },

  // Regional Settings (UAE-specific)
  region: {
    country: 'AE',
    currency: 'AED',
    currencySymbol: 'د.إ',
    taxAuthority: 'Federal Tax Authority',
    taxAuthorityCode: 'FTA',
    timezone: 'Asia/Dubai',
    language: 'en',
  },

  // Retry Configuration
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelayMs: 1000,
  },

  // Webhook Configuration
  webhooks: {
    enabled: true,
    secretKey: '', // Set via .env: VITE_WEBHOOK_SECRET
    timeout: 30000, // 30 seconds
    retryAttempts: 5,
    events: [
      'payment.completed',
      'payment.failed',
      'payment.pending',
      'payment.cancelled',
      'payment.refunded',
      'payment.disputed',
    ],
  },

  // Logging and Monitoring
  logging: {
    enabled: true,
    level: 'info', // debug, info, warn, error
    sensitiveDataMasking: true,
    logCardNumbers: false,
    logCVV: false,
  },
};

export function getEnabledPaymentMethods() {
  const enabled = [];
  if (PAYMENT_CONFIG.paymentMethods.creditCard.enabled) enabled.push('creditCard');
  if (PAYMENT_CONFIG.paymentMethods.debitCard.enabled) enabled.push('debitCard');
  if (PAYMENT_CONFIG.paymentMethods.mobileWallet.enabled) enabled.push('mobileWallet');
  if (PAYMENT_CONFIG.paymentMethods.bankTransfer.enabled) enabled.push('bankTransfer');
  if (PAYMENT_CONFIG.paymentMethods.installments.enabled) enabled.push('installments');
  return enabled;
}

export function getEnabledProcessors() {
  const { processors } = PAYMENT_CONFIG;
  const enabled = [];
  if (processors.stripe.enabled) enabled.push('stripe');
  if (processors.paypal.enabled) enabled.push('paypal');
  if (processors.twocheckout.enabled) enabled.push('twocheckout');
  if (processors.emirates_nbd.enabled) enabled.push('emirates_nbd');
  if (processors.fabd.enabled) enabled.push('fabd');
  return enabled;
}

export function validateVATPaymentAmount(amount: number): { valid: boolean; error?: string } {
  const { vat } = PAYMENT_CONFIG;
  if (amount < vat.minimumAmount) return { valid: false, error: `Minimum payment amount is AED ${vat.minimumAmount}` };
  if (amount > vat.maximumAmount) return { valid: false, error: `Maximum payment amount is AED ${vat.maximumAmount}` };
  return { valid: true };
}

export function validateCorporateTaxPaymentAmount(amount: number): { valid: boolean; error?: string } {
  const { corporateTax } = PAYMENT_CONFIG;
  if (amount < corporateTax.minimumAmount) return { valid: false, error: `Minimum payment amount is AED ${corporateTax.minimumAmount}` };
  if (amount > corporateTax.maximumAmount) return { valid: false, error: `Maximum payment amount is AED ${corporateTax.maximumAmount}` };
  return { valid: true };
}
