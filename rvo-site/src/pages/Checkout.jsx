import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/orders';

const Checkout = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ firstName: '', lastName: '', address: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("Cart is empty");
    if (!currentUser) return toast.error("Please login to place an order");

    setIsProcessing(true);
    try {
      // 1. Fetch Order ID from Netlify Function
      const response = await fetch('/.netlify/functions/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error('Gateway failed');

      // 2. Setup Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "RVO Fabric Essentials",
        description: "Premium Eco-Friendly Purchase",
        order_id: data.order_id,
        handler: async function (paymentResponse) {
          try {
            toast.loading("Verifying payment...", { id: "order-toast" });

            // 3. Verify Signature Securely
            const verifyRes = await fetch('/.netlify/functions/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentResponse)
            });
            const verifyData = await verifyRes.json();
            
            if (!verifyData.success) throw new Error("Payment verification failed");

            // 4. Save to Database
            const shippingAddress = { name: `${formData.firstName} ${formData.lastName}`, address: formData.address };
            await createOrder(currentUser.uid, cartItems, total, shippingAddress, {
              paymentId: paymentResponse.razorpay_payment_id,
              status: 'Confirmed'
            });
            
            toast.success("Order Placed Successfully!", { id: "order-toast" });
            await clearCart();
            navigate('/profile'); 
          } catch (error) {
            toast.error("Payment successful but database update failed.", { id: "order-toast" });
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: currentUser.email || "",
        },
        theme: { color: "#1F4D36" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => toast.error("Payment Failed."));
      rzp.open();

    } catch (error) {
      toast.error("Failed to connect to gateway.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="section-padding py-32 bg-ivory-white min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex-grow">
          <h1 className="text-4xl font-serif text-forest-green mb-8">Checkout</h1>
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6 bg-white p-8 rounded-2xl border border-forest-green/5 shadow-sm">
            <h3 className="text-xl font-serif text-forest-green mb-4">Shipping Details</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm text-forest-green mb-1">First Name</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-premium-gold" />
               </div>
               <div>
                  <label className="block text-sm text-forest-green mb-1">Last Name</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-premium-gold" />
               </div>
               <div className="col-span-2">
                  <label className="block text-sm text-forest-green mb-1">Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-premium-gold" />
               </div>
            </div>
          </form>
        </div>

        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-forest-green/5 shadow-sm sticky top-32">
            <h3 className="text-xl font-serif text-forest-green mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center"><span className="text-forest-green/70">Subtotal</span><span className="font-semibold text-forest-green">₹{subtotal}</span></div>
               <div className="flex justify-between items-center"><span className="text-forest-green/70">Shipping</span><span className="font-semibold text-forest-green">{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
               <div className="pt-4 border-t border-gray-100 flex justify-between items-center"><span className="text-lg font-serif text-forest-green">Total</span><span className="text-xl font-sans font-bold text-premium-gold">₹{total}</span></div>
            </div>
            <button form="checkout-form" type="submit" disabled={isProcessing} className={`w-full premium-btn py-3 flex items-center justify-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isProcessing ? 'Initializing Secure Payment...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;