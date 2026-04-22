import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui";
import { getAuthHeaders } from "@/lib/auth";
import confetti from "canvas-confetti";
import { CheckCircle, Smartphone, QrCode, CreditCard } from "lucide-react";

export default function PaymentPage() {
const [match, params] = useRoute("/payment/:transactionId");  const [, setLocation] = useLocation();
  const transactionId = params?.transactionId;
  const searchParams = new URLSearchParams(window.location.search);
  const amount = searchParams.get("amount");
  const courseId = searchParams.get("courseId");

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [generatedTransactionId, setGeneratedTransactionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    // Fetch course details based on courseId
    if (courseId) {
      fetch(`/api/courses/${courseId}`)
        .then((res) => res.json())
        .then((data) => {
          setCourse(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    // Fetch course details based on courseId
    if (courseId) {
      fetch(`/api/courses/${courseId}`)
        .then((res) => res.json())
        .then((data) => {
          setCourse(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [courseId]);

  const handleCompletePayment = async () => {
    if (!courseId || !transactionId) return;

    setPaying(true);

    // Simulate payment processing (2-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const response = await fetch(
        `/api/enrollments/complete/${transactionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ courseId: parseInt(courseId) }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Payment failed");
      }

      const data = await response.json();

      // Generate fake transaction ID for demo
      const fakeTxnId = `TXN${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setGeneratedTransactionId(fakeTxnId);
      setPaymentSuccess(true);

      // Fire confetti!
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
      };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          }),
        );
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          }),
        );
      }, 250);

      setTimeout(() => setLocation("/dashboard"), 3000);
    } catch (err: any) {
      alert(err.message || "Payment failed. Please try again.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Payment Details
            </h2>
            <p className="text-gray-600">
              Please wait while we prepare your payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!course || !amount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Error
            </h1>
            <p className="text-gray-600 mb-6">
              Unable to load payment details. Please try again.
            </p>
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful! ✅
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">Transaction ID</div>
              <div className="font-mono text-lg font-semibold text-gray-900">
                {generatedTransactionId}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Course</span>
                <span className="font-medium text-gray-900">
                  {course.title}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-bold text-lg text-gray-900">
                  ₹{amount}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">
            Complete Your Payment
          </h1>
          <p className="text-center text-blue-100">
            Secure payment powered by LearnHub
          </p>
        </div>

        <div className="p-6">
          {/* Course Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {course.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {course.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Total Amount
              </span>
              <span className="text-3xl font-bold text-blue-600">
                ₹{amount}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">QR Code Payment</div>
                <div className="text-sm text-gray-600">Demo payment method</div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-green-900 mb-1">
                  Secure Payment
                </div>
                <div className="text-sm text-green-700">
                  Your payment is protected by bank-level security. Get instant
                  access to your course after payment.
                </div>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handleCompletePayment}
            disabled={paying}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {paying ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              `Pay ₹${amount}`
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 mt-4">
            By proceeding, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
