import crypto from "crypto";

interface PaymentDetails {
  amount: number;
  [key: string]: any;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

interface PaymentStrategy {
  process(details: PaymentDetails): Promise<PaymentResult>;
}

class UPIPaymentStrategy implements PaymentStrategy {
  async process(details: PaymentDetails): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 500));
    const transactionId = `UPI${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    return {
      success: true,
      transactionId,
      message: `UPI payment of ₹${details.amount} successful via ${details.upiId || "UPI"}`,
    };
  }
}

class CreditCardPaymentStrategy implements PaymentStrategy {
  async process(details: PaymentDetails): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 700));
    const transactionId = `CC${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    return {
      success: true,
      transactionId,
      message: `Credit card payment of ₹${details.amount} successful`,
    };
  }
}

class NetBankingPaymentStrategy implements PaymentStrategy {
  async process(details: PaymentDetails): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 600));
    const transactionId = `NB${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    return {
      success: true,
      transactionId,
      message: `Net banking payment of ₹${details.amount} successful via ${details.bank || "bank"}`,
    };
  }
}

const strategies: Record<string, PaymentStrategy> = {
  upi: new UPIPaymentStrategy(),
  credit_card: new CreditCardPaymentStrategy(),
  net_banking: new NetBankingPaymentStrategy(),
};

export async function processPayment(
  method: string,
  details: PaymentDetails
): Promise<PaymentResult> {
  const strategy = strategies[method];
  if (!strategy) {
    return { success: false, transactionId: "", message: `Unknown payment method: ${method}` };
  }
  return strategy.process(details);
}
