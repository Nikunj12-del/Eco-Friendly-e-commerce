const crypto = require('crypto');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body);
        const secret = process.env.RAZORPAY_KEY_SECRET;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex');

        if (expectedSignature === razorpay_signature) {
            return { statusCode: 200, body: JSON.stringify({ success: true }) };
        } else {
            return { statusCode: 400, body: JSON.stringify({ success: false, message: "Invalid signature" }) };
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ success: false }) };
    }
};