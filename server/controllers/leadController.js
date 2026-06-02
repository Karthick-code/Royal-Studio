import { LeadRepo } from "../models/Lead.js";
import { sendInquiryEmail, getMailerTransport } from "../utils/mailer.js";

export const createLead = async (req, res) => {
  const { name, email, phone, message, status, requirements, paymentAmount, advancePayment } = req.body;

  // Validation
  if (!name || name.trim().length === 0) {
    res.status(400).json({ msg: "Name is required." });
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ msg: "A valid email address is required." });
    return;
  }

  if (!phone || phone.trim().length === 0) {
    res.status(400).json({ msg: "Phone number is required." });
    return;
  }

  const finalMessage = message && message.trim().length > 0 ? message.trim() : "Directly registered on CRM Dashboard";

  try {
    const lead = await LeadRepo.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: finalMessage,
      status: status || "new",
      requirements: requirements ? requirements.trim() : "",
      paymentAmount: paymentAmount ? paymentAmount.trim() : "",
      advancePayment: advancePayment ? advancePayment.trim() : ""
    });

    let mailStatus = null;
    try {
      mailStatus = await sendInquiryEmail({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message
      });
    } catch (mErr) {
      console.error("Failed to safely dispatch inquiry email notifier:", mErr);
    }

    res.status(201).json({
      ...lead,
      lead, // Keep original container clean in case of dependency matching
      mailStatus
    });
  } catch (err) {
    res.status(500).json({ msg: "Database failure creating inquiry lead.", error: err.message });
  }
};

export const getLeads = async (req, res) => {
  try {
    const leads = await LeadRepo.find();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ msg: "Database failure loading inquiries.", error: err.message });
  }
};

export const updateLead = async (req, res) => {
  const { id } = req.params;
  const { status, name, email, phone, requirements, paymentAmount, advancePayment } = req.body;

  const validStatuses = ["new", "contacted", "converted"];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ msg: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    return;
  }

  const updateFields = {};
  if (status !== undefined) updateFields.status = status;
  if (name !== undefined) updateFields.name = name.trim();
  if (email !== undefined) updateFields.email = email.trim();
  if (phone !== undefined) updateFields.phone = phone.trim();
  if (requirements !== undefined) updateFields.requirements = requirements.trim();
  if (paymentAmount !== undefined) updateFields.paymentAmount = paymentAmount.trim();
  if (advancePayment !== undefined) updateFields.advancePayment = advancePayment.trim();

  try {
    const updatedLead = await LeadRepo.findByIdAndUpdate(id, updateFields);
    if (!updatedLead) {
      res.status(404).json({ msg: "Inquiry lead not found." });
      return;
    }
    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({ msg: "Database failure updating lead data.", error: err.message });
  }
};

export const getSmtpStatus = async (req, res) => {
  res.json({
    SMTP_HOST: process.env.SMTP_HOST || "",
    SMTP_PORT: process.env.SMTP_PORT || "587",
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS_SET: !!process.env.SMTP_PASS,
    COMPANY_EMAIL: process.env.COMPANY_EMAIL || "karthi02.study@gmail.com",
    activeMode: (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ? "live" : "simulated"
  });
};

export const testSmtpConnection = async (req, res) => {
  const { testRecipient } = req.body;
  const targetEmail = testRecipient || process.env.COMPANY_EMAIL || "karthi02.study@gmail.com";

  const client = getMailerTransport();
  if (!client) {
    res.status(400).json({
      success: false,
      msg: "SMTP environment configuration is incomplete. To connect a live SMTP relay, please populate SMTP_HOST, SMTP_USER, and SMTP_PASS variables.",
      details: {
        host: process.env.SMTP_HOST || "Not Set",
        user: process.env.SMTP_USER || "Not Set"
      }
    });
    return;
  }

  try {
    // 1. Verify connection handshake
    console.log("⚡ Initiating diagnostic SMTP verification check...");
    await client.verify();
    
    // 2. Try sending a quick test message
    const testSubject = `[AURA CRM] Diagnostic SMTP Verification Success`;
    const messageText = `This is a diagnostic verification email sent by Aura Photo Studio CRM at the request of the administrator.\n\nConnection verified and SMTP pathway is working correctly!`;
    const systemEmailUser = process.env.SMTP_USER || "mailer@auraphotostudio.com";
    
    const info = await client.sendMail({
      from: `"Aura Photo Studio Diagnostics" <${systemEmailUser}>`,
      to: targetEmail,
      subject: testSubject,
      text: messageText,
      html: `
        <div style="font-family: sans-serif; background-color: #0F0F0F; color: #F5F5F5; padding: 40px; border-radius: 8px; border: 1px solid #2A2A2A; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #D4AF37; margin-bottom: 12px;">📡 SMTP Handshake: SUCCESSFUL</h2>
          <p style="font-size: 14px; color: #CCC; line-height: 1.6;">
            Excellent news! Aura Photo Studio has successfully authenticated with your SMTP server and dispatched this test email to your mailbox.
          </p>
          <div style="background-color: #1A1A1A; padding: 15px; border-left: 3px solid #D4AF37; font-family: monospace; font-size: 11px; margin: 20px 0; color: #AAA;">
            <strong>Host:</strong> ${process.env.SMTP_HOST}<br/>
            <strong>Port:</strong> ${process.env.SMTP_PORT || 587}<br/>
            <strong>User:</strong> ${process.env.SMTP_USER}<br/>
            <strong>Target:</strong> ${targetEmail}
          </div>
          <p style="font-size: 12px; color: #666;">
            Timestamp: ${new Date().toISOString()} | Session active.
          </p>
        </div>
      `
    });

    res.json({
      success: true,
      msg: `Test email successfully dispatched via SMTP!`,
      details: {
        envelope: info.envelope,
        messageId: info.messageId,
        accepted: info.accepted,
        response: info.response,
        telemetry: `Authenticated correctly on host TLS server. Connection hand-shake completed.`
      }
    });
  } catch (err) {
    console.error("❌ Diagnostic SMTP connection test failed:", err);
    res.status(500).json({
      success: false,
      msg: `SMTP connection handshake failed: ${err.message}`,
      details: {
        error: err.message,
        code: err.code,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT
      }
    });
  }
};
