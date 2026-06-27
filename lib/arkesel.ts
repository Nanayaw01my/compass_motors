const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY;
const SENDER_ID = "CompassMtrs";

interface SMSResult {
  success: boolean;
  message?: string;
}

async function sendSMS(to: string, message: string): Promise<SMSResult> {
  if (!ARKESEL_API_KEY) {
    console.log(`[SMS Mock] To: ${to} | Message: ${message}`);
    return { success: true, message: "SMS mocked (no API key)" };
  }

  const phone = to.startsWith("+") ? to : `+233${to.replace(/^0/, "")}`;

  try {
    const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "api-key": ARKESEL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: SENDER_ID,
        message,
        recipients: [phone],
      }),
    });
    const data = await response.json();
    return { success: data.status === "success" };
  } catch (error) {
    console.error("Arkesel SMS error:", error);
    return { success: false };
  }
}

export async function sendWelcomeSMS(phone: string, name: string, username: string, password: string) {
  const message = `Welcome to Compass Motors, ${name}!\nYour login details:\nUsername: ${username}\nPassword: ${password}\nLogin at: www.compassmotors.online\nCall: 0593920144`;
  return sendSMS(phone, message);
}

export async function sendPaymentConfirmationSMS(phone: string, name: string, amount: number, balance: number, receiptNo: string) {
  const message = `Hi ${name}, your payment of GHS ${amount.toFixed(2)} to Compass Motors was successful.\nReceipt: ${receiptNo}\nBalance: GHS ${balance.toFixed(2)}\nThank you!`;
  return sendSMS(phone, message);
}

export async function sendPaymentReminderSMS(phone: string, name: string, amount: number, dueDate: string) {
  const message = `Hi ${name}, your installment payment of GHS ${amount.toFixed(2)} is due on ${dueDate}.\nPay now at www.compassmotors.online\nCompass Motors: 0593920144`;
  return sendSMS(phone, message);
}

export async function sendOverdueSMS(phone: string, name: string, amount: number) {
  const message = `Hi ${name}, your installment payment of GHS ${amount.toFixed(2)} to Compass Motors is OVERDUE. Please pay immediately to avoid suspension.\nCall: 0593920144`;
  return sendSMS(phone, message);
}

export async function sendContractCompletionSMS(phone: string, name: string, motorcycle: string) {
  const message = `Congratulations ${name}! Your ${motorcycle} is FULLY PAID. Come collect your documents at Compass Motors. Call: 0593920144`;
  return sendSMS(phone, message);
}
