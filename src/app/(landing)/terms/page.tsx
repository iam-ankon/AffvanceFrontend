'use client';

import { LegalPage } from '@/components/landing/legal-page';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
            <Navbar />
            <LegalPage title="Terms and Conditions" content={`Affvance is an AI-powered content generation platform operated by Meeting Me ("Company", "we," "us," "our"). These Terms and Conditions ("Terms") govern your access to and use of our website https://affvance.com and all related services, tools, and subscriptions (collectively, the "Services").
Affvance is a product and brand operated by Meeting Me, the legal entity responsible for providing and managing the Services.
By accessing or using the Services, creating an account, or purchasing a subscription, you agree to be bound by these Terms. If you do not agree, you must not use the Services.

1. Acceptance of Terms
By using our Services, you confirm that:
• You are at least 13 years old (or older if required by local law);
• You have the legal capacity to enter into this agreement;
• You agree to comply with these Terms and all applicable laws and regulations.

2. Account Registration
To access certain features, you must create an account. You agree that:
• All registration information you provide is accurate and current;
• You are responsible for maintaining the confidentiality of your login credentials;
• You are fully responsible for all activities conducted through your account.
You must notify us immediately if you suspect unauthorized access or security breaches.

3. Use of the Services
You agree to use the Services only for lawful purposes. You must not:
• Create or distribute illegal, misleading, harmful, abusive, or infringing content;
• Use the Services to violate intellectual property or privacy rights;
• Reverse engineer, decompile, or attempt to extract source code;
• Interfere with platform security, performance, or availability.
You are solely responsible for how you use any AI-generated content.

4. Nature of the Services
Affvance provides a fully automated software platform that assists users with AI-powered content generation and SEO workflows.
The Services are delivered digitally through the platform.
Affvance does not provide human-driven consulting or manual services as part of the standard subscription offering.

5. Content Ownership & AI Output
a. Your Content
You retain ownership of:
• Content you upload; and
• Content generated through your account using the Services.
b. License to Operate the Services
You grant us a limited, non-exclusive, revocable license to store, process, and display your content solely to provide and improve the Services.
We do not sell or publicly share your private content.

6. Payments, Subscriptions & Paddle
a. Payment Processing
All payments are processed by Paddle.com, who acts as the Merchant of Record for Affvance.
By purchasing a subscription, you also agree to Paddle's Terms and Privacy Policy.
Paddle is responsible for:
• Payment processing
• Invoicing
• Taxes (including VAT/GST where applicable)
• Chargeback handling

b. Subscription Terms
• Subscriptions are billed in advance on a recurring basis (monthly or annually);
• Your subscription will automatically renew unless canceled before the renewal date;
• Prices may change, but changes will not affect your current billing period.

c. Cancellations
• You may cancel your subscription at any time via your account or Paddle’s checkout links;
• Cancellation stops future billing but does not affect access for the remainder of the paid billing period.

d. Refunds
Customers may request a refund within 14 days of the initial purchase date if they are not satisfied with the Services.
Refund requests must be submitted through our support channels and will be processed in accordance with Paddle's refund policies and payment processing procedures.

e. Chargebacks & Payment Disputes
• Customers experiencing billing issues should contact support first so we can assist with resolution.
• Fraudulent or abusive chargebacks may result in account suspension or termination.

7. Termination
We may suspend or terminate your account immediately if:
• You violate these Terms;
• You misuse the Services;
• Required by law or platform security concerns.
You may terminate your account at any time. Upon termination:
• Access to the Services ends;
• Data may be deleted in accordance with our Privacy Policy and legal obligations.

8. Privacy & Data Protection
Your use of the Services is also governed by our Privacy Policy, which explains how we collect, process, and protect personal data in compliance with GDPR and other data protection laws.

9. Disclaimers
The Services are provided "as is" and "as available."
We do not guarantee that:
• The Services will be uninterrupted or error-free;
• AI-generated content is accurate, complete, or suitable for any specific purpose;
• Generated content complies with legal, SEO, or commercial requirements.
You acknowledge that AI output may contain errors and must be reviewed before use.

10. Limitation of Liability
To the maximum extent permitted by law:
• We are not liable for indirect, incidental, consequential, or special damages;
• We are not responsible for business losses, lost revenue, or data loss;
• Our total liability shall not exceed the amount paid by you for the Services in the previous 12 months.
Nothing in these Terms limits liability where exclusion is not permitted by law.

11. Changes to the Services or Terms
We may update these Terms from time to time. Updated Terms will be posted with a revised Last Updated date.
Continued use of the Services after updates constitutes acceptance of the revised Terms.

12. Governing Law
These Terms are governed by the laws of the jurisdiction in which Meeting Me, the operator of Affvance, is registered, without regard to conflict of law principles.

13. Contact Information
If you have questions regarding these Terms, please contact us:
Email: assist@affvance.com 

[ Last Updated: March 6, 2026 ]`} />
            <Footer />
        </div>
    );
}
