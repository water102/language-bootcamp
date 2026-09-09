/**
 * WebRTC Mesh Manager for Peer-to-Peer Study Rooms
 * Spec reference: docs/cefr-learning-planner-spec/08_P2P_CHAT_SIGNALING.md
 */

const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

export class WebRtcMesh {
  /**
   * @param {Object} options
   * @param {string} options.myPeerId
   * @param {string} options.roomId
   * @param {any} options.signalingProvider
   * @param {(peerId: string, message: Object) => void} options.onMessage
   * @param {(peerId: string, status: string) => void} options.onPeerConnectionChange
   */
  constructor({ myPeerId, roomId, signalingProvider, onMessage, onPeerConnectionChange }) {
    this.myPeerId = myPeerId;
    this.roomId = roomId;
    this.signaling = signalingProvider;
    this.onMessage = onMessage;
    this.onPeerConnectionChange = onPeerConnectionChange;

    /** @type {Map<string, RTCPeerConnection>} */
    this.peerConnections = new Map();
    /** @type {Map<string, RTCDataChannel>} */
    this.dataChannels = new Map();
  }

  /**
   * Connect to a newly discovered peer (Initiator side)
   * @param {string} targetPeerId
   */
  async connectToPeer(targetPeerId) {
    if (this.peerConnections.has(targetPeerId) || targetPeerId === this.myPeerId) return;

    const pc = this.createPeerConnection(targetPeerId);

    // Create DataChannel
    const dc = pc.createDataChannel('study-chat', { negotiated: false, maxRetransmits: 3 });
    this.setupDataChannel(targetPeerId, dc);

    // Create and send SDP Offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await this.signaling.sendSignal(this.roomId, this.myPeerId, targetPeerId, 'OFFER', offer);
  }

  /**
   * Handle incoming WebRTC signaling from peer
   * @param {Object} signal
   */
  async handleSignal(signal) {
    const { fromPeerId, type, payload } = signal;
    if (fromPeerId === this.myPeerId) return;

    let pc = this.peerConnections.get(fromPeerId);

    if (type === 'OFFER') {
      if (!pc) {
        pc = this.createPeerConnection(fromPeerId);
      }
      await pc.setRemoteDescription(new RTCSessionDescription(payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await this.signaling.sendSignal(this.roomId, this.myPeerId, fromPeerId, 'ANSWER', answer);
    } else if (type === 'ANSWER') {
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
      }
    } else if (type === 'ICE') {
      if (pc && payload) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload));
        } catch (e) {
          console.warn('[WebRtcMesh] addIceCandidate error:', e);
        }
      }
    }
  }

  /**
   * Helper to create RTCPeerConnection and wire ICE events
   */
  createPeerConnection(targetPeerId) {
    if (typeof RTCPeerConnection === 'undefined') return null;

    const pc = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });
    this.peerConnections.set(targetPeerId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.sendSignal(this.roomId, this.myPeerId, targetPeerId, 'ICE', event.candidate);
      }
    };

    pc.ondatachannel = (event) => {
      this.setupDataChannel(targetPeerId, event.channel);
    };

    pc.onconnectionstatechange = () => {
      if (this.onPeerConnectionChange) {
        this.onPeerConnectionChange(targetPeerId, pc.connectionState);
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.closePeer(targetPeerId);
      }
    };

    return pc;
  }

  /**
   * Setup RTCDataChannel event handlers
   */
  setupDataChannel(peerId, dc) {
    this.dataChannels.set(peerId, dc);

    dc.onopen = () => {
      console.log(`[WebRtcMesh] DataChannel open with peer: ${peerId}`);
      if (this.onPeerConnectionChange) {
        this.onPeerConnectionChange(peerId, 'connected');
      }
    };

    dc.onclose = () => {
      console.log(`[WebRtcMesh] DataChannel closed with peer: ${peerId}`);
      this.dataChannels.delete(peerId);
      if (this.onPeerConnectionChange) {
        this.onPeerConnectionChange(peerId, 'closed');
      }
    };

    dc.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (this.onMessage) {
          this.onMessage(peerId, msg);
        }
      } catch (e) {
        console.warn('[WebRtcMesh] Malformed message received:', event.data);
      }
    };
  }

  /**
   * Broadcast a chat message directly to all connected peers via DataChannels
   * @param {Object} message
   */
  broadcast(message) {
    const payload = JSON.stringify(message);
    let sentCount = 0;

    this.dataChannels.forEach((dc, peerId) => {
      if (dc.readyState === 'open') {
        dc.send(payload);
        sentCount++;
      }
    });

    return sentCount;
  }

  /**
   * Close a specific peer connection
   */
  closePeer(peerId) {
    const dc = this.dataChannels.get(peerId);
    if (dc) {
      try { dc.close(); } catch (e) {}
      this.dataChannels.delete(peerId);
    }

    const pc = this.peerConnections.get(peerId);
    if (pc) {
      try { pc.close(); } catch (e) {}
      this.peerConnections.delete(peerId);
    }
  }

  /**
   * Disconnect and close all peer connections
   */
  destroy() {
    this.peerConnections.forEach((pc, peerId) => this.closePeer(peerId));
    this.peerConnections.clear();
    this.dataChannels.clear();
  }
}
