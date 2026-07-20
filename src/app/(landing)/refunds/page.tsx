'use client';

import { LegalPage } from '@/components/landing/legal-page';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export default function RefundsPage() {
  return (
    <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
      <Navbar />
      <LegalPage title="Refund & Cancellation Policy" content={`This Refund & Cancellation Policy explains how cancellations and refunds are handled for Affvance, a service operated by Meeting Me ("we," "us," or "our"). Affvance provides an AI-powered content generation platform available through www.affvance.com.
All payments for subscriptions and services are securely processed by Paddle, who acts as the Merchant of Record for all transactions. Paddle is responsible for payment processing, invoicing, taxes, and refund processing.
By purchasing a subscription or using the Services, you agree to this Refund & Cancellation Policy in addition to our Terms & Conditions and Privacy Policy.

1. Subscription Cancellation
1.1 How to Cancel
You may cancel your subscription at any time by:
• Accessing your account dashboard
• Using the Paddle subscription management link provided in your billing emails
• Contacting our support team at assist@affvance.com
1.2 Effect of Cancellation
When you cancel a subscription:
• Future renewals will be stopped
• Your subscription will remain active until the end of the current billing period
• You will not be charged again after cancellation

2. Refund Policy
2.1 14-Day Refund Window
We offer a 14-day refund window for new subscription purchases.
If you request a refund within 14 days of the initial purchase, you may be eligible for a full refund of the subscription fee.
Refund requests submitted after the 14-day period are not eligible for refunds.
2.2 Refund Scope
Refunds apply only to the initial subscription purchase.
Refunds are not provided for:
• Subscription renewals
• Partial billing periods
• Unused features or credits
• Plan downgrades or upgrades

3. How to Request a Refund
To request a refund within the 14-day refund window, contact our support team at:
assist@affvance.com
Please include:
• Your account email address
• Transaction or invoice ID
• A short description of the issue
Our support team will review your request and coordinate the refund process through Paddle.

4. Refund Processing
If a refund request is approved:
• The refund will be processed by Paddle
• Refunds are issued to the original payment method used for the purchase
Refunds typically appear in your account within 5–10 business days, depending on your bank or payment provider.

5. Payment Disputes
If you experience a billing issue, please contact our support team before initiating a payment dispute.
Payment disputes and chargebacks are handled by Paddle, who manages payment processing and dispute resolution.

6. Changes to This Policy
We may update this Refund & Cancellation Policy from time to time. Any updates will be posted on this page with a revised "Last Updated" date.
Continued use of the Services after updates constitutes acceptance of the revised policy.

7. Contact Information
If you have questions about cancellations or refunds, please contact us:
Email: assist@affvance.com 

[ Last Updated: March 6, 2026]`} />
      <Footer />
    </div>
  );
}
