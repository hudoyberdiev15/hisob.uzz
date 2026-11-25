(function(){
var P=["Tovuq","Tandir","Akarachka","Golen","File","Qanot","Butaka","Jigar"],K="gusht_v2",db={days:{},debts:[]},st={date:iso(new Date()),sheet:null};
try{var s=localStorage.getItem(K);if(s)db=JSON.parse(s)}catch(e){}
if(!db.days)db.days={};if(!db.debts)db.debts=[];if(!db.products)db.products=P.slice();P=db.products;if(!db.titles)db.titles={};
if(!db.manual)db.manual=[];
db.debts.forEach(function(x){if(x.a4==null)x.a4=x.amt});
db.debts.forEach(function(x){if(!x.log){x.log=[];x.g=x.amt;x.pb=x.paid?0:x.amt;if(x.paid){x.log.push({t:Date.now(),d:x.date,k:"p",a:-x.g});x.amt=0}}});
db.mTg2=1;db.mTg=1;
if(!db.rmTg){db.rmTg=1;var ri=db.products.indexOf("Tovuq go‘shti");if(ri>-1)db.products.splice(ri,1);db.manual=db.manual.filter(function(z){return z!=="Tovuq go‘shti"})}
function save(){try{localStorage.setItem(K,JSON.stringify(db))}catch(e){}}
var $=function(i){return document.getElementById(i)};
function iso(d){var m=d.getMonth()+1,k=d.getDate();return d.getFullYear()+"-"+(m<10?"0":"")+m+"-"+(k<10?"0":"")+k}
function addDays(s,n){var d=new Date(s+"T00:00:00");d.setDate(d.getDate()+n);return iso(d)}
function num(v){var x=parseFloat(String(v).replace(",",".").replace(/\s/g,""));return isFinite(x)?x:0}
function sumExpr(v){var t=0,ok=0;String(v).split("+").forEach(function(x){var n=numM(x);if(n){t+=n;ok=1}});return ok?r2(t):0}
function numM(v){var s=String(v).trim();if(/^\d{1,3}([.,\s\u00a0]\d{3})+$/.test(s))return parseFloat(s.replace(/\D/g,""));return num(v)}
function q(n){return Number(n.toFixed(2)).toLocaleString("ru-RU")}
function sh(n){return Math.round(n).toLocaleString("ru-RU")}
function money(n){return sh(n)+" so‘m"}
function sg(n){return(n<0?"−":"+")+sh(Math.abs(n))}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]})}
function fmtP(v){return String(v).split("+").map(function(p){var d=p.replace(/\D/g,"");return d.replace(/\B(?=(\d{3})+(?!\d))/g,".")}).join("+")}
window.fmtP=fmtP;
function vv(x){return x?String(+Number(x).toFixed(2)):""}
function wD(d){return db.days[d]||(db.days[d]={items:{},exp:[]})}
function r2(n){return Math.round(n*100)/100}
function calc(p,d){
  var it=(db.days[d]&&db.days[d].items[p])||{},open=it.open||0,has=it.left!=null;
  var sold=has?r2(open+(it.in||0)-(it.home||0)-(it.left||0)):0,sell=it.sell||0,pf=it.pf||0;
  var auto=sold,autoHas=has;if(db.manual.indexOf(p)>-1||it.msold!=null){has=it.msold!=null;sold=has?(it.msold||0):0}
  return{auto:auto,autoHas:autoHas,it:it,open:open,has:has,sold:sold,sell:sell,rev:r2(sold*sell),pf:pf,p5:r2(sold*pf)};
}
function dayTot(d){
  var r=0,e=0,q2=0,p5=0,kg=0;P.forEach(function(p){var c=calc(p,d);r+=c.rev;p5+=c.p5;kg+=c.sold});kg=r2(kg);
  ((db.days[d]&&db.days[d].exp)||[]).forEach(function(x){e+=x.amt});
  db.debts.forEach(function(x){if(x.date===d)q2+=x.pb});
  return{p5:p5,kg:kg,rev:r,exp:e,debt:q2,out:e+q2,profit:r-(e+q2)};
}
function period(pre){
  var set={},t={rev:0,out:0,net:0,f:0,z:0,exp:0,debt:0,p5:0};Object.keys(db.days).forEach(function(k){set[k]=1});db.debts.forEach(function(x){set[x.date]=1});
  Object.keys(set).forEach(function(k){if(k.indexOf(pre)===0){var x=dayTot(k);t.rev+=x.rev;t.out+=x.exp+x.debt;t.exp+=x.exp;t.debt+=x.debt;t.p5+=x.p5}});
  t.net=t.rev-t.out;t.f=Math.max(0,t.net);t.z=Math.max(0,-t.net);return t;
}
function periodL(l){var t={rev:0,exp:0,debt:0};l.forEach(function(k){var x=dayTot(k);t.rev+=x.rev;t.exp+=x.exp;t.debt+=x.debt});t.out=t.exp+t.debt;t.net=t.rev-t.out;t.f=Math.max(0,t.net);t.z=Math.max(0,-t.net);return t}
function r4(x){return !x.paid&&!x.l7}
function keyOf(x){return String(x.name).trim().toLowerCase()}
function recalc(x){var a=x.g;x.log.forEach(function(l){a+=l.a});x.amt=Math.max(0,a);x.paid=x.amt<=0.0001}
function unpaidOf(k){return db.debts.filter(function(x){return !x.paid&&keyOf(x)===k}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0})}
function totOf(k){return unpaidOf(k).reduce(function(a,x){return a+x.amt},0)}
function personObj(k){var u=unpaidOf(k);return u.length?{name:u[0].name,phone:u[0].phone,amt:totOf(k)}:null}
function setAmt(x,v){var dl=v-x.amt;if(!dl)return;x.log.push({t:Date.now(),d:st.date,k:"e",a:dl});recalc(x)}
function payPerson(k,p){var left=Math.min(p,totOf(k));unpaidOf(k).forEach(function(x){if(left<=0)return;var u=Math.min(x.amt,left);x.log.push({t:Date.now(),d:st.date,k:"p",a:-u});left-=u;recalc(x)})}
function lendPerson(k,a){var u=unpaidOf(k);if(!u.length)return;var l=u[u.length-1];db.debts.push({id:"q"+Date.now(),name:l.name,phone:l.phone,amt:a,a4:0,l7:true,g:a,pb:a,log:[],ts:Date.now(),date:st.date,paid:false})}
function setTotal(k,T){var u=unpaidOf(k),dl=T-totOf(k);if(!u.length||!dl)return;if(dl>0){var l=u[u.length-1];l.log.push({t:Date.now(),d:st.date,k:"e",a:dl});recalc(l)}else{var r=-dl;for(var i=u.length-1;i>=0&&r>0;i--){var c=Math.min(u[i].amt,r);u[i].log.push({t:Date.now(),d:st.date,k:"e",a:-c});r-=c;recalc(u[i])}}}
function debtTotal(){return db.debts.reduce(function(a,x){return a+(x.paid?0:x.amt)},0)}

function build(){
  var d=st.date;$("dt").value=d;
  var h="<div class=t1><div class=th><span>Mahsulot</span><span>Kecha astatka</span><span>Bugun kelgan</span><span>Uyga ketdi</span><span>Bugun qolgan</span></div>",it;
  var n1=0;P.forEach(function(p,i){
    if(db.manual.indexOf(p)>-1)return;n1++;var c=calc(p,d);it=c.it;
    h+="<div class=tr data-p="+i+"><span class='nm nmx'><em>"+n1+"</em><span class=nt>"+p+"</span><button class=pad data-act=padd data-i="+i+" aria-label=Qo‘shish>+</button>"+(/\s\d+$/.test(p)&&P.indexOf(p.replace(/\s+\d+$/,""))>-1?"<button class='pad pmn' data-act=pdel data-i="+i+" aria-label=Olib-tashlash>−</button>":"")+"</span>"+
    "<input inputmode=decimal data-f=open placeholder=0 value=\""+vv(c.open)+"\">"+
    "<input inputmode=decimal data-f=in placeholder=0 value=\""+(it.in!=null?it.in:"")+"\">"+
    "<input inputmode=decimal data-f=home placeholder=0 value=\""+(it.home!=null?it.home:"")+"\">"+
    "<input inputmode=decimal data-f=left placeholder=0 value=\""+(it.left!=null?it.left:"")+"\"></div>";
  });
  $("t1").innerHTML=h+"</div>";
  h="<div class=t2><div class=th><span>Mahsulot</span><span>Sotildi (kg)</span><span>Narxi (1 kg)</span><span style='text-align:right'>Summa</span></div>";
  P.forEach(function(p,i){
    var c=calc(p,d);
    h+="<div class=tr data-p="+i+"><span class=nm><em>"+(i+1)+"</em>"+p+"</span>"+"<input inputmode=decimal data-f=msold placeholder=0 value=\""+(c.it.msold!=null?c.it.msold:"")+"\">"+
    "<input inputmode=decimal data-f=sell placeholder=0 value=\""+fmtP(vv(c.sell))+"\"><span class=sm></span></div>";
  });
  $("t2").innerHTML=h+"</div>";
  h="<div class=t2><div class=th><span>Mahsulot</span><span>Jami kg</span><span>Foyda narxi (1 kg)</span><span style='text-align:right'>Foyda summa</span></div>";
  P.forEach(function(p,i){var c=calc(p,d);h+="<div class=tr data-p="+i+"><span class=nm><em>"+(i+1)+"</em>"+p+"</span><span class=sd></span><input inputmode=decimal data-f=pf placeholder=0 value=\""+fmtP(vv(c.pf))+"\"><span class=sm></span></div>"});
  h+="<div class=tr><span class=nm>Jami</span><span class=sd id=k5></span><span></span><span class=sm id=s5></span></div>";
  $("t5").innerHTML=h+"</div>";
  refresh();
}
function refresh(){
  var d=st.date,rev=0,d4s=0;
  db.debts.forEach(function(x){if(r4(x)&&x.date===d)d4s+=x.a4});
  P.forEach(function(p,i){
    var c=calc(p,d),r=document.querySelector("#t2 [data-p=\""+i+"\"]");if(!r)return;
    var s=r.querySelector(".sd");if(s){s.textContent=c.has?q(c.sold):"—";s.classList.toggle("neg",c.has&&c.sold<0)}
    var mq=r.querySelector("[data-f=msold]");if(mq){mq.placeholder=db.manual.indexOf(p)>-1?"0":(c.autoHas?q(c.auto):"0");mq.classList.toggle("neg",c.has&&c.sold<0)}
    r.querySelector(".sm").textContent=sh(c.rev);rev+=c.rev;
  });
  P.forEach(function(p,i){var c=calc(p,d),r=document.querySelector("#t5 [data-p=\""+i+"\"]");if(!r)return;var s=r.querySelector(".sd");s.textContent=c.has?q(c.sold):"—";s.classList.toggle("neg",c.has&&c.sold<0);r.querySelector(".sm").textContent=sh(c.p5)});
  var t=dayTot(d),mo=period(d.slice(0,7)),yr=period(d.slice(0,4));
  $("k5").textContent=q(t.kg)+" kg";$("s5").textContent=sh(t.p5);$("fP5").textContent=money(t.p5);$("tRev").textContent=money(rev);$("tExp").textContent=money(t.exp);$("tDebt").textContent=money(d4s);
  $("fRev").textContent=sh(t.rev);$("fExp").textContent=sh(t.exp);
  var sfx=d===iso(new Date())?" · BUGUN":" · "+d.slice(5);$("fDebt").textContent=sh(t.debt);$("fOut").textContent=$("fOut2").textContent=sh(t.out);$("fF").textContent=sh(Math.abs(t.profit));$("fFl").textContent=(t.profit<0?"ZARAR":"FOYDA")+sfx;$("fRes").classList.toggle("neg",t.profit<0);var hi=Math.max(t.rev,t.out),lo=Math.min(t.rev,t.out);$("fNote").textContent=t.rev===t.out?"Tushum va chiqim teng: foyda ham zarar ham yo‘q":(t.rev>t.out?"Tushum ko‘p: "+sh(t.rev)+" − "+sh(t.out)+" = "+sh(hi-lo)+" FOYDA":"Chiqim ko‘p: "+sh(t.out)+" − "+sh(t.rev)+" = "+sh(hi-lo)+" ZARAR");
  var wd=new Date(d+"T00:00:00"),ws=addDays(d,-((wd.getDay()+6)%7)),wl=[];for(var wi=0;wi<7;wi++)wl.push(addDays(ws,wi));
  var wk=periodL(wl);function rw(l,v){return"<span>"+l+"</span><b class=fy>"+sh(v.f)+"</b><b class=zr>"+sh(v.z)+"</b><b class=rx>"+sh(v.exp+v.debt)+"</b>"}
  $("fExt").innerHTML="<span></span><em>Foyda</em><em>Zarar</em><em>Rasxod</em>"+rw("Hafta",wk)+rw("Oy",mo)+rw("Yil",yr);
  var ne=((db.days[d]&&db.days[d].exp)||[]).length,nd=db.debts.filter(function(x){return r4(x)&&x.date===d}).length;
  $("lExp").textContent="Ro‘yxat ("+ne+")";$("lDebt").textContent="Ro‘yxat ("+nd+")";$("hDebt").textContent=money(d4s);
  renderD7();
  if(st.sheet)sheet();
}
function sheet(){
  var d=st.date,h;
  if(st.sheet==="exp"){
    $("shT").textContent="Xarajatlar · "+d;
    var ex=(db.days[d]&&db.days[d].exp)||[];
    h=ex.length?ex.map(function(x){return"<div class=li><div>"+esc(x.name)+"</div><div class=b><b>"+money(x.amt)+"</b><button class=del data-act=delExp data-id="+x.id+">×</button></div></div>"}).join(""):"<div class=empty>Xarajat yo‘q</div>";
  }else if(st.sheet==="inst"){
    $("shT").textContent="Ilovani o‘rnatish";
    var ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
    h="<div class=ist><b>"+(ios?"iPhone / iPad (Safari)":"Android / Chrome")+"</b>"+(ios?
      "<p>1. Safari pastidagi <b>Ulashish</b> tugmasini bosing.</p><p>2. <b>Bosh ekranga qo‘shish</b> ni tanlang.</p><p>3. <b>Qo‘shish</b> ni bosing.</p>":
      "<p>1. Brauzer menyusini (<b>⋮</b>) oching.</p><p>2. <b>Ilovani o‘rnatish</b> yoki <b>Bosh ekranga qo‘shish</b> ni tanlang.</p><p>3. <b>O‘rnatish</b> ni bosing.</p>")+
      "<p class=ish>Shundan keyin ilova bosh ekranda icon bo‘lib turadi.</p></div>";
  }else if(st.sheet==="person"){
    var k=st.pk,u=unpaidOf(k),p=personObj(k);
    $("shT").textContent=u.length?u[0].name:"Qarzdor";
    if(!p){h="<div class=empty>Qarz to‘liq yopildi</div>"}
    else{
      var ev=[];
      u.forEach(function(x){ev.push({d:x.date,t:x.ts||0,l:"Qarz berildi",a:x.g});x.log.forEach(function(l){ev.push({d:l.d,t:l.t||0,l:l.k==="p"?"Qarz olindi":"Tahrir",a:l.a})})});
      ev.sort(function(m,n){return m.d<n.d?-1:m.d>n.d?1:m.t-n.t});
      var ph=phoneN(p.phone),mt=encodeURIComponent(msgFor(p));
      h="<div class=ptot><small>Jami qarz</small><b>"+money(p.amt)+"</b></div>"+(p.phone?"<div class=pph>"+esc(p.phone)+"</div>":"")+
      (st.pm?"<div class=pf><label>"+(st.pm==="give"?"Qarz berilayotgan summa":"Olinayotgan qarz summasi")+"</label><input class=ei id=pam inputmode=decimal placeholder=Summa autocomplete=off><div class=er id=perr></div><div class=pbt><button class=pbk data-act=pm>Orqaga</button><button class=pbm data-act=psave>Saqlash</button></div></div>"
      :"<div class=pbt><button class='pbm give' data-act=pm data-m=give>Qarz berish</button><button class='pbm take' data-act=pm data-m=take>Qarz olish</button></div>")+
      (ph&&!st.pm?"<div class=la style='margin-bottom:6px'><a class='lb sms' href=\"sms:+"+ph+"?&body="+mt+"\" target=_blank rel=noopener>SMS</a><a class='lb tg' data-act=tg data-k=\""+esc(k)+"\" href=\"https://t.me/+"+ph+"\" target=_blank rel=noopener>Telegram</a><button class=lb data-act=cp data-k=\""+esc(k)+"\">Matnni nusxalash</button></div>":"")+
      "<div class=phs>"+ev.map(function(x){return"<div class='hr "+(x.a<0?"mn":"pp")+"'><span>"+wdt(x.d,x.t)+" · "+x.l+"</span><b>"+(x.a<0?"−":"+")+sh(Math.abs(x.a))+"</b></div>"}).join("")+"</div>";
    }
  }else{
    $("shT").textContent=st.allD?"Barcha qarzdorlar":"Qarzlar · "+d;
    var ds=db.debts.filter(function(x){return r4(x)&&(st.allD||x.date===d)});
    h="<div class=la style='margin:0 0 6px'><button class=abtn data-act=allD>"+(st.allD?"Faqat shu kun":"Barcha qarzdorlar")+"</button></div>"+(ds.length?ds.map(function(x){
      var ph=phoneN(x.phone),m=encodeURIComponent(msgFor(x));
      return"<div class=li style='flex-wrap:wrap'><div style='flex:1;min-width:90px'><input class=ei data-ed=name data-id="+x.id+" value=\""+esc(x.name)+"\" placeholder=Ism><input class=ei data-ed=phone data-id="+x.id+" value=\""+esc(x.phone||"")+"\" placeholder=Telefon inputmode=tel><small>"+x.date+""+"</small></div><div class=b>"+
      "<input class='ei am' inputmode=decimal data-ed=amt data-id="+x.id+" value=\""+vv(x.a4)+"\">"+"<button class=del data-act=delDebt data-id="+x.id+">×</button></div>"+
      (ph&&!x.paid?"<div class=la style='width:100%'><a class='lb sms' href=\"sms:+"+ph+"?&body="+m+"\" target=_blank rel=noopener>SMS</a><a class='lb tg' data-act=tg data-id="+x.id+" href=\"https://t.me/+"+ph+"\" target=_blank rel=noopener>Telegram</a><button class=lb data-act=cp data-id="+x.id+">Matnni nusxalash</button></div>":"")+"</div>"}).join(""):"<div class=empty>Qarz yo‘q</div>");
  }
  $("shB").innerHTML=h;$("ov").hidden=false;
}
function onField(e){
  var el=e.target,f=el.dataset.f;if(!f)return;
  var p=P[+el.closest(".tr").dataset.p],its=wD(st.date).items,it=its[p]=its[p]||{};
  if(el.value.trim()==="")delete it[f];else it[f]=el.value.indexOf("+")>-1?sumExpr(el.value):(f==="sell"||f==="pf"?numM:num)(el.value);
  if(!Object.keys(it).length)delete its[p];
  if(!Object.keys(its).length&&!wD(st.date).exp.length)delete db.days[st.date];
  save();refresh();
}
function plusFix(e){var el=e.target;if(el.dataset&&el.dataset.f&&el.value.indexOf("+")>-1){var v=sumExpr(el.value);el.value=v?String(v):""}}
$("t1").addEventListener("change",plusFix);$("t2").addEventListener("change",plusFix);$("t5").addEventListener("change",plusFix);
$("t1").addEventListener("input",onField);$("t2").addEventListener("input",onField);$("t5").addEventListener("input",onField);
$("dt").addEventListener("change",function(e){if(e.target.value){st.date=e.target.value;build()}});
$("ov").addEventListener("click",function(e){if(e.target.id==="ov"){st.sheet=null;$("ov").hidden=true}});
document.addEventListener("click",function(e){
  var t=e.target.closest?e.target.closest("[data-act]"):null;if(!t)return;var a=t.dataset.act;
  if(a==="nav"){st.date=addDays(st.date,+t.dataset.n);build();return}
  if(a==="close"){st.sheet=null;$("ov").hidden=true;return}
  if(a==="clr"){
    if(!t.classList.contains("sure")){t.classList.add("sure");t.textContent="Aniq tozalansinmi?";clearTimeout(window._ct);window._ct=setTimeout(function(){t.classList.remove("sure");t.textContent="Tozalash"},3500);return}
    clearTimeout(window._ct);t.classList.remove("sure");t.textContent="Tozalash";
    delete db.days[st.date];db.debts.forEach(function(x){if(x.date===st.date){x.l7=true;x.a4=0;x.pb=0}});
    ["en","ea","qn","qp","qa"].forEach(function(i){$(i).value=""});st.sheet=null;$("ov").hidden=true;save();build();return;
  }
  if(a==="allD"){st.allD=!st.allD;sheet();return}
  if(a==="tg"||a==="cp"){var xd=t.dataset.k?personObj(t.dataset.k):db.debts.filter(function(z){return z.id===t.dataset.id})[0];if(xd)copyTxt(msgFor(xd));if(a==="cp"){var o0=t.textContent;t.textContent="Nusxalandi";setTimeout(function(){t.textContent=o0},1500)}return}
  if(a==="padd"){var pi=+t.dataset.i,bs=P[pi].replace(/\s+\d+$/,""),pn2=2;while(P.indexOf(bs+" "+pn2)>-1)pn2++;P.splice(pi+1,0,bs+" "+pn2);save();build();return}
  if(a==="pdel"){if(!t.classList.contains("sure")){t.classList.add("sure");t.textContent="?";clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove("sure");t.textContent="−"},3000);return}var dn=P[+t.dataset.i];P.splice(+t.dataset.i,1);db.manual=db.manual.filter(function(z){return z!==dn});Object.keys(db.days).forEach(function(k){delete db.days[k].items[dn]});save();build();return}
  if(a==="st"){setTab(+t.dataset.i);var rw=document.querySelector(".row.on");if(rw)rw.scrollTop=0;return}
  if(a==="pg"){openPg(t.dataset.k);return}
  if(a==="pgx"){st.pg=null;$("pg").hidden=true;return}
  if(a==="man"){var pn=P[+t.dataset.i],mj=db.manual.indexOf(pn);if(mj>-1)db.manual.splice(mj,1);else db.manual.push(pn);afterAdmin();return}
  if(a==="aadd"){var nm=$("np").value.trim();if(nm&&P.indexOf(nm)<0){P.push(nm);afterAdmin()}return}
  if(a==="adel"){two(t,function(){var nm=P[+t.dataset.i];P.splice(+t.dataset.i,1);db.manual=db.manual.filter(function(z){return z!==nm});Object.keys(db.days).forEach(function(k){delete db.days[k].items[nm]});afterAdmin()});return}
  if(a==="theme"){db.theme=t.dataset.v;applyTheme();save();openPg("admin");return}
  if(a==="wipe"){two(t,function(){db.days={};db.debts=[];save();build();openPg("admin")});return}
  if(a==="gal"){saveDay();return}
  if(a==="install"){if(dip){dip.prompt();dip.userChoice.then(function(){dip=null})}else{st.sheet="inst";sheet()}return}
  if(a==="instX"){db.instX=1;save();$("inst").hidden=true;return}
  if(a==="themeT"){db.theme=effTheme()==="dark"?"light":"dark";applyTheme();save();return}
  if(a==="person"){st.sheet="person";st.pk=t.dataset.k;st.pm=null;sheet();return}
  if(a==="pm"){st.pm=t.dataset.m||null;sheet();var pi=$("pam");if(pi)pi.focus();return}
  if(a==="psave"){var pv=numM($("pam").value),pt=totOf(st.pk);
    if(!pv){$("pam").focus();return}
    if(st.pm==="take"&&pv>pt){$("perr").textContent="Qarz "+money(pt)+" dan oshmasin";return}
    if(st.pm==="give")lendPerson(st.pk,pv);else payPerson(st.pk,pv);
    st.pm=null;save();refresh();return}
  if(a==="listExp"){st.sheet="exp";sheet();return}
  if(a==="listDebt"){st.sheet="debt";sheet();return}
  if(a==="addExp"){var am=sumExpr($("ea").value);if(!am){$("ea").focus();return}var nm=$("en").value.trim()||"Xarajat",ED=wD(st.date),ex0=ED.exp.filter(function(z){return z.name.toLowerCase()===nm.toLowerCase()})[0];if(ex0)ex0.amt=r2(ex0.amt+am);else ED.exp.push({id:"e"+Date.now(),name:nm,amt:am});$("en").value="";$("ea").value="";$("en").focus()}
  else if(a==="delExp"){var D=wD(st.date);D.exp=D.exp.filter(function(x){return x.id!==t.dataset.id})}
  else if(a==="addDebt"){var n=$("qn").value.trim(),m=numM($("qa").value);if(!n||!m){(n?$("qa"):$("qn")).focus();return}db.debts.push({id:"q"+Date.now(),name:n,phone:$("qp").value.trim(),amt:m,a4:m,g:m,pb:m,log:[],ts:Date.now(),date:st.date,paid:false});$("qn").value="";$("qp").value="";$("qa").value="";$("qn").focus()}
  else if(a==="payDebt"){db.debts.forEach(function(x){if(x.id!==t.dataset.id)return;if(!x.paid){x.log.push({t:Date.now(),d:st.date,k:"p",a:-x.amt});recalc(x)}else{for(var i=x.log.length-1;i>=0;i--){if(x.log[i].k==="p"){x.log.splice(i,1);break}}recalc(x)}})}
  else if(a==="pay"||a==="lend"){var pc=t.closest(".pc"),xx=db.debts.filter(function(z){return z.id===pc.dataset.id})[0],iv=numM(pc.querySelector("[data-amt]").value);if(!xx)return;if(a==="pay"){var u=Math.min(iv||xx.amt,xx.amt);xx.log.push({t:Date.now(),d:st.date,k:"p",a:-u});recalc(xx)}else{if(!iv){pc.querySelector("[data-amt]").focus();return}db.debts.push({id:"q"+Date.now(),name:xx.name,phone:xx.phone,amt:iv,a4:0,l7:true,g:iv,pb:iv,log:[],ts:Date.now(),date:st.date,paid:false})}}
  else if(a==="delDebt"){two(t,function(){db.debts=db.debts.filter(function(x){return x.id!==t.dataset.id});save();refresh()});return}
  save();refresh();
});

function drawReport(ctx,W,H){
  var d=st.date,t=dayTot(d),y=0,F="Onest,system-ui,sans-serif";
  function T(s,x,yy,sz,w,c,al){ctx.font=w+" "+sz+"px "+F;ctx.fillStyle=c;ctx.textAlign=al||"left";ctx.fillText(s,x,yy)}
  function B(yy,h,c){ctx.fillStyle=c;ctx.fillRect(40,yy,W-80,h)}
  function sec(n,title,col){y+=34;ctx.fillStyle=col;ctx.beginPath();ctx.arc(62,y+2,18,0,7);ctx.fill();T(n,62,y+10,22,"700","#fff","center");T(title,96,y+11,30,"700","#16213a");y+=50}
  function line(a,b,bold,col){T(a,40,y,27,bold?"700":"500","#16213a");T(b,W-40,y,27,"700",col||"#16213a","right");y+=46}
  if(H){ctx.fillStyle="#ffffff";ctx.fillRect(0,0,W,H)}
  y=76;T("Go‘sht hisobi",40,y,48,"700","#16213a");T(d,W-40,y,32,"500","#6a7690","right");y+=26;B(y,3,"#dfe5ef");
  sec("1",ttl("r1")+" va "+ttl("r2"),"#10a37f");
  var ex=[390,480,565,660,770,890,1040],hd=["Kecha","Kelgan","Uyga","Qolgan","Sotildi","Narx","Summa"];
  T("Mahsulot",40,y,21,"500","#6a7690");hd.forEach(function(h,i){T(h,ex[i],y,21,"500","#6a7690","right")});y+=14;B(y,2,"#dfe5ef");y+=40;
  var rows=P.map(function(p){return{p:p,c:calc(p,d)}}).filter(function(r){var i=r.c.it;return r.c.open||i.in||i.home||i.left!=null||r.c.sell||r.c.has});
  if(!rows.length)rows=P.map(function(p){return{p:p,c:calc(p,d)}});
  rows.forEach(function(r,k){var c=r.c,i=c.it;if(k%2===0)B(y-31,44,"#f3f6fb");T(r.p,48,y,26,"700","#16213a");
    [vv(c.open)||"0",vv(i.in)||"0",vv(i.home)||"0",i.left!=null?vv(i.left)||"0":"—",c.has?q(c.sold):"—",sh(c.sell),sh(c.rev)].forEach(function(v,j){T(v,ex[j]-(j===6?8:0),y,26,j>=5?"700":"500",j===4&&c.has&&c.sold<0?"#dc4b43":"#16213a","right")});y+=44});
  y+=6;B(y-31,48,"#e3f6ef");T("Jami tushum (2)",48,y+3,28,"700","#0b7a5e");T(sh(t.rev)+" so‘m",W-48,y+3,28,"700","#0b7a5e","right");y+=60;
  sec("3",ttl("r3"),"#f59e0b");
  var xs=(db.days[d]&&db.days[d].exp)||[];
  if(!xs.length){line("Xarajat yo‘q","0")}else xs.forEach(function(x){line(x.name,sh(x.amt)+" so‘m")});
  line("Jami xarajat",sh(t.exp)+" so‘m",true,"#b45309");
  sec("4",ttl("r4"),"#8b5cf6");
  var ds=db.debts.filter(function(x){return x.date===d});
  if(!ds.length){line("Qarz yo‘q","0")}else ds.forEach(function(x){line(x.name+(x.paid?" (to‘landi)":""),sh(x.pb)+" so‘m")});
  line("Jami qarz (chiqimga qo‘shiladi)",sh(t.debt)+" so‘m",true,"#6d28d9");
  sec("5",ttl("r5"),"#06b6d4");
  var r5=P.map(function(p){return{p:p,c:calc(p,d)}}).filter(function(r){return r.c.has&&r.c.pf});
  if(!r5.length)line("Ma’lumot yo‘q","0");else r5.forEach(function(r){line(r.p+"  "+q(r.c.sold)+" kg × "+sh(r.c.pf),sh(r.c.p5)+" so‘m")});
  line("Jami "+q(t.kg)+" kg · Jami foyda",sh(t.p5)+" so‘m",true,"#0e7490");
  sec("6",ttl("r6"),"#ec4899");
  line("Xarajat (3) + Qarz (4) = Jami chiqim",sh(t.out)+" so‘m");
  line("Tushum (2)",sh(t.rev)+" so‘m");
  y+=4;B(y-34,96,"#16213a");T(t.profit<0?"ZARAR (Chiqim − Tushum)":"FOYDA (Tushum − Chiqim)",64,y+12,27,"500","#c9d3ea");T(sh(Math.abs(t.profit))+" so‘m",W-64,y+16,44,"700",t.profit<0?"#ff9a90":"#5eead4","right");y+=100;
  return y+24;
}
async function savePng(blob,name){
  try{if(window.claude&&window.claude.use){var dl=await window.claude.use("downloads");if(dl){await dl.save({filename:name,data:blob});return true}}}catch(e){if(e&&e.code==="declined")return false}
  var f=new File([blob],name,{type:"image/png"});
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:name});return true}catch(e){if(e&&e.name==="AbortError")return false}}
  var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();return true;
}
async function saveDay(){
  var b=$("gal"),msg="Saqlandi";b.disabled=true;
  try{
    if(document.fonts&&document.fonts.ready)await document.fonts.ready;
    var W=1080,c=document.createElement("canvas");c.width=W;c.height=100;
    var H=drawReport(c.getContext("2d"),W,0);c.height=H;drawReport(c.getContext("2d"),W,H);
    var blob=await new Promise(function(r){c.toBlob(r,"image/png")});
    if(!(await savePng(blob,"hisob-"+st.date+".png")))msg="Bekor qilindi";
  }catch(e){msg="Saqlanmadi"}
  b.textContent=msg;setTimeout(function(){b.textContent="Galereyaga saqlash";b.disabled=false},2200);
}

var DEFMSG="Assalomu alaykum, {ism}! Sizning {summa} so‘m qarzingiz bor. Iltimos, to‘lovni amalga oshiring. Rahmat!";
function msgFor(x){return(db.msg||DEFMSG).replace(/\{ism\}/g,x.name).replace(/\{summa\}/g,sh(x.amt))}
function phoneN(p){var d=String(p||"").replace(/\D/g,"");if(d.length===9)d="998"+d;return d}
function legacy(s){var a=document.createElement("textarea");a.value=s;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();try{document.execCommand("copy")}catch(e){}a.remove()}
function copyTxt(s){try{if(navigator.clipboard){navigator.clipboard.writeText(s).catch(function(){legacy(s)});return}}catch(e){}legacy(s)}
function makeBg(){
  var E=["🧮","🧾","💰","💵","📊","📈","🪙","💳","📒","🔢","➕","➖","✖️","➗","🥩","🍗","🧮","💰"],box=$("bgfx");if(!box)return;
  function r(a,b){return a+Math.random()*(b-a)}
  E.forEach(function(e){
    var s=document.createElement("span");s.textContent=e;
    s.style.left=r(0,92)+"%";s.style.top=r(0,90)+"%";s.style.fontSize=r(26,58)+"px";
    s.style.setProperty("--dx",r(-45,45)+"vw");s.style.setProperty("--dy",r(-45,45)+"vh");
    s.style.setProperty("--r0",r(-25,25)+"deg");s.style.setProperty("--r1",r(-40,40)+"deg");
    s.style.setProperty("--d",r(22,48)+"s");s.style.animationDelay="-"+r(0,30)+"s";
    box.appendChild(s);
  });
}
function dLabel(dt){var t=iso(new Date());return dt===t?"Bugun":dt===addDays(t,-1)?"Kecha":dt===addDays(t,1)?"Ertaga":dt}
var WDN=["Yakshanba","Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba"];
function hm(t){var d=new Date(t);return(d.getHours()<10?"0":"")+d.getHours()+":"+(d.getMinutes()<10?"0":"")+d.getMinutes()}
function wdt(d,t){return WDN[new Date(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8)).getDay()]+", "+dmy(d)+(t?" · "+hm(t):"")}
function dmy(d){return +d.slice(8)+" "+MN[+d.slice(5,7)-1]+" "+d.slice(0,4)}
function renderD7(){
  var el=$("d7");if(!el)return;
  $("tD7").textContent="Jami: "+money(debtTotal());
  var ps={};
  db.debts.forEach(function(x){if(x.paid)return;var k=keyOf(x),p=ps[k];
    if(!p)p=ps[k]={k:k,name:x.name,d:x.date,t:x.ts||0,amt:0};
    p.amt+=x.amt;if(x.date<p.d||(x.date===p.d&&(x.ts||0)<p.t)){p.d=x.date;p.t=x.ts||0}});
  var L=Object.keys(ps).map(function(k){return ps[k]}).sort(function(p,q){return p.d<q.d?-1:p.d>q.d?1:p.t-q.t});
  if(!L.length){el.innerHTML="<div class=empty>Qarzdor yo‘q</div>";return}
  el.innerHTML=L.map(function(p){return"<button class=prs data-act=person data-k=\""+esc(p.k)+"\"><span class=prn>"+esc(p.name)+"</span><b>"+money(p.amt)+"</b></button>"}).join("");
}
$("d7").addEventListener("change",function(e){var t=e.target;if(t.dataset.tot==null)return;var x=db.debts.filter(function(z){return z.id===t.closest(".pc").dataset.id})[0];if(!x)return;setAmt(x,Math.max(0,numM(t.value)));save();refresh()});
$("shB").addEventListener("change",function(e){
  var t=e.target,f=t.dataset.ed;if(!f)return;var x=db.debts.filter(function(z){return z.id===t.dataset.id})[0];if(!x)return;
  if(f==="name"){if(t.value.trim())x.name=t.value.trim()}else if(f==="phone")x.phone=t.value.trim();else if(f==="amt"){var nv=Math.max(0,numM(t.value)),dl=nv-x.a4;x.a4=nv;if(dl){if(!x.l7)x.pb=Math.max(0,x.pb+dl);x.log.push({t:Date.now(),d:st.date,k:"e",a:dl});recalc(x)}}
  save();refresh();
});
var WD=["Du","Se","Ch","Pa","Ju","Sh","Ya"],MN=["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"],MS=["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
var DEF={r1:"Mahsulotlar",r2:"Sotuv hisobi",r3:"Xarajatlar",r4:"Qarzlar",r5:"Foyda hisobi",r6:"Jami hisob",r7:"Barcha qarzdorlar"};
function ttl(k){return db.titles[k]||DEF[k]}
function applyTitles(){document.querySelectorAll("[data-tk]").forEach(function(h){h.textContent=ttl(h.dataset.tk)})}
function scl(){var r=db.scale||100;return r+"%"+(st.eff&&st.eff*100<r-1?" → ekranga sig‘gani: "+Math.round(st.eff*100)+"%":"")}
function setTab(i){st.tab=i;document.querySelectorAll(".row").forEach(function(r){r.classList.toggle("on",+r.dataset.s===i)});document.querySelectorAll("#stabs button").forEach(function(b){b.classList.toggle("on",+b.dataset.i===i)})}
function fit(){
  var s=(db.scale||100)/100;
  document.documentElement.style.setProperty("--s",s);
  document.querySelector(".app").classList.add("tabs");
  st.eff=s;var sv=$("scv");if(sv)sv.textContent=scl();
}
function applyScale(){fit()}
var _ft;window.addEventListener("resize",function(){clearTimeout(_ft);_ft=setTimeout(fit,150)});
window.addEventListener("load",fit);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
function effTheme(){return db.theme==="light"||db.theme==="dark"?db.theme:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}
function applyTheme(){var r=document.documentElement;if(db.theme==="light"||db.theme==="dark")r.setAttribute("data-theme",db.theme);else r.removeAttribute("data-theme");var tb=$("thm");if(tb)tb.textContent=effTheme()==="dark"?"☀":"☾"}
function pad(n){return(n<10?"0":"")+n}
function fin(v){v.out=v.exp+v.debt;v.net=v.rev-v.out;return v}
function norm(x){return fin({rev:x.rev,exp:x.exp,debt:x.debt,p5:x.p5})}
function sumL(a){var t={rev:0,exp:0,debt:0,p5:0};a.forEach(function(r){var v=r.v;t.rev+=v.rev;t.exp+=v.exp;t.debt+=v.debt;t.p5+=v.p5});return fin(t)}
function sn(n){return(n<0?"−":"")+sh(Math.abs(n))}
function report(kind){
  var d=st.date,y=d.slice(0,4),ym=d.slice(0,7),items=[],title,rng,i,x;
  if(kind==="week"){var s=addDays(d,-((new Date(d+"T00:00:00").getDay()+6)%7));title="1 haftalik hisob";rng=s+" — "+addDays(s,6);
    for(i=0;i<7;i++){var dd=addDays(s,i);items.push({l:WD[i]+" "+dd.slice(8),v:norm(dayTot(dd))})}}
  else if(kind==="month"){title="1 oylik hisob";rng=MN[+ym.slice(5)-1]+" "+y;var n=new Date(+y,+ym.slice(5),0).getDate();
    for(i=1;i<=n;i++){x=dayTot(ym+"-"+pad(i));if(x.rev||x.exp||x.debt||x.p5)items.push({l:pad(i)+"."+ym.slice(5),v:norm(x)})}}
  else{title="1 yillik hisob";rng=y+"-yil";for(i=1;i<=12;i++)items.push({l:MS[i-1],v:period(y+"-"+pad(i))})}
  var t=sumL(items);
  function row(l,v,c){return"<div class='rr "+(c||"")+"'><span>"+l+"</span><span>"+sh(v.rev)+"</span><span>"+sh(v.out)+"</span><span>"+sh(v.p5)+"</span><b>"+sn(v.net)+"</b></div>"}
  var h="<div class=rg>"+rng+"</div><div class=cards><div class='cd big'><small>"+(t.net<0?"ZARAR (Chiqim − Tushum)":"FOYDA (Tushum − Chiqim)")+"</small><b>"+sn(Math.abs(t.net))+" so‘m</b></div>"+
  "<div class=cd><small>Jami tushum</small><b>"+money(t.rev)+"</b></div><div class=cd><small>Jami chiqim</small><b>"+money(t.out)+"</b></div>"+
  "<div class=cd><small>Xarajatlar</small><b>"+money(t.exp)+"</b></div><div class=cd><small>Qarzlar (chiqimga qo‘shiladi)</small><b>"+money(t.debt)+"</b></div>"+
  "<div class='cd' style='grid-column:1/-1'><small>Foyda hisobi (5-qator)</small><b>"+money(t.p5)+"</b></div></div>"+
  "<div class=rpt><div class='rr h'><span>Sana</span><span>Tushum</span><span>Chiqim</span><span>Foyda (5)</span><span>Natija</span></div>"+
  (items.length?items.map(function(r){return row(r.l,r.v)}).join("")+row("Jami",t,"tl"):"<div class=empty>Ma’lumot yo‘q</div>")+"</div>";
  return{title:title,html:h};
}
function adminHTML(){
  var h="<div class=ad><h3>Harf o‘lchami: <span id=scv>"+scl()+"</span></h3><input type=range min=70 max=150 step=5 data-sc value="+(db.scale||100)+"><div style='display:flex;justify-content:space-between;color:var(--mute);font-size:12px;margin-top:4px'><span>Kichik</span><span>Katta</span></div></div><div class=ad><h3>Mahsulotlar</h3>"+P.map(function(p,i){return"<div class=ar style='grid-template-columns:1fr auto auto'><input data-pn="+i+" value=\""+esc(p)+"\"><button class=abtn data-act=man data-i="+i+">1-qator: "+(db.manual.indexOf(p)>-1?"Yo‘q":"Ha")+"</button><button class='abtn red' data-act=adel data-i="+i+">O‘chirish</button></div>"}).join("")+
  "<div class=ar><input id=np placeholder='Yangi mahsulot nomi'><button class=abtn data-act=aadd>Qo‘shish</button></div></div>";
  h+="<div class=ad><h3>Qator nomlari</h3>"+Object.keys(DEF).map(function(k){return"<div style='margin-bottom:8px'><label>"+k.slice(1)+"-qator</label><input data-tk2="+k+" value=\""+esc(ttl(k))+"\"></div>"}).join("")+"</div>";
  h+="<div class=ad><h3>Ko‘rinish</h3><div class=themes>"+[["auto","Avto"],["light","Yorug‘"],["dark","Qorong‘i"]].map(function(a){return"<button class='abtn"+((db.theme||"auto")===a[0]?" on":"")+"' data-act=theme data-v="+a[0]+">"+a[1]+"</button>"}).join("")+"</div></div>";
  h+="<div class=ad><h3>SMS va Telegram matni</h3><input data-msg value=\""+esc(db.msg||DEFMSG)+"\"><div style='color:var(--mute);font-size:12px;margin-top:6px'>{ism} va {summa} o‘rniga qarzdor ismi va summasi qo‘yiladi.</div></div>";
  h+="<div class=ad><h3>Ma’lumotlar</h3><button class='abtn red' style='width:100%' data-act=wipe>Barcha kunlarni o‘chirish</button></div>";
  return h;
}
function openPg(k){
  var r=k==="admin"?{title:"Admin panel",html:adminHTML()}:report(k);
  st.pg=k;$("pg").classList.toggle("rep",k!=="admin");$("pgT").textContent=r.title;$("pgB").innerHTML=r.html;$("pg").hidden=false;
}
function two(t,fn){
  if(!t.classList.contains("sure")){var o=t.textContent;t.classList.add("sure");t.textContent="Aniq?";clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove("sure");t.textContent=o},3500);return}
  clearTimeout(t._t);fn();
}
function afterAdmin(){save();build();applyTitles();openPg("admin")}
$("pgB").addEventListener("change",function(e){
  var el=e.target;if(el.dataset.pn==null)return;
  var i=+el.dataset.pn,old=P[i],nn=el.value.trim();
  if(!nn||nn===old||P.indexOf(nn)>-1){el.value=old;return}
  Object.keys(db.days).forEach(function(k){var it=db.days[k].items;if(it[old]){it[nn]=it[old];delete it[old]}});
  P[i]=nn;var mi=db.manual.indexOf(old);if(mi>-1)db.manual[mi]=nn;afterAdmin();
});
$("pgB").addEventListener("input",function(e){
  if(e.target.dataset.msg!=null){db.msg=e.target.value;save();return}
  if(e.target.dataset.sc!=null){db.scale=+e.target.value;applyScale();save();return}
  var k=e.target.dataset.tk2;if(!k)return;
  if(e.target.value.trim())db.titles[k]=e.target.value;else delete db.titles[k];
  save();applyTitles();
});
st.today=iso(new Date());
function syncToday(){
  var n=iso(new Date());if(n===st.today)return;
  if(st.date===st.today){st.date=n;st.allD=false}
  st.today=n;build();
}
setInterval(syncToday,30000);
function tick(){var n=new Date(),p=function(v){return(v<10?"0":"")+v};
  $("clkD").textContent=WDN[n.getDay()]+", "+n.getDate()+" "+MN[n.getMonth()]+" "+n.getFullYear();
  $("clkT").textContent=p(n.getHours())+":"+p(n.getMinutes())+":"+p(n.getSeconds())}
tick();setInterval(tick,1000);
document.addEventListener("visibilitychange",function(){if(!document.hidden)syncToday()});
window.addEventListener("focus",syncToday);
var dip=null;
function showInst(){var b=$("inst"),sa=(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;b.hidden=sa||db.instX===1}
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();dip=e;showInst()});
window.addEventListener("appinstalled",function(){dip=null;$("inst").hidden=true});
if("serviceWorker"in navigator&&/^https?:/.test(location.protocol)){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}
makeBg();build();applyTitles();applyTheme();applyScale();showInst();setTab(st.tab||1);
})();

/* "+" qo'shish paneli: katakka bosilganda pastda chiqadi, 200 turgan joyga "+300" yozishga yordam beradi */
(function(){
var bar=document.createElement("div");
bar.id="plusBar";
bar.style.cssText="position:fixed;left:0;right:0;bottom:0;z-index:9998;display:none;justify-content:center;gap:10px;padding:8px 12px;background:rgba(20,20,24,.92);backdrop-filter:blur(8px)";
bar.innerHTML='<button type="button" id="plusBtn" style="flex:1;max-width:220px;font:700 20px system-ui;padding:10px 0;border:0;border-radius:12px;background:#10a37f;color:#fff">+ qo‘shish</button><button type="button" id="okBtn" style="padding:10px 18px;border:0;border-radius:12px;background:#fff;color:#111;font:600 16px system-ui">Tayyor</button>';
document.body.appendChild(bar);
var cur=null;
function isF(el){return el&&el.tagName==="INPUT"&&(el.dataset&&el.dataset.f||el.id==="ea")}
function place(){var vv=window.visualViewport;bar.style.bottom=vv?Math.max(0,window.innerHeight-vv.height-vv.offsetTop)+"px":"0px"}
if(window.visualViewport){visualViewport.addEventListener("resize",place);visualViewport.addEventListener("scroll",place)}
document.addEventListener("focusin",function(e){if(isF(e.target)){cur=e.target;bar.style.display="flex";place()}});
document.addEventListener("focusout",function(){setTimeout(function(){if(!isF(document.activeElement)){bar.style.display="none";cur=null}},150)});
bar.addEventListener("pointerdown",function(e){e.preventDefault()});
document.getElementById("plusBtn").addEventListener("click",function(){if(!cur)return;var v=cur.value;if(v.trim()===""||/\+$/.test(v))return;cur.value=v+"+";cur.dispatchEvent(new Event("input",{bubbles:true}));try{cur.setSelectionRange(cur.value.length,cur.value.length)}catch(x){}});
document.getElementById("okBtn").addEventListener("click",function(){if(cur){cur.dispatchEvent(new Event("change",{bubbles:true}));cur.blur()}});
})();

/* Narx katakchalarida avtomatik nuqta: 12000 -> 12.000, 123000 -> 123.000 */
(function(){
function isP(el){return el&&el.tagName==="INPUT"&&(el.id==="ea"||(el.dataset&&(el.dataset.f==="sell"||el.dataset.f==="pf")))}
document.addEventListener("input",function(e){var el=e.target;if(!isP(el))return;var f=window.fmtP(el.value);if(f!==el.value){el.value=f;try{el.setSelectionRange(f.length,f.length)}catch(x){}}},true);
})();

/* ===== Jami pullar: bitta oyna, pul qo'shish / pul olish ===== */
(function(){
var KEY="gusht_pul1",OLD="gusht_pul";
function sum(s){var t=0;String(s).split("+").forEach(function(p){var d=p.replace(/\D/g,"");if(d)t+=parseInt(d,10)});return t}
function fm(s){return String(s).split("+").map(function(p){return p.replace(/\D/g,"").replace(/\B(?=(\d{3})+(?!\d))/g,".")}).join("+")}
function money(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,".")}
function hm(ts){var d=new Date(ts),h=d.getHours(),m=d.getMinutes();return d.getDate()+"."+(d.getMonth()+1)+"."+d.getFullYear()+" "+(h<10?"0":"")+h+":"+(m<10?"0":"")+m}
function load(){
  var r=null;try{r=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
  if(!r||typeof r.a!=="number"){ // eski 8 qatorli ma'lumotni bittaga yig'ish
    r={a:0,h:[]};
    try{var o=JSON.parse(localStorage.getItem(OLD)||"[]");if(Array.isArray(o))o.forEach(function(x){if(!x)return;var v=typeof x.a==="number"?x.a:sum(x.t||"");r.a+=v;(x.h||[]).forEach(function(e){r.h.push(e)})})}catch(e){}
    r.h.sort(function(p,q){return p.at-q.at});
  }
  if(!Array.isArray(r.h))r.h=[];return r}
function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}
var D=load();
var st=document.createElement("style");
st.textContent="#pulBtn{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:8px;z-index:9999;background:#10a37f;color:#fff;border:0;border-radius:20px;padding:7px 14px;font:600 13px system-ui;box-shadow:0 2px 10px rgba(0,0,0,.3)}"+
"#pulBox,#pulAct{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:flex-end;justify-content:center;font-family:system-ui,sans-serif}"+
"#pulBox{z-index:2147483000}#pulAct{z-index:2147483100}#pulBox.on,#pulAct.on{display:flex}"+
".pSh{background:#fff;color:#111;width:100%;max-width:520px;max-height:92vh;overflow:auto;border-radius:22px 22px 0 0;padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 16px)}"+
".pSh h2{margin:0 0 4px;font-size:20px}.pSh h3{margin:0 0 4px;font-size:18px}.pSh .hn{color:#556;font-size:13px;margin:0 0 10px;line-height:1.5}"+
".pSh .lg{display:flex;gap:8px;font-size:12px;margin-bottom:10px;flex-wrap:wrap}.pSh .lg span{padding:4px 10px;border-radius:10px}.pSh .l1{background:#dff7ee;color:#05795a}.pSh .l2{background:#fde4e2;color:#b3261e}"+
".pSh .tot{width:100%;border:0;border-radius:20px;background:linear-gradient(135deg,#0b9a74,#10c9a0);color:#fff;padding:22px 12px;text-align:center;box-shadow:0 6px 20px rgba(16,163,127,.4)}.pSh .tot small{display:block;opacity:.9;font:500 13px system-ui}.pSh .tot b{display:block;font:800 34px system-ui;margin:4px 0}.pSh .tot i{font:normal 12px system-ui;opacity:.9}"+
".pSh input{box-sizing:border-box;border:1px solid #cfd8d5;border-radius:10px;padding:12px;font-size:18px;background:#fff;color:#111;min-width:0;width:100%}"+
".pSh .two{display:flex;gap:10px;margin:12px 0}.pSh .two button{flex:1;border:0;border-radius:16px;padding:22px 8px;font:700 17px system-ui;color:#fff}.pSh .ad{background:#10a37f}.pSh .sb{background:#e5484d}"+
".pSh .fr{display:flex;gap:8px;align-items:center;margin:8px 0}.pSh .fr button{flex:none;width:48px;height:48px;border:0;border-radius:12px;background:#10a37f;color:#fff;font:700 24px system-ui}"+
".pSh .pv{margin:10px 0;padding:12px;border-radius:12px;background:#f0f4f3;font-size:15px;font-weight:600;text-align:center;min-height:20px}.pSh .pv.bad{background:#fde4e2;color:#b3261e}"+
".pSh .ok{text-align:center;padding:10px 0}.pSh .ok .c{font-size:44px;color:#10a37f}.pSh .ok b{font-size:26px;display:block;margin-top:4px}"+
".pSh .full{width:100%;border:0;border-radius:12px;padding:14px;font:700 16px system-ui;margin-top:6px}"+
".pSh .hs{margin:14px 0 4px;font-weight:700;font-size:14px}.pSh .it{display:flex;justify-content:space-between;padding:8px 2px;border-bottom:1px solid #eef1f0;font-size:14px}.pSh .it b.p{color:#0a8f6a}.pSh .it b.m{color:#d33a3f}.pSh .it span{color:#778;font-size:12px}";
document.head.appendChild(st);
var btn=document.createElement("button");btn.id="pulBtn";btn.type="button";btn.textContent="Jami pullar";document.body.appendChild(btn);
var box=document.createElement("div");box.id="pulBox";document.body.appendChild(box);
var act=document.createElement("div");act.id="pulAct";document.body.appendChild(act);
var mode="";
function render(){
  var h='<div class="pSh"><h2>Jami pullar</h2><p class="hn">Pulning ustiga bosing: <b>Pul qo‘shish</b> yoki <b>Pul olish</b> oynasi ochiladi.</p><div class="lg"><span class="l1">Yoziladi: yashil summa</span><span class="l2">O‘chiriladi: qizil tugma</span></div>'+
  '<button type="button" class="tot" id="pulTotBtn"><small>JAMI PUL</small><b>'+money(D.a)+' so‘m</b><i>Qo‘shish yoki olish uchun bosing</i></button>'+
  '<div class="hs">Oxirgi harakatlar</div>';
  var l=D.h.slice(-30).reverse();
  if(!l.length)h+='<div class="it"><span>Hali harakat yo‘q</span></div>';
  l.forEach(function(e){h+='<div class="it"><div><b class="'+(e.o==="+"?"p":"m")+'">'+(e.o==="+"?"+":"−")+money(e.v)+' so‘m</b><br><span>'+hm(e.at)+'</span></div><span>'+(e.o==="+"?"qo‘shildi":"olindi")+'</span></div>'});
  h+='<button type="button" class="full" id="pulClr" style="background:#fde4e2;color:#b3261e;margin-top:12px">Hamma pulni o‘chirish</button><button type="button" class="full" id="pulX" style="background:#10a37f;color:#fff">Yopish</button></div>';
  box.innerHTML=h;
}
function step(){
  mode="";
  act.innerHTML='<div class="pSh"><h3>Jami pul</h3><p class="hn">Hozirgi pul: <b>'+money(D.a)+' so‘m</b></p><div class="two"><button type="button" class="ad" data-m="+">➕ Pul qo‘shish</button><button type="button" class="sb" data-m="-">➖ Pul olish</button></div><button type="button" class="full" data-x="1" style="background:#e8eeec;color:#333">Orqaga</button></div>';
  act.classList.add("on");
}
function form(m){
  mode=m;var add=m==="+";
  act.innerHTML='<div class="pSh"><h3>'+(add?"Pul qo‘shish":"Pul olish")+'</h3><p class="hn">Hozirgi pul: <b>'+money(D.a)+' so‘m</b></p><div class="fr"><input id="pIn" inputmode="decimal" placeholder="'+(add?"Qancha qo‘shiladi?":"Qancha olinadi?")+'"><button type="button" id="pPlus">+</button></div><div class="pv" id="pPv"></div><button type="button" class="full" id="pOk" style="background:'+(add?"#10a37f":"#e5484d")+';color:#fff">'+(add?"Qo‘shish":"Olish")+'</button><button type="button" class="full" data-b="1" style="background:#e8eeec;color:#333">Orqaga</button></div>';
  document.getElementById("pIn").focus();preview();
}
function preview(){
  var inp=document.getElementById("pIn");if(!inp)return;var v=sum(inp.value),pv=document.getElementById("pPv");pv.className="pv";
  if(!v){pv.textContent=mode==="+"?"Qo‘shiladigan summani yozing":"Olinadigan summani yozing";return}
  if(mode==="+")pv.textContent="Qo‘shilgach jami: "+money(D.a+v)+" so‘m";
  else if(v>D.a){pv.className="pv bad";pv.textContent="Yetarli pul yo‘q. Bor: "+money(D.a)+" so‘m"}
  else pv.textContent="Olingandan keyin qoladi: "+money(D.a-v)+" so‘m";
}
function apply(){
  var v=sum(document.getElementById("pIn").value);if(!v){preview();return}
  if(mode==="-"&&v>D.a){preview();return}
  D.a=mode==="+"?D.a+v:D.a-v;D.h.push({o:mode,v:v,at:Date.now()});if(D.h.length>200)D.h.shift();save();
  act.innerHTML='<div class="pSh"><div class="ok"><div class="c">✓</div>'+(mode==="+"?"Qo‘shildi: +"+money(v)+" so‘m<b>Jami: "+money(D.a)+" so‘m</b>":"Olindi: −"+money(v)+" so‘m<b>Qoldi: "+money(D.a)+" so‘m</b>")+'</div><button type="button" class="full" data-x="1" style="background:#10a37f;color:#fff">Tayyor</button></div>';
  render();
}
btn.addEventListener("click",function(){D=load();render();box.classList.add("on")});
box.addEventListener("click",function(e){
  var t=e.target;
  if(t===box||t.id==="pulX"){box.classList.remove("on");return}
  if(t.closest&&t.closest("#pulTotBtn")){step();return}
  if(t.id==="pulClr"){if(confirm(money(D.a)+" so‘m va hamma harakatlar o‘chirilsinmi?")){D={a:0,h:[]};save();render()}}
});
act.addEventListener("click",function(e){
  var t=e.target;
  if(t===act||t.dataset.x){act.classList.remove("on");return}
  if(t.dataset.m){form(t.dataset.m);return}
  if(t.dataset.b){step();return}
  if(t.id==="pPlus"){var inp=document.getElementById("pIn"),v=inp.value;if(v.trim()===""||/\+$/.test(v)){inp.focus();return}inp.value=v+"+";inp.focus();preview();return}
  if(t.id==="pOk")apply();
});
act.addEventListener("input",function(e){var t=e.target;if(t.id!=="pIn")return;var f=fm(t.value);if(f!==t.value)t.value=f;preview()});
window.__pul={bal:function(){D=load();return D.a},open:function(){btn.click()},
 add:function(v){D=load();D.a+=v;D.h.push({o:"+",v:v,at:Date.now()});if(D.h.length>200)D.h.shift();save();return D.a},
 take:function(v){D=load();if(v>D.a)return -1;D.a-=v;D.h.push({o:"-",v:v,at:Date.now()});if(D.h.length>200)D.h.shift();save();return D.a}};
})();

var VCP=(function(){
var CY={"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"yo","ж":"j","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"x","ц":"ts","ч":"ch","ш":"sh","щ":"sh","ъ":"","ь":"","ы":"i","э":"e","ю":"yu","я":"ya","ў":"o","қ":"q","ғ":"g","ҳ":"h"};
function norm(s){s=String(s).toLowerCase().replace(/[ʻʼ‘’`´']/g,"");var o="";for(var i=0;i<s.length;i++){var c=s.charAt(i);o+=CY.hasOwnProperty(c)?CY[c]:c}return o.replace(/[^a-z0-9.,\s]/g," ").replace(/\s+/g," ").trim()}
function lev(a,b){var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++){d[i]=[i]}for(j=1;j<=n;j++)d[0][j]=j;for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a.charAt(i-1)===b.charAt(j-1)?0:1));return d[m][n]}
function tol(w){return w.length<=4?0:(w.length<=7?1:2)}
function near(t,w){return t===w||(w.length>=5&&t.indexOf(w)===0&&t.length-w.length<=4)||(t.length>=4&&lev(t,w)<=tol(w))}
function L(s){return s.split(" ").map(norm)}
function has(T,list,from){for(var i=from||0;i<T.length;i++)for(var k=0;k<list.length;k++)if(near(T[i],list[k]))return i;return -1}
var K={
 help:L("yordam komandalar buyruqlar help помощь"),
 close:L("yop yopish yopilsin orqaga закрой закрыть назад"),
 pul:L("pul pullar pulga pulni pulini деньги"),
 add:L("qosh qoshing qoshib qoshildi plyus plus yana ustiga добавь добавить плюс"),
 take:L("ol olish olinsin olib ayir ayirish chiqar chiqarish забери снять вычти"),
 xar:L("xarajat xarajatlar xarajatni xarajatga расход расходы"),
 qarz:L("qarz qarzga долг"),
 qarzd:L("qarzdor qarzdorlar qarzlar qarzdorlarni qarzlarni qarzdorlarning должники долги"),
 barcha:L("barcha hamma все"),
 mah:L("mahsulot mahsulotlar mahsulotni tovar tovarlar товар"),
 sot:L("sotuv sotuvlar sotuvni продажи продажа"),
 foy:L("foyda foydani прибыль"),
 jami:L("jami umumiy итого"),
 hisob:L("hisob hisobi hisobni"),
 royxat:L("royxat royxatini royhat royxatni список"),
 admin:L("admin panel админ"),
 week:L("haftalik hafta неделя"),
 month:L("oylik oy месяц"),
 year:L("yillik yil год"),
 prev:L("kecha kechagi oldingi вчера"),
 next:L("ertaga keyingi завтра"),
 today:L("bugun bugungi сегодня"),
 theme:L("rejim rang tungi qora tema тема"),
 gal:L("galereya galereyaga saqla saqlash галерея"),
 clr:L("tozala tozalash tozalansin ochir ochirish очисти"),
 place:L("qator sahifa bolim oyna раздел"),
 ord:L("birinchi ikkinchi uchinchi tortinchi beshinchi oltinchi yettinchi"),
 yes:L("ha xa tasdiq tasdiqlayman togri ok okey da aynan"),
 no:L("yoq bekor net нет"),
 uyga:L("uyga ketdi uyda домой"),
 kel:L("kelgan keldi kelish keldim kirim пришло"),
 qol:L("qolgan qoldi qoldiq остаток"),
 open:L("kecha kechagi astatka astatok"),
 sold:L("sotildi sotilgan sotdim sotuv sotilgani продано"),
 narx:L("narx narxi narxini цена"),
 cost:L("tannarx tannarxi foyda"),
 fill:L("kilo kg kilogramm kilogram som sum sumga so mingta ta dona uchun va ga ni ning dan ham")
};
var NUMW={},HUND=L("yuz sto"),MULT={},HALF=L("yarim polovina");
function addN(words,v){L(words).forEach(function(w){NUMW[w]=v})}
addN("nol ноль",0);addN("bir один одна",1);addN("ikki два две",2);addN("uch три",3);addN("tort четыре",4);addN("besh пять",5);addN("olti шесть",6);addN("yetti семь",7);addN("sakkiz восемь",8);addN("toqqiz toqiz девять",9);addN("on десять",10);
addN("одиннадцать",11);addN("двенадцать",12);addN("тринадцать",13);addN("четырнадцать",14);addN("пятнадцать",15);addN("шестнадцать",16);addN("семнадцать",17);addN("восемнадцать",18);addN("девятнадцать",19);
addN("yigirma двадцать",20);addN("ottiz otuz тридцать",30);addN("qirq сорок",40);addN("ellik пятьдесят",50);addN("oltmish шестьдесят",60);addN("yetmish семьдесят",70);addN("sakson восемьдесят",80);addN("toqson девяносто",90);
addN("двести",200);addN("триста",300);addN("четыреста",400);addN("пятьсот",500);addN("шестьсот",600);addN("семьсот",700);addN("восемьсот",800);addN("девятьсот",900);
L("ming тысяча тысячи тысяч").forEach(function(w){MULT[w]=1e3});L("million milyon mln миллион миллиона миллионов").forEach(function(w){MULT[w]=1e6});L("milliard mlrd миллиард").forEach(function(w){MULT[w]=1e9});
function numWord(t){if(NUMW.hasOwnProperty(t))return NUMW[t];if(t.length>=6)for(var w in NUMW)if(w.length>=6&&lev(t,w)<=1)return NUMW[w];return null}
function parseDigits(t){t=t.replace(/[.,]+$/,"");if(/^\d{1,3}([.,]\d{3})+$/.test(t))return parseFloat(t.replace(/[.,]/g,""));var x=parseFloat(t.replace(",","."));return isFinite(x)?x:null}
function merge(T){var o=[];for(var i=0;i<T.length;i++){var t=T[i];if(/^\d{1,3}$/.test(t)){while(i+1<T.length&&/^\d{3}$/.test(T[i+1])){t+=T[i+1];i++}}o.push(t)}return o}
function cls(t){
 if(/^\d[\d.,]*$/.test(t)){var v=parseDigits(t);return v===null?null:{k:"d",v:v}}
 if(MULT.hasOwnProperty(t))return{k:"m",v:MULT[t]};
 for(var i=0;i<HUND.length;i++)if(t===HUND[i])return{k:"h"};
 for(var j=0;j<HALF.length;j++)if(t===HALF[j])return{k:"half"};
 var n=numWord(t);if(n!==null)return{k:"w",v:n};
 return null}
function runs(T){
 var out=[],i=0;
 while(i<T.length){
  var c=cls(T[i]);
  if(!c||c.k==="half"){i++;continue}
  var s=i,total=0,cur=0;
  while(i<T.length){
   c=cls(T[i]);if(!c)break;
   if(c.k==="d")cur+=c.v;
   else if(c.k==="w")cur+=c.v;
   else if(c.k==="h")cur=(cur===0?1:(cur<10?cur:1))*100+(cur>=10?cur:0);
   else if(c.k==="m"){total+=(cur||1)*c.v;cur=0}
   else if(c.k==="half")cur+=0.5;
   i++}
  out.push({s:s,e:i,v:Math.round((total+cur)*100)/100})}
 return out}
var ALIAS={tovuq:L("tovuq tovuk tavuk kuritsa курица"),tandir:L("tandir tandur тандыр"),akarachka:L("akarachka akaracha akarochka akoracha окорочок окорочка"),golen:L("golen golyen golin голень"),file:L("file fayl fale fele fil филе"),qanot:L("qanot kanot qanat крылья крыло"),butaka:L("butaka butka butaga buta бутылка"),jigar:L("jigar jegar jigr печень")};
function findProd(T,prods){
 for(var i=0;i<T.length;i++)for(var p=0;p<prods.length;p++){
  var base=norm(prods[p].name).replace(/\s*\d+$/,"");var list=[base].concat(ALIAS[base]||[]);
  for(var k=0;k<list.length;k++)if(near(T[i],list[k]))return{idx:prods[p].idx,name:prods[p].name,pos:i}}
 return null}
function strip(T,rs,extra){var o=[];for(var i=0;i<T.length;i++){var skip=false;for(var r=0;r<rs.length;r++)if(i>=rs[r].s&&i<rs[r].e)skip=true;if(skip)continue;if(has([T[i]],K.fill)>=0||(extra&&has([T[i]],extra)>=0))continue;o.push(T[i])}return o}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function interpret(raw,prods){
 var S=norm(raw);if(!S)return null;
 var T=merge(S.split(" ")),R=runs(T),amt=R.length>0,H=function(l){return has(T,l)>=0};
 if(H(K.help))return{type:"help"};
 if(H(K.close)&&!amt)return{type:"close"};
 var pr=findProd(T,prods||[]);
 if(!pr&&H(K.pul)){
  if(amt){var ad=H(K.add),tk=H(K.take);
   if(tk&&!ad)return{type:"pul",op:"-",v:R[R.length-1].v};
   if(ad)return{type:"pul",op:"+",v:R[R.length-1].v};
   return{type:"err",msg:"Qo‘shishni yoki olishni ayting: «jami pulga 10 ming qo‘sh»"}}
  return{type:"pulopen"}}
 if(!pr&&H(K.xar)&&amt){var nm=strip(T,R,K.xar.concat(K.add,K.pul)).join(" ");return{type:"exp",name:nm?cap(nm):"Xarajat",v:R[R.length-1].v}}
 if(!pr&&H(K.qarz)&&amt){var qn=strip(T,R,K.qarz.concat(K.add)).join(" ").replace(/\b(berdim|oldim|berdi|oldi)\b/g,"").trim();if(!qn)return{type:"err",msg:"Qarz egasini ayting: «qarz Anvar 500 ming»"};return{type:"debt",name:cap(qn),v:R[R.length-1].v}}
 if(pr){
  var f=null;
  if(H(K.narx)||H(K.cost))f=(H(K.cost)||H(L("foyda")))&&!H(L("sotuv"))?"pf":"sell";
  if(!f&&H(K.open))f="open";
  if(!f&&H(K.uyga))f="home";
  if(!f&&H(K.kel))f="in";
  if(!f&&H(K.qol))f="left";
  if(!f&&H(K.sold))f="msold";
  if(!amt)return{type:"err",msg:pr.name+": qancha? Masalan «"+pr.name.toLowerCase()+" kelgan 200»"};
  if(!f)return{type:"err",msg:pr.name+": qaysi ustun? «kelgan», «uyga ketdi», «qolgan», «sotildi» yoki «narxi» deng"};
  return{type:"field",idx:pr.idx,name:pr.name,field:f,v:R[0].v,add:H(K.add)}}
 if(H(K.admin))return{type:"pg",k:"admin"};
 if(H(K.week))return{type:"pg",k:"week"};
 if(H(K.month))return{type:"pg",k:"month"};
 if(H(K.year))return{type:"pg",k:"year"};
 var tab=0,sheet="";
 if(H(K.place)){var o=has(T,K.ord);if(o>=0)tab=[1,2,3,4,5,6,7][K.ord.indexOf(K.ord.filter(function(w){return near(T[o],w)})[0])];else if(amt&&R[0].v>=1&&R[0].v<=7)tab=R[0].v}
 if(!tab){
  if(H(K.barcha)&&H(K.qarzd))tab=7;
  else if(H(K.qarzd)||H(K.qarz)){tab=4;if(H(K.royxat))sheet="debt"}
  else if(H(K.xar)){tab=3;if(H(K.royxat))sheet="exp"}
  else if(H(K.sot))tab=2;
  else if(H(K.foy))tab=5;
  else if(H(K.mah))tab=1;
  else if(H(K.jami)||H(K.hisob))tab=6}
 if(tab)return{type:"tab",n:tab,sheet:sheet};
 if(H(K.today))return{type:"today"};
 if(H(K.prev))return{type:"nav",n:-1};
 if(H(K.next))return{type:"nav",n:1};
 if(H(K.theme))return{type:"theme"};
 if(H(K.gal))return{type:"gal"};
 if(H(K.clr))return{type:"clr"};
 return null}
function answer(raw){var T=norm(raw).split(" ");if(has(T,K.no)>=0)return"no";if(has(T,K.yes)>=0)return"yes";return null}
return{norm:norm,interpret:interpret,answer:answer,runs:function(s){var T=merge(norm(s).split(" "));return runs(T)}}
})();

/* ===== Ovozli boshqaruv (mikrofon tugmasi) ===== */
(function(){
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function $(i){return document.getElementById(i)}
function money(n){return String(Math.round(n*100)/100).replace(/\B(?=(\d{3})+(?!\d))/g,".")}
var st=document.createElement("style");
st.textContent="#vcBtn{position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 78px);z-index:9998;width:58px;height:58px;border-radius:50%;border:0;background:#10a37f;color:#fff;font-size:26px;box-shadow:0 4px 16px rgba(0,0,0,.4)}"+
"#vcBtn.on{background:#e5484d;animation:vcp 1s ease infinite}@keyframes vcp{0%,100%{box-shadow:0 0 0 0 rgba(229,72,77,.7)}50%{box-shadow:0 0 0 16px rgba(229,72,77,0)}}"+
"#vcPan{position:fixed;left:10px;right:10px;max-width:460px;margin:0 auto;bottom:calc(env(safe-area-inset-bottom,0px) + 146px);z-index:9998;background:#fff;color:#111;border-radius:18px;padding:12px 14px;box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:system-ui,sans-serif;display:none;max-height:55vh;overflow:auto}"+
"#vcPan.on{display:block}#vcPan .vh{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}"+
"#vcPan .vh button{border:0;border-radius:10px;background:#eef2f1;color:#222;padding:6px 10px;font:600 13px system-ui;margin-left:6px}"+
"#vcTx{font-size:15px;color:#445;min-height:20px}#vcRs{margin-top:6px;font-size:15px;font-weight:600;line-height:1.45}#vcRs.ok{color:#0a8f6a}#vcRs.bad{color:#d33a3f}"+
"#vcRs .hl{font-weight:400;font-size:13px;color:#333}#vcRs .hl b{display:block;margin-top:6px;color:#0a8f6a}"+
"#vcCf{display:flex;gap:8px;margin-top:8px}#vcCf button{flex:1;border:0;border-radius:12px;padding:12px;font:700 16px system-ui;color:#fff}";
document.head.appendChild(st);
var btn=document.createElement("button");btn.id="vcBtn";btn.type="button";btn.setAttribute("aria-label","Ovozli boshqaruv");btn.textContent="🎤";
var pan=document.createElement("div");pan.id="vcPan";
pan.innerHTML='<div class="vh"><b>🎤 Ovozli boshqaruv</b><span><button type="button" id="vcLang"></button><button type="button" id="vcHelp">?</button><button type="button" id="vcClose">×</button></span></div><div id="vcTx"></div><div id="vcRs"></div><div id="vcCf"></div>';
document.body.appendChild(pan);document.body.appendChild(btn);
var lang="uz-UZ";try{lang=localStorage.getItem("vc_lang")||"uz-UZ"}catch(e){}
function langLabel(){$("vcLang").textContent=lang==="uz-UZ"?"UZ":"RU"}
langLabel();
var rec=null,listening=false,pending=null;
function say(msg,cls){var r=$("vcRs");r.className=cls||"";r.textContent=msg}
function tx(t){$("vcTx").textContent=t||""}
function clearCf(){pending=null;$("vcCf").innerHTML=""}
function click(sel){var e=document.querySelector(sel);if(e){e.click();return true}return false}
function tab(n){return click('#stabs button[data-i="'+n+'"]')}
function prods(){var o=[];document.querySelectorAll("#t2 .tr").forEach(function(r){var nm=r.querySelector(".nm");if(nm)o.push({idx:+r.dataset.p,name:nm.textContent.replace(/^\d+/,"").trim()})});return o}
var LAB={open:"Kecha astatka",in:"Bugun kelgan",home:"Uyga ketdi",left:"Bugun qolgan",msold:"Sotildi (kg)",sell:"Narxi (1 kg)",pf:"Foyda narxi"};
var SEC={open:1,in:1,home:1,left:1,msold:2,sell:2,pf:5};
function runField(a){
  var sec=SEC[a.field],el=document.querySelector("#t"+sec+' .tr[data-p="'+a.idx+'"] input[data-f="'+a.field+'"]');
  if(!el){say(a.name+": bu ustunda yo‘q","bad");return}
  tab(sec);
  var mon=a.field==="sell"||a.field==="pf",old=0;
  if(mon)old=parseInt(el.value.replace(/\D/g,"")||"0",10);
  else old=el.value.split("+").reduce(function(s,p){var x=parseFloat(p.replace(",","."));return s+(isFinite(x)?x:0)},0);
  var nv=a.add?Math.round((old+a.v)*100)/100:a.v;
  el.value=String(nv);el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));
  say("✓ "+a.name+" · "+LAB[a.field]+" = "+(mon?money(nv):nv)+(a.add?" (qo‘shildi: +"+(mon?money(a.v):a.v)+")":""),"ok");
}
function closeAll(){
  click('[data-act="pgx"]');click('[data-act="close"]');
  var b=$("pulBox"),c=$("pulAct");if(b)b.classList.remove("on");if(c)c.classList.remove("on");
}
function exec(a){
  switch(a.type){
  case "field":runField(a);break;
  case "tab":
    if(!tab(a.n)){say("Sahifa topilmadi","bad");break}
    if(a.sheet==="debt")click('[data-act="listDebt"]');
    if(a.sheet==="exp")click('[data-act="listExp"]');
    say("✓ "+a.n+"-qator ochildi"+(a.sheet?" (ro‘yxat)":""),"ok");break;
  case "pg":click('[data-act="pg"][data-k="'+a.k+'"]');say("✓ "+({admin:"Admin panel",week:"1 haftalik",month:"1 oylik",year:"1 yillik"})[a.k]+" ochildi","ok");break;
  case "nav":click('[data-act="nav"][data-n="'+a.n+'"]');say(a.n<0?"✓ Oldingi kun":"✓ Keyingi kun","ok");break;
  case "today":var d=new Date(),m=d.getMonth()+1,k=d.getDate(),dt=$("dt");dt.value=d.getFullYear()+"-"+(m<10?"0":"")+m+"-"+(k<10?"0":"")+k;dt.dispatchEvent(new Event("change",{bubbles:true}));say("✓ Bugungi kun","ok");break;
  case "theme":click('[data-act="themeT"]');say("✓ Rang almashtirildi","ok");break;
  case "gal":click('[data-act="gal"]');say("✓ Galereyaga saqlanmoqda","ok");break;
  case "close":closeAll();say("✓ Yopildi","ok");break;
  case "pulopen":if(window.__pul)window.__pul.open();say("✓ Jami pullar ochildi","ok");break;
  case "help":help();break;
  case "err":say(a.msg,"bad");break;
  case "pul":
  case "exp":
  case "debt":
  case "clr":ask(a);break;
  }
}
function ask(a){
  var q;
  if(a.type==="pul")q=(a.op==="+"?"Jami pulga "+money(a.v)+" so‘m QO‘SHILSINMI?":"Jami puldan "+money(a.v)+" so‘m OLINSINMI?");
  else if(a.type==="exp")q="Xarajat: "+a.name+" — "+money(a.v)+" so‘m yozilsinmi?";
  else if(a.type==="debt")q="Qarz: "+a.name+" — "+money(a.v)+" so‘m yozilsinmi?";
  else q="Shu kundagi hamma ma’lumot TOZALANSINMI?";
  pending=a;say(q,"");
  var cf=$("vcCf");cf.innerHTML='<button type="button" id="vcYes" style="background:#10a37f">Ha</button><button type="button" id="vcNo" style="background:#e5484d">Yo‘q</button>';
  $("vcYes").onclick=function(){doPending()};$("vcNo").onclick=function(){clearCf();say("Bekor qilindi","bad")};
}
function doPending(){
  var a=pending;clearCf();if(!a)return;
  if(a.type==="pul"){
    if(!window.__pul){say("Jami pullar oynasi topilmadi","bad");return}
    if(a.op==="+"){var t=window.__pul.add(a.v);window.__pul.open();say("✓ Qo‘shildi: +"+money(a.v)+" so‘m. Jami: "+money(t)+" so‘m","ok")}
    else{var r=window.__pul.take(a.v);if(r<0){say("Yetarli pul yo‘q. Bor: "+money(window.__pul.bal())+" so‘m","bad")}else{window.__pul.open();say("✓ Olindi: −"+money(a.v)+" so‘m. Qoldi: "+money(r)+" so‘m","ok")}}
  }else if(a.type==="exp"){
    tab(3);$("en").value=a.name;$("ea").value=String(a.v);click('[data-act="addExp"]');say("✓ Xarajat yozildi: "+a.name+" — "+money(a.v)+" so‘m","ok")
  }else if(a.type==="debt"){
    tab(4);$("qn").value=a.name;$("qa").value=String(a.v);click('[data-act="addDebt"]');say("✓ Qarz yozildi: "+a.name+" — "+money(a.v)+" so‘m","ok")
  }else if(a.type==="clr"){
    var b=document.querySelector('[data-act="clr"]');if(b){b.click();b.click()}say("✓ Tozalandi","ok")
  }
}
function help(){
  var r=$("vcRs");r.className="";
  r.innerHTML='<div class="hl"><b>Sahifalar</b>«mahsulotlar», «sotuv», «xarajatlar», «qarzdorlar», «foyda hisobi», «jami hisob», «barcha qarzdorlar», «4 qator», «to‘rtinchi qator», «qarzdorlar ro‘yxatini och»'+
  '<b>Kunlar va hisobotlar</b>«kecha», «ertaga», «bugun», «admin panel», «1 haftalik», «1 oylik», «1 yillik», «yop»'+
  '<b>Mahsulot yozish</b>«tovuq kelgan 200», «tovuq kelganiga 300 qo‘sh», «tandir uyga ketdi 12», «file qolgan 5», «golen sotildi 23», «tovuq narxi 35 ming», «jigar kecha qoldiq 5»'+
  '<b>Pul (tasdiqlanadi)</b>«jami pullar», «jami pulga 10 ming qo‘sh», «puldan 5 ming ol»'+
  '<b>Xarajat va qarz (tasdiqlanadi)</b>«xarajat non 50 ming», «qarz Anvar 500 ming»'+
  '<b>Boshqa</b>«qora rejim», «galereyaga saqla», «tozalash», «yordam»</div>'
}
function handle(alts){
  if(pending){for(var i=0;i<alts.length;i++){var an=VCP.answer(alts[i]);if(an==="yes"){doPending();return}if(an==="no"){clearCf();say("Bekor qilindi","bad");return}}clearCf()}
  var best=null,errA=null,P=prods();
  for(var j=0;j<alts.length;j++){var a=VCP.interpret(alts[j],P);if(!a)continue;if(a.type==="err"){if(!errA)errA=a;continue}best=a;break}
  if(best)exec(best);else if(errA)exec(errA);else say("Tushunmadim. «Yordam» deb ayting yoki ? tugmasini bosing.","bad");
}
function stop(){try{if(rec)rec.stop()}catch(e){}listening=false;btn.classList.remove("on")}
function start(){
  pan.classList.add("on");
  if(!SR){say("Bu brauzerda ovoz aniqlash yo‘q. Android’da Chrome, iPhone’da Safari’da oching (bosh ekrandagi ilovada ishlamasligi mumkin).","bad");return}
  if(listening){stop();return}
  try{rec=new SR()}catch(e){say("Mikrofonni ishga tushirib bo‘lmadi","bad");return}
  rec.lang=lang;rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=3;
  var got=false;
  rec.onstart=function(){listening=true;btn.classList.add("on");tx("");say(pending?"Eshityapman… «ha» yoki «yo‘q» deng":"Eshityapman… gapiring","")};
  rec.onresult=function(e){
    var r=e.results[e.results.length-1];tx("«"+r[0].transcript+"»");
    if(r.isFinal){got=true;var alts=[];for(var k=0;k<r.length;k++)alts.push(r[k].transcript);handle(alts)}
  };
  rec.onerror=function(e){
    var m={"not-allowed":"Mikrofonga ruxsat bering (brauzer sozlamalari).","service-not-allowed":"Mikrofonga ruxsat bering.","no-speech":"Ovoz eshitilmadi. Qayta urinib ko‘ring.","language-not-supported":"Bu til qo‘llab-quvvatlanmaydi. UZ/RU tugmasini almashtiring.","audio-capture":"Mikrofon topilmadi.","network":"Internet kerak (ovoz aniqlash internet orqali ishlaydi)."};
    got=true;say(m[e.error]||("Xato: "+e.error),"bad")
  };
  rec.onend=function(){listening=false;btn.classList.remove("on");if(!got&&!$("vcRs").textContent.indexOf("Eshityapman"))say("Ovoz eshitilmadi. Qayta bosing.","bad")};
  try{rec.start()}catch(e){say("Mikrofonni ishga tushirib bo‘lmadi","bad")}
}
btn.addEventListener("click",start);
$("vcClose").addEventListener("click",function(){stop();clearCf();pan.classList.remove("on")});
$("vcHelp").addEventListener("click",help);
$("vcLang").addEventListener("click",function(){lang=lang==="uz-UZ"?"ru-RU":"uz-UZ";try{localStorage.setItem("vc_lang",lang)}catch(e){}langLabel();say("Til: "+(lang==="uz-UZ"?"O‘zbekcha":"Ruscha"),"ok")});
})();
