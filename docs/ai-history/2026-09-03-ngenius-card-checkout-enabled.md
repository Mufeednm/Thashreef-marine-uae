# N-Genius card checkout enabled

## Outcome

The local checkout now lets customers choose Cash on Delivery or N-Genius hosted card payment. Choosing card payment posts the validated cart and delivery details to the existing server-side N-Genius checkout endpoint, then redirects only to the returned hosted-payment URL.

## Verification

The sandbox service-account authentication was previously verified. No payment API key is exposed to the browser, and no test transaction was created while enabling the UI.

## Local return origin

N-Genius sandbox accepts the `127.0.0.1` callback used by the existing local account but rejects `localhost`. The app therefore permits `127.0.0.1` as a Next.js development origin and uses it for local payment returns, keeping the callback and customer-session cookie on the same host.
