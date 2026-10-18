# KirayBet marketing assets

- `print/poster-letter.pdf` / `.png`: US Letter poster for shops and churches (300 dpi).
- `social/poster-chat-and-instagram-post-1080x1350.png`: group chats (WhatsApp, Telegram, Facebook) and Instagram posts.
- `social/story-1080x1920.png`: Instagram, WhatsApp and Telegram stories / status.
- `social/facebook-cover-1640x624.png`, `social/x-twitter-header-1500x500.png`: page banners.
- `social/profile-picture-1080.png`: profile picture for every account (safe for round crops).
- `social/instagram-highlight-*.png`: Instagram highlight covers.
- `logos/`: icon (PNG, SVG) and full logos for dark, white and transparent backgrounds.

The QR code opens https://kiraybet.org. To change wording and rebuild everything:
`cd tools && npm i playwright-core@1.55.0 qrcode@1.5.4 jsqr@1.4.0 pngjs@7.0.0 && node build.mjs ..`
(needs Google Chrome). `node qrcheck.mjs <png>` confirms a QR code scans.
The `src/` folder has each design as HTML.
