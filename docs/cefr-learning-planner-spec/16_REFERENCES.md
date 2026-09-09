# 16 — References and Technical Notes

## 1. CEFR learning-hour baseline

Cambridge English — Guided learning hours:
- A1: 90–100 cumulative guided hours.
- A2: 180–200.
- B1: 350–400.
- B2: 500–600.
- C1: 700–800.
- C2: 1000–1200.
- Cambridge also notes roughly 200 guided hours between adjacent CEFR levels as a broad estimate and explicitly states actual time varies by background, intensity, age and exposure.

Source:
https://support.cambridgeenglish.org/hc/en-gb/articles/202838506-Guided-learning-hours

## 2. WebRTC DataChannel

MDN documents `RTCDataChannel` as bidirectional peer-to-peer arbitrary data transport and notes WebRTC data channels are encrypted using DTLS.

Sources:
https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel
https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels

## 3. WebRTC signaling / ICE

WebRTC applications still require signaling to exchange offer/answer/ICE information. ICE configuration may use STUN/TURN to establish a route through NAT/firewalls. The signaling transport itself is application-defined.

Source:
https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling

## 4. Google Apps Script Web Apps

Google Apps Script web apps can be deployed with access configuration including anonymous access in supported deployment configurations and can execute as the deploying user.

Sources:
https://developers.google.com/apps-script/guides/web
https://developers.google.com/apps-script/manifest/web-app-api-executable

## 5. Google Apps Script quotas

Google documents execution and simultaneous-execution limits and states quotas can change. This is why Apps Script must only be used for lightweight signaling, not as a realtime chat transport.

Source:
https://developers.google.com/apps-script/guides/services/quotas

## 6. Service Worker / IndexedDB

MDN notes Service Workers can cache resources for offline behavior and IndexedDB can be used from service workers, while localStorage is synchronous and not available inside service workers.

Source:
https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

## 7. Web Share API

Web Share can share text, URLs and supported files via the OS share mechanism, but it is not universally available and requires feature detection/secure context.

Source:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share

## 8. Avataaars npm package

The `avataaars` package is an SVG-based React component for Avataaars. The npm listing currently shows version 2.0.0 and indicates it is an older package, so compatibility should be isolated behind an adapter and tested with the chosen React version.

Source:
https://www.npmjs.com/package/avataaars

## 9. Reference policy

Agent should treat:
- official specifications/browser docs as technical source;
- CEFR hour values as planning guidance, not certification criteria;
- package ecosystem facts as time-sensitive and verify when implementation begins.

