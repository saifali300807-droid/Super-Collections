/* paymentMethod (DB me 'Razorpay'/'COD' store hota hai) ka user-friendly label.
   Display hamesha "Online Pay" dikhe — backend enum stable rehta hai. */
export const paymentLabel = (method) => {
  if (method === 'Razorpay') return 'Online Pay';
  if (method === 'COD') return 'Cash on Delivery';
  return method || '—';
};