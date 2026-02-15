import { Router, type Request, type Response } from 'express';
import Stripe from 'stripe';
import { queries } from '../db.js';
import { requireAuth, type AuthRequest } from '../auth.js';

export const stripeRouter = Router();

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || ''; // Your Pro plan price ID
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

function getStripe(): Stripe | null {
  if (!STRIPE_SECRET) return null;
  return new Stripe(STRIPE_SECRET, { apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion });
}

// POST /api/stripe/checkout - Create checkout session for Pro upgrade
stripeRouter.post('/stripe/checkout', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const stripe = getStripe();
    if (!stripe || !STRIPE_PRICE_ID) {
      res.status(503).json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID env vars.' });
      return;
    }

    const user = queries.getUserById.get(req.user!.userId) as Record<string, unknown> | undefined;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.plan === 'pro') {
      res.status(400).json({ error: 'Already on Pro plan' });
      return;
    }

    // Create or reuse Stripe customer
    let customerId = user.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email as string,
        metadata: { user_id: user.id as string },
      });
      customerId = customer.id;
      queries.updateStripeCustomer.run(customerId, user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}?upgraded=true`,
      cancel_url: `${APP_URL}?cancelled=true`,
      metadata: { user_id: user.id as string },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/stripe/portal - Customer portal for managing subscription
stripeRouter.post('/stripe/portal', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      res.status(503).json({ error: 'Stripe not configured' });
      return;
    }

    const user = queries.getUserById.get(req.user!.userId) as Record<string, unknown> | undefined;
    if (!user?.stripe_customer_id) {
      res.status(400).json({ error: 'No active subscription' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id as string,
      return_url: APP_URL,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// POST /api/stripe/webhook - Stripe webhook handler
stripeRouter.post('/stripe/webhook', async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      res.status(503).send('Stripe not configured');
      return;
    }

    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    if (STRIPE_WEBHOOK_SECRET && sig) {
      try {
        // req.body needs to be raw for signature verification
        // We handle this in index.ts with express.raw() for this route
        event = stripe.webhooks.constructEvent(
          req.body as Buffer,
          sig,
          STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        res.status(400).send('Webhook signature verification failed');
        return;
      }
    } else {
      // No webhook secret - accept event as-is (dev mode)
      event = req.body as Stripe.Event;
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        if (userId && session.subscription) {
          queries.updateUserPlan.run(
            'pro',
            session.customer as string,
            session.subscription as string,
            userId
          );
          console.log(`User ${userId} upgraded to Pro`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const user = queries.getUserByStripeCustomer.get(sub.customer as string) as Record<string, unknown> | undefined;
        if (user) {
          queries.updateUserPlan.run('free', user.stripe_customer_id, null, user.id);
          console.log(`User ${user.id} downgraded to free (subscription cancelled)`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const user = queries.getUserByStripeCustomer.get(sub.customer as string) as Record<string, unknown> | undefined;
        if (user) {
          const plan = sub.status === 'active' ? 'pro' : 'free';
          queries.updateUserPlan.run(plan, user.stripe_customer_id, sub.id, user.id);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
