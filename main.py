import os
import random
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Initialize the API
app = FastAPI(title="E-Commerce API Architecture", version="1.0")

# --- CORS CONFIGURATION ---
# Allows your Netlify frontend to communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with your GoDaddy domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class OrderRequest(BaseModel):
    cart_items: list
    total_amount: float

# --- 1. SYSTEM HEALTH CHECK ---
@app.get("/")
async def root():
    return {"status": "Online", "message": "FastAPI mock backend is operational."}

# --- 2. FRONTEND API: CREATE ORDER ---
@app.post("/api/create-order")
async def create_order(order: OrderRequest):
    print(f"[ORDER] Checkout initiated for amount: ₹{order.total_amount}")
    
    # Mocking the Razorpay Order ID generation
    mock_order_id = f"order_mock_{random.randint(10000, 99999)}"
    
    return {
        "success": True,
        "order_id": mock_order_id
    }

# --- 3. RAZORPAY WEBHOOK LISTENER ---
@app.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request):
    payload = await request.json()
    print(f"[RAZORPAY] Webhook event received: {payload.get('event')}")
    
    # TODO: Verify X-Razorpay-Signature header here
    # TODO: Update database status
    
    return {"status": "OK"}

# --- 4. WHATSAPP CLOUD API WEBHOOKS ---

async def send_telegram_reply(chat_id: int, received_text: str):
    """The core engine that transmits messages back to the Telegram network."""
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    # Basic dialogue tree
    text_lower = received_text.lower()
    if "hi" in text_lower or "/start" in text_lower:
        reply_text = "Welcome to the storefront, sir! Reply with 'catalog' to view inventory."
    elif "catalog" in text_lower:
        reply_text = "Available Items:\n1. Health Potion - ₹50\n2. Mana Potion - ₹50\n\nReply with 'buy 1' to checkout."
    elif "buy" in text_lower:
        reply_text = "Order initiated! Here is your secure checkout link: https://your-netlify-site.com/checkout"
    else:
        reply_text = "Command not recognized. Try sending 'hi'."

    payload = {
        "chat_id": chat_id,
        "text": reply_text
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)
        if response.status_code == 200:
            print(f"[JARVIS] Telegram transmission successful to chat {chat_id}")
        else:
            print(f"[SYSTEM ERROR] Telegram transmission failed: {response.text}")


# --- TELEGRAM WEBHOOK LISTENER ---
@app.post("/webhooks/telegram")
async def receive_telegram(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    print("[TELEGRAM] Incoming transmission detected.")
    
    # Safely extract the message and chat ID
    if "message" in payload and "text" in payload["message"]:
        chat_id = payload["message"]["chat"]["id"]
        text_body = payload["message"]["text"]
        
        print(f"[COMM LINK] Message from {chat_id}: {text_body}")
        
        # Offload the reply to prevent blocking the main server thread
        background_tasks.add_task(send_telegram_reply, chat_id, text_body)
        
    # Telegram requires a 200 OK response to know the message was received
    return {"status": "ok"}# Meta verification (GET)
@app.get("/webhooks/whatsapp", response_class=PlainTextResponse)
async def verify_whatsapp(
    mode: str = Query(None, alias="hub.mode"),
    token: str = Query(None, alias="hub.verify_token"),
    challenge: str = Query(None, alias="hub.challenge")
):
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN")
    
    if mode and token:
        if mode == "subscribe" and token == verify_token:
            print("[META] WhatsApp Webhook Verified.")
            # Meta requires the raw challenge string returned, not JSON
            return challenge
        else:
            raise HTTPException(status_code=403, detail="Verification token mismatch")
    raise HTTPException(status_code=400, detail="Missing parameters")

# Meta message receiver (POST)
@app.post("/webhooks/whatsapp")
async def send_whatsapp_reply(to_number: str, received_text: str):
    """The core function that sends messages back to the user via Meta's API."""
    phone_id = os.getenv("META_PHONE_ID")
    token = os.getenv("META_ACCESS_TOKEN")
    
    url = f"https://graph.facebook.com/v18.0/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Basic branching logic for your bot
    text_lower = received_text.lower()
    if "hi" in text_lower or "hello" in text_lower:
        reply_text = "Welcome to the storefront! Reply with 'catalog' to see our inventory."
    elif "catalog" in text_lower:
        reply_text = "Available Items:\n1. Health Potion - ₹50\n2. Mana Potion - ₹50\n\nReply with 'buy 1' to checkout."
    elif "buy" in text_lower:
        reply_text = "Order initiated! Here is your mock payment link: https://your-netlify-site.com/checkout"
    else:
        reply_text = "I did not recognize that command. Try saying 'hi'."

    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": reply_text}
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            print(f"[JARVIS] Successfully sent reply to {to_number}")
        else:
            print(f"[SYSTEM ERROR] Failed to send message: {response.text}")


@app.post("/webhooks/whatsapp")
async def receive_whatsapp(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    print("[WHATSAPP] Incoming payload detected.")
    
    try:
        # Navigating Meta's deeply nested JSON structure
        entry = payload.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})
        
        # Ensure this is an actual user message and not a delivery receipt
        if "messages" in value:
            message = value["messages"][0]
            sender_phone = message.get("from")
            text_body = message.get("text", {}).get("body", "")
            
            print(f"[COMM LINK] Message from {sender_phone}: {text_body}")
            
            # Offload the reply to a background task so we can instantly return 200 OK to Meta
            background_tasks.add_task(send_whatsapp_reply, sender_phone, text_body)
            
    except IndexError:
        pass # Ignore payloads that don't match the message structure
        
    return {"status": "EVENT_RECEIVED"}

@app.post("/api/create-order")
async def create_order(order: OrderRequest, background_tasks: BackgroundTasks):
    print(f"[ORDER] Checkout initiated for amount: ₹{order.total_amount}")
    
    # Generate the mock Order ID
    mock_order_id = f"order_mock_{random.randint(10000, 99999)}"
    
    # Alert the Admin via Telegram
    admin_id = os.getenv("ADMIN_CHAT_ID")
    if admin_id:
        alert_text = f"💰 *NEW WEB ORDER!*\n\nItems: {len(order.cart_items)}\nTotal: ₹{order.total_amount}\nOrder ID: {mock_order_id}"
        background_tasks.add_task(send_telegram_reply, int(admin_id), alert_text)
    
    return {
        "success": True,
        "order_id": mock_order_id
    }