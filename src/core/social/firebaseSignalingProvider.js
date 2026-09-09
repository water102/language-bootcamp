/**
 * Firebase Signaling Provider for WebRTC P2P Study Rooms
 * Spec reference: docs/cefr-learning-planner-spec/08_P2P_CHAT_SIGNALING.md
 * Invariant: Firebase is used strictly for signaling & room discovery.
 * Chat messages flow P2P via WebRTC DataChannel.
 */

import { db } from '../firebase/firebaseConfig.js';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

export class FirebaseSignalingProvider {
  constructor() {
    this.unsubPeers = null;
    this.unsubSignals = null;
    this.heartbeatTimer = null;
  }

  /**
   * Register peer presence in the study room
   * @param {string} roomId
   * @param {Object} peerInfo
   */
  async joinRoom(roomId, peerInfo) {
    if (!roomId || !peerInfo?.peerId) return;

    const peerRef = doc(db, 'study_rooms', roomId, 'peers', peerInfo.peerId);
    await setDoc(peerRef, {
      peerId: peerInfo.peerId,
      nickname: peerInfo.nickname || 'Learner',
      currentLevel: peerInfo.currentLevel || 'B1',
      avatarConfig: peerInfo.avatarConfig || null,
      joinedAt: serverTimestamp(),
      lastSeen: Date.now()
    });

    // Start ephemeral heartbeat (every 30s)
    this.heartbeatTimer = setInterval(async () => {
      try {
        await setDoc(peerRef, { lastSeen: Date.now() }, { merge: true });
      } catch (e) {
        console.warn('[FirebaseSignaling] Heartbeat error:', e);
      }
    }, 30000);
  }

  /**
   * Leave room and clean up presence
   * @param {string} roomId
   * @param {string} peerId
   */
  async leaveRoom(roomId, peerId) {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.unsubPeers) {
      this.unsubPeers();
      this.unsubPeers = null;
    }

    if (this.unsubSignals) {
      this.unsubSignals();
      this.unsubSignals = null;
    }

    if (roomId && peerId) {
      try {
        const peerRef = doc(db, 'study_rooms', roomId, 'peers', peerId);
        await deleteDoc(peerRef);
      } catch (e) {
        console.warn('[FirebaseSignaling] Leave cleanup error:', e);
      }
    }
  }

  /**
   * Send a temporary WebRTC signaling message (OFFER, ANSWER, ICE)
   * @param {string} roomId
   * @param {string} fromPeerId
   * @param {string} toPeerId
   * @param {'OFFER'|'ANSWER'|'ICE'} type
   * @param {any} payload SDP or ICE candidate object
   */
  async sendSignal(roomId, fromPeerId, toPeerId, type, payload) {
    if (!roomId || !toPeerId) return;

    const signalsCol = collection(db, 'study_rooms', roomId, 'signals');
    await addDoc(signalsCol, {
      fromPeerId,
      toPeerId,
      type,
      payload: JSON.stringify(payload),
      createdAt: Date.now(),
      expiresAt: Date.now() + 3 * 60 * 1000 // 3-minute TTL
    });
  }

  /**
   * Listen for active peers in room in real-time
   * @param {string} roomId
   * @param {(peers: Array<Object>) => void} onPeersUpdate
   * @returns {() => void} Unsubscribe
   */
  listenPeers(roomId, onPeersUpdate) {
    const peersCol = collection(db, 'study_rooms', roomId, 'peers');

    this.unsubPeers = onSnapshot(peersCol, (snapshot) => {
      const peers = [];
      const now = Date.now();
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        // Ignore dead peers (no heartbeat for >90s)
        if (now - (data.lastSeen || 0) < 90000) {
          peers.push(data);
        }
      });
      onPeersUpdate(peers);
    }, (err) => {
      console.warn('[FirebaseSignaling] Peers snapshot error:', err);
    });

    return () => {
      if (this.unsubPeers) this.unsubPeers();
    };
  }

  /**
   * Listen for incoming signals (targeted to myPeerId)
   * @param {string} roomId
   * @param {string} myPeerId
   * @param {(signal: Object) => void} onSignal
   * @returns {() => void} Unsubscribe
   */
  listenSignals(roomId, myPeerId, onSignal) {
    const signalsCol = collection(db, 'study_rooms', roomId, 'signals');
    const q = query(signalsCol, where('toPeerId', '==', myPeerId));

    this.unsubSignals = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const docData = change.doc.data();
          try {
            const parsedPayload = JSON.parse(docData.payload);
            onSignal({
              signalId: change.doc.id,
              fromPeerId: docData.fromPeerId,
              type: docData.type,
              payload: parsedPayload
            });

            // Cleanup signal document immediately after consumption to keep database pristine
            deleteDoc(change.doc.ref).catch(() => {});
          } catch (e) {
            console.warn('[FirebaseSignaling] Signal parse error:', e);
          }
        }
      });
    }, (err) => {
      console.warn('[FirebaseSignaling] Signals snapshot error:', err);
    });

    return () => {
      if (this.unsubSignals) this.unsubSignals();
    };
  }
}
