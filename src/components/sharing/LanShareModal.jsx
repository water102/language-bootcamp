import { memo, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/runtime/controller';

export default memo(function LanShareModal({ isOpen, onClose }) {
  const lanUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'http://192.168.101.169:8080/';
    const hostname = window.location.hostname;
    const port = window.location.port || '8080';
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${hostname}${port ? ':' + port : ''}/`;
    }
    return `http://192.168.101.169:${port}/`;
  }, []);

  const qrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(lanUrl)}&margin=6`;
  }, [lanUrl]);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(lanUrl);
      } else {
        const input = document.getElementById('lan-url-input');
        if (input) {
          input.select();
          document.execCommand('copy');
        }
      }
      showToast('📋 Đã sao chép liên kết mạng LAN!');
    } catch {
      showToast('📋 Đã sao chép liên kết mạng LAN!');
    }
  }, [lanUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay open flex"
      id="lan-share-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-container lan-modal-box animate-in fade-in zoom-in-95 duration-150">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">{"📱"}</span>
            <div>
              <h3>{"Học Trên Điện Thoại & Thiết Bị LAN"}</h3>
              <p className="modal-subtitle">{"Quét mã QR để mở trạm học trên iPhone, iPad, Android hoặc máy tính khác trong cùng Wi-Fi"}</p>
            </div>
          </div>
          <Button variant="unstyled" className="modal-close-btn" id="close-lan-modal" onClick={onClose}>
            {"×"}
          </Button>
        </div>
        <div className="modal-body">
          <div className="lan-content-grid">
            <div className="lan-qr-wrapper">
              <div className="lan-qr-card" id="lan-qr-card">
                <img id="lan-qr-image" src={qrImageUrl} alt="Mã QR truy cập LAN" />
              </div>
              <p className="lan-qr-caption">{"📷 Dùng Camera điện thoại quét mã này"}</p>
            </div>
            <div className="lan-info-panel">
              <div className="lan-input-group">
                <label htmlFor="lan-url-input">{"Đường dẫn trong mạng nội bộ (LAN):"}</label>
                <div className="lan-url-box">
                  <input type="text" id="lan-url-input" readOnly value={lanUrl} />
                  <Button variant="unstyled" className="btn btn-primary" id="btn-copy-lan-url" onClick={handleCopy}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{"Sao chép"}</span>
                  </Button>
                </div>
              </div>
              <div className="lan-guide-card">
                <h4>{"📌 3 Bước kết nối nhanh trên điện thoại:"}</h4>
                <ol>
                  <li>{"Đảm bảo điện thoại kết nối "}<strong>{"chung mạng Wi-Fi"}</strong>{" với máy tính này."}</li>
                  <li>{"Mở camera điện thoại quét mã QR hoặc gõ địa chỉ trên vào Safari / Chrome."}</li>
                  <li>{"Bấm "}<strong>{"Chia sẻ → \"Thêm vào Màn hình chính\" (Add to Home Screen)"}</strong>{" để dùng tràn viền như App gốc!"}</li>
                </ol>
              </div>
              <div className="lan-status-box">
                <span className="status-dot-pulse"></span>
                <span>
                  {"Máy chủ đang phục vụ tại: "}
                  <strong>{lanUrl}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
