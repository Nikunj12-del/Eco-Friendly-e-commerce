import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = (e) => {
    e.preventDefault();
    if(cartItems.length === 0) return toast.error("Cart is empty");
    toast.success("Order Placed Successfully!");
    clearCart();
    navigate('/');
  };

  return (
    <div className="section-padding py-32 bg-ivory-white min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Left Form */}
        <div className="flex-grow">
          <h1 className="text-4xl font-serif text-forest-green mb-8">Checkout</h1>
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6 bg-white p-8 rounded-2xl border border-forest-green/5 shadow-sm">
            <h3 className="text-xl font-serif text-forest-green mb-4">Shipping Details</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm text-forest-green mb-1">First Name</label>
                  <input required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-premium-gold" />
               </div>
               <div>
                  <label className="block text-sm text-forest-green mb-1">Last Name</label>
                  <input required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-premium-gold" />
               </div>
               <div className="col-span-2">
                  <label className="block text-sm text-forest-green mb-1">Address</label>
                  <input required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-premium-gold" />
               </div>
            </div>
          </form>
        </div>

        {/* Right Summary */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-forest-green/5 shadow-sm sticky top-32">
            <h3 className="text-xl font-serif text-forest-green mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center">
                 <span className="text-forest-green/70">Subtotal</span>
                 <span className="font-semibold text-forest-green">₹{subtotal}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-forest-green/70">Shipping</span>
                 <span className="font-semibold text-forest-green">Free</span>
               </div>
               <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                 <span className="text-lg font-serif text-forest-green">Total</span>
                 <span className="text-xl font-sans font-bold text-premium-gold">₹{subtotal}</span>
               </div>
            </div>
            <button form="checkout-form" type="submit" className="w-full premium-btn py-3">Place Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
