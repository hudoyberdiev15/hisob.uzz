# Go‘sht hisobi
WebStorm: papkani oching → index.html ustida o‘ng tugma → Open in → Browser.
Fayllar: index.html (sahifa), style.css (dizayn), app.js (hisob-kitob).
Ma’lumotlar brauzerning localStorage xotirasida saqlanadi.

Har bir kun alohida: bugun kiritilgan ma’lumot faqat bugunda qoladi,
ertangi kun toza ochiladi. Yarim tundan keyin sahifa yangi kunga o‘zi o‘tadi.
Qarzdorlar (7-qator) kunlar bo‘yicha qoldiq bilan yuritiladi.

Telefon raqamga bog'langan bulutli rejim (CLOUD_MODE):
1) Firebase loyihasida Authentication -> Phone ni yoqing, Firestore yarating.
2) firestore.rules ni Firebase -> Firestore -> Rules ga qo'ying (Publish).
3) auth-sync.js boshidagi FIREBASE_CONFIG ni to'ldiring, OWNER_PHONES_SIMPLE ga raqamlarni yozing.
4) Authentication -> Settings -> Authorized domains ga hudoyberdiev15.github.io ni qo'shing.
