"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/components/analytics/meta-pixel";

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
    const gaStorageKey = `mtm-ga4-purchase-${transactionId}`;
    const metaStorageKey = `mtm-meta-purchase-${transactionId}`;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const sendPurchase = () => {
      let waiting = false;

      if (!window.localStorage.getItem(gaStorageKey)) {
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
          window.localStorage.setItem(gaStorageKey, "1");
        } else {
          waiting = true;
        }
      }

      if (!window.localStorage.getItem(metaStorageKey)) {
        if (
          trackMetaEvent("Purchase", {
            value,
            currency,
            content_name: "Personalized Audio Song",
            content_type: "product",
            content_ids: ["personalized-audio-song"],
            num_items: 1,
          })
        ) {
          window.localStorage.setItem(metaStorageKey, "1");
        } else {
          waiting = true;
        }
      }

      attempts += 1;
      if (waiting && attempts < 20) timer = setTimeout(sendPurchase, 250);
    };

    sendPurchase();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currency, transactionId, value]);

  return null;
}
