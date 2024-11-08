import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';



const app = express();
const PORT_CHECKOUT = 3001;

// This is a public sample test API key.
const stripe = new Stripe('rk_test_51O8WroIimwnGoQGfD5AnqkI4SxYn61AkjlQTweNre8CTda95EtsF4U9IhpmJXGkTuj5ltYcdoubBvaXndIXKiZdK00UNKwAxaY');

/**
 * Middleware to handle cors
 */
app.use(express.json());
app.use(cors());

/**
 * Calculating amount based on item bought
 */
const calculateOrderAmount = (items) => {
    if (items[0].id == "premium") {
        return 199;
    }
};

/**
 * Creating an Stripe payment intent
 */
app.post("/create-payment-intent", async (req, res) => {
    console.log("Request received for intent\n\n");
    const { items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "usd",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
            enabled: true,
        },
        payment_method_configuration: 'pmc_1O8YAnIimwnGoQGfCz3dPEHq'//this key is available on the Stripe configuration dashboard 
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

app.listen(PORT_CHECKOUT, () => console.log(`Node server listening on : http://127.0.0.1:${PORT_CHECKOUT}`));