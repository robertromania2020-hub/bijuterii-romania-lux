# Roadmap — Stripe (BYOK)

- [x] Baza de date: coloane Stripe pe `orders`, `stripe_events`, RPC `apply_stripe_payment_event`
- [x] Helpers server: `stripe.server.ts`, `stripe-checkout.functions.ts` (createCheckoutSession, getPaymentStatus)
- [x] UI checkout: alegere „ramburs / card" + redirect către Stripe
- [x] Pagină succes `/comanda/succes` cu verificare status plată
- [x] Panou admin: metodă plată, status plată, dată plată, ID-uri Stripe
- [x] Webhook endpoint `/api/public/stripe-webhook` (verificare semnătură, idempotent)
- [ ] STRIPE_WEBHOOK_SECRET — utilizatorul îl creează în Stripe și îl salvează; URL: webhook endpoint (preview + producție)
- [ ] Configurare evenimente în dashboard-ul Stripe (checkout.session.completed, .expired, async_payment_succeeded/failed, payment_intent.payment_failed)
- [ ] Testare flux complet în mod TEST (card de test 4242…)