/**
 * Sursa unică de adevăr pentru datele magazinului: nume comercial, date
 * juridice, contact și costul standard de transport.
 */

export const SHOP_NAME = "Casa Elegantei";
export const SHOP_TAGLINE = "Casa Elegantei – magazin online";

export const LEGAL_NAME = "BOUTIQUE WOMAN & MEN S.R.L.";
export const CUI = "48597630";
export const REG_COM = "J2023000760105";
export const COMPANY_ADDRESS =
  "Principală nr. 87, sat Băbeni, comuna Topliceni, județul Buzău, România";

export const PHONE = "0774 570 743";
export const PHONE_HREF = "tel:+40774570743";
export const EMAIL = "eleganteicasa10@gmail.com";
export const EMAIL_HREF = `mailto:${EMAIL}`;
export const WORKING_HOURS = "Luni–Vineri, 09:00–18:00";

/**
 * Numărul de WhatsApp al magazinului, în format internațional fără „+"
 * și fără spații (cerut de linkurile oficiale wa.me).
 * Acesta este SINGURUL loc unde se configurează numărul de WhatsApp.
 */
export const WHATSAPP_NUMBER = "40774570743";
export const WHATSAPP_DISPLAY = "+40 774 570 743";

/** Domeniul public al magazinului, folosit în linkurile trimise clienților. */
export const SITE_URL = "https://casaelegantei.ro";

/** Tarif standard de transport (lei), aplicat la fiecare comandă. */
export const SHIPPING_COST = 25;

/** Bloc reutilizabil cu datele comerciantului, pentru pagini legale. */
export const MERCHANT_DETAILS = [
  `Denumire comercială: ${SHOP_NAME}`,
  `Denumire juridică: ${LEGAL_NAME}`,
  `CUI: ${CUI}`,
  `Nr. Registrul Comerțului: ${REG_COM}`,
  `Sediu social: ${COMPANY_ADDRESS}`,
  `Telefon: ${PHONE}`,
  `E-mail: ${EMAIL}`,
].join(" · ");

/** Secțiune reutilizabilă pentru paginile legale. */
export const MERCHANT_SECTION = {
  title: "Datele comerciantului",
  body: `${SHOP_NAME} este numele comercial al societății ${LEGAL_NAME}, CUI ${CUI}, înregistrată la Registrul Comerțului cu nr. ${REG_COM}, cu sediul social în ${COMPANY_ADDRESS}. Ne poți contacta la telefon ${PHONE} sau pe e-mail la ${EMAIL}.`,
};
