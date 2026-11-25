/* ============ SOZLAMALAR (faqat shu qismni o'zgartiring) ============ */
const FIREBASE_CONFIG = {
  apiKey: "BU_YERGA",
  authDomain: "BU_YERGA",
  projectId: "BU_YERGA",
  appId: "BU_YERGA"
};
const OWNER_EMAILS = ["sizning.emailingiz@gmail.com"]; // faqat shu akkauntlar kira oladi (iCloud emailingizni ham qo'shing)
const OWNER_PHONES = ["+998901234567"]; // telefon bilan kirishga ruxsat berilgan raqam(lar), +998 bilan
const ENABLE_PHONE = true;     // telefon raqam + SMS kod bilan kirish
const PHONE_ONLY = true;                      // true: faqat telefon raqam oynasi (Firebase kerak emas). false: Google/Apple/SMS + bulutga saqlash
const OWNER_PHONES_SIMPLE = ["+998920820571"];  // PHONE_ONLY=true: kira oladigan raqamlar (har bir odam uchun bittadan qo'shing, O'ZINGIZNIKINI YOZING)
const PIN_CODE = "5711";                       // ilova boshidagi parol
const CLOUD_MODE = true;                      // true: raqam SMS kod bilan tasdiqlanadi va ma'lumotlar RAQAMGA bog'lanib bulutda saqlanadi (Firebase kalitlari kerak). Kalit yozilmasa oddiy rejim ishlaydi
const ENABLE_APPLE = true;   // Apple (iCloud) tugmasi yoqilgan
const APP_NAME = "Go‘sht hisobi";
/* ===================================================================== */

(function () {
  document.documentElement.classList.add("locked");
  const css = document.createElement("style");
  css.textContent = `
  html.locked body>*:not(#gate){display:none!important}
  #gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;
    background:linear-gradient(135deg,#0b7a5e,#10a37f 55%,#34d1a6);font-family:system-ui,-apple-system,sans-serif}
  #gate .box{background:#fff;color:#111;width:100%;max-width:380px;border-radius:24px;padding:32px 24px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3)}
  #gate .logo{width:72px;height:72px;border-radius:20px;background:#10a37f;color:#fff;font:700 38px/72px system-ui;margin:0 auto 14px}
  #gate h1{margin:0 0 6px;font-size:24px}#gate p{margin:0 0 22px;color:#667;font-size:15px}
  #gate button{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;margin:10px 0 0;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;border:1px solid #dadce0;background:#fff;color:#111}
  #gate button.apple{background:#000;color:#fff;border-color:#000}
  #gate input{width:100%;box-sizing:border-box;padding:14px;border:1px solid #dadce0;border-radius:14px;font-size:16px;margin-top:10px;background:#fff;color:#111}
  #gate .or{color:#889;font-size:13px;margin:16px 0 2px}
  #gate .err{color:#d93025;font-size:14px;margin-top:14px;min-height:18px}
  #gate .spin{width:34px;height:34px;border:4px solid #e0e0e0;border-top-color:#10a37f;border-radius:50%;margin:20px auto;animation:s 1s linear infinite}
  @keyframes s{to{transform:rotate(360deg)}}
  #gate .out{position:fixed}
  #logoutBtn{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:8px;z-index:9999;background:rgba(0,0,0,.45);color:#fff;border:0;border-radius:20px;padding:6px 12px;font-size:12px}`;
  document.head.appendChild(css);

  /* ---- Oddiy rejim: parol (PIN) + telefon raqam. To'g'ri bo'lsa animatsiya bilan ochiladi ---- */
  function devInfo() {
    const ua = navigator.userAgent; let os = "Kompyuter";
    if (/iPhone/.test(ua)) os = "iPhone"; else if (/iPad/.test(ua)) os = "iPad";
    else if (/Android/.test(ua)) { const m = ua.match(/Android[^;]*;\s*([^;)]+)/); os = "Android" + (m ? " " + m[1].trim() : ""); }
    const br = /Edg\//.test(ua) ? "Edge" : /CriOS|Chrome\//.test(ua) ? "Chrome" : /FxiOS|Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Brauzer";
    const app = (matchMedia("(display-mode: standalone)").matches || navigator.standalone) ? " (ilova)" : "";
    return os + " · " + br + app;
  }
  function simpleGate() {
    const wants = OWNER_PHONES_SIMPLE.map(p => p.replace(/\D/g, "").slice(-9));
    const PK = "__sync_phone_ok", SK = "__sync_pin_ok", LK = "__sync_loginlog";
    const st = document.createElement("style");
    st.textContent = `
    @keyframes pop{from{opacity:0;transform:translateY(30px) scale(.92)}to{opacity:1;transform:none}}
    @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}
    @keyframes appIn{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
    @keyframes tick{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
    #gate .box{animation:pop .55s cubic-bezier(.2,.9,.3,1.2) both}
    #gate{transition:opacity .45s ease;background:linear-gradient(135deg,#00a67e,#10e0a4 50%,#8cffdc)!important}
    #gate .box{box-shadow:0 0 0 4px rgba(255,255,255,.45),0 24px 70px rgba(0,255,190,.5)!important}
    @keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(16,224,164,.7)}50%{box-shadow:0 0 0 18px rgba(16,224,164,0)}}
    #gate.ok .logo{animation:tick .5s ease both,glow 1s ease infinite;background:#00c98f!important}
    #gate.ok{opacity:0;pointer-events:none}
        #gate .dots{display:flex;justify-content:center;gap:14px;margin:4px 0 18px}
    #gate .dots i{width:18px;height:18px;border-radius:50%;border:2px solid #00b386;transition:.15s}
    #gate .dots i.on{background:#00b386;transform:scale(1.2);box-shadow:0 0 10px #10e0a4}
    #gate .dots.bad{animation:shake .4s}
    #gate .dots.good i{background:#34d1a6;border-color:#34d1a6}
    #gate .kp{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    #gate .kp button{margin:0;width:auto;justify-content:center;padding:14px 0;font-size:22px;font-weight:600;border-radius:16px;background:#f3f6f5;border:0;transition:transform .08s}
    #gate .kp button:active{transform:scale(.92);background:#d9f3ec}
    #gate .dev{margin-top:14px;font-size:12px;color:#99a}
    body.enter>*:not(#gate){animation:appIn .7s cubic-bezier(.2,.8,.2,1) both}
    #histBtn{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:76px;z-index:9999;background:rgba(0,0,0,.45);color:#fff;border:0;border-radius:20px;padding:6px 12px;font-size:12px}
    #histBox{position:fixed;inset:0;z-index:2147483646;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:20px}
    #histBox div{background:#fff;color:#111;border-radius:18px;padding:18px;max-width:380px;width:100%;max-height:70vh;overflow:auto;font:14px system-ui;line-height:1.7}`;
    document.head.appendChild(st);
    const fmt9 = p => "+998 " + p.slice(0, 2) + " " + p.slice(2, 5) + " " + p.slice(5, 7) + " " + p.slice(7);
    function addLog(ph) { try { const l = JSON.parse(localStorage.getItem(LK) || "[]"); l.unshift({ t: Date.now(), p: ph, d: devInfo() }); localStorage.setItem(LK, JSON.stringify(l.slice(0, 30))); } catch (x) {} }
    function openApp(ph) {
      addLog(ph);
      const g = gate('<p style="color:#10a37f;font-weight:600;font-size:18px">Xush kelibsiz</p>');
      const lg = g.querySelector(".logo"); if (lg) lg.textContent = "✓"; g.querySelector("p").style.color = "#00a67e";
      setTimeout(() => g.classList.add("ok"), 700);
      setTimeout(() => {
        g.remove();
        document.documentElement.classList.remove("locked");
        document.body.classList.add("enter");
        const out = document.createElement("button"); out.id = "logoutBtn"; out.textContent = "Chiqish";
        out.onclick = () => {
          if (cloud) {
            if (!confirm("Chiqsangiz bu telefondagi ma’lumotlar o‘chadi (bulutda raqamingizga saqlanib qoladi). Chiqilsinmi?")) return;
            clearTimeout(timer);
            Promise.resolve(firebase.auth().signOut()).catch(() => {}).then(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (x) {} location.reload(); });
            return;
          }
          try { localStorage.removeItem(PK); sessionStorage.removeItem(SK); } catch (x) {} location.reload();
        };
        const hb = document.createElement("button"); hb.id = "histBtn"; hb.textContent = "Kirishlar";
        hb.onclick = () => {
          let l = []; try { l = JSON.parse(localStorage.getItem(LK) || "[]"); } catch (x) {}
          const box = document.createElement("div"); box.id = "histBox";
          box.innerHTML = "<div><b>Shu telefondagi kirishlar</b><br>" + (l.length ? l.map(e => new Date(e.t).toLocaleString("uz-UZ") + "<br>" + fmt9(e.p) + " · " + e.d).join("<hr>") : "Hali yo‘q") + "</div>";
          box.onclick = () => box.remove(); document.body.appendChild(box);
        };
        document.body.append(hb, out);
        setTimeout(() => document.body.classList.remove("enter"), 1000);
      }, 1300);
    }
    function phoneStep() {
      const g = gate('<p>Telefon raqamingizni yozing</p><input id="phIn" type="tel" inputmode="tel" placeholder="+998 90 123 45 67" autocomplete="tel"><div class="err"></div><div class="dev">Qurilma: ' + devInfo() + '</div>');
      const inp = g.querySelector("#phIn"), err = g.querySelector(".err");
      inp.focus();
      inp.addEventListener("input", () => {
        const d = inp.value.replace(/\D/g, "");
        const need = d.startsWith("998") ? 12 : 9;
        if (d.length < need) { err.textContent = ""; return; }
        const last = d.slice(-9);
        if (d.length === need && wants.includes(last)) { try { localStorage.setItem(PK, last); } catch (x) {} openApp(last); }
        else err.textContent = "Raqam noto‘g‘ri. Ilova ochilmaydi.";
      });
    }
    /* ---- Bulutli rejim: telefon raqam + SMS kod, ma'lumotlar raqamga bog'lanadi ---- */
    const noKeys = !FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey === "BU_YERGA";
    const useCloud = CLOUD_MODE && !noKeys;
    let cloud = false;
    const allowed9 = p => wants.length === 0 || wants.includes(String(p).replace(/\D/g, "").slice(-9));
    async function cloudStep() {
      gate('<p>Tekshirilmoqda…</p><div class="spin"></div>');
      try {
        const v = "https://www.gstatic.com/firebasejs/10.12.2/";
        await load(v + "firebase-app-compat.js");
        await Promise.all([load(v + "firebase-auth-compat.js"), load(v + "firebase-firestore-compat.js")]);
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        const auth = firebase.auth();
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        const user = await new Promise(res => { const off = auth.onAuthStateChanged(u => { off(); res(u); }); });
        if (user && user.phoneNumber && allowed9(user.phoneNumber)) return cloudOpen(user);
        if (user) await auth.signOut();
        cloudLogin();
      } catch (e) {
        console.error(e);
        const g = gate('<p style="color:#d93025">Internet yoki Firebase xatosi.</p><button id="rtBtn">Qayta urinish</button>');
        g.querySelector("#rtBtn").onclick = cloudStep;
      }
    }
    function cloudLogin(err) {
      let last = ""; try { last = localStorage.getItem("__sync_lastphone") || ""; } catch (x) {}
      if (!/^\+?\d{0,15}$/.test(last)) last = "";
      const g = gate('<p>Telefon raqamingizni yozing. Raqamingizga SMS kod yuboriladi</p><input id="phIn" type="tel" inputmode="tel" placeholder="+998 90 123 45 67" autocomplete="tel" value="' + last + '"><button id="phBtn">SMS kod yuborish</button><div class="err">' + (err || "") + '</div><div class="dev">Qurilma: ' + devInfo() + '</div>');
      g.querySelector("#phBtn").onclick = () => {
        let ph = g.querySelector("#phIn").value.replace(/[\s-]/g, "");
        if (/^\d{9}$/.test(ph)) ph = "+998" + ph;
        if (/^998\d{9}$/.test(ph)) ph = "+" + ph;
        if (!/^\+\d{9,15}$/.test(ph)) return cloudLogin("Telefon raqamni +998901234567 ko‘rinishida yozing.");
        if (!allowed9(ph)) return cloudLogin("Bu raqam uchun ruxsat yo‘q. Ilova ochilmaydi.");
        try { localStorage.setItem("__sync_lastphone", ph); } catch (x) {}
        cloudSend(ph);
      };
    }
    function cloudSend(ph) {
      let box = document.getElementById("rcBox");
      if (!box) { box = document.createElement("div"); box.id = "rcBox"; document.body.appendChild(box); }
      if (window.__rv) { try { window.__rv.clear(); } catch (x) {} }
      box.innerHTML = "";
      window.__rv = new firebase.auth.RecaptchaVerifier(box, { size: "invisible" });
      gate('<p>Kod yuborilmoqda…</p><div class="spin"></div>');
      firebase.auth().signInWithPhoneNumber(ph, window.__rv).then(cr => {
        const g = gate('<p>' + ph + ' raqamiga SMS kod yuborildi</p><input id="cdIn" inputmode="numeric" maxlength="6" placeholder="6 xonali kod" autocomplete="one-time-code"><button id="cdBtn">Tasdiqlash</button><button id="bkBtn">Orqaga</button><div class="err" id="cdErr"></div>');
        const inp = g.querySelector("#cdIn"), er = g.querySelector("#cdErr"); let busy = false;
        inp.focus();
        g.querySelector("#bkBtn").onclick = () => cloudLogin();
        const go = () => {
          const c = inp.value.trim(); if (c.length < 6) { er.textContent = "6 xonali kodni yozing."; return; }
          if (busy) return; busy = true;
          cr.confirm(c).then(res => cloudOpen(res.user)).catch(() => { busy = false; er.textContent = "Kod noto‘g‘ri. Ilova ochilmaydi."; });
        };
        g.querySelector("#cdBtn").onclick = go;
        inp.addEventListener("input", () => { if (inp.value.trim().length === 6) go(); });
      }).catch(e => {
        const m = e.code === "auth/too-many-requests" ? "Juda ko‘p urinish. Keyinroq qayta urinib ko‘ring."
          : e.code === "auth/operation-not-allowed" ? "Telefon bilan kirish Firebase’da yoqilmagan."
          : e.code === "auth/invalid-phone-number" ? "Telefon raqam noto‘g‘ri."
          : "SMS yuborishda xato: " + (e.code || e.message);
        cloudLogin(m);
      });
    }
    async function cloudOpen(user) {
      const id = user.phoneNumber.replace(/\D/g, "");
      gate('<p>Ma’lumotlar yuklanmoqda…</p><div class="spin"></div>');
      try {
        const go = await startSync("users", id);
        if (go === false) return;
        cloud = true;
        openApp(id.slice(-9));
      } catch (e) { console.error(e); cloudLogin("Ma’lumotlarni yuklashda xato. Qayta urinib ko‘ring."); }
    }
    function next() {
      if (useCloud) return cloudStep();
      let saved = null; try { saved = localStorage.getItem(PK); } catch (x) {}
      if (saved && wants.includes(saved)) openApp(saved); else phoneStep();
    }
    function pinStep() {
      const g = gate('<p>Parolni kiriting</p><div class="dots"><i></i><i></i><i></i><i></i></div><div class="kp">' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map(k => k === "" ? "<span></span>" : '<button data-k="' + k + '">' + k + "</button>").join("") +
        '</div><div class="err"></div><div class="dev">Qurilma: ' + devInfo() + "</div>");
      const dots = g.querySelector(".dots"), ds = dots.querySelectorAll("i"), err = g.querySelector(".err");
      let v = "", busy = false;
      function paint() { ds.forEach((d, i) => d.classList.toggle("on", i < v.length)); }
      function press(k) {
        if (busy) return;
        if (k === "⌫" || k === "Backspace") { v = v.slice(0, -1); err.textContent = ""; paint(); return; }
        if (!/^\d$/.test(k) || v.length >= 4) return;
        v += k; paint();
        if (v.length < 4) return;
        busy = true;
        if (v === PIN_CODE) {
          dots.classList.add("good"); try { sessionStorage.setItem(SK, "1"); } catch (x) {}
          document.removeEventListener("keydown", onKey);
          setTimeout(next, 450);
        } else {
          dots.classList.add("bad"); err.textContent = "Parol noto‘g‘ri";
          setTimeout(() => { dots.classList.remove("bad"); v = ""; paint(); busy = false; }, 450);
        }
      }
      function onKey(e) { press(e.key); }
      document.addEventListener("keydown", onKey);
      g.querySelector(".kp").addEventListener("click", e => { const b = e.target.closest("button"); if (b) press(b.dataset.k); });
    }
    let skip = false; try { skip = sessionStorage.getItem("__sync_pinskip") === "1"; sessionStorage.removeItem("__sync_pinskip"); sessionStorage.removeItem(SK); } catch (x) {}
    if (skip) next(); else pinStep();   // parol va animatsiya har safar ilova ochilganda chiqadi
  }

  function gate(html) {
    let g = document.getElementById("gate");
    if (!g) { g = document.createElement("div"); g.id = "gate"; document.body.appendChild(g); }
    g.innerHTML = '<div class="box"><div class="logo">G</div><h1>' + APP_NAME + '</h1>' + html + '</div>';
    return g;
  }
  function loading() { gate('<p>Tekshirilmoqda…</p><div class="spin"></div>'); }
  const NOCFG = !FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey === "BU_YERGA";
  const NOCFG_MSG = "Firebase kalitlari kiritilmagan. auth-sync.js boshidagi FIREBASE_CONFIG ni to‘ldiring.";
  function showLogin(err) {
    const g = gate('<p>Davom etish uchun shaxsiy akkauntingiz bilan kiring</p>' +
      '<button id="gBtn"><svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.800 2.400 30.300 0 24 0 14.600 0 6.500 5.400 2.600 13.200l7.900 6.100C12.400 13.600 17.700 9.500 24 9.500z"/><path fill="#4285F4" d="M46.500 24.500c0-1.600-.1-3.100-.4-4.500H24v9h12.700c-.6 3-2.300 5.500-4.800 7.200l7.500 5.800c4.400-4.100 7.100-10.100 7.100-17.500z"/><path fill="#FBBC05" d="M10.500 28.700A14.500 14.500 0 0 1 9.500 24c0-1.600.3-3.200.8-4.700l-7.900-6.100A24 24 0 0 0 0 24c0 3.900.9 7.500 2.600 10.800l7.900-6.100z"/><path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/></svg>Google bilan kirish</button>' +
      (ENABLE_APPLE ? '<button id="aBtn" class="apple">&#63743; Apple (iCloud) bilan kirish</button>' : '') +
      (ENABLE_PHONE ? '<div class="or">yoki telefon raqam bilan</div><input id="phIn" type="tel" inputmode="tel" placeholder="+998 90 123 45 67" autocomplete="tel"><button id="phBtn">SMS kod yuborish</button>' : '') +
      '<div class="err">' + (err || "") + '</div>');
    g.querySelector("#gBtn").onclick = () => { if (NOCFG) return showLogin(NOCFG_MSG); signIn(new firebase.auth.GoogleAuthProvider()); };
    if (ENABLE_APPLE) g.querySelector("#aBtn").onclick = () => {
      if (NOCFG) return showLogin(NOCFG_MSG);
      const p = new firebase.auth.OAuthProvider("apple.com"); p.addScope("email"); signIn(p);
    };
    if (ENABLE_PHONE) g.querySelector("#phBtn").onclick = () => {
      if (NOCFG) return showLogin(NOCFG_MSG);
      const ph = g.querySelector("#phIn").value.replace(/[\s-]/g, "");
      if (!/^\+\d{9,15}$/.test(ph)) return showLogin("Telefon raqamni +998901234567 ko‘rinishida yozing.");
      sendCode(ph);
    };
  }
  function sendCode(ph) {
    let box = document.getElementById("rcBox");
    if (!box) { box = document.createElement("div"); box.id = "rcBox"; document.body.appendChild(box); }
    if (window.__rv) { try { window.__rv.clear(); } catch (x) {} }
    box.innerHTML = "";
    window.__rv = new firebase.auth.RecaptchaVerifier(box, { size: "invisible" });
    gate('<p>Kod yuborilmoqda…</p><div class="spin"></div>');
    firebase.auth().signInWithPhoneNumber(ph, window.__rv).then(cr => {
      window.__cr = cr;
      const g = gate('<p>' + ph + ' raqamiga SMS kod yuborildi</p><input id="cdIn" inputmode="numeric" maxlength="6" placeholder="6 xonali kod" autocomplete="one-time-code"><button id="cdBtn">Tasdiqlash</button><button id="bkBtn">Orqaga</button><div class="err" id="cdErr"></div>');
      g.querySelector("#bkBtn").onclick = () => showLogin();
      g.querySelector("#cdBtn").onclick = () => {
        const c = g.querySelector("#cdIn").value.trim();
        if (c.length < 6) { g.querySelector("#cdErr").textContent = "6 xonali kodni yozing."; return; }
        window.__cr.confirm(c).catch(() => { g.querySelector("#cdErr").textContent = "Kod noto‘g‘ri. Qayta urinib ko‘ring."; });
      };
    }).catch(e => {
      const m = e.code === "auth/too-many-requests" ? "Juda ko‘p urinish. Keyinroq qayta urinib ko‘ring."
        : e.code === "auth/operation-not-allowed" ? "Telefon bilan kirish Firebase’da yoqilmagan."
        : e.code === "auth/invalid-phone-number" ? "Telefon raqam noto‘g‘ri."
        : "SMS yuborishda xato: " + (e.code || e.message);
      showLogin(m);
    });
  }
  function signIn(provider) {
    firebase.auth().signInWithPopup(provider).catch(e => {
      if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")
        return firebase.auth().signInWithRedirect(provider);
      if (e.code === "auth/operation-not-allowed") return showLogin("Bu kirish usuli hali Firebase’da yoqilmagan.");
      if (e.code !== "auth/popup-closed-by-user") showLogin("Kirishda xato: " + (e.code || e.message));
    });
  }

  /* ---- Ma'lumotlarni bulutga sinxronlash (localStorage <-> Firestore) ---- */
  const DEVICE = Math.random().toString(36).slice(2);
  const SKIP = k => k.startsWith("firebase") || k.startsWith("__sync");
  let db, ref, timer, applying = false;
  const snap = () => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!SKIP(k)) o[k] = localStorage.getItem(k); } return JSON.stringify(o); };
  function push() { clearTimeout(timer); timer = setTimeout(() => { if (!applying) ref.set({ data: snap(), device: DEVICE, t: Date.now() }).catch(console.error); }, 1500); }
  function apply(json) {
    applying = true;
    const o = JSON.parse(json);
    Object.keys(localStorage).filter(k => !SKIP(k)).forEach(k => localStorage.removeItem(k));
    Object.keys(o).forEach(k => localStorage.setItem(k, o[k]));
    applying = false;
  }
  async function startSync(col, docId) {
    db = firebase.firestore(); ref = db.collection(col || "app").doc(docId || "owner");
    const s = await ref.get();
    if (s.exists) {
      const remote = s.data().data;
      if (remote !== snap()) { apply(remote); if (!sessionStorage.__syncReload) { sessionStorage.__syncReload = 1; try { sessionStorage.__sync_pinskip = "1"; } catch (x) {} location.reload(); return false; } }
    } else { await ref.set({ data: snap(), device: DEVICE, t: Date.now() }); }
    delete sessionStorage.__syncReload;
    const ss = Storage.prototype.setItem, rs = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (k, v) { ss.call(this, k, v); if (this === localStorage && !SKIP(k) && !applying) push(); };
    Storage.prototype.removeItem = function (k) { rs.call(this, k); if (this === localStorage && !SKIP(k) && !applying) push(); };
    ref.onSnapshot(d => { if (d.metadata.hasPendingWrites || !d.exists) return; const x = d.data(); if (x.device !== DEVICE && x.data !== snap()) { apply(x.data); try { sessionStorage.__sync_pinskip = "1"; } catch (e2) {} location.reload(); } });
    return true;
  }

  function load(src) { return new Promise((r, j) => { const s = document.createElement("script"); s.src = src; s.onload = r; s.onerror = j; document.head.appendChild(s); }); }
  async function boot() {
    loading();
    if (NOCFG) return showLogin(NOCFG_MSG);
    try {
    const v = "https://www.gstatic.com/firebasejs/10.12.2/";
    await load(v + "firebase-app-compat.js");
    await Promise.all([load(v + "firebase-auth-compat.js"), load(v + "firebase-firestore-compat.js")]);
    firebase.initializeApp(FIREBASE_CONFIG);
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL); // bir marta kirsa, qayta so'ralmaydi
    firebase.auth().onAuthStateChanged(async u => {
      if (!u) return showLogin();
      const ok = (u.email && OWNER_EMAILS.map(e => e.toLowerCase()).includes(u.email.toLowerCase())) || (u.phoneNumber && OWNER_PHONES.includes(u.phoneNumber));
      if (!ok) { await firebase.auth().signOut(); return showLogin("Bu akkaunt uchun ruxsat yo‘q. Ilova ochilmaydi."); }
      loading();
      try { await startSync(); } catch (e) { console.error(e); return showLogin("Ma’lumotlarni yuklashda xato."); }
      const g = document.getElementById("gate"); if (g) g.remove();
      document.documentElement.classList.remove("locked");
      const b = document.createElement("button"); b.id = "logoutBtn"; b.textContent = "Chiqish";
      b.onclick = () => firebase.auth().signOut().then(() => location.reload());
      document.body.appendChild(b);
    });
    } catch (e) { console.error(e); gate('<p style="color:#d93025">Internet yoki Firebase xatosi. Qayta urinib ko‘ring.</p>'); }
  }
  const START = PHONE_ONLY ? simpleGate : boot;
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", START) : START();
})();
