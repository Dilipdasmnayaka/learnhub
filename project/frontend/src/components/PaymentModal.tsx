import React, { useState } from 'react';
import { Modal, Button, Input, useToast } from './ui';
import { useProcessPayment } from '@workspace/api-client-react';
import { getAuthHeaders } from '@/lib/auth';
import confetti from 'canvas-confetti';
import { CreditCard, Smartphone, Banknote, ShieldCheck } from 'lucide-react';
import { useLocation } from 'wouter';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseTitle: string;
  price: number;
}

export default function PaymentModal({ isOpen, onClose, courseId, courseTitle, price }: PaymentModalProps) {
  const [method, setMethod] = useState<'credit_card' | 'upi' | 'net_banking'>('credit_card');
  const { mutate: pay, isPending } = useProcessPayment({ request: { headers: getAuthHeaders() } });
  const { success, error } = useToast();
  const [, setLocation] = useLocation();

  // Dummy form states
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('');

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (method === 'credit_card' && cardNumber.length < 12) {
      error("Please enter a valid dummy card number");
      return;
    }
    if (method === 'upi' && !upiId.includes('@')) {
      error("Please enter a valid dummy UPI ID");
      return;
    }

    pay({
      data: {
        courseId,
        paymentMethod: method,
        paymentDetails: method === 'credit_card' ? { card: cardNumber } : { upi: upiId }
      }
    }, {
      onSuccess: () => {
        // Fire confetti!
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        success("Payment successful! You are now enrolled.");
        onClose();
        setTimeout(() => setLocation('/dashboard'), 1500);
      },
      onError: (err: any) => {
        error(err.message || "Payment failed. Please try again.");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Enrollment" maxWidth="max-w-lg">
      <div className="mb-6 p-4 bg-muted/50 rounded-2xl flex justify-between items-center border border-border/50">
        <div>
          <p className="text-sm font-semibold text-foreground">{courseTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">One-time payment</p>
        </div>
        <div className="text-2xl font-display font-bold text-primary">₹{price}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { id: 'credit_card', label: 'Card', icon: <CreditCard className="w-5 h-5 mb-1" /> },
          { id: 'upi', label: 'UPI', icon: <Smartphone className="w-5 h-5 mb-1" /> },
          { id: 'net_banking', label: 'Net Banking', icon: <Banknote className="w-5 h-5 mb-1" /> }
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id as any)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
              method === m.id 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-border bg-card hover:bg-muted text-muted-foreground'
            }`}
          >
            {m.icon}
            <span className="text-xs font-semibold">{m.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        {method === 'credit_card' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <Input 
              label="Card Number (Dummy)" 
              placeholder="0000 0000 0000 0000" 
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Expiry Date" placeholder="MM/YY" required />
              <Input label="CVV" placeholder="123" type="password" maxLength={3} required />
            </div>
            <Input label="Cardholder Name" placeholder="Your Name" required />
          </div>
        )}

        {method === 'upi' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <Input 
              label="UPI ID (Dummy)" 
              placeholder="username@okaxis" 
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">You will receive a request on your UPI app.</p>
          </div>
        )}

        {method === 'net_banking' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm text-muted-foreground mb-4">You will be redirected to your bank's secure portal after clicking Pay.</p>
            <select className="w-full h-12 rounded-xl border-2 border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10">
              <option>State Bank of India</option>
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
            </select>
          </div>
        )}

        <div className="pt-4 mt-2 border-t border-border flex items-center justify-between">
          <div className="flex items-center text-xs font-medium text-muted-foreground">
            <ShieldCheck className="w-4 h-4 mr-1 text-success" />
            Secure Encrypted Payment
          </div>
          <Button type="submit" isLoading={isPending} className="px-8 shadow-primary/30">
            Pay ₹{price}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
