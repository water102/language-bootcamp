# 08 — P2P Study Chat and Signaling

## 1. Product definition

Tên nên là:
- Study Room;
- P2P Room;
không gọi “global persistent chat”.

Tính năng:
- room code;
- online peers;
- text;
- emoji;
- basic reactions;
- nickname/avatar;
- local history.

Không có:
- offline cloud inbox;
- permanent server archive;
- large-scale public moderation platform.

## 2. Transport

Actual messages:
- WebRTC `RTCDataChannel`.
- JSON application protocol.
- WebRTC data channel được mã hóa ở transport bởi DTLS theo WebRTC.

## 3. Signaling problem

WebRTC cần exchange:
- SDP offer;
- SDP answer;
- ICE candidates.

WebRTC không tự cung cấp room discovery/signaling.
Ứng dụng dùng:
- Google Apps Script Web App;
- Google Sheet event store tạm thời.

## 4. Signaling architecture

Static App
→ Apps Script HTTPS endpoint
→ Google Sheet temporary signaling events
→ peers find/exchange negotiation
→ WebRTC connected
→ stop signaling polling
→ chat P2P directly.

## 5. Google Apps Script role

Chỉ:
- register JOIN;
- list active room peers;
- post OFFER;
- post ANSWER;
- post ICE candidate;
- leave/expire;
- cleanup.

Không:
- store chat;
- store learning profile;
- store avatar image;
- store study history.

## 6. Sheet schema

Append-only event log concept:
- eventId;
- roomId;
- peerId;
- eventType;
- payload;
- createdAt;
- expiresAt;
- optional targetPeerId;
- protocolVersion.

Event types:
- JOIN;
- LEAVE;
- OFFER;
- ANSWER;
- ICE;
- HEARTBEAT optional, only during discovery;
- ROOM_META optional.

## 7. TTL

Gợi ý:
- JOIN presence: 60–120s hoặc refresh lúc waiting;
- OFFER/ANSWER/ICE: 2–5 phút;
- cleanup on request + scheduled cleanup.

Không để sheet phình vô hạn.

## 8. Polling

Chỉ khi:
- creating/joining;
- renegotiating.

Interval ban đầu khoảng 1–2 giây, có backoff.
Sau CONNECTED:
- stop signaling polling.

Không heartbeat Google mỗi vài giây trong suốt chat nếu WebRTC đã có presence.

## 9. Room code

Không dùng 4 digit đơn giản.
Dùng 8–12 ký tự entropy phù hợp, ví dụ nhóm ký tự không nhầm.

Có thể có:
- roomCode;
- optional roomPassword.

Room password không gửi raw.
Nếu dùng encryption signaling:
- derive symmetric key từ room secret;
- AES-GCM encrypt payload.

## 10. STUN/TURN

ICE cần STUN/TURN config.
Yêu cầu:
- deployment config, không nằm trong domain logic;
- dùng server có quyền sử dụng;
- TURN là fallback khi direct P2P không xuyên NAT/firewall.

Nếu không có TURN:
- chấp nhận một tỷ lệ peer không kết nối được;
- UI phải báo lý do/fallback.

## 11. Group topology

Small room dùng full mesh.

Số connection = n(n-1)/2.
Khuyến nghị soft limit:
- 2–8 peers;
- có thể 10 cho text tùy test.

Không target 100-user room.

## 12. Chat application protocol

Message envelope:
- protocolVersion;
- messageId;
- roomId;
- senderPeerId;
- type;
- timestamp;
- payload.

Types:
- HELLO;
- TEXT;
- REACTION;
- PRESENCE;
- TYPING optional;
- SYSTEM;
- PING/PONG;
- ROOM_STATE optional.

## 13. Peer profile exchange

HELLO payload:
- nickname;
- avatarConfig;
- appVersion;
- chatProtocolVersion.

Avatar là config, máy nhận tự render qua Avataaars.
Không truyền ảnh avatar lớn.

## 14. Message history

IndexedDB local.
Mỗi peer lưu message mình gửi/nhận.

Offline behavior:
- peer offline không nhận message.
- app không giả lập server queue.
- khi reconnect, có thể optional recent-history sync giữa peers nếu hai bên đồng ý, nhưng đây là feature riêng và cần conflict/dedup protocol.

## 15. Dedup

Message ID unique.
Repository bỏ duplicate messageId.
Clock không được coi là identity.

## 16. Emoji/reaction

Basic:
- native Unicode emoji;
- fixed reaction palette.
Không upload sticker/file ở scope hiện tại.

## 17. Local moderation

User có:
- mute peer;
- block peer;
- clear local history;
- leave room;
- report không khả dụng nếu không có server moderation, nên UI không được giả có report backend.

Block:
- drop incoming messages từ peer;
- optional close P2P connection.

## 18. Security/abuse

Apps Script anonymous endpoint cần:
- input validation;
- max payload size;
- TTL;
- rate guard best-effort;
- room entropy;
- no secrets in payload;
- no OAuth token exposed;
- sanitize text display;
- length limit;
- protocol version check.

## 19. Provider abstraction

Định nghĩa `SignalingProvider` concept:
- create/register room;
- announce peer;
- send signal;
- poll signals;
- leave;
- health.

Provider đầu:
- GoogleAppsScript.

Có thể thay:
- Nostr;
- Supabase;
- Firebase;
mà không sửa ChatProtocol/WebRTC layer.

## 20. Google quota awareness

Apps Script có quota/runtime/simultaneous limits.
Vì vậy:
- request ngắn;
- không long-poll;
- không dùng như realtime message bus;
- monitor failure;
- exponential backoff;
- UI báo signaling unavailable.

