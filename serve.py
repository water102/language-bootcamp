import http.server
import socket
import socketserver
import os
import sys

# Đảm bảo in UTF-8 trơn tru trên Windows console
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")
if not os.path.isfile(os.path.join(DIRECTORY, "index.html")):
    print("Chưa có bản build React. Hãy chạy npm install và npm run build trước.")
    sys.exit(1)

def get_lan_ips():
    """Lấy danh sách các địa chỉ IP mạng LAN thực tế của máy tính."""
    ips = []
    # 1. Phát hiện IP chính qua kết nối UDP định tuyến
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(('8.8.8.8', 80))
        primary_ip = s.getsockname()[0]
        s.close()
        if primary_ip and not primary_ip.startswith('127.'):
            ips.append(primary_ip)
    except Exception:
        pass

    # 2. Quét các địa chỉ mạng bổ sung từ getaddrinfo
    try:
        host_name = socket.gethostname()
        for info in socket.getaddrinfo(host_name, None, socket.AF_INET):
            ip = info[4][0]
            if ip not in ips and not ip.startswith('127.') and not ip.startswith('169.254'):
                ips.append(ip)
    except Exception:
        pass

    return ips or ['127.0.0.1']

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        sys.stdout.write(f"[{self.log_date_time_string()}] {self.address_string()} - {format%args}\n")

def print_banner(port, lan_ips):
    primary_ip = lan_ips[0]
    lan_url = f"http://{primary_ip}:{port}/"
    local_url = f"http://localhost:{port}/"

    sep = "=" * 66
    print("\n" + sep)
    print(" 🚀 ENGLISH C1 BOOTCAMP — LAN WEB SERVER ĐÃ SẴN SÀNG")
    print(sep)
    print(f" Thư mục phục vụ : {DIRECTORY}")
    print(f" Cổng (Port)     : {port}")
    print(f"\n 👉 Máy tính này (Local):  {local_url}")
    print(f" 📱 Thiết bị LAN/Mobile :  {lan_url}")
    if len(lan_ips) > 1:
        for extra_ip in lan_ips[1:]:
            print(f"    (IP phụ / Adapter)   :  http://{extra_ip}:{port}/")

    print("\n" + "-" * 66)
    print(" 📲 QUÉT MÃ QR BẰNG CAMERA ĐIỆN THOẠI ĐỂ MỞ NHANH:")
    print("-" * 66)
    try:
        import qrcode
        qr = qrcode.QRCode(box_size=1, border=2)
        qr.add_data(lan_url)
        qr.make(fit=True)
        qr.print_ascii(invert=True)
    except Exception as e:
        print(f" (Mở trực tiếp liên kết trên điện thoại: {lan_url})")

    print("\n 💡 HƯỚNG DẪN DÀNH CHO ĐIỆN THOẠI / TABLET:")
    print("  1. Đảm bảo điện thoại kết nối cùng mạng Wi-Fi với máy tính này.")
    print(f"  2. Quét mã QR ở trên hoặc mở trình duyệt gõ: {lan_url}")
    print("  3. Chọn 'Add to Home Screen' (Thêm vào MH chính) để học tràn màn hình.")
    print("\n [Nhấn Ctrl + C để dừng máy chủ]")
    print(sep + "\n")

def main():
    port = PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])

    if "--check" in sys.argv:
        lan_ips = get_lan_ips()
        print(f"LAN_IPS:{','.join(lan_ips)}")
        sys.exit(0)

    lan_ips = get_lan_ips()

    class DualStackServer(socketserver.ThreadingTCPServer):
        allow_reuse_address = True
        daemon_threads = True

    try:
        with DualStackServer(("0.0.0.0", port), CustomHandler) as httpd:
            print_banner(port, lan_ips)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Đã dừng máy chủ English C1 Bootcamp.")
        sys.exit(0)
    except OSError as e:
        print(f"\n[Thông báo] Cổng {port} hiện đang có tiến trình hoạt động.")
        print(f"Nếu là server cũ đang chạy, bạn vẫn có thể truy cập bình thường:")
        print(f" 👉 http://localhost:{port}/")
        print(f" 📱 http://{lan_ips[0]}:{port}/")
        print("\nNếu muốn khởi động lại, hãy đóng tiến trình cũ trước rồi chạy lại script này.")
        sys.exit(1)

if __name__ == "__main__":
    main()
