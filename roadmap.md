# Roadmap — Stripe (BYOK)

- [x] Baza de date: coloane Stripe pe `orders`, `stripe_events`, RPC `apply_stripe_payment_event`
- [x] Helpers server: `stripe.server.ts`, `stripe-checkout.functions.ts` (createCheckoutSession, getPaymentStatus)
- [x] UI checkout: alegere „ramburs / card" + redirect către Stripe
- [x] Pagină succes `/comanda/succes` cu verificare status plată
- [x] Panou admin: produse (CRUD + imagini reale din bucket), metodă plată, status plată, dată plată, ID-uri Stripe
- [x] Webhook endpoint `/api/public/stripe-webhook` (verificare semnătură, idempotent) — testat: semnătură invalidă → 401, eveniment valid → comandă „plătită/confirmată", eveniment repetat → ignorat
- [x] Webhook înregistrat în Stripe pentru URL-ul de preview (mod LIVE)
- [ ] Mod TEST: cheia conectată este `rk_live_…`; pentru testul cu cardul 4242 e nevoie de o cheie de test (`sk_test_…`) + endpoint webhook de test
- [ ] Webhook pentru domeniul de producție (casaelegantei.ro) — necesită al doilea secret `whsec_`
