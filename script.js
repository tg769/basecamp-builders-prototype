// gear and date data (all made up, like in the paper prototype tests)
const NOW_REPLY = 'Thu, Nov 19 at 12:00 PM';
const PHONE = '(928) 555-0142';

const ITEMS = {
  tent2:{name:'2-person tent', sub:'Fits 2 people', price:12, bg:'#e3efe6',
    desc:'A 3-season tent that fits 2 people with their bags.',
    facts:['Packs down to about 7 x 20 in','Weighs about 5 lb','Good for spring and fall, not heavy snow','Checked Oct 12: poles and stakes all there']},
  tent4:{name:'4-person tent', sub:'Fits 4 people', price:20, bg:'#e3efe6',
    desc:'A roomy 3-season tent for up to 4 people.',
    facts:['Packs down to about 8 x 24 in','Weighs about 9 lb','Good for spring and fall, not heavy snow','Checked Oct 12: poles and stakes all there']},
  bag:{name:'Sleeping bag', sub:'Good down to 20 F', price:8, bg:'#f6e8cd',
    desc:'A warm bag for cold fall and winter nights.',
    facts:['Comfortable down to 20 F','Weighs about 3 lb','Stuff sack included']},
  pad:{name:'Sleeping pad', sub:'Insulated, 1 person', price:5, bg:'#dfe9ef',
    desc:'An insulated pad. The ground gets cold in the fall.',
    facts:['Rolls up to about 6 x 20 in','Weighs about 1 lb']},
  stove:{name:'Camp stove', sub:'Single burner', price:5, bg:'#f2e0d8',
    desc:'A single burner stove for quick meals.',
    facts:['Weighs about 1 lb','Ask at the desk about fuel']}
};
const ORDER = ['tent2','tent4','bag','pad','stove'];

const RANGES = {
  a:{label:'Sat, Nov 21 to Mon, Nov 23', short:'Nov 21 to 23', nights:2, fri:'Fri, Nov 20', sat:'Sat, Nov 21',
     stock:{tent2:3,tent4:1,bag:12,pad:8,stove:0}, back:{stove:'Tue, Nov 24'}},
  b:{label:'Sat, Dec 5 to Sun, Dec 6', short:'Dec 5 to 6', nights:1, fri:'Fri, Dec 4', sat:'Sat, Dec 5',
     stock:{tent2:0,tent4:2,bag:6,pad:4,stove:2}, back:{tent2:'Mon, Dec 7'}},
  c:{label:'Sat, Dec 12 to Mon, Dec 14', short:'Dec 12 to 14', nights:2, fri:'Fri, Dec 11', sat:'Sat, Dec 12',
     stock:{tent2:4,tent4:3,bag:10,pad:9,stove:2}, back:{}}
};
// the hold ends 1 hour after the pickup time, and the reminder goes out 1 hour before it
function makePickup(day, time, endTime, remindTime){
  return {label: day + ' at ' + time, end: day + ' at ' + endTime, rem: remindTime + ' on ' + day};
}
for (const key in RANGES) {
  const r = RANGES[key];
  r.hours = 'Fri 10 AM to 6 PM, Sat 9 AM to 1 PM';
  r.pickups = [
    makePickup(r.fri, '12:00 PM', '1:00 PM', '11:00 AM'),
    makePickup(r.fri, '3:30 PM', '4:30 PM', '2:30 PM'),
    makePickup(r.fri, '5:00 PM', '6:00 PM', '4:00 PM'),
    makePickup(r.sat, '9:00 AM', '10:00 AM', '8:00 AM')
  ];
}

// keeps track of what screen we are on and what the user picked
const S = {route:'home', range:'a', item:null, qty:1, pickup:1, holds:[], requests:[], sheet:null,
           plan:{where:'Mormon Lake', people:2, exp:'first'}, removed:{}, mode:'hold', lastId:null, uid:1};
let lastRoute = null;

// svg icons and gear pictures
const P = {
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.5"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  chevR:'<path d="M9 5l7 7-7 7"/>', chevL:'<path d="M15 5l-7 7 7 7"/>',
  cal:'<rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
  tent:'<path d="M3 19L12 5l9 14z"/><path d="M12 5v14"/>',
  bagn:'<rect x="5" y="4.5" width="14" height="16" rx="3.5"/><path d="M9 4.5V3h6v1.5M9 12h6"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.6a2.6 2.6 0 015.1.5c0 1.8-2.6 2.1-2.6 3.8M12 17.3v.4"/>',
  phone:'<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 006 6l1.5-2 4 1.5v3a2 2 0 01-2 2A16 16 0 014 5.5a2 2 0 012.5-2z"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="M15.7 8.3l-2.1 5.3-5.3 2.1 2.1-5.3z"/>',
  minus:'<path d="M5 12h14"/>', plus:'<path d="M12 5v14M5 12h14"/>',
  pin:'<path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  bell:'<path d="M6 16v-5a6 6 0 0112 0v5l1.5 2h-15zM10 20.5a2 2 0 004 0"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.5"/>'
};
const ic = (n,s=20,sw=2)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;

const ART = {
  tent2:'<path d="M6 51L32 13l26 38z" fill="#fff"/><path d="M32 13v38"/><path d="M32 31l9 20H32z" fill="#bcd8c5"/><path d="M3 51h58"/>',
  tent4:'<path d="M6 51C6 28 20 15 32 15s26 13 26 36z" fill="#fff"/><path d="M22 51c0-11 4-18 10-18s10 7 10 18" fill="#bcd8c5"/><path d="M32 15v18"/><path d="M3 51h58"/>',
  bag:'<g transform="rotate(20 32 32)"><rect x="20" y="5" width="24" height="54" rx="12" fill="#fff"/><circle cx="32" cy="17" r="6" fill="#f3d9a8"/><path d="M32 26v28" stroke-dasharray="2 4"/></g>',
  pad:'<rect x="8" y="23" width="40" height="20" rx="4" fill="#fff"/><path d="M18 23v20M28 23v20M38 23v20"/><circle cx="47" cy="33" r="11" fill="#fff"/><circle cx="47" cy="33" r="4.5" fill="#cfdfe9"/>',
  stove:'<rect x="17" y="13" width="30" height="17" rx="3.5" fill="#f3dccf"/><path d="M24 13v-3h16v3"/><path d="M32 33c-3-2.5 0-4.5-1-7.5 3 1 6 3.5 5 7.5"/><rect x="11" y="40" width="42" height="8" rx="3" fill="#fff"/><path d="M19 48l-3 8M45 48l3 8"/>'
};
const art = id=>`<svg viewBox="0 0 64 64" fill="none" stroke="#1e5b3a" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${ART[id]}</svg>`;

const CONTOUR = `<svg class="contour" viewBox="0 0 300 220" fill="none" stroke="#6fae86" stroke-width="1.2" aria-hidden="true">
<path d="M10 150C50 110 90 140 130 100S210 60 300 90"/><path d="M0 175C50 135 95 165 135 125S215 85 300 115"/>
<path d="M20 125C60 85 100 115 140 75S215 35 300 65"/><path d="M40 100C80 60 115 90 150 50S225 15 300 40"/>
<path d="M0 200C55 160 100 190 140 150S220 110 300 140"/></svg>`;

// small helper functions
const R = ()=>RANGES[S.range];
// how many of an item are already held for a date range
function heldQty(rangeId, itemId){
  let n = 0;
  for (const h of S.holds) {
    if (h.range !== rangeId) continue;
    for (const l of h.lines) {
      if (l.id === itemId) n += l.qty;
    }
  }
  return n;
}
// how many are left to hold
function stock(id, rangeId = S.range){
  return Math.max(0, RANGES[rangeId].stock[id] - heldQty(rangeId, id));
}
const money = n=>'$'+n;
const lineText = l=>`${l.qty} x ${ITEMS[l.id].name}`;
function total(lines){
  let t = 0;
  for (const l of lines) t += ITEMS[l.id].price * l.qty;
  return t;
}
const plural = (n,w)=>n+' '+w+(n===1?'':'s');

function chip(id){
  const n=stock(id);
  if(n===0) return `<span class="chip out">${ic('x',14,2.6)} Out for ${R().short}</span>`;
  if(n===1) return `<span class="chip warn">${ic('alert',14,2.4)} Last one</span>`;
  return `<span class="chip ok">${ic('check',14,2.8)} ${n} left</span>`;
}
function pickupSelect(attr,idx){
  return `<select class="sel" ${attr} aria-label="Pickup time">${R().pickups.map((p,i)=>`<option value="${i}" ${i===idx?'selected':''}>${p.label}</option>`).join('')}</select>`;
}
function nav(tab){
  const n=S.holds.length+S.requests.length;
  const b=(t,i,l,r)=>`<button data-a="go" data-r="${r}" class="${tab===t?'on':''}" ${tab===t?'aria-current="page"':''}>${ic(i,22)}${l}${t==='mygear'&&n?`<span class="dot">${n}</span>`:''}</button>`;
  return `<nav class="nav" aria-label="Main">${b('home','tent','Browse','home')}${b('mygear','bagn','My gear','mygear')}${b('help','help','Help','help')}</nav>`;
}
const topbar = (title,back)=>`<header class="top ${back?'':'noback'}">${back?`<button class="iconbtn" data-a="go" data-r="${back}" aria-label="Back">${ic('chevL',24)}</button>`:''}<h1>${title}</h1></header>`;

// each function below builds one screen
function home(){
  const mine = S.holds.length+S.requests.length;
  let banner='';
  if(mine){
    const h=S.holds[0], q=S.requests[0];
    const line = h ? `${h.lines.map(lineText).join(', ')}, held until ${RANGES[h.range].pickups[h.pickup].end}`
                   : `Request waiting for staff. Reply by ${NOW_REPLY}`;
    banner = `<button class="mine" data-a="go" data-r="mygear"><span class="badge">${ic('check',20,2.6)}</span><span><b>${mine===1?'You have 1 booking':'You have '+mine+' bookings'}</b><span class="s">${line}</span></span><span style="margin-left:auto;color:var(--green)">${ic('chevR')}</span></button>`;
  }
  return `<div class="scroll">
    <div class="hero">${CONTOUR}<span class="user">Signed in with NAU login</span>
      <div class="eyebrow" style="margin-top:22px">NAU Outdoor Adventures</div><h1>Gear Rental</h1>
      <span class="pill">${ic('clock',16)} Open today until 6 PM</span></div>
    <button class="datecard" data-a="dates"><div class="l">Trip dates</div>
      <div class="v"><span>${R().label}</span><span class="c">${ic('cal',20)} Change</span></div>
      <div class="h">Pickup hours: ${R().hours}</div></button>
    ${banner}
    <button class="plan" data-a="go" data-r="plan"><span class="badge">${ic('compass',26,1.8)}</span>
      <span><b>Plan my trip</b><span class="s">Answer 4 questions and we suggest the gear</span></span><span class="go">${ic('chevR')}</span></button>
    <div class="sec"><h2>Available for ${R().short}</h2><span>Counts update live</span></div>
    ${ORDER.map(gearCard).join('')}
    <div style="height:14px"></div>
  </div>${nav('home')}`;
}
function gearCard(id){
  const it=ITEMS[id], out=stock(id)===0, back=R().back[id];
  return `<div class="gear ${out?'is-out':''}" ${out?'':`role="button" tabindex="0" data-a="item" data-id="${id}" aria-label="${it.name}, open details"`}>
    <div class="tile" style="background:${it.bg}">${art(id)}</div>
    <div class="g-body"><div class="g-name">${it.name}</div><div class="g-sub">${it.sub} · ${money(it.price)} per weekend</div>
      <div class="g-row">${chip(id)}</div>
      ${out?`<div class="g-back">${back?`Back ${back}. `:''}<button class="link" data-a="dates">See other dates</button></div>`:''}</div>
    ${out?'':ic('chevR')}</div>`;
}

function item(){
  const id=S.item, it=ITEMS[id], left=stock(id), r=R(), pk=r.pickups[S.pickup];
  const q=Math.min(S.qty,left);
  return `${topbar('Item details','home')}
  <div class="scroll"><div class="itemhero" style="background:${it.bg}">${art(id)}</div>
  <div class="pad">
    <div class="titlerow"><h2>${it.name}</h2>${chip(id)}</div>
    <p class="desc">${it.desc}</p>
    <ul class="facts">${it.facts.map(f=>`<li>${ic('check',16,2.6)}<span>${f}</span></li>`).join('')}</ul>
    <div class="block"><div class="row"><div><div class="lbl">How many?</div><div class="hint">${left} available for ${r.short}</div></div>
      <div class="stepper"><button data-a="qty" data-d="-1" aria-label="One fewer" ${q<=1?'disabled':''}>${ic('minus')}</button><b aria-live="polite">${q}</b><button data-a="qty" data-d="1" aria-label="One more" ${q>=left?'disabled':''}>${ic('plus')}</button></div></div></div>
    <div class="block"><div class="lbl">Pickup time</div>${pickupSelect('data-sel="pk"',S.pickup)}
      <div class="hint" style="margin-top:8px">HLC desk. Hours for your dates: ${r.hours}.</div></div>
    <div class="block sum"><div class="r"><span>Trip dates</span><span>${r.label}</span></div>
      <div class="r"><span>${q} x ${money(it.price)} per weekend</span><span>${money(it.price*q)}</span></div>
      <div class="r t"><span>Total, pay at pickup</span><span>${money(it.price*q)}</span></div>
      <div class="hint" style="margin-top:6px">No card needed now.</div></div>
  </div></div>
  <div class="actions"><div class="holdnote">${ic('clock',18)}<span>Free hold until <b>${pk.end}</b>. That is 1 hour after your pickup time.</span></div>
    <button class="btn primary" data-a="hold">Hold it, free</button></div>`;
}

function heldDetails(h,showCancel){
  const r=RANGES[h.range], pk=r.pickups[h.pickup];
  return `<div class="block" style="margin-top:14px">
    <div class="kv"><div class="k">Items</div><div class="v">${h.lines.map(lineText).join('<br>')}</div></div>
    <div class="kv"><div class="k">Trip dates</div><div class="v">${r.label}</div></div>
    <div class="kv"><div class="k">Pickup time</div><div class="v" style="font-weight:400">${showCancel?pickupSelect(`data-sel="pkheld" data-id="${h.id}"`,h.pickup):`<b>${pk.label}</b>`}</div></div>
    <div class="kv"><div class="k">Where</div><div class="v">HLC desk<small>Hours: ${r.hours}</small></div></div>
    <div class="kv"><div class="k">Pay at pickup</div><div class="v">${money(total(h.lines))}<small>No card needed</small></div></div>
    <div class="kv"><div class="k">Reminder</div><div class="v">${ic('bell',15)} We will text you at ${pk.rem}</div></div>
    ${showCancel?`<div style="padding-top:12px"><button class="btn danger slim" data-a="askcancel" data-kind="hold" data-id="${h.id}">Cancel hold</button>
      <div class="hint center" style="margin-top:6px">Free to cancel until ${pk.end}</div></div>`:''}
  </div>`;
}
function held(){
  const h=S.holds.find(x=>x.id===S.lastId); if(!h){S.route='home';return home();}
  const pk=RANGES[h.range].pickups[h.pickup];
  return `${topbar('Hold confirmed')}
  <div class="scroll"><div class="pad"><div class="okmark">${ic('check',38,2.8)}</div>
    <h2 class="center" style="margin:0;font-size:22px">Your gear is held</h2>
    <div class="until"><small>Held until</small><b>${pk.end}</b><span>That is 1 hour after your pickup time, so being a few minutes late will not lose your gear.</span></div>
    ${heldDetails(h,true)}</div></div>
  <div class="actions"><button class="btn primary" data-a="go" data-r="home">Done</button></div>`;
}

function mygear(){
  const cards = S.holds.map(h=>{
    const r=RANGES[h.range], pk=r.pickups[h.pickup];
    return `<div class="hcard"><span class="chip ok">${ic('check',14,2.8)} Held</span>
      <h3>${h.lines.map(lineText).join(', ')}</h3><div class="small">${r.label}</div>
      <div class="kv" style="margin-top:8px"><div class="k">Held until</div><div class="v">${pk.end}</div></div>
      <div class="kv"><div class="k">Pickup</div><div class="v">${pk.label}<small>HLC desk</small></div></div>
      <div class="kv"><div class="k">Pay at pickup</div><div class="v">${money(total(h.lines))}</div></div>
      <div class="stack" style="margin-top:10px"><button class="btn danger slim" data-a="askcancel" data-kind="hold" data-id="${h.id}">Cancel hold</button></div></div>`;
  }).concat(S.requests.map(q=>{
    const r=RANGES[q.range], pk=r.pickups[q.pickup];
    return `<div class="hcard"><span class="chip wait">${ic('clock',14,2.4)} Waiting for staff</span>
      <h3>${q.lines.map(lineText).join(', ')}</h3><div class="small">${r.label}</div>
      <div class="kv" style="margin-top:8px"><div class="k">Reply by</div><div class="v">${NOW_REPLY}<small>We will text you when it changes</small></div></div>
      <div class="kv"><div class="k">Pickup</div><div class="v">${pk.label}<small>HLC desk</small></div></div>
      <div class="kv"><div class="k">Estimated</div><div class="v">${money(total(q.lines))}<small>Pay at pickup</small></div></div>
      <div class="stack" style="margin-top:10px"><button class="btn secondary slim" data-a="go" data-r="help">Contact the desk</button>
      <button class="btn danger slim" data-a="askcancel" data-kind="req" data-id="${q.id}">Cancel request</button></div></div>`;
  }));
  return `${topbar('My gear')}
  <div class="scroll"><div class="pad">${cards.length?cards.join(''):
    `<div class="empty"><div class="okmark">${ic('bagn',34,1.8)}</div><b style="color:var(--ink);font-size:17px">Nothing held yet</b>
      <p style="margin:6px 0 18px">When you hold gear or send a request, it shows up here.</p>
      <button class="btn primary" style="max-width:240px;margin:0 auto" data-a="go" data-r="home">Browse gear</button></div>`}</div></div>${nav('mygear')}`;
}

function help(){
  return `${topbar('Help')}
  <div class="scroll"><div class="pad">
    <div class="block" style="margin-top:0"><div class="lbl" style="display:flex;gap:8px;align-items:center">${ic('pin',18)} Pickup and return</div>
      <p class="hint" style="font-size:14px;margin:6px 0 0">HLC desk. Weekend hours always show at the top of the home screen.</p></div>
    <div class="block"><div class="lbl" style="display:flex;gap:8px;align-items:center">${ic('clock',18)} Desk hours</div>
      <div class="kv"><div class="k">Fri</div><div class="v">10 AM to 6 PM</div></div>
      <div class="kv"><div class="k">Sat</div><div class="v">9 AM to 1 PM</div></div></div>
    <div class="block"><div class="lbl" style="display:flex;gap:8px;align-items:center">${ic('info',18)} How holds work</div>
      <p class="hint" style="font-size:14px;margin:6px 0 0">A hold is free. We keep your gear until 1 hour after your pickup time, and you pay at pickup. You can cancel for free until the hold ends.</p></div>
    <div class="block"><div class="lbl">Talk to a person</div>
      <p class="hint" style="font-size:14px;margin:6px 0 12px">Questions about gear or your booking? Call the desk during open hours.</p>
      <a class="btn primary" style="text-decoration:none" href="tel:9285550142">${ic('phone',20)} Call ${PHONE}</a></div>
  </div></div>${nav('help')}`;
}

function plan(){
  const p=S.plan;
  return `${topbar('Plan my trip','home')}
  <div class="scroll"><div class="pad">
    <p style="margin:0 0 4px;color:var(--muted);font-size:14.5px">Tell us about your trip and we will suggest what to bring. You can remove anything you do not need.</p>
    <div class="block"><label class="lbl" for="where">Where are you going?</label><input class="field" id="where" value="${p.where}" autocomplete="off"></div>
    <div class="block"><div class="lbl">When?</div>
      <button class="opt" style="margin:8px 0 0" data-a="dates"><span style="color:var(--green)">${ic('cal',22)}</span><span style="flex:1"><b>${R().label}</b><span class="s">${plural(R().nights,'night')}, tap to change</span></span><span style="color:var(--green)">${ic('chevR')}</span></button></div>
    <div class="block"><div class="row"><div class="lbl">How many people?</div>
      <div class="stepper"><button data-a="people" data-d="-1" aria-label="One fewer person" ${p.people<=1?'disabled':''}>${ic('minus')}</button><b>${p.people}</b><button data-a="people" data-d="1" aria-label="One more person" ${p.people>=8?'disabled':''}>${ic('plus')}</button></div></div></div>
    <div class="block"><div class="lbl">Camping experience</div>
      <div class="seg" role="radiogroup" aria-label="Camping experience">${[['first','First time'],['few','A few trips'],['lots','Lots']].map(([k,l])=>`<button role="radio" aria-checked="${p.exp===k}" class="${p.exp===k?'on':''}" data-a="exp" data-k="${k}">${l}</button>`).join('')}</div></div>
  </div></div>
  <div class="actions stack"><button class="btn primary" data-a="suggest">Show me gear</button>
    <button class="btn secondary slim" data-a="go" data-r="home">Skip and see all gear</button></div>`;
}

function suggestion(){
  const p=S.plan.people, r=S.range; const lines=[]; let note=null;
  let tent = p<=2?'tent2':'tent4';
  if(p<=2 && stock('tent2')===0){tent='tent4'; note='The 2-person tent is out for these dates, so we picked the next size up.';}
  lines.push({id:tent, qty:p>=5?Math.ceil(p/4):1, note});
  lines.push({id:'bag', qty:p}); lines.push({id:'pad', qty:p});
  return lines;
}
const keep = lines=>lines.filter(l=>!S.removed[l.id]);
function canInstant(lines){ return S.plan.people<=4 && lines.every(l=>l.qty<=stock(l.id)); }

function suggest(){
  const all=suggestion(), lines=keep(all), r=R(), pk=r.pickups[S.pickup], inst=canInstant(all);
  const mode=S.mode;
  let why='';
  if(mode==='request'){
    why = S.plan.people>=5 ? 'Bigger groups are confirmed by staff, so we can make sure there is enough gear.'
        : !inst ? 'We do not have enough of everything for these dates, so staff will confirm what they can swap in.'
        : 'You asked staff to confirm this one.';
  }
  const cards = all.map(l=>{
    const it=ITEMS[l.id], off=!!S.removed[l.id];
    return `<div class="sline ${off?'off':''}"><div class="tile" style="background:${it.bg}">${art(l.id)}</div>
      <div class="g-body"><div class="g-name">${l.qty>1?l.qty+' x ':''}${it.name}</div>
      <div class="g-sub">${l.qty} x ${money(it.price)} = ${money(it.price*l.qty)}</div>
      ${l.note&&!off?`<div class="note">${l.note}</div>`:''}</div>
      ${off?`<button class="rm add" data-a="addback" data-id="${l.id}" aria-label="Add ${it.name} back">${ic('plus',16,2.6)} Add back</button>`
           :`<button class="rm" data-a="remove" data-id="${l.id}" aria-label="Remove ${it.name}">${ic('x',16,2.6)} Remove</button>`}</div>`;
  }).join('');
  const t=total(lines);
  return `${topbar('Suggested gear','plan')}
  <div class="scroll"><div class="pad">
    <div class="chips"><span>${S.plan.where||'Your trip'}</span><span>${S.plan.people===1?'1 person':S.plan.people+' people'}</span><span>${plural(r.nights,'night')}</span><span>${r.short}</span></div>
    ${mode==='request'?`<div class="banner">${ic('info',18)}<span>${why}</span></div>`:''}
    <p style="margin:0 0 10px;color:var(--muted);font-size:14px">Cold nights, so we picked warm bags and pads. Remove anything you already have.</p>
    ${cards}
    <div class="block sum">${lines.map(l=>`<div class="r"><span>${lineText(l)}</span><span>${money(ITEMS[l.id].price*l.qty)}</span></div>`).join('')||'<div class="hint">Nothing selected.</div>'}
      <div class="r t"><span>${mode==='request'?'Estimated total':'Total'}</span><span>${money(t)}</span></div>
      <div class="hint" style="margin-top:6px">${mode==='request'?'Staff may swap an item for a similar one. You see the final price before pickup. Pay at pickup, no card now.':'Pay at pickup, no card now.'}</div></div>
    <div class="block"><div class="lbl">Pickup time</div>${pickupSelect('data-sel="pk"',S.pickup)}
      <div class="hint" style="margin-top:8px">HLC desk. Hours: ${r.hours}.</div></div>
  </div></div>
  <div class="actions stack">
    ${mode==='hold'?`<div class="holdnote" style="margin-bottom:0">${ic('clock',18)}<span>Free hold until <b>${pk.end}</b>, 1 hour after your pickup time.</span></div>
      <button class="btn primary" data-a="holdplan" ${lines.length?'':'disabled'}>Hold it, free</button>
      ${S.plan.people<=4&&inst?`<button class="link center" data-a="mode" data-m="request" style="font-size:14px;text-decoration:none">Ask staff to confirm instead</button>`:''}`
    :`<div class="holdnote" style="margin-bottom:0">${ic('clock',18)}<span>Staff usually reply by <b>${NOW_REPLY}</b>.</span></div>
      <button class="btn primary" data-a="sendreq" ${lines.length?'':'disabled'}>Send request to staff</button>
      ${inst?`<button class="link center" data-a="mode" data-m="hold" style="font-size:14px;text-decoration:none">Hold it now instead</button>`:''}`}
  </div>`;
}

function sent(){
  const q=S.requests.find(x=>x.id===S.lastId); if(!q){S.route='home';return home();}
  const r=RANGES[q.range], pk=r.pickups[q.pickup];
  return `${topbar('Request sent')}
  <div class="scroll"><div class="pad">
    <div class="block" style="margin-top:0"><div class="track">
      <div class="step done"><span class="b">${ic('check',16,3)}</span><div><b class="t">Sent</b><span class="s">We got your request</span></div></div>
      <div class="step now"><span class="b">${ic('clock',16,2.4)}</span><div><b class="t">Staff reviewing</b><span class="s">Usually done by ${NOW_REPLY}. We will text you when it changes.</span></div></div>
      <div class="step pending"><span class="b"></span><div><b class="t">Confirmed</b><span class="s">Your gear is set aside under your name</span></div></div></div></div>
    <div class="block"><div class="lbl" style="display:flex;gap:8px;align-items:center">${ic('phone',18)} Need an answer sooner?</div>
      <p class="hint" style="font-size:14px;margin:6px 0 10px">Call the desk during open hours (${r.hours}).</p>
      <a class="btn secondary slim" style="text-decoration:none" href="tel:9285550142">Call ${PHONE}</a></div>
    <div class="block">
      <div class="kv"><div class="k">Items</div><div class="v">${q.lines.map(lineText).join('<br>')}</div></div>
      <div class="kv"><div class="k">Trip dates</div><div class="v">${r.label}</div></div>
      <div class="kv"><div class="k">Pickup</div><div class="v">${pk.label}<small>HLC desk</small></div></div>
      <div class="kv"><div class="k">Estimated</div><div class="v">${money(total(q.lines))}<small>Pay at pickup</small></div></div>
      <div class="kv"><div class="k">Cancel</div><div class="v">Free until ${pk.label}</div></div></div>
  </div></div>
  <div class="actions stack"><button class="btn primary" data-a="go" data-r="mygear">View my gear</button>
    <button class="btn danger slim" data-a="askcancel" data-kind="req" data-id="${q.id}">Cancel request</button></div>`;
}

// popups that slide up from the bottom
function sheet(){
  const s=S.sheet; if(!s) return '';
  if(s.type==='dates'){
    return `<div class="scrim" data-a="closesheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Pick your dates"><div class="grab"></div>
      <h2>Pick your dates</h2><p>Counts on the home screen update for the dates you pick.</p>
      ${Object.entries(RANGES).map(([k,r])=>`<button class="opt ${S.range===k?'on':''}" data-a="setrange" data-id="${k}"><span class="r">${S.range===k?ic('check',14,3.4):''}</span><span><b>${r.label}</b><span class="s">Pickup ${r.fri}, ${plural(r.nights,'night')}</span></span></button>`).join('')}
      <button class="btn secondary slim" data-a="closesheet">Close</button></div>`;
  }
  if(s.type==='cancel'){
    const list = s.kind==='hold'?S.holds:S.requests, x=list.find(h=>h.id===s.id); if(!x) return '';
    const r=RANGES[x.range], pk=r.pickups[x.pickup], isH=s.kind==='hold';
    return `<div class="scrim" data-a="closesheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="${isH?'Cancel hold':'Cancel request'}"><div class="grab"></div>
      <h2>${isH?'Cancel your hold?':'Cancel your request?'}</h2>
      <div class="block sum" style="margin:6px 0 12px"><div class="r"><span>Items</span><span style="text-align:right">${x.lines.map(lineText).join('<br>')}</span></div><div class="r"><span>Trip dates</span><span>${r.short}</span></div></div>
      <p>${isH?'Your gear goes back on the shelf right away. We will email you a confirmation.':'Staff will be told right away. We will email you a confirmation.'} You can cancel for free until <b style="color:var(--ink)">${isH?pk.end:pk.label}</b>.</p>
      <div class="stack"><button class="btn primary" data-a="closesheet">${isH?'Keep hold':'Keep request'}</button>
      <button class="btn danger" data-a="docancel" data-kind="${s.kind}" data-id="${s.id}">${isH?'Cancel hold':'Cancel request'}</button></div></div>`;
  }
  return '';
}

// draws the current screen
const SCREENS = {home,item,held,mygear,help,plan,suggest,sent};
const app = document.getElementById('app'), phone = document.getElementById('phone');
function render(){
  const sc = app.querySelector('.scroll'); const top = sc?sc.scrollTop:0;
  const html = SCREENS[S.route]();
  const changed = lastRoute!==S.route;
  app.innerHTML = `<div class="screen ${changed?'enter':''}">${html}</div>${sheet()}`;
  const ns = app.querySelector('.scroll'); if(ns){ ns.scrollTop = changed?0:top; }
  lastRoute = S.route;
}
function toast(msg){
  const t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); t.textContent=msg;
  phone.appendChild(t); setTimeout(()=>t.remove(),3600);
}
function go(r){ S.route=r; S.sheet=null; document.querySelectorAll('.toast').forEach(t=>t.remove()); render(); }

// what happens when you tap things
function act(a,d){
  switch(a){
    case 'go': go(d.r); break;
    case 'item': S.item=d.id; S.qty=1; go('item'); break;
    case 'dates': S.sheet={type:'dates'}; render(); break;
    case 'setrange': S.range=d.id; S.pickup=1; S.removed={}; S.sheet=null; render(); break;
    case 'closesheet': S.sheet=null; render(); break;
    case 'qty': S.qty=Math.max(1,Math.min(stock(S.item),S.qty+Number(d.d))); render(); break;
    case 'hold': {
      const id='h'+(S.uid++); const q=Math.min(S.qty,stock(S.item));
      S.holds.push({id,range:S.range,lines:[{id:S.item,qty:q}],pickup:S.pickup}); S.lastId=id; go('held'); break; }
    case 'askcancel': S.sheet={type:'cancel',kind:d.kind,id:d.id}; render(); break;
    case 'docancel': {
      if(d.kind==='hold'){ S.holds=S.holds.filter(h=>h.id!==d.id); } else { S.requests=S.requests.filter(h=>h.id!==d.id); }
      S.sheet=null; S.route='mygear'; render();
      toast(d.kind==='hold'?'Hold cancelled. Your gear is back on the shelf. We emailed you a confirmation.':'Request cancelled. We emailed you a confirmation.'); break; }
    case 'people': S.plan.people=Math.max(1,Math.min(8,S.plan.people+Number(d.d))); render(); break;
    case 'exp': S.plan.exp=d.k; render(); break;
    case 'suggest': S.removed={}; S.pickup=1; S.mode=canInstant(suggestion())?'hold':'request'; go('suggest'); break;
    case 'remove': S.removed[d.id]=true; render(); break;
    case 'addback': delete S.removed[d.id]; render(); break;
    case 'mode': S.mode=d.m; render(); break;
    case 'holdplan': {
      const lines=keep(suggestion()).map(l=>({id:l.id,qty:l.qty})); const id='h'+(S.uid++);
      S.holds.push({id,range:S.range,lines,pickup:S.pickup}); S.lastId=id; go('held'); break; }
    case 'sendreq': {
      const lines=keep(suggestion()).map(l=>({id:l.id,qty:l.qty})); const id='q'+(S.uid++);
      S.requests.push({id,range:S.range,lines,pickup:S.pickup}); S.lastId=id; go('sent'); break; }
  }
}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-a]'); if(!el||!app.contains(el)) return;
  e.preventDefault(); act(el.dataset.a, el.dataset);
});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button][data-a]')){ e.preventDefault(); act(e.target.dataset.a,e.target.dataset); }
});
document.addEventListener('change',e=>{
  const t=e.target; if(!t.matches('select[data-sel]')) return;
  const v=Number(t.value);
  if(t.dataset.sel==='pkheld'){ const h=S.holds.find(x=>x.id===t.dataset.id); if(h) h.pickup=v; } else S.pickup=v;
  render();
});
document.addEventListener('input',e=>{ if(e.target.id==='where') S.plan.where=e.target.value; });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&S.sheet){ S.sheet=null; render(); } });
document.getElementById('restart').addEventListener('click',()=>location.reload());
render();
