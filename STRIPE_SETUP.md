# Stripe Integration Setup Guide

## Overview
The app now has a complete 2-tier payment system:
- **Free Tier**: Ad-supported, limited to 5 snapshots, 30-day history
- **Premium Tier**: $9.99/month, no ads, unlimited snapshots, 365-day history

## What's Implemented
✅ Backend Stripe routes (checkout session creation, webhook handling)
✅ Frontend PricingModal component with upgrade flow
✅ AdBanner that triggers upgrade modal on free tier
✅ Tier system with auth_users table tracking tier status
✅ UI wiring complete (AdBanner → PricingModal → Stripe checkout)

## Next Steps: Configure Stripe

### 1. Get Stripe API Keys
- Visit https://dashboard.stripe.com/apikeys
- Copy your **Publishable Key** and **Secret Key**
- Use test keys (starting with `pk_test_` and `sk_test_`) for development

### 2. Create a Premium Product & Price
- Go to https://dashboard.stripe.com/products
- Click "Add product"
  - Name: "Premium Subscription"
  - Pricing: $9.99/month (select "Recurring" and "Monthly")
  - Copy the **Price ID** (starts with `price_`)

### 3. Configure Environment Variables

**Backend (Render Dashboard)**:
- Add these environment variables:
  - `STRIPE_SECRET_KEY`: Your Stripe Secret Key (sk_test_xxx)
  - `STRIPE_WEBHOOK_SECRET`: Set temporarily to empty string, will get real value in step 5
  - `FRONTEND_URL`: https://leetinsight.netlify.app

**Frontend (.env file)**:
- Update `VITE_STRIPE_PRICE_ID` with your Price ID from step 2

### 4. Set Up Webhook (For Production)
- Go to https://dashboard.stripe.com/webhooks
- Click "Add endpoint"
  - URL: `https://leetinsight.onrender.com/api/stripe/webhook`
  - Events to send:
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
- Click "Reveal" on your signing secret
- Copy the `whsec_...` value and add to Render as `STRIPE_WEBHOOK_SECRET`

### 5. Test the Flow

1. Push changes to GitHub (triggers auto-deploy)
2. Wait for Netlify and Render to finish deploying
3. Go to https://leetinsight.netlify.app
4. Sign up as a free user
5. Click "Upgrade" button on the AdBanner
6. You'll be taken to Stripe checkout
7. Use test card: **4242 4242 4242 4242**
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
8. Complete payment
9. User tier should update to "premium" automatically
10. AdBanner should disappear, no ads should show

## Troubleshooting

**Checkout fails**: Ensure `VITE_STRIPE_PRICE_ID` is set correctly in frontend .env
**Webhook not firing**: Check that `STRIPE_WEBHOOK_SECRET` matches your webhook signing secret
**Tier not updating**: Check Render logs for webhook handler errors
**Redirect issue**: Ensure `FRONTEND_URL` matches your actual frontend domain

## Files Modified
- Backend: `backend/index.js` - Added Stripe routes
- Frontend: `lc-dashboard-frontend/src/App.jsx` - Wired pricing modal
- Frontend: `lc-dashboard-frontend/src/components/PricingModal.jsx` - Created pricing UI
- Frontend: `lc-dashboard-frontend/src/components/AdBanner.jsx` - Updated with callback

## Next Phase (After Testing)
- Premium feature gating (enforce snapshot/history limits)
- Success page after payment
- Invoice management
- Email receipts
