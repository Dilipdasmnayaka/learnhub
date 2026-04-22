import crypto from "crypto";
import qrcode from "qrcode";

interface PaymentDetails {
  amount: number;
  courseId?: number;
  [key: string]: any;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
  paymentUrl?: string;
  qrCodeDataUrl?: string;
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

class QRCodePaymentStrategy implements PaymentStrategy {
  private getBaseUrl() {
    // Prefer externally reachable URL (ngrok / production), fallback to local for dev
    const configured =
      process.env["NGROK_URL"] ||
      process.env["PUBLIC_APP_URL"] ||
      process.env["FRONTEND_URL"];

    return (configured ?? "http://localhost:5173").replace(/\/$/, "");
  }

  async process(details: PaymentDetails): Promise<PaymentResult> {
    try {
      const transactionId = `QR${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
      const baseUrl = this.getBaseUrl();

      const paymentUrl = `${baseUrl}/payment/${transactionId}?amount=${details.amount}&courseId=${details.courseId ?? ""}`;
      const qrCodeDataUrl = await qrcode.toDataURL(paymentUrl);

      // Helpful for debugging end-to-end QR flow
      console.log("[QR] Payment URL:", paymentUrl);

      await new Promise((r) => setTimeout(r, 1000));

      return {
        success: true,
        transactionId,
        paymentUrl,
        qrCodeDataUrl,
        message: `QR code generated`,
      };

      /* Production code with ngrok:
      const ngrokUrl = await this.initializeNgrok();
      const transactionId = `QR${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

      // Create payment URL with transaction details
      const paymentUrl = `${ngrokUrl}/payments/payment/${transactionId}?amount=${details.amount}`;

      // Generate QR code
      const qrCodeDataUrl = await qrcode.toDataURL(paymentUrl);

      return {
        success: true,
        transactionId,
        message: `QR code payment of ₹${details.amount} successful. QR Code: ${qrCodeDataUrl}`,
      };
      */
    } catch (error) {
      console.error("QR Code generation error:", error);
      return {
        success: false,
        transactionId: "",
        message: `QR code generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

const strategies: Record<string, PaymentStrategy> = {
  upi: new UPIPaymentStrategy(),
  credit_card: new CreditCardPaymentStrategy(),
  net_banking: new NetBankingPaymentStrategy(),
  qr_code: new QRCodePaymentStrategy(),
};

export async function processPayment(
  method: string,
  details: PaymentDetails,
): Promise<PaymentResult> {
  const strategy = strategies[method];
  if (!strategy) {
    return {
      success: false,
      transactionId: "",
      message: `Unknown payment method: ${method}`,
    };
  }
  return strategy.process(details);
}
