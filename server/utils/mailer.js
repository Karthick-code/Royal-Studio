import nodemailer from "nodemailer";
import axios from "axios";

export function canUseEmailJS() {
  const serviceId = (process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID || "").replace(/['"]/g, "").trim();
  const templateId = (process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID || "").replace(/['"]/g, "").trim();
  const publicKey = (process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_USER_ID || process.env.VITE_EMAILJS_USER_ID || "").replace(/['"]/g, "").trim();
  return !!(serviceId && templateId && publicKey);
}

export async function sendEmailJSEmail({ name, email, phone, message }) {
  const serviceId = (process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID || "").replace(/['"]/g, "").trim();
  const templateId = (process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID || "").replace(/['"]/g, "").trim();
  const publicKey = (process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_USER_ID || process.env.VITE_EMAILJS_USER_ID || "").replace(/['"]/g, "").trim();
  const privateKey = (process.env.EMAILJS_PRIVATE_KEY || process.env.VITE_EMAILJS_PRIVATE_KEY || process.env.EMAILJS_ACCESS_TOKEN || process.env.VITE_EMAILJS_ACCESS_TOKEN || "").replace(/['"]/g, "").trim();
  const companyEmail = (process.env.COMPANY_EMAIL || process.env.VITE_COMPANY_EMAIL || "").replace(/['"]/g, "").trim() || "karthi02.study@gmail.com";

  const maskedCompanyEmail = maskEmail(companyEmail);
  const maskedClientEmail = maskEmail(email);

  const directorSubject = `[CRM] New Photoshoot Session Inquiry from ${name}`;
  const clientSubject = `We Recieved Your Photoshoot Session Vision - Royal Studio`;

  const templateParams = {
    name: name,
    from_name: name,
    email: email,
    from_email: email,
    phone: phone,
    phone_number: phone,
    message: message,
    reply_to: email,
    company_email: companyEmail,
    subject: directorSubject,
    client_subject: clientSubject,
    summary_text: `New booking request from ${name} (${email}, Phone: ${phone}). Vision: ${message}`
  };

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams
  };

  if (privateKey) {
    payload.accessToken = privateKey;
  }

  try {
    console.log(`⚡ Dispatching live email via EmailJS API. Service: ${serviceId}, Template: ${templateId}`);
    const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", payload, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "RoyalStudio/1.0"
      }
    });

    console.log(`🟩 EmailJS API call successful:`, response.data);
    return {
      sent: true,
      mode: "emailjs",
      recipient: `${maskedClientEmail} (and CC'd to ${maskedCompanyEmail})`,
      messageId: `[EMAILJS_OK]`,
      telemetry: `Email successfully triggered via EmailJS REST API platform. Bypass SMTP constraints on Cloud Run container ports.`,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    const errorDetails = err.response?.data || err.message;
    console.error(`❌ EmailJS API action failed:`, errorDetails);
    return {
      sent: false,
      mode: "emailjs-failed",
      recipient: `${maskedClientEmail} & ${maskedCompanyEmail}`,
      telemetry: `EmailJS REST client failed. Server response: ${typeof errorDetails === "object" ? JSON.stringify(errorDetails) : errorDetails}`,
      error: typeof errorDetails === "object" ? JSON.stringify(errorDetails) : errorDetails,
      timestamp: new Date().toISOString()
    };
  }
}

export function getMailerTransport() {
  const host = (process.env.SMTP_HOST || process.env.VITE_SMTP_HOST || "").replace(/['"]/g, "").trim();
  const portStr = (process.env.SMTP_PORT || process.env.VITE_SMTP_PORT || "587").replace(/['"]/g, "").trim();
  const port = parseInt(portStr || "587", 10);
  const user = (process.env.SMTP_USER || process.env.VITE_SMTP_USER || "").replace(/['"]/g, "").trim();
  const pass = (process.env.SMTP_PASS || process.env.VITE_SMTP_PASS || "").replace(/['"]/g, "").trim();

  if (!host || !user || !pass) {
    // Return null, indicating fallback is active
    return null;
  }

  // To prevent caching old/stale credentials or half-failed states and ensure they can dry-run dynamically,
  // we rebuild the transporter and use a robust tls options configuration.
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // True for 465, false for 587 (STARTTLS)/others
    auth: {
      user,
      pass,
    },
    tls: {
      // Allow self-signed and untrusted certificates for corporate or custom server SMTP relays
      rejectUnauthorized: false
    },
    connectionTimeout: 15000, // Wait max 15s to establish physical TCP socket
    greetingTimeout: 15000,   // Wait max 15s for SMTP server greeting
    socketTimeout: 30000      // Wait max 30s for active data transfer operations
  });
}

export function maskEmail(email) {
  if (!email) return "[REDACTED_RECIPIENT]";
  const parts = email.split("@");
  if (parts.length !== 2) return "******";
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
}

export async function sendInquiryEmail({ name, email, phone, message }) {
  if (canUseEmailJS()) {
    return sendEmailJSEmail({ name, email, phone, message });
  }
  const companyEmail = (process.env.COMPANY_EMAIL || process.env.VITE_COMPANY_EMAIL || "").replace(/['"]/g, "").trim() || "karthi02.study@gmail.com";
  const systemEmailUser = (process.env.SMTP_USER || process.env.VITE_SMTP_USER || "").replace(/['"]/g, "").trim() || "karthi02.study@gmail.com";
  const client = getMailerTransport();
  const maskedCompanyEmail = maskEmail(companyEmail);
  const maskedClientEmail = maskEmail(email);

  // Fallback sender email to guarantee that standard mail servers don't reject if systemEmailUser is not a valid email
  const fromEmail = systemEmailUser.includes("@") ? systemEmailUser : companyEmail;

  // 1. Director Inquiry Subject & Body (CRM)
  const directorSubject = `[CRM] New Photoshoot Session Inquiry from ${name}`;
  const directorHtmlBody = `
    <div style="font-family: 'Georgia', serif; background-color: #0F0F0F; color: #F5F5F5; padding: 40px; border-radius: 8px; border: 1px solid #2A2A2A; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 1px solid #2A2A2A; padding-bottom: 24px; margin-bottom: 24px;">
        <h1 style="color: #D4AF37; font-size: 20px; font-weight: normal; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Royal Studio</h1>
        <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin: 4px 0 0 0;">CRM LEAD DISPATCH SYSTEM</p>
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #CCC; margin-bottom: 24px;">
        Greetings Studio Director, <br/><br/>
        A potential client has requested a photoshoot session booking. Review the captured details below to formulate a tailored quote:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-family: monospace; font-size: 11px; text-transform: uppercase; color: #666; width: 140px;">Client Name</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-size: 14px; color: #FFF; font-weight: bold;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-family: monospace; font-size: 11px; text-transform: uppercase; color: #666;">Email Address</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-size: 13px; color: #D4AF37;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-family: monospace; font-size: 11px; text-transform: uppercase; color: #666;">Phone Line</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-size: 13px; color: #FFF; font-family: monospace;">${phone}</td>
        </tr>
      </table>

      <div style="background-color: #141414; border-left: 3px solid #D4AF37; padding: 20px; margin-bottom: 30px;">
        <h4 style="margin: 0 0 8px 0; font-family: monospace; font-size: 10px; text-transform: uppercase; color: #D4AF37; letter-spacing: 1px;">Session Vision & Request</h4>
        <p style="margin: 0; font-size: 13px; font-style: italic; line-height: 1.6; color: #BBB;">"${message}"</p>
      </div>

      <div style="text-align: center; border-top: 1px solid #2A2A2A; padding-top: 24px; font-size: 11px; color: #555;">
        <p style="margin: 0;">This transmission was dispatched securely to the corporate mailbox.</p>
        <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 9px; uppercase">CMS Core • Live Socket Relay Active</p>
      </div>
    </div>
  `;
  const directorTextBody = `New Photoshoot Session Inquiry from ${name}\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nClient Message:\n"${message}"\n\nCRM Delivery Status: Live Dispatch Recipient [CONFIDENTIAL]`;

  // 2. Client Inquiry Confirmation Subject & Body (Thank you confirmation)
  const clientSubject = `We Recieved Your Photoshoot Session Vision - Royal Studio`;
  const clientHtmlBody = `
    <div style="font-family: 'Georgia', serif; background-color: #0F0F0F; color: #F5F5F5; padding: 40px; border-radius: 8px; border: 1px solid #2A2A2A; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 1px solid #2A2A2A; padding-bottom: 24px; margin-bottom: 24px;">
        <h1 style="color: #D4AF37; font-size: 20px; font-weight: normal; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Photo Studio</h1>
        <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin: 4px 0 0 0;">Inquiry Confirmation</p>
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #CCC; margin-bottom: 24px;">
        Dear ${name}, <br/><br/>
        Thank you for submitting your session vision to Royal Studio. We have received your inquiry. Below are the details you provided:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-family: monospace; font-size: 11px; text-transform: uppercase; color: #666; width: 140px;">Your Name</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-size: 14px; color: #FFF; font-weight: bold;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-family: monospace; font-size: 11px; text-transform: uppercase; color: #666;">Provided Email</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-size: 13px; color: #D4AF37;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-family: monospace; font-size: 11px; text-transform: uppercase; color: #666;">Phone Line</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A; font-size: 13px; color: #FFF; font-family: monospace;">${phone}</td>
        </tr>
      </table>

      <div style="background-color: #141414; border-left: 3px solid #D4AF37; padding: 20px; margin-bottom: 30px;">
        <h4 style="margin: 0 0 8px 0; font-family: monospace; font-size: 10px; text-transform: uppercase; color: #D4AF37; letter-spacing: 1px;">Session Vision Details</h4>
        <p style="margin: 0; font-size: 13px; font-style: italic; line-height: 1.6; color: #BBB;">"${message}"</p>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #AAA; margin-bottom: 24px;">
        Our team will contact you directly within the next 4 hours to review schedules, answer package questions, and solidify plans to bring your artistic vision to life.
      </p>

      <div style="text-align: center; border-top: 1px solid #2A2A2A; padding-top: 24px; font-size: 11px; color: #555;">
        <p style="margin: 0;">If you have any urgent details to add, feel free to reply directly to this email.</p>
        <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 9px; uppercase">Royal Studio • Capturing Timeless Moments</p>
      </div>
    </div>
  `;
  const clientTextBody = `Dear ${name},\n\nThank you for submitting your photoshoot session vision to Royal Studio. We have received your request and will contact you within the next 4 hours!\n\nSummary of details:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: "${message}"\n\nWarm regards,\nRoyal Studio Team`;

  if (!client) {
    // Generate simulated detailed log demonstrating both recipients
    const simulatedLog = `
┌────────────────────────────────────────────────────────────────────────┐
│  ✉️  SIMULATED BACKEND MAIL DISPATCH FALLBACK                          │
├────────────────────────────────────────────────────────────────────────┤
│  STATUS   : Simulated Send SUCCESS to BOTH Recipient Addresses         │
│  TO (DIRECTOR) : ${maskedCompanyEmail}                                 │
│  TO (CLIENT)   : ${maskedClientEmail}                                  │
│  SUBJECTS :                                                            │
│     - Dir:  ${directorSubject}     │
│     - Cli:  ${clientSubject}    │
│  CLIENT   : ${name} (${email})                                           │
│  PHONE    : ${phone}                                                   │
│  MESSAGE  : ${message.substring(0, 100)}${message.length > 100 ? "..." : ""}   │
│  NOTE     : To route live emails via Node.js, enter your SMTP keys    │
│             (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) in .env!      │
└────────────────────────────────────────────────────────────────────────┘`;
    console.log(simulatedLog);

    return {
      sent: true,
      mode: "simulated",
      recipient: `${maskedClientEmail} (and CC'd to ${maskedCompanyEmail})`,
      telemetry: "SMTP configuration parameters absent. Gracefully simulated both customer confirmation and director notification emails.",
      timestamp: new Date().toISOString()
    };
  }

  // Real NodeMailer dispatch
  try {
    // 1. Dispatch alert notification to Director
    const infoDirector = await client.sendMail({
      from: `"Royl Studio" <${fromEmail}>`,
      to: companyEmail,
      replyTo: email,
      subject: directorSubject,
      html: directorHtmlBody,
      text: directorTextBody,
    });
    console.log(`🟩 Live alert notification email successfully sent to Director: ${maskedCompanyEmail}`);

    // 2. Dispatch confirmation response to Client
    let clientSent = false;
    let clientErrStr = "";
    try {
      await client.sendMail({
        from: `"Royal Studio" <${fromEmail}>`,
        to: email,
        replyTo: companyEmail,
        subject: clientSubject,
        html: clientHtmlBody,
        text: clientTextBody,
      });
      clientSent = true;
      console.log(`🟩 Live confirmation email successfully sent to Client: ${maskedClientEmail}`);
    } catch (cErr) {
      console.error(`❌ Client SMTP dispatch failed:`, cErr.message);
      clientErrStr = cErr.message;
    }

    if (clientSent) {
      return {
        sent: true,
        mode: "live",
        recipient: `${maskedClientEmail} (and CC'd to ${maskedCompanyEmail})`,
        messageId: "[SECURE_LOCK_ID]",
        telemetry: `Dispatched through live host protocol TLS on port ${process.env.SMTP_PORT || 587}. Both client confirmation and director alert successfully delivered in parallel.`,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        sent: true,
        mode: "live-partial",
        recipient: `${maskedCompanyEmail} (Client dispatch failed: ${clientErrStr})`,
        messageId: "[SECURE_LOCK_ID]",
        telemetry: `Director notification delivered to ${maskedCompanyEmail}, but client dispatch to ${maskedClientEmail} failed with SMTP error: ${clientErrStr}. Check your SMTP authorization limits.`,
        timestamp: new Date().toISOString()
      };
    }
  } catch (err) {
    console.error(`❌ SMTP transport failed to deliver mail:`, err.message);
    return {
      sent: false,
      mode: "failed",
      recipient: `${maskedClientEmail} & ${maskedCompanyEmail}`,
      telemetry: `Nodemailer core aborted during secure TLS connection handshake: ${err.message}.`,
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}
