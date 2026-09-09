"use client";

import { useEffect } from "react";

export function PurchaseTracker({
  transactionId,
  value,
  currency,
}: {
  transactionId: string;
  value: number;
  currency: string;
}) {
  useEffect(() => {
    const storageKey = `mtm-ga4-purchase-${transactionId}`;
    if (window.localStorage.getItem(storageKey)) return;

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const sendPurchase = () => {
      if (window.gtag) {
        window.gtag("event", "purchase", {
          transaction_id: transactionId,
          value,
          currency,
          items: [
            {
              item_id: "personalized-audio-song",
              item_name: "Personalized Audio Song",
              price: value,
              quantity: 1,
            },
          ],
        });
        window.localStorage.setItem(storageKey, "1");
        return;
      }

      attempts += 1;
      if (attempts < 20) timer = setTimeout(sendPurchase, 250);
    };

    sendPurchase();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currency, transactionId, value]);

  return null;
}
