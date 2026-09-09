import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FirebaseSignalingProvider } from '@/core/social/firebaseSignalingProvider.js';
import { WebRtcMesh } from '@/core/social/webRtcMesh.js';
import { createPeerId } from '@/core/domain/hashing.js';
import { localStore } from '@/core/storage/localStorageAdapter.js';

export default function StudyRoomModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [roomId, setRoomId] = useState('C1-BOOTCAMP-ROOM');
  const [inRoom, setInRoom] = useState(false);
  const [peers, setPeers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [myPeerId] = useState(() => createPeerId());
  const [nickname, setNickname] = useState(() => localStore.get('profile')?.nickname || 'C1 Learner');

  const signalingRef = useRef(null);
  const meshRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    return () => {
      handleLeaveRoom();
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) return;

    try {
      const signaling = new FirebaseSignalingProvider();
      signalingRef.current = signaling;

      const mesh = new WebRtcMesh({
        myPeerId,
        roomId: roomId.trim().toUpperCase(),
        signalingProvider: signaling,
        onMessage: (senderPeerId, msg) => {
          setMessages(prev => [...prev, { ...msg, fromPeerId: senderPeerId, isMe: false }]);
        },
        onPeerConnectionChange: (peerId, status) => {
          console.log(`[StudyRoom] Peer ${peerId} connection status: ${status}`);
        }
      });
      meshRef.current = mesh;

      // 1. Join room presence in Firebase
      await signaling.joinRoom(roomId.trim().toUpperCase(), {
        peerId: myPeerId,
        nickname: nickname.trim() || 'C1 Learner',
        currentLevel: 'C1'
      });

      // 2. Listen to incoming signals
      signaling.listenSignals(roomId.trim().toUpperCase(), myPeerId, (signal) => {
        mesh.handleSignal(signal);
      });

      // 3. Listen to peer updates and initiate connections to new peers
      signaling.listenPeers(roomId.trim().toUpperCase(), (activePeers) => {
        setPeers(activePeers);

        // For every peer discovered that isn't me, connect if myPeerId is "greater"
        // (Deterministic initiator pattern prevents double offers)
        activePeers.forEach(peer => {
          if (peer.peerId !== myPeerId && myPeerId > peer.peerId) {
            mesh.connectToPeer(peer.peerId);
          }
        });
      });

      setInRoom(true);
      setMessages([
        {
          id: 'sys_welcome',
          sender: 'Hệ thống P2P',
          text: `Đã kết nối vào phòng ${roomId.trim().toUpperCase()}. Bạn đang giao tiếp trực tiếp ngang hàng qua WebRTC!`,
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('[StudyRoom] Join room failed:', err);
      alert('Không thể tham gia phòng: ' + err.message);
    }
  };

  const handleLeaveRoom = () => {
    if (signalingRef.current) {
      signalingRef.current.leaveRoom(roomId.trim().toUpperCase(), myPeerId);
      signalingRef.current = null;
    }
    if (meshRef.current) {
      meshRef.current.destroy();
      meshRef.current = null;
    }
    setInRoom(false);
    setPeers([]);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const messagePayload = {
      id: `msg_${Date.now()}`,
      sender: nickname || 'C1 Learner',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Send directly through WebRTC DataChannels
    if (meshRef.current) {
      meshRef.current.broadcast(messagePayload);
    }

    // Add to local chat feed
    setMessages(prev => [...prev, { ...messagePayload, isMe: true }]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white">

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#1f2937]/50">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <span>👥</span> Phòng Học Nhóm P2P (WebRTC Study Room)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Signaling qua Firebase • Tin nhắn truyền trực tiếp ngang hàng WebRTC DataChannel (E2E Encrypted)
            </p>
          </div>
          <button id="close-study-room-modal-btn" onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
            ✕
          </button>
        </div>

        {/* Room Control Bar */}
        {!inRoom ? (
          <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl">
              🌐
            </div>

            <div className="text-center max-w-md">
              <h3 className="text-lg font-bold text-white">Tham Gia Phòng Học Cùng Bạn Bè</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Nhập mã phòng để cùng học, trao đổi kỹ năng Speaking/Writing và chia sẻ tiến độ học tập mà không cần lưu tin nhắn lên bất kỳ máy chủ nào.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Tên Hiển Thị (Nickname):</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white font-medium text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Mã Phòng Học (Room Code):</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={e => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: C1-ROOM-101"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <Button
                variant="unstyled"
                onClick={handleJoinRoom}
                className="w-full btn-primary text-sm py-3 mt-2 flex items-center justify-center gap-2 shadow-lg font-bold"
              >
                🚀 Vào Phòng Học Ngay
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">

            {/* Left: Active Peers Panel */}
            <div className="w-60 border-r border-white/10 bg-[#0f172a]/70 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase text-gray-400">Bạn Học Trong Phòng:</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    {peers.length} online
                  </span>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[50vh]">
                  {peers.map(peer => {
                    const isMe = peer.peerId === myPeerId;
                    return (
                      <div
                        key={peer.peerId}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                          isMe
                            ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                            : 'bg-white/5 border-white/5 text-gray-300'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-indigo-300">
                          {peer.nickname?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold truncate text-white">
                            {peer.nickname} {isMe && '(Bạn)'}
                          </div>
                          <div className="text-[10px] text-gray-400">P2P Peer</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="text-[11px] text-gray-400 mb-2">
                  Phòng: <strong className="text-white">{roomId}</strong>
                </div>
                <Button
                  variant="unstyled"
                  onClick={handleLeaveRoom}
                  className="w-full text-xs py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 rounded-lg font-bold transition"
                >
                  Rời Phòng Học
                </Button>
              </div>
            </div>

            {/* Right: P2P Chat Stream */}
            <div className="flex-1 flex flex-col bg-[#0b0f19]">
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg, index) => {
                  if (msg.isSystem) {
                    return (
                      <div key={index} className="text-center my-2">
                        <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-gray-400 mb-1 px-1">
                        {msg.sender} • {msg.time}
                      </div>
                      <div
                        className={`max-w-xs sm:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.isMe
                            ? 'bg-indigo-600 text-white rounded-br-sm shadow'
                            : 'bg-white/10 text-gray-100 rounded-bl-sm border border-white/5'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#0f172a] flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Nhắn tin trực tiếp qua WebRTC P2P..."
                  className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
                <Button variant="unstyled" type="submit" className="btn-primary text-xs px-5 py-2 font-bold shadow">
                  Gửi
                </Button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
