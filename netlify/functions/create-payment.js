require('dotenv').config();
const Razorpay = require('razorpay');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        console.log("--- NEW PAYMENT REQUEST ---");
        const body = JSON.parse(event.body);
        console.log("1. Amount Requested:", body.amount);
        
        console.log("2. Checking API Keys...");
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("❌ ERROR: Missing Razorpay Keys in root .env file!");
            throw new Error("Missing API Keys");
        }
        console.log("✅ API Keys found.");

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        console.log("3. Asking Razorpay for Order ID...");
        const order = await razorpay.orders.create({
            amount: body.amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `rcpt_${Math.floor(Math.random() * 10000)}`,
        });

        console.log("✅ Order created successfully:", order.id);
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, order_id: order.id, amount: order.amount }),
        };
    } catch (error) {
        console.error("❌ BACKEND CRASH:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ success: false, error: error.message || "Unknown Error" }) 
        };
    }
};