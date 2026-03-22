const express = require('express');
const Stripe = require('stripe');
const { Octokit } = require('@octokit/rest');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

app.use(express.json());
app.use(express.static('public'));

// Create context gist for user
app.post('/api/create-context', async (req, res) => {
  const { email, name } = req.body;
  
  const contextTemplate = `# ${name}'s Context

**Last Updated**: ${new Date().toISOString()}
**Email**: ${email}

## Current Work

[Add what you're working on]

## Active Projects

- [Project 1]
- [Project 2]

## Context for AI Assistants

When starting a conversation, I'm currently focused on: [Fill this in]

## Instructions

Give this URL to any AI assistant: [This gist URL]
Update using: gh gist edit [gist-id] CURRENT_CONTEXT.md
`;

  try {
    const gist = await octokit.gists.create({
      description: `${name}'s Context Bridge`,
      public: true,
      files: {
        'CURRENT_CONTEXT.md': {
          content: contextTemplate
        }
      }
    });

    res.json({ 
      gistUrl: gist.data.html_url,
      gistId: gist.data.id,
      rawUrl: gist.data.files['CURRENT_CONTEXT.md'].raw_url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Stripe checkout
app.post('/api/create-checkout', async (req, res) => {
  const { email, priceId } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/`,
      customer_email: email,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Create gist for customer
      // Send welcome email with gist URL
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
