import { useState } from 'react';

/**
 * Stripe Checkout Component
 *
 * Handles secure payment processing via Stripe.
 * In production, this would:
 * 1. Load Stripe.js SDK
 * 2. Create payment intent
 * 3. Redirect to Stripe Checkout
 * 4. Handle webhook confirmation
 * 5. Process order completion
 */
export default function StripeCheckout({ amount, currency = 'usd', onSuccess, onCancel, metadata = {} }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      // In production, this would:
      // 1. Call backend to create Stripe PaymentIntent
      // 2. Get client secret
      // 3. Load Stripe.js
      // 4. Redirect to Stripe Checkout or use embedded form
      // 5. Handle 3D Secure if needed
      // 6. Confirm payment
      // 7. Redirect back with success/failure

      // Backend endpoint example:
      // POST /api/marketplace/create-payment-intent
      // Body: { orderId, amount, currency, metadata }
      // Response: { clientSecret, publishableKey }

      // For demo, simulate Stripe checkout
      await simulateStripeCheckout();

      // On success, call onSuccess callback
      if (onSuccess) {
        onSuccess({
          paymentIntentId: `pi_${Date.now()}`,
          status: 'succeeded'
        });
      }
    } catch (err) {
      console.error('Stripe checkout failed:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  async function simulateStripeCheckout() {
    // Simulate Stripe checkout flow
    return new Promise((resolve, reject) => {
      // Mock payment processing
      setTimeout(() => {
        // 90% success rate for demo
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Payment declined by issuer'));
        }
      }, 2000);
    });
  }

  return (
    <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Secure Payment</h3>

      {/* Amount Display */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-1">Total Amount</div>
        <div className="text-3xl font-bold text-green-400">
          ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-6 space-y-2 text-sm text-gray-400">
        <div className="flex items-start gap-2">
          <span>🔒</span>
          <span>Secure payment processing via Stripe</span>
        </div>
        <div className="flex items-start gap-2">
          <span>💳</span>
          <span>Supports all major credit cards</span>
        </div>
        <div className="flex items-start gap-2">
          <span>🔐</span>
          <span>PCI DSS compliant - your data is safe</span>
        </div>
        <div className="flex items-start gap-2">
          <span>✅</span>
          <span>Instant delivery after payment</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm">
          <div className="font-semibold mb-1">Payment Failed</div>
          <div>{error}</div>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-bold text-lg transition shadow-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>🔒</span>
            <span>Pay ${(amount / 100).toFixed(2)}</span>
          </>
        )}
      </button>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full mt-3 px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg transition"
        >
          Cancel
        </button>
      )}

      {/* Stripe Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <span>Powered by</span>
        <span className="font-bold text-purple-400">Stripe</span>
      </div>

      {/* Test Mode Notice (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-yellow-400 text-xs">
          <div className="font-semibold mb-1">🚧 Test Mode</div>
          <div>This is a simulated payment. In production, this would redirect to Stripe Checkout.</div>
        </div>
      )}
    </div>
  );
}

/**
 * Production Implementation Example:
 *
 * import { loadStripe } from '@stripe/stripe-js';
 * import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
 *
 * const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);
 *
 * export default function StripeCheckout({ orderId, amount, onSuccess }) {
 *   const [clientSecret, setClientSecret] = useState(null);
 *
 *   useEffect(() => {
 *     // Create PaymentIntent
 *     fetch('/api/marketplace/create-payment-intent', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ orderId, amount })
 *     })
 *       .then(res => res.json())
 *       .then(data => setClientSecret(data.clientSecret));
 *   }, [orderId, amount]);
 *
 *   const options = { clientSecret };
 *
 *   return (
 *     <Elements stripe={stripePromise} options={options}>
 *       <CheckoutForm onSuccess={onSuccess} />
 *     </Elements>
 *   );
 * }
 *
 * function CheckoutForm({ onSuccess }) {
 *   const stripe = useStripe();
 *   const elements = useElements();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const { error, paymentIntent } = await stripe.confirmPayment({
 *       elements,
 *       confirmParams: {
 *         return_url: `${window.location.origin}/marketplace/order-complete`
 *       }
 *     });
 *     if (paymentIntent.status === 'succeeded') {
 *       onSuccess(paymentIntent);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <PaymentElement />
 *       <button type="submit">Pay Now</button>
 *     </form>
 *   );
 * }
 */
