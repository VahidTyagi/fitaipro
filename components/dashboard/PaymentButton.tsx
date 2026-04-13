"use client";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";

interface Props {
  plan: "pro" | "elite";
  price: string;
  label?: string;
  className?: string;
}

declare global {
  interface Window { Razorpay: any; }
}

export default function PaymentButton({ plan, price, label, className }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const orderData = await res.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name,
        description: orderData.description,
        order_id: orderData.orderId,
        prefill: orderData.prefill,
        theme: { color: "#10b981" },
        modal: { ondismiss: () => { setLoading(false); toast.error("Payment cancelled"); } },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
              }),
            });
            if (!verifyRes.ok) throw new Error("Verification failed");
            toast.success(`🎉 Welcome to FitAI ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`);
            router.refresh();
            router.push("/dashboard");
          } catch {
            toast.error("Payment verification failed. Contact support.");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handlePayment}
        disabled={loading}
        className={className || "w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {label || `Upgrade to ${plan} — ${price}`}
          </span>
        )}
      </button>
    </>
  );
}