/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51N6tMpBoikv2ueRhqdcyENdgzL2LeDHQ7wYDKMb4f1sPJi9RkggbJX1r7pVNXC8hTvytaif3v4dtLMgaGfhX9ihg00Wsy2OPVQ'
  );
  // 1.) Get checkout session from server/API
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    // 2.) Create checkout form and process credit card charge using stripe object
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
