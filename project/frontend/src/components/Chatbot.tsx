import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  CreditCard,
  Smartphone,
  Banknote,
  QrCode,
} from "lucide-react";
import { Button, Input } from "./ui";
import { getAuthHeaders } from "@/lib/auth";
import { useLocation } from "wouter";
import { useChatbotQuery } from "@workspace/api-client-react";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  showPaymentOptions?: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      text:
        "Hi! I’m the SkillElevate assistant.\nAsk about courses, prices, or payments (UPI / Card / Net Banking / QR).",
    },
  ]);
  const [input, setInput] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [adminName, setAdminName] = useState("");
  const [showAdminBox, setShowAdminBox] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const { mutate: sendQuery, isPending } = useChatbotQuery();

  const handlePaymentMethodClick = (method: string) => {
    setIsOpen(false); // Close chatbot
    setLocation("/courses"); // Navigate to courses page where users can enroll
  };

  const pushMessage = (msg: Message) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === msg.role && last.text.trim() === msg.text.trim()) {
        return prev; // de-dupe identical consecutive messages
      }
      return [...prev, msg];
    });
  };

  const handleQuickAction = (message: string) => {
    setInput(message);
    handleSubmit({
      preventDefault: () => {},
    } as React.FormEvent);
  };

  const handleSuggestCourse = () => {
    const suggestion = window.prompt("Tell us the course or topic you want. We'll notify the admin.");
    if (!suggestion || !suggestion.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: `Course suggestion: ${suggestion.trim()}`,
    };
    pushMessage(userMsg);
    // Try sending to chatbot endpoint to surface in backend logs/admin
    sendQuery(
      { data: { message: `[COURSE_SUGGESTION] ${suggestion.trim()}` } },
      {
        onSuccess: () => {
          pushMessage({
            id: (Date.now() + 1).toString(),
            role: "bot",
            text: "Thanks! We’ve recorded your course request and will notify the admin.",
          });
        },
        onError: () => {
          pushMessage({
            id: (Date.now() + 1).toString(),
            role: "bot",
            text: "Thanks! We’ll try to notify the admin, but if this fails, please email support.",
          });
        },
      },
    );
  };

  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };
    pushMessage(userMsg);
    setInput("");

    // Check if user is asking about payment
    const isPaymentQuery =
      input.toLowerCase().includes("payment") ||
      input.toLowerCase().includes("pay") ||
      input.toLowerCase().includes("enroll") ||
      input.toLowerCase().includes("qr");

    // If payment-related, return a single predefined answer (avoid double messages)
    if (isPaymentQuery) {
      const paymentInfo: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text:
          "We support four payment methods:\n• UPI – enter your UPI ID (e.g., name@upi)\n" +
          "• Credit Card – enter card number, expiry, and CVV\n" +
          "• Net Banking – select your bank\n" +
          "• QR Code – scan with your phone to pay securely.\n" +
          "All payments are securely processed and you get instant access after payment!",
        showPaymentOptions: true,
      };
      pushMessage(paymentInfo);
      setShowPaymentOptions(true);
      return;
    }

    sendQuery(
      { data: { message: userMsg.text } },
      {
        onSuccess: (res: any) => {
          const botMsg: Message = {
            id: Date.now().toString(),
            role: "bot",
            text: res.reply,
            showPaymentOptions: isPaymentQuery,
          };
          pushMessage(botMsg);

          // If user asks about payment, add a clear static explainer
          if (isPaymentQuery) {
            const paymentInfo: Message = {
              id: (Date.now() + 1).toString(),
              role: "bot",
              text:
                "We support four payment methods:\n• UPI – enter your UPI ID (e.g., name@upi)\n" +
                "• Credit Card – enter card number, expiry, and CVV\n" +
                "• Net Banking – select your bank\n" +
                "• QR Code – scan with your phone to pay securely.\n" +
                "All payments are securely processed and you get instant access after payment!",
              showPaymentOptions: true,
            };
            setMessages((prev) => [...prev, paymentInfo]);
            setShowPaymentOptions(true);
          }
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "bot",
              text: "Sorry, I'm having trouble connecting right now.",
            },
          ]);
        },
      },
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-primary to-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 z-50 group"
          >
            <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-card border border-border/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">
                    SkillElevate Assistant
                  </h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-muted/20 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border/50 text-foreground rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  {msg.showPaymentOptions && (
                    <div className="flex justify-start mt-2">
                      <div className="bg-card border border-border/50 rounded-2xl p-3 shadow-sm max-w-[85%]">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Choose a payment method:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handlePaymentMethodClick("upi")}
                            className="flex items-center gap-2 p-2 text-xs bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                          >
                            <Smartphone className="w-3 h-3" />
                            UPI
                          </button>
                          <button
                            onClick={() =>
                              handlePaymentMethodClick("credit_card")
                            }
                            className="flex items-center gap-2 p-2 text-xs bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                          >
                            <CreditCard className="w-3 h-3" />
                            Card
                          </button>
                          <button
                            onClick={() =>
                              handlePaymentMethodClick("net_banking")
                            }
                            className="flex items-center gap-2 p-2 text-xs bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                          >
                            <Banknote className="w-3 h-3" />
                            Net Banking
                          </button>
                          <button
                            onClick={() => handlePaymentMethodClick("qr_code")}
                            className="flex items-center gap-2 p-2 text-xs bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                          >
                            <QrCode className="w-3 h-3" />
                            QR Code
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isPending && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border/50 p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-3 py-2 bg-card border-t border-border shrink-0">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleQuickAction("Show me your courses")}
                  className="px-3 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full transition-colors"
                >
                  📚 Courses
                </button>
                <button
                  onClick={() =>
                    handleQuickAction(
                      "Tell me about payment options (UPI, Card, Net Banking, QR) and how to pay."
                    )
                  }
                  className="px-3 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full transition-colors"
                >
                  💳 Payment help
                </button>
                <button
                  onClick={() => setShowAdminBox((v) => !v)}
                  className="px-3 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full transition-colors"
                >
                  📨 Feedback / request
                </button>
              </div>
            </div>

            {/* Admin Notification Box */}
            {showAdminBox && (
              <div className="px-3 py-3 bg-card border-t border-border shrink-0">
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  Notify admin (feedback / course request)
                </div>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="your name"
                    className="h-10 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="feedback / course request..."
                    className="h-10 text-sm flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={!adminNote.trim() || !adminName.trim() || isPending}
                    onClick={async () => {
                      const note = adminNote.trim();
                      const name = adminName.trim();
                      if (!note || !name) return;
                      setAdminNote("");
                      setAdminName("");
                      setShowAdminBox(false);
                    const authHeaders = getAuthHeaders();
                    const userMsg: Message = {
                      id: Date.now().toString(),
                      role: "user",
                      text: `Admin note from ${name}: ${note}`,
                    };
                    pushMessage(userMsg);
                    try {
                      const res = await fetch("/api/admin/notifications", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          ...authHeaders,
                        },
                        body: JSON.stringify({ message: `[${name}] ${note}`, name }),
                      });
                      if (!res.ok) throw new Error("request failed");
                      pushMessage({
                        id: (Date.now() + 1).toString(),
                        role: "bot",
                        text: "Notified admin. They will review your note.",
                      });
                    } catch {
                      pushMessage({
                        id: (Date.now() + 1).toString(),
                        role: "bot",
                        text: "Could not notify admin. Please try again.",
                      });
                    }
                  }}
                >
                  Send
                </Button>
              </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-card border-t border-border shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="rounded-full h-10"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isPending}
                  className="h-10 w-10 shrink-0 rounded-full"
                >
                  <Send className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
