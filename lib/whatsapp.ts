import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendWhatsApp(to: string, msg: string) {
  try {
    await client.messages.create({
      from: "whatsapp:" + process.env.TWILIO_WHATSAPP_FROM,
      to: "whatsapp:" + to,
      body: msg,
    });
  } catch (e) {
    console.log("WhatsApp error:", e);
  }
}
