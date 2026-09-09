/* ── Super Collection — Legal Policies (website content) ──────────────
   Har policy ke sections blocks me hote hain: p (paragraph), list, table.
   PolicyPage.jsx inko premium design me render karta hai. */

const POLICIES = {
  privacy: {
    title: 'Privacy Policy',
    updated: '9 September 2026',
    intro: 'At Super Collection ("we", "our", "us"), protecting your privacy is not just a legal obligation — it is the foundation of the trust you place in us when you shop for India\u2019s timeless craft. This policy explains what we collect, how we use it, and the rights you have over your data.',
    sections: [
      {
        heading: 'Information We Collect',
        blocks: [
          {
            type: 'table',
            headers: ['Category', 'Details', 'Purpose'],
            rows: [
              ['Account Data', 'Name, email, phone number', 'Order processing, communication'],
              ['Address Data', 'Full shipping address, pincode', 'Delivery of your order'],
              ['Payment Data', 'UPI ID (Online Pay), Razorpay transaction references', 'Payment processing'],
              ['Technical Data', 'IP address, browser type, device information', 'Security, analytics'],
              ['Usage Data', 'Pages visited, products viewed', 'Improving your experience'],
            ],
          },
          { type: 'p', text: 'What we NEVER collect:' },
          {
            type: 'list',
            items: [
              'We never store your full card numbers, CVV, or UPI PIN',
              'We never see your banking passwords',
              'Payment credentials go directly to Razorpay\u2019s secure servers — they never touch our systems',
            ],
          },
        ],
      },
      {
        heading: 'How We Use Your Information',
        blocks: [
          {
            type: 'list',
            items: [
              'Processing and delivering your orders',
              'Sending order confirmations and delivery updates (email/SMS)',
              'Responding to your queries and support requests',
              'Fraud prevention and security monitoring',
              'Improving our product range and services',
            ],
          },
        ],
      },
      {
        heading: 'UPI Payment Data Handling',
        blocks: [
          { type: 'p', text: 'When you choose Online Pay (UPI):' },
          {
            type: 'list',
            items: [
              'You provide your UPI ID in Razorpay\u2019s secure payment pop-up — not on our website',
              'Razorpay (PCI-DSS Level 1 certified) processes the transaction',
              'We receive only: transaction ID, payment status, and masked payment reference',
              'Your UPI ID is never stored on our servers in readable form',
              'OTPs are sent by your bank / UPI app — we have no role in them',
            ],
          },
        ],
      },
      {
        heading: 'Data Sharing',
        blocks: [
          { type: 'p', text: 'We share data only when necessary:' },
          {
            type: 'table',
            headers: ['Partner', 'Data Shared', 'Why'],
            rows: [
              ['Razorpay', 'Transaction amount, order reference', 'Payment processing'],
              ['India Post', 'Name, address, phone', 'Shipment delivery'],
              ['Email Service', 'Your email address', 'Order confirmations'],
            ],
          },
          { type: 'p', text: 'We never sell, rent, or trade your personal data to third parties for marketing.' },
        ],
      },
      {
        heading: 'Data Security',
        blocks: [
          {
            type: 'list',
            items: [
              'All traffic is encrypted with HTTPS/TLS',
              'Passwords are hashed with bcrypt (never stored readable)',
              'Login sessions use httpOnly secure cookies (XSS-safe)',
              'Payment signature verified on our server (HMAC-SHA256)',
              'Admin access is restricted and audited',
            ],
          },
        ],
      },
      // __APPEND__
    ],
  },

  returns: {
    title: 'Return & Refund Policy',
    updated: '9 September 2026',
    intro: 'Your satisfaction is the heart of Super Collection. If an outfit does not feel right, we make returning it simple, honest and transparent — every step is explained here, with no hidden clauses and no fine-print traps.',
    sections: [
      {
        heading: 'Our 7-Day Easy Return Promise',
        blocks: [
          { type: 'p', text: 'Every purchase is covered by a 7-day hassle-free return window, counted from the date of delivery (as recorded by India Post).' },
          {
            type: 'list',
            items: [
              'Day 1 = the day your parcel is delivered',
              'Return requests must be raised within 7 days of delivery',
              'Requests are accepted via our Contact page or WhatsApp support',
            ],
          },
        ],
      },
      {
        heading: 'Eligibility for a Return',
        blocks: [
          { type: 'p', text: 'To keep the process fair for everyone, returned items must meet all of the following conditions:' },
          {
            type: 'list',
            items: [
              'The item is unworn, unwashed and unaltered',
              'Original tags, packaging and any complimentary accessories are intact',
              'The invoice or order confirmation is available',
              'The item was not purchased during a final-sale clearance',
            ],
          },
        ],
      },
      {
        heading: 'Non-Returnable Items',
        blocks: [
          {
            type: 'list',
            items: [
              'Items marked Final Sale / Clearance at checkout',
              'Custom-stitched or made-to-measure outfits',
              'Items damaged due to misuse, improper washing or self-alteration',
              'Free gifts and promotional items',
            ],
          },
        ],
      },
      {
        heading: 'How to Request a Return',
        blocks: [
          {
            type: 'list',
            items: [
              'Step 1 — Contact us within 7 days of delivery with your order ID and reason',
              'Step 2 — Our team reviews the request and confirms approval (usually within 24 hours)',
              'Step 3 — Pack the item securely in its original packaging',
              'Step 4 — Hand the parcel to India Post using the return instructions we share',
              'Step 5 — Share the India Post tracking number with our support team',
            ],
          },
        ],
      },
      {
        heading: 'Return Shipping',
        blocks: [
          { type: 'p', text: 'All return shipments travel through India Post, the same trusted partner that delivers your orders. Registered Post / Speed Post with tracking is mandatory so that both sides can follow the parcel.' },
          {
            type: 'list',
            items: [
              'Wrong, damaged or defective item — we bear the full return shipping cost',
              'Change of mind / size issue — a flat return shipping fee is deducted from the refund',
              'We recommend insuring parcels of higher value in transit',
            ],
          },
        ],
      },
      {
        heading: 'Refund Process & Timelines',
        blocks: [
          { type: 'p', text: 'Refunds begin only after the returned item reaches us and passes a quality check. Here is exactly what happens and when:' },
          {
            type: 'table',
            headers: ['Stage', 'What Happens', 'Timeline'],
            rows: [
              ['Parcel received', 'Quality check of the returned item', 'Within 48 hours of arrival'],
              ['Refund approved', 'Confirmation sent to your email', 'Same day as approval'],
              ['UPI refund initiated', 'Amount sent back to your original UPI payment method via Razorpay', 'Within 24 hours of approval'],
              ['Amount in your account', 'Depends on your bank / UPI app', '3–5 working days (typical)'],
            ],
          },
        ],
      },
      {
        heading: 'Damaged, Defective or Wrong Items',
        blocks: [
          {
            type: 'list',
            items: [
              'Report within 48 hours of delivery with photos of the item and packaging',
              'We arrange the return through India Post at our cost',
              'Choose a free replacement or a full refund — whichever you prefer',
            ],
          },
        ],
      },
      {
        heading: 'Exchanges',
        blocks: [
          { type: 'p', text: 'Prefer a different size or design? Instead of a refund we can exchange your item, subject to stock availability. The 7-day window and eligibility conditions apply exactly as for returns.' },
        ],
      },
    ],
  },

  payment: {
    title: 'Payment Policy',
    updated: '9 September 2026',
    intro: 'Payments at Super Collection run on UPI — fast, familiar and secure. This policy explains exactly how your money moves, who touches your data, and the protections built into every transaction.',
    sections: [
      {
        heading: 'Accepted Payment Method — UPI (Online Pay)',
        blocks: [
          { type: 'p', text: 'All online orders are paid through Online Pay, powered by UPI (Unified Payments Interface) and processed via Razorpay, a PCI-DSS Level 1 certified payment gateway.' },
          {
            type: 'list',
            items: [
              'Pay using any UPI ID (VPA) — GPay, PhonePe, Paytm, BHIM or any bank UPI app',
              'Scan the QR code or enter your UPI ID inside the secure Razorpay pop-up',
              'All amounts are charged in Indian Rupees (INR)',
            ],
          },
        ],
      },
      {
        heading: 'How a UPI Payment Works',
        blocks: [
          {
            type: 'list',
            items: [
              'Step 1 — You place the order and choose Online Pay (UPI)',
              'Step 2 — A secure Razorpay payment window opens on your screen',
              'Step 3 — You enter your UPI ID and approve the request in your UPI app',
              'Step 4 — Your bank debits the amount; Razorpay confirms the payment',
              'Step 5 — Our server verifies the payment signature and confirms your order',
            ],
          },
        ],
      },
      {
        heading: 'UPI ID Security & Data Handling',
        blocks: [
          { type: 'p', text: 'Your UPI credentials are handled with bank-grade caution. The Golden Rule: your payment details never touch our servers.' },
          {
            type: 'list',
            items: [
              'Your UPI ID and UPI PIN are entered only inside Razorpay\u2019s secure, encrypted environment',
              'We never see, ask for, or store your UPI PIN, OTP or banking password',
              'Our servers receive only the transaction ID, payment status and a masked payment reference',
              'Every payment is verified server-side using HMAC-SHA256 signature verification before an order is confirmed',
              'All traffic between you and Super Collection is encrypted with HTTPS/TLS',
            ],
          },
        ],
      },
      {
        heading: 'Payment Verification & Order Confirmation',
        blocks: [
          {
            type: 'list',
            items: [
              'An order is marked Paid only after server-side signature verification succeeds',
              'A confirmation email with your order details follows immediately',
              'If your UPI app shows the payment as done but the order is not confirmed, do not pay again — contact support with the transaction ID',
            ],
          },
        ],
      },
      {
        heading: 'Failed, Declined or Pending Payments',
        blocks: [
          {
            type: 'list',
            items: [
              'Declined by bank — no money leaves your account; you may simply retry',
              'Debited but order failed — banks usually auto-reverse the amount within 5–7 working days; we help you follow up with the transaction reference',
              'Pending UPI requests expire automatically in your UPI app if not approved',
            ],
          },
        ],
      },
      {
        heading: 'Refunds to Your UPI',
        blocks: [
          { type: 'p', text: 'Approved refunds are credited back to the original UPI payment method used at checkout, via the same Razorpay route. Typical credit time is 3–5 working days after refund approval — see the Return & Refund Policy for the full timeline.' },
        ],
      },
      {
        heading: 'Payment Support',
        blocks: [
          { type: 'p', text: 'Facing a payment issue? Reach us via the Contact page or WhatsApp with your order ID and the UPI transaction reference (the 12-digit UTR number). We respond within one business day.' },
        ],
      },
    ],
  },

  delivery: {
    title: 'Delivery & Shipping Policy',
    updated: '9 September 2026',
    intro: 'Every Super Collection parcel travels with India Post — the postal network that has connected India for over 170 years. This policy lays out our processing timelines, delivery estimates and what happens at every stage of the journey.',
    sections: [
      {
        heading: 'Our Shipping Partner — India Post',
        blocks: [
          { type: 'p', text: 'All shipments — to metros and remote pin codes alike — are handled exclusively through India Post (Speed Post / Registered Post). We chose India Post for its unmatched reach and reliability.' },
          {
            type: 'list',
            items: [
              'Delivery to 19,100+ pin codes across India, including remote and rural areas',
              'Fully trackable end-to-end with an official India Post consignment number',
              'Doorstep delivery with proof-of-delivery records',
            ],
          },
        ],
      },
      {
        heading: 'Order Processing Timelines',
        blocks: [
          { type: 'p', text: 'Every order passes through fixed, transparent stages before it is handed to India Post:' },
          {
            type: 'table',
            headers: ['Stage', 'What Happens', 'Timeline'],
            rows: [
              ['Order confirmed', 'Payment verified, order accepted', 'Instant (on successful payment)'],
              ['Packing', 'Quality check, careful packaging, invoice', 'Within 1–2 business days'],
              ['Handover to India Post', 'Booking + tracking number generated', 'Within 1 business day of packing'],
              ['Tracking details shared', 'Consignment number sent to your email', 'Within 24 hours of booking'],
            ],
          },
          { type: 'p', text: 'Business days exclude Sundays and public holidays. Orders placed after 5 PM are processed the next business day.' },
        ],
      },
      {
        heading: 'Estimated Delivery Timelines',
        blocks: [
          {
            type: 'table',
            headers: ['Destination', 'India Post Transit', 'Total Doorstep Time'],
            rows: [
              ['Jaipur & nearby (Rajasthan)', '1–3 business days', '3–5 business days'],
              ['Metro cities & state capitals', '2–4 business days', '4–6 business days'],
              ['Rest of India', '3–7 business days', '5–9 business days'],
              ['Remote / North-East / island regions', '5–9 business days', '7–12 business days'],
            ],
          },
          { type: 'p', text: 'These are India Post transit estimates, not guarantees. Your tracking number always shows the live, authoritative status.' },
        ],
      },
      {
        heading: 'Safe Delivery Charges',
        blocks: [
          {
            type: 'list',
            items: [
              'A flat Safe Delivery charge of \u20B949 applies on orders below the free-delivery threshold',
              'FREE safe delivery on qualifying orders as announced on the website or during sales',
              'The charge (if any) is shown transparently at checkout before you pay — there are no hidden handling or packaging fees, ever',
            ],
          },
        ],
      },
      {
        heading: 'Tracking Your Order',
        blocks: [
          {
            type: 'list',
            items: [
              'Your India Post consignment number arrives by email after booking',
              'Track it on the India Post website or via the link in your email',
              'The My Orders page in your account always shows the latest status',
            ],
          },
        ],
      },
      {
        heading: 'Delivery Attempts & Address Accuracy',
        blocks: [
          {
            type: 'list',
            items: [
              'Please double-check your name, full address, landmark and pincode before paying — India Post delivers exactly to what you enter',
              'If a delivery attempt is missed, India Post follows its standard re-attempt / hold-at-office procedure',
              'Parcels unclaimed after the India Post holding period are returned to us (see below)',
            ],
          },
        ],
      },
      {
        heading: 'Delays & Unforeseen Circumstances',
        blocks: [
          { type: 'p', text: 'Weather, strikes, festivals, natural events and peak-season loads can stretch India Post timelines. If a parcel is unreasonably delayed, contact us — we trace it with India Post and keep you informed until it arrives.' },
        ],
      },
      {
        heading: 'Returned-to-Origin (RTO) Parcels',
        blocks: [
          {
            type: 'list',
            items: [
              'If a parcel returns to us undelivered (wrong address, repeated non-collection), we contact you immediately',
              'Re-shipment is possible at standard shipping cost, or',
              'The item value is refunded (shipping charges already spent with India Post are non-refundable)',
            ],
          },
        ],
      },
    ],
  },

  terms: {
    title: 'Terms & Conditions',
    updated: '9 September 2026',
    intro: 'Welcome to Super Collection. These Terms & Conditions form the agreement between you and us when you browse, shop or transact on this website. We have written them in plain language — transparent by design, because trust starts with clarity.',
    sections: [
      {
        heading: '1. Acceptance of These Terms',
        blocks: [
          { type: 'p', text: 'By accessing or purchasing from this website you agree to these Terms & Conditions together with our Privacy Policy, Payment Policy, Delivery Policy and Return & Refund Policy. If you do not agree, please do not use the website.' },
        ],
      },
      {
        heading: '2. Who We Are',
        blocks: [
          { type: 'p', text: 'Super Collection is a curated online store for traditional & luxury women\u2019s wear — suits, kurtis, lehengas and sarees — operated from Shop 24, Johari Bazaar, Jaipur, Rajasthan 302003, India. Reach us at hello@supercollection.in or +91 98765 43210.' },
        ],
      },
      {
        heading: '3. Eligibility & Your Account',
        blocks: [
          {
            type: 'list',
            items: [
              'You must be at least 18 years old, or transacting under guardian supervision, to purchase',
              'Account information you provide must be accurate, current and yours',
              'You are responsible for keeping your login credentials confidential',
              'Notify us immediately of any unauthorised account use',
            ],
          },
        ],
      },
      {
        heading: '4. Products, Pricing & Availability',
        blocks: [
          {
            type: 'list',
            items: [
              'Product images are for representation; slight colour variation may occur due to screen settings and handcrafted fabrics',
              'All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise',
              'Prices, offers and stock availability may change without prior notice',
              'In the rare case of a pricing error, we will contact you before processing the order',
            ],
          },
        ],
      },
      {
        heading: '5. Orders & Confirmation',
        blocks: [
          {
            type: 'list',
            items: [
              'An order is a request to purchase; it becomes binding when payment is verified and we send confirmation',
              'We reserve the right to decline or cancel any order (suspected fraud, stock error, shipping restrictions) with a full refund',
              'Order confirmations and updates are sent to the email on your account',
            ],
          },
        ],
      },
      {
        heading: '6. Payments',
        blocks: [
          { type: 'p', text: 'Payments are collected through UPI (Online Pay) processed securely via Razorpay. We never store your UPI PIN, OTP or banking credentials — full details are in our Payment Policy.' },
        ],
      },
      {
        heading: '7. Shipping & Delivery',
        blocks: [
          { type: 'p', text: 'All orders ship through India Post with published processing and transit timelines. Delivery estimates are good-faith projections, not guarantees — details in our Delivery Policy.' },
        ],
      },
      {
        heading: '8. Returns & Refunds',
        blocks: [
          { type: 'p', text: 'Returns are accepted within 7 days of delivery subject to our eligibility conditions, with refunds routed back to your UPI payment method. The complete process is described in our Return & Refund Policy.' },
        ],
      },
      {
        heading: '9. Intellectual Property',
        blocks: [
          { type: 'p', text: 'All content on this website — text, images, design, logos and code — is owned by or licensed to Super Collection and protected by applicable laws. Copying, reproducing or reusing it commercially without written permission is prohibited.' },
        ],
      },
      {
        heading: '10. Acceptable Use',
        blocks: [
          {
            type: 'list',
            items: [
              'Do not misuse, hack, scrape or disrupt the website or its services',
              'Do not place fraudulent orders or abuse the return / refund process',
              'Do not use the website to violate any applicable Indian law',
            ],
          },
        ],
      },
      {
        heading: '11. Limitation of Liability',
        blocks: [
          { type: 'p', text: 'To the maximum extent permitted by law, Super Collection\u2019s total liability for any claim relating to an order is limited to the amount you paid for that order. We are not liable for indirect or consequential losses, or for delays caused by India Post or other third parties beyond our reasonable control.' },
        ],
      },
      {
        heading: '12. Governing Law & Jurisdiction',
        blocks: [
          { type: 'p', text: 'These Terms are governed by the laws of India. Any dispute arising from them is subject to the exclusive jurisdiction of the competent courts of Jaipur, Rajasthan.' },
        ],
      },
      {
        heading: '13. Changes to These Terms',
        blocks: [
          { type: 'p', text: 'We may update these Terms from time to time. The revised version takes effect the moment it is published on this page with a new updated date. Continued use of the website means you accept the revised Terms.' },
        ],
      },
      {
        heading: '14. Contact Us',
        blocks: [
          { type: 'p', text: 'Questions about these Terms? Write to hello@supercollection.in, call or WhatsApp +91 98765 43210, or visit us at Shop 24, Johari Bazaar, Jaipur, Rajasthan 302003 (Mon–Sat, 10 AM–8 PM).' },
        ],
      },
    ],
  },
};

export default POLICIES;
