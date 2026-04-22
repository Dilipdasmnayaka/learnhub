import { Router, type IRouter, Request, Response } from "express";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";
import { sendPaymentEmail } from "../lib/mailer.js";

const router: IRouter = Router();

// Mobile payment page route
router.get("/payment/:transactionId", async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  const { amount, courseId, userId } = req.query;

  // Fetch course name/price (best-effort; fall back to query)
  let courseTitle = "Course";
  let paymentAmount = amount || "0";
  if (courseId) {
    try {
      const course = await Course.findById(courseId as string).lean();
      if (course) {
        courseTitle = course.title || courseTitle;
        paymentAmount = (course.price ?? paymentAmount).toString();
      }
    } catch {}
  }

  // Serve a simple HTML page for mobile payment
  const safeUserId = userId ? String(userId) : "";
  const safeCourseId = courseId ? String(courseId) : "";
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment - Learnhub</title>
        <style>
            :root {
              --bg: #0f172a;
              --card: #0b1221;
              --border: #1e293b;
              --primary: #22d3ee;
              --primary-dark: #0ea5e9;
              --text: #e2e8f0;
              --muted: #94a3b8;
              --success: #34d399;
            }
            * { box-sizing: border-box; }
            body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: radial-gradient(120% 120% at 10% 20%, #0ea5e915 0%, transparent 40%),
                            radial-gradient(120% 120% at 90% 80%, #22d3ee15 0%, transparent 40%),
                            var(--bg);
                color: var(--text);
                padding: 16px;
            }
            .card {
                width: min(420px, 100%);
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: 24px;
                padding: 28px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.35);
            }
            .pill {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 999px;
                border: 1px solid var(--border);
                background: rgba(255,255,255,0.04);
                color: var(--muted);
                font-size: 12px;
                letter-spacing: 0.02em;
                text-transform: uppercase;
            }
            h1 {
                margin: 12px 0 4px;
                font-size: 24px;
                letter-spacing: -0.01em;
            }
            .subtitle {
                color: var(--muted);
                margin: 0 0 20px;
                font-size: 14px;
            }
            .amount {
                display: flex;
                align-items: baseline;
                gap: 6px;
                font-size: 44px;
                font-weight: 800;
                margin: 10px 0 18px;
            }
            .amount .currency {
                font-size: 20px;
                color: var(--muted);
            }
            .list {
                display: grid;
                gap: 10px;
                margin: 18px 0 24px;
                color: var(--muted);
                font-size: 14px;
            }
            .list span { color: var(--text); font-weight: 600; }
            .pay-button {
                width: 100%;
                background: linear-gradient(120deg, var(--primary) 0%, var(--primary-dark) 100%);
                color: #0b1221;
                border: none;
                padding: 16px;
                font-size: 16px;
                font-weight: 700;
                border-radius: 14px;
                cursor: pointer;
                box-shadow: 0 15px 35px rgba(14,165,233,0.35);
                transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
            }
            .pay-button:hover { transform: translateY(-1px); filter: brightness(1.05); }
            .pay-button:active { transform: translateY(0); }
            .status {
                margin-top: 18px;
                padding: 12px 14px;
                border-radius: 12px;
                border: 1px solid var(--border);
                display: none;
            }
            .status.success {
                display: block;
                background: rgba(52, 211, 153, 0.08);
                color: var(--success);
                border-color: rgba(52, 211, 153, 0.4);
            }
            .loader {
                display: none;
                margin-top: 14px;
                color: var(--muted);
                font-size: 14px;
            }
            .spinner {
                width: 18px;
                height: 18px;
                border: 3px solid rgba(255,255,255,0.08);
                border-top: 3px solid var(--primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 8px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes flash {
                0% { background: #0f172a; }
                50% { background: #0d2620; }
                100% { background: #0f172a; }
            }
            .flash-bg {
                animation: flash 0.9s ease-in-out 2;
            }
                .checkmark-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.15);
  border: 2px solid #34d399;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  animation: pop 0.4s ease;
}

.checkmark {
  width: 25px;
  height: 50px;
  border-right: 4px solid #34d399;
  border-bottom: 4px solid #34d399;
  transform: rotate(45deg);
}

@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
        </style>
    </head>
    <body>
        <div class="card">
  <div class="pill">Secure Checkout</div>
  <h1>${courseTitle}</h1>
  <p class="subtitle">One-time payment for course access</p>

  <div class="amount">
    <span class="currency">₹</span>${paymentAmount}
  </div>

  <div class="list">
    <div id="txnRow" style="display:none;">
      Transaction ID: <span id="txnVal"></span>
    </div>
  </div>
  
  <!-- OLD BUTTON -->
  <button id="payBtn" class="pay-button" onclick="processPayment()">
    Pay & Enroll
  </button>

  <!-- LOADER -->
  <div class="loader" id="loading">
    <span class="spinner"></span>Processing payment…
  </div>

  <!-- SUCCESS MESSAGE -->
  <div class="status" id="successMsg">
    ✅ Payment successful. You’re enrolled!
  </div>

  <!-- ✅ NEW SUCCESS UI -->
  <div id="successUI" style="display:none; text-align:center; margin-top:20px;">
    <div class="checkmark-circle">
      <div class="checkmark"></div>
    </div>
    <p style="margin-top:10px; font-weight:600;">Payment Completed</p>

    <button class="pay-button" style="margin-top:15px; background:#34d399;" onclick="goToDashboard()">
View Dashboard    </button>
  </div>
</div>

        <script>
            async function processPayment() {
                const button = document.querySelector('.pay-button');
                const loading = document.getElementById('loading');
                const successMessage = document.getElementById('successMsg');
                const txnRow = document.getElementById('txnRow');
                const txnVal = document.getElementById('txnVal');

                button.disabled = true;
                loading.style.display = 'flex';

                try {
                    // Simulate payment processing
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // First, show success to the user on the phone
                    txnVal.innerText = '${transactionId}';
                    txnRow.style.display = 'block';
                    loading.style.display = 'none';
                    successMessage.classList.add('success');
                    successMessage.style.display = 'block';
                    document.body.classList.add('flash-bg');
                    setTimeout(() => document.body.classList.remove('flash-bg'), 1600);
                    document.getElementById("payBtn").style.display = "none";
                    document.getElementById("successUI").style.display = "block";

                    // Then notify backend to enroll the user (laptop will pick this up on next poll)
                    const resp = await fetch('/api/payments/complete-qr', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        transactionId: '${transactionId}',
                        courseId: '${safeCourseId}',
                        userId: '${safeUserId}'
                      })
                    });
                    const data = await resp.json();
                    if (!resp.ok || !data.success) {
                      throw new Error(data.error || 'Enrollment failed');
                    }

                } catch (error) {
                    console.error('Payment failed:', error);
                    loading.style.display = 'none';
                    button.disabled = false;
                    alert('Payment failed. Please try again.');
                }
            }
        </script>
    </body>
    </html>
  `;

  res.send(html);
});

// Complete enrollment from mobile QR flow (no auth; demo-only)
router.post("/complete-qr", async (req: Request, res: Response) => {
  try {
    const { transactionId, courseId, userId } = req.body;
    if (!transactionId || !courseId || !userId) {
      res
        .status(400)
        .json({ error: "transactionId, courseId, and userId are required" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    // Prevent duplicate enrollments
    const existing = await Enrollment.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      courseId: new mongoose.Types.ObjectId(courseId),
    });
    if (existing && existing.paymentStatus === "completed") {
      res.status(200).json({ success: true, message: "Already enrolled" });
      return;
    }

    const enrollment = new Enrollment({
      userId: new mongoose.Types.ObjectId(userId),
      courseId: new mongoose.Types.ObjectId(courseId),
      paymentMethod: "qr_code",
      paymentStatus: "completed",
      amountPaid: course.price,
      transactionId,
      enrolledAt: new Date(),
    });
    await enrollment.save();

    // Best-effort email receipt
    try {
      const user = await User.findById(userId).lean();
      if (user?.email) {
        await sendPaymentEmail(user.email, course.title, String(transactionId));
      }
    } catch (emailErr) {
      console.warn("[mail] sendPaymentEmail (complete-qr) failed:", emailErr);
    }

    res.status(201).json({
      success: true,
      message: "Payment completed and enrollment saved.",
    });
  } catch (err) {
    console.error("complete-qr error:", err);
    res.status(500).json({ error: "Failed to complete enrollment" });
  }
});

export default router;
