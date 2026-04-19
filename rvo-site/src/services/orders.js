import { supabase } from '../lib/supabase';

// Notice the new 'paymentDetails' parameter at the end
export const createOrder = async (userId, cartItems, total, shippingAddress, paymentDetails = {}) => {
  
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
        items: cartItems,
        total_amount: total,
        shipping_name: shippingAddress.name,
        shipping_address: shippingAddress.address,
        // The new Razorpay fields injected here:
        payment_id: paymentDetails.paymentId || null,
        status: paymentDetails.status || 'Pending'
      }
    ]);

  if (error) throw error;
  return data;
};
export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); // Shows newest orders first

  if (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
  
  return data;
};