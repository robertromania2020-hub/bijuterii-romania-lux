# Bijuterii de Lux Online

Build a modern, premium Romanian online jewelry store.

IMPORTANT:

The entire customer-facing website MUST be in Romanian.

All buttons, menus, labels, forms, validation messages, product information, cart, checkout text, account pages and notifications must be in Romanian.

The admin dashboard must also be in Romanian.

Do NOT use English text in the user interface, except where technically necessary inside code.

Use Romanian diacritics correctly: ă, â, î, ș, ț.

1. BRAND / VISUAL STYLE

Create a premium, elegant jewelry e-commerce website.

The visual identity should communicate:

luxury

elegance

femininity

modern fashion

premium quality

trust

Use a clean minimalist design with plenty of white space, elegant typography and high-quality product photography.

The design must be fully responsive:

desktop

tablet

mobile

Mobile-first is important.

Use subtle animations and hover effects, but keep the website fast and elegant.

Do not make the website look like a generic template.

2. MAIN NAVIGATION

Create a professional header with:

Logo / brand name placeholder:
“BIJUTERII”

Navigation:

Acasă

Bijuterii

Noutăți

Colecții

Reduceri

Despre noi

Contact

On the right side:

🔍 Căutare

👤 Contul meu

🛒 Coș

On mobile, create a clean mobile navigation menu.

3. HOMEPAGE

Create a premium hero section.

Main headline:

“Eleganță pe care o porți în fiecare zi”

Subheadline:

“Descoperă colecția noastră de bijuterii din oțel și bijuterii placate cu aur, create pentru a-ți completa stilul.”

Buttons:

“Descoperă colecția”

“Vezi reducerile”

Create a premium jewelry visual area using elegant product imagery/placeholders.

4. PRODUCT CATEGORIES

Create category cards for:

Inele

Brățări

Coliere

Cercei

Seturi

Bijuterii placate cu aur

Bijuterii din oțel

Reduceri

Each category should have an attractive image and link to the category page.

5. FEATURED PRODUCTS

Create a section:

“Produse populare”

Product cards must contain:

imagine

nume produs

preț

preț vechi, when applicable

procent reducere

badge “Reducere”

badge “Nou”

disponibilitate

button “Adaugă în coș”

wishlist heart icon

Example products can be placeholders for now.

Do not hardcode the final catalog because products will later come from Supabase.

6. NEW PRODUCTS

Create a section:

“Noutăți”

Show the newest products dynamically once the database is connected.

7. SALE SECTION

Create a visually attractive section:

“Descoperă reducerile”

Example:

“Până la -30%”

Button:

“Vezi toate reducerile”

This section must later be connected to the discount system.

8. COLLECTIONS

Create a section called:

“Colecții”

Example collections:

Gold Collection

Stainless Steel

Minimal

Elegance

Cadouri

These are placeholders and must later be manageable from the admin dashboard.

9. PRODUCT LISTING PAGE

Create a professional product listing page.

Features:

search

category filter

material filter

price filter

availability filter

sorting

Sorting options in Romanian:

Recomandate

Cele mai noi

Preț: crescător

Preț: descrescător

Cele mai populare

Product grid must be responsive.

10. PRODUCT PAGE

Create a premium product detail page.

Include:

large product gallery

thumbnails

product name

current price

old price

discount percentage

material

description

available sizes/variants when applicable

stock availability

quantity selector

“Adaugă în coș”

wishlist

product information

shipping information

returns information

Stock states:

“În stoc”

“Stoc limitat”

“Stoc epuizat”

The “Adaugă în coș” button must be disabled when the product is out of stock.

11. SHOPPING CART

Create a complete shopping cart.

Display:

product

image

quantity

price

subtotal

remove button

Show:

Subtotal

Reducere

Transport

Total

Buttons:

“Continuă cumpărăturile”

“Finalizează comanda”

The cart must later be connected to real database products and inventory.

12. CHECKOUT

Create a Romanian checkout page.

Sections:

“Date de contact”

Nume

Prenume

Telefon

Email

“Adresă de livrare”

Județ

Localitate

Adresă

Număr

Bloc

Scară

Apartament

Cod poștal

Observații comandă

“Metoda de livrare”

“Metoda de plată”

Payment options should initially be placeholders:

Plata ramburs

Plata online cu cardul

Do NOT implement a fake payment system.

Payment integration will be added later.

Create an order summary.

Button:

“Plasează comanda”

13. CUSTOMER ACCOUNT

Create:

“Contul meu”

Sections:

Date personale

Comenzile mele

Adresele mele

Produse favorite

Deconectare

Order statuses must be displayed in Romanian:

Nouă

Confirmată

În procesare

Expediată

Livrată

Anulată

14. FOOTER

Create a professional footer containing:

“Despre noi”

“Contact”

“Termeni și condiții”

“Politica de confidențialitate”

“Politica de retur”

“Livrare”

“Întrebări frecvente”

“Contact”

Include placeholders for:

telefon

email

program

social media

Add newsletter section:

“Abonează-te la newsletter”

Input:

“Introdu adresa ta de email”

Button:

“Abonează-te”

15. ADMIN DASHBOARD FOUNDATION

Create the structure for a protected administrator dashboard.

Route:

/admin

The admin area must be completely separate from the customer interface.

Create the following navigation:

Dashboard

Prezentare generală

Produse

Categorii

Colecții

Stoc

Comenzi

Clienți

Reduceri

Coduri promoționale

Setări

For now, create the UI and architecture.

Do NOT use fake authentication as the final solution.

The real authentication and authorization will be implemented with Supabase in the next development phase.

16. ADMIN PRODUCT MANAGEMENT

Prepare the interface for:

“Produse”

Features:

Adaugă produs

Editează produs

Șterge produs

Activează/dezactivează produs

Modifică preț

Modifică preț promoțional

Modifică stoc

Adaugă imagini

Modifică descriere

Selectează categoria

Selectează materialul

Selectează colecția

Product fields should include:

Nume produs

SKU

Descriere

Preț

Preț redus

Material

Categorie

Colecție

Stoc

Imagini

Status

Produs nou

Produs recomandat

17. ADMIN ORDERS

Prepare an orders management interface.

Admin should eventually be able to:

view orders

open order details

change order status

view customer information

view ordered products

view total

add AWB

add internal notes

18. ADMIN INVENTORY

Create a dedicated stock management page.

Display:

produs

SKU

stoc actual

status stoc

stoc minim

Use warnings for low stock.

Example:

“Stoc redus”

“Stoc epuizat”

19. ADMIN DISCOUNTS

Create a discount management interface.

Admin should eventually be able to:

create discount

edit discount

activate/deactivate discount

set percentage discount

set fixed amount discount

set start date

set end date

select products

select categories

select collections

Example:

“-20%”

“-30%”

“-50%”

20. DATABASE ARCHITECTURE PREPARATION

Design the frontend architecture so it can later connect cleanly to Supabase.

Expected future database entities:

products
categories
collections
product_images
product_variants
inventory
orders
order_items
customers
discounts
coupons
admin_users
wishlists
addresses

Do NOT create fake backend functionality.

Use clean reusable components.

21. IMPORTANT TECHNICAL REQUIREMENTS

Use a scalable architecture.

Requirements:

responsive design

reusable components

clean code

accessible UI

SEO-friendly structure

optimized images

fast loading

proper error states

loading states

empty states

mobile optimization

Use Romanian throughout the interface.

Currency:

RON / lei

Prices must be displayed in Romanian lei.

Use realistic Romanian e-commerce terminology.

22. IMPORTANT

Do NOT implement fake checkout payments.

Do NOT pretend that orders are actually being stored until Supabase is connected.

Do NOT create fake authentication as the final implementation.

Build the frontend and application architecture so that Supabase can be connected in the next phase.

At the end, provide a concise summary of:

What was created

Which pages were created

Which features are currently frontend-only

What needs to be implemented in the next phase

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bijuterii-romania-lux.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/04c05115-9a29-4417-a762-c9811506d1ea).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
