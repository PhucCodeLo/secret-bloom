# The Secret Bloom — Beyond the Midnight Garden

Một website điện ảnh, tương tác nhân **Ngày Phụ nữ Việt Nam 20/10**:
15 scene liên tiếp — từ Tia lửa đầu tiên, qua 6 mini-game, đến Vườn hoa bừng nở
và Xưởng thiệp cuối cùng.

- Mobile-first, tiếng Việt đầy đủ dấu
- Không backend, không tài khoản, không API trả phí, không secret trong code
- Âm thanh WebAudio tổng hợp sẵn (tắt mặc định: tiếng tương tác + ambient gió/đệm nhạc + swell)
- Không dùng WebGL/Three.js: Canvas 2D + SVG đáp ứng ngôn ngữ hình ảnh với chi phí
  tải trang và rủi ro thấp hơn nhiều trên mobile (mỗi scene lazy-load riêng, chunk ≤ ~33KB)

## Năm hệ thống chính

1. **Mở quà đa tầng** (`components/InteractiveGift.tsx`): state machine
   approach → ribbon (kéo theo đường cong, không reset) → seal (nhấn-giữ tích năng lượng)
   → sealBroken → beam → lid (bản lề) → reveal → crystal → ascend (trường sáng chuyển cảnh).
2. **Tiến trình tập trung** (`hooks/useProgression.ts` + `data/registry.ts`):
   18 vật phẩm có ID ổn định; `collect(id)` lũy đẳng (không trùng thưởng);
   lưu sessionStorage; chơi lại reset toàn bộ. Nhật ký suy ra từ registry.
3. **Sáu mini-game**: Thử thách ký ức (3 cấp độ), tháo nơ (quà teaser),
   lắp pha lê (kéo-thả), hồ phản chiếu (nhớ qua ảnh phản chiếu),
   đồng hồ hoa (xoay 3 vòng + chạm-từng-nấc), chòm sao (nối 7 sao).
4. **Lá thư tự mọc** (`data/letterFragments.ts`): mỗi khám phá mở một đoạn văn;
   LetterScene dệt các đoạn theo thứ tự hành trình + thư trung tâm + chữ ký.
   Thiếu bí mật phụ, thư vẫn mạch lạc.
5. **Finale Ngàn hoa** (`scenes/FinaleScene.tsx`): mọi vật phẩm bay về tâm vườn
   theo đường cong so le, hội tụ thành đóa hồng khổng lồ, sóng sáng lan ra,
   hoa nở theo đợt, cánh hoa bay lên — rồi mới tới xưởng thiệp.

## Hành trình (14 hồi)

1. **Void — Tia lửa đầu tiên**: nhấn-giữ để đánh thức khu vườn.
2. **Gate — Cổng thiên văn**: 4 cổ ngữ, chạm ấn sáng để mở cổng.
3. **Crossing — Lối đi trăng**: lần theo 4 điểm sáng; bướm đêm + minh văn ẩn (ghi nhật ký).
4. **Garden — Khu vườn sống + Ba đức hạnh**: nhấn-giữ 3 hoa YÊU THƯƠNG / TRÂN TRỌNG / HẠNH PHÚC.
5. **Pond — Hồ ký ức** (mini-game): xem sao sáng theo thứ tự, chạm vào *hình phản chiếu* đúng thứ tự (2 vòng).
6. **Fragments — Mảnh vỡ ánh sáng** (mini-game): kéo 4 mảnh pha lê vào khung cùng màu để hợp nhất thành hoa.
7. **Clock — Đồng hồ hoa** (mini-game): xoay 3 vòng đưa ☾ ❀ ✦ lên đỉnh kim để mở cơ quan.
8. **Constellation — Chòm sao của nàng** (mini-game): nối 7 vì sao theo thứ tự thành đóa hoa.
9. **Sanctuary — Thánh địa**: thắp 3 cổ ngữ Quá khứ/Hiện tại/Tương lai → bí mật thánh địa.
10. **Gift — Món quà niêm phong**: kéo nơ, chạm ấn sáp (vẫn khóa) → tới thử thách.
11. **Memory — Thử thách ký ức**: 3 cấp độ (3/4/5 nhịp), sai không mở khóa, có gợi ý, đếm số lần nhầm.
12. **Unveiling — Khai mở** (tương tác đầy đủ): kéo nơ theo đường cong → nhấn-giữ ấn sáp vỡ vụn →
    tia sáng len qua khe → nắp mở theo bản lề → pha lê bay lên, hóa thành trường sáng chuyển cảnh.
13. **Letter — Lá thư**: nhấn-giữ ấn sáp để mở phong bì; thư tự dệt từ các khám phá
    (có "Đọc toàn bộ", đọc theo nhịp của bạn).
14. **Finale — Vườn hoa bừng nở**: mọi kỷ niệm bay về, hội tụ thành đóa hồng khổng lồ.
15. **Card — Xưởng thiệp**: 96 lời chúc (6 nhóm × 6 cảm xúc, chống lặp, nút "Lời chúc khác") → xuất PNG / chia sẻ.

Tính năng chung: **nhật ký khám phá**, **chế độ điện ảnh**, **transition cánh hoa** giữa các scene,
**không có nút Bỏ qua** ở story scenes (tiến trình qua tương tác, có gợi ý khi stuck),
reduced-motion, âm thanh đồng bộ với animation.

## Yêu cầu

- Node.js 18+ (khuyến nghị Node 20+), npm 9+

## Chạy local / build

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ là website tĩnh hoàn chỉnh
```

## Deploy (Vercel, qua MCP)

Script `deploy-vercel.py` upload từng file trong `dist/` (kèm sha1) rồi tạo
production deployment. Vendor (react, framer-motion, html-to-image) được
externalize qua importmap esm.sh trong `index.html` vì giới hạn ~128KB/arg
của tool upload; các scene dùng `React.lazy`.

Lần deploy đầu: tắt Deployment Protection (SSO) để có link công khai —
`update_project { ssoProtection: null }`.

## Tuỳ biến nội dung

- **`src/config.ts`**: tên người gửi, ngày, lời chúc mặc định, nội dung lá thư, siteUrl.
- **`src/data/blessings.ts`**: 96 lời chúc tiếng Việt theo nhóm người nhận
  (Mẹ, Chị/em, Bạn bè, Đồng nghiệp, Cán bộ/hội viên, Chung) × cảm xúc
  (Dịu dàng, Biết ơn, Bình yên, Rực rỡ, Truyền cảm hứng, Vui vẻ),
  kèm engine chống lặp (`pickBlessing`).
- Thông điệp 3 bông hoa: `src/scenes/GardenScene.tsx` (hằng số `FLOWERS`).
- Bí mật thánh địa: `src/scenes/SanctuaryScene.tsx`; phần thưởng hồ ký ức: `PondScene.tsx`;
  khắc chòm sao: `ConstellationScene.tsx`.

## Cấu trúc thư mục

```
src/
  components/      # atmosphere/*, InteractiveGift (state machine mở quà),
                   # Envelope (nhấn-giữ ấn sáp), TransitionVeil,
                   # ParticleField, FloatingPetals, PointerTrail, Flower,
                   # GiftBox, MemoryGame, LetterCard,
                   # GreetingCard, Journal, HoldButton, SoundToggle
  scenes/          # 15 scene: Void, Gate, Crossing, Garden, Pond, Fragments,
                   # Clock, Constellation, Sanctuary, Gift, Memory,
                   # Unveiling, Letter, Finale, Card
  data/            # blessings.ts (96 lời chúc + engine), registry.ts (18 vật phẩm),
                   # letterFragments.ts (14 đoạn thư)
  hooks/           # useSound (WebAudio + ambient + swell), useReducedMotion,
                   # useProgression (store tiến trình tập trung)
  config.ts        # nội dung tuỳ biến (thư trung tâm, chữ ký, người gửi)
  types.ts         # Scene, CardStyle, Sfx, JournalEntry
  App.tsx          # state machine chuyển scene + nhật ký + cinematic mode
```

## Ghi chú kỹ thuật

- Xuất PNG dùng `html-to-image` (client-side); chờ `document.fonts.ready`
  để dấu tiếng Việt render đúng.
- Chia sẻ dùng Web Share API, fallback sao chép URL.
- Tôn trọng `prefers-reduced-motion`; animation tạm dừng khi tab ẩn;
  canvas tự giảm mật độ hạt trên mobile; ambient tạm dừng khi tab ẩn.
- State machine mở quà: approach → ribbon → ribbonDone → seal → sealBroken →
  beam → lid → reveal → crystal → ascend; mỗi stage chỉ trigger một lần,
  tiến trình ribbon/seal không bao giờ bị reset bất ngờ.
- Không backend, không key, không domain trả phí.
