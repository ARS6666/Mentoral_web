import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Copy, LogOut, Wallet, Users, Link2, Check, LayoutDashboard, Radio, BarChart3, CircleCheck, Clock3, FileText } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { apiJson } from "../utils/api";
import "./AffiliatePortal.css";

export const money = value => `${Math.floor(value / 10).toLocaleString("fa-IR")} تومان`;
export const count = value => Number(value).toLocaleString("fa-IR");
export const partnerDate = value => value ? new Date(value).toLocaleDateString("fa-IR") : "—";
export const channelPlatforms = {instagram:"اینستاگرام",telegram:"تلگرام",youtube:"یوتیوب",aparat:"آپارات",whatsapp:"واتساپ",rubika:"روبیکا",x:"ایکس (توییتر)",other:"دیگر"};
const panelSections = [{id:"overview",label:"داشبورد",title:"داشبورد همکاری",icon:LayoutDashboard},{id:"media",label:"رسانهٔ من",title:"رسانهٔ من",icon:Radio},{id:"income",label:"درآمد و پورسانت",title:"درآمد و پورسانت",icon:BarChart3},{id:"wallet",label:"تسویه و حساب بانکی",title:"تسویه و حساب بانکی",icon:Wallet},{id:"terms",label:"شرایط پورسانت",title:"شرایط پورسانت",icon:FileText}];
const statusLabels = { pending:"در انتظار بررسی", active:"فعال", rejected:"رد شده", suspended:"معلق", available:"آمادهٔ تسویه", reserved:"رزرو برای تسویه", paid:"تسویه شده", voided:"باطل شده", requested:"درخواست شده", processing:"در حال واریز" };
export function PartnerStatus({ value }) { return <span className={`partner-status partner-status-${value}`}>{statusLabels[value] || value}</span>; }
export async function affiliateRequest(url, options = {}) {
  const { response, data } = await apiJson(url, options);
  if (!response.ok) {
    const detail = data?.error || data?.detail || Object.values(data || {}).flat().join(" · ");
    throw new Error(typeof detail === "string" && detail ? detail : "درخواست انجام نشد؛ دوباره تلاش کن.");
  }
  return data;
}
export const jsonWrite = (method, data) => ({ method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) });

export function PartnerPages({ data, onPage, disabled }) {
  if (!data || data.total <= data.pageSize) return null;
  return <nav className="partner-pages" aria-label="صفحه‌بندی">
    <button disabled={disabled || data.page <= 1} onClick={() => onPage(data.page - 1)}>قبلی</button>
    <span>صفحهٔ {count(data.page)} از {count(Math.ceil(data.total / data.pageSize))}</span>
    <button disabled={disabled || data.page * data.pageSize >= data.total} onClick={() => onPage(data.page + 1)}>بعدی</button>
  </nav>;
}

export function CommissionTable({ data, onPage, disabled, onVoid }) {
  const planLabels={monthly:"۱ ماهه",quarterly:"۳ ماهه",six_months:"۶ ماهه",yearly:"۱ ساله"};
  return <><div className="partner-table-wrap"><table><thead><tr><th>تاریخ خرید</th><th>اشتراک</th><th>مبلغ خرید</th><th>نوع خرید</th><th>درصد</th><th>پورسانت</th><th>وضعیت</th><th>قابل برداشت از</th><th>شناسهٔ خرید</th>{onVoid && <th>عملیات</th>}</tr></thead>
    <tbody>{data.items.map(row => <tr key={row.id}><td>{partnerDate(row.paidAt)}</td><td>{planLabels[row.planSlug] || "اشتراک"}</td><td>{money(row.baseAmountRials)}</td><td>{row.kind === "first" ? "خرید اول" : "تمدید / ارتقا"}</td><td>{count(row.ratePercent)}٪</td><td>{money(row.amountRials)}</td><td><PartnerStatus value={row.status} /></td><td>{partnerDate(row.availableAt)}</td><td><code>{row.paymentId}</code></td>{onVoid && <td><button disabled={disabled || !["pending","available"].includes(row.status)} onClick={() => onVoid(row)}>ابطال</button></td>}</tr>)}</tbody></table></div>
    {!data.items.length && <p className="partner-empty">هنوز فروشی ثبت نشده</p>}
    <PartnerPages data={data} onPage={onPage} disabled={disabled} /></>;
}

function CommissionTerms() {
  return <section className="partner-terms" aria-label="راهنمای پورسانت">
    <section className="partner-panel"><h2>سهم شما از خرید اول</h2><p>درصد هر خرید اول به تعداد مشتری‌های جدید معرفی‌شده و نوع اشتراک خریداری‌شده بستگی دارد.</p>
      <div className="partner-table-wrap"><table aria-label="درصد پورسانت خرید اول"><thead><tr><th scope="col">مشتری جدید خریدار</th><th scope="col">ماهانه</th><th scope="col">سه‌ماهه</th><th scope="col">شش‌ماهه</th><th scope="col">سالانه</th></tr></thead><tbody>{[
        ["مشتری ۱ تا ۱۰","۱۵٪","۱۵٪","۲۰٪","۲۰٪"],
        ["مشتری ۱۱ تا ۵۰","۲۰٪","۲۰٪","۲۵٪","۲۵٪"],
        ["از مشتری ۵۱ به بعد","۲۵٪","۲۵٪","۳۰٪","۳۰٪"],
      ].map(([label,...rates])=><tr key={label}><th scope="row">{label}</th>{rates.map((rate,index)=><td key={index}>{rate}</td>)}</tr>)}</tbody></table></div>
      <p>مشتری جدید، کسی است که اولین خرید واقعی اشتراک او با معرفی معتبر شما ثبت شود. بازدید لینک یا ثبت‌نام به‌تنهایی پورسانت ایجاد نمی‌کند.</p>
      <p>افزایش سطح برای خرید اولِ مشتری‌های جدید بعدی اعمال می‌شود؛ درصد و مبلغ خریدهای قبلی دوباره محاسبه نمی‌شوند.</p>
    </section>
    <section className="partner-panel partner-terms-example"><h2>پورسانت چطور حساب می‌شود؟</h2><p>مبنای محاسبه، مبلغ واقعی پرداخت‌شده است، نه صرفاً قیمت درج‌شدهٔ پلن.</p><div className="partner-terms-calculation"><span>۴۰۰٬۰۰۰ تومان خرید × ۱۵٪ سهم</span><strong>۶۰٬۰۰۰ تومان پورسانت</strong></div><p>این یک مثال محاسباتی است. مبلغ هر خرید و درصد همان خرید را در گزارش پورسانت‌ها می‌بینید. مبلغ پورسانت به تومان کامل، رو به پایین محاسبه می‌شود.</p></section>
    <div className="partner-split">
      <section className="partner-panel"><span className="partner-eyebrow">۵٪ سهم خریدهای بعدی</span><h2>تمدید و ارتقای اشتراک</h2><p>از تمدید یا ارتقای اشتراک همان مشتری، در بازهٔ ۱۸ ماه تقویمی از اولین خرید تأییدشدهٔ او، ۵٪ پورسانت دریافت می‌کنید.</p><p>این بازه با هر تمدید از نو شروع نمی‌شود. درصد تمدید مستقل از سطح شما و نوع پلن است و پس از پایان بازه، پورسانت تمدید جدید ثبت نمی‌شود.</p><p>بعد از ثبت خرید اول، برای تمدیدهای واجد شرایط نیازی به باز کردن دوبارهٔ لینک شما نیست؛ نسبت معرفی همان مشتری حفظ می‌شود.</p></section>
      <section className="partner-panel"><span className="partner-eyebrow">درخواست از موجودی آزادشده</span><h2>آزادسازی و تسویه</h2><p>پورسانت هر خرید، ۱۴ روز پس از تأیید پرداخت، از «در انتظار آزادسازی» به «آمادهٔ تسویه» می‌رسد.</p><ul><li>حساب همکاری باید فعال و شماره شبا و نام صاحب حساب تکمیل باشد.</li><li>مبلغ درخواست به‌صورت خودکار از کل موجودی آمادهٔ تسویه محاسبه می‌شود؛ تا پایان بررسی، این مبلغ رزرو می‌شود.</li><li>هم‌زمان فقط یک درخواست تسویهٔ باز می‌توانید داشته باشید.</li><li>ثبت درخواست به معنی واریز فوری نیست. بررسی و واریز توسط تیم منتورا انجام می‌شود و وضعیت و رسید در تاریخچهٔ تسویه نمایش داده می‌شود.</li><li>اگر درخواست رد شود، مبلغ رزروشده به موجودی آمادهٔ تسویه برمی‌گردد.</li></ul><Link className="partner-terms-link" to="?section=wallet">رفتن به بخش تسویه <ArrowUpLeft size={17}/></Link></section>
    </div>
    <section className="partner-panel"><h2>معرفی معتبر و ثبت خرید</h2><ul><li>پس از تأیید رسانه، لینک اختصاصی شما فعال می‌شود.</li><li>معرفی ۳۰ روز اعتبار دارد. سفارش خرید اول باید در بازهٔ اعتبار معرفی ثبت شده باشد و پرداخت آن تأیید شود.</li><li>ثبت معرفی به کوکی مرورگر وابسته است. تغییر مرورگر یا دستگاه و مسدود بودن کوکی‌ها ممکن است مانع ثبت معرفی شود.</li><li>تا وقتی معرفی قبلیِ کاربر معتبر و همکار مربوط به آن فعال است، کلیک روی لینک همکار دیگر آن را جابه‌جا نمی‌کند.</li><li>کاربری که پیش از معرفی شما سابقهٔ خرید واقعی داشته، برای شما مشتری جدید محسوب نمی‌شود.</li></ul></section>
    <section className="partner-panel"><h2>موارد بدون پورسانت و وضعیت حساب</h2><ul><li>پرداخت ناموفق، پرداخت آزمایشی، خرید خودِ همکار و خرید بدون معرفی معتبر، پورسانت ایجاد نمی‌کنند.</li><li>برای ثبت پورسانت جدید، حساب همکاری باید در زمان تأیید پرداخت فعال باشد.</li><li>در حساب معلق، ثبت پورسانت و درخواست تسویهٔ جدید متوقف است؛ تعلیق، سوابق قبلی را حذف نمی‌کند.</li><li>پورسانت باطل‌شده قابل تسویه نیست؛ وضعیت آن در گزارش پورسانت‌ها مشخص است.</li></ul><p>در بخش «درآمد و پورسانت»، مبلغ پایه، درصد، نوع خرید و وضعیت هر پورسانت را می‌توانید بررسی کنید.</p></section>
  </section>;
}

function SalesChart({ series }) {
  const max = Math.max(1, ...series.map(row => row.commissionRials));
  const points = series.map((row, i) => `${20 + i * 760 / Math.max(1, series.length - 1)},${140 - row.commissionRials / max * 120}`).join(" ");
  return <div className="partner-chart"><svg viewBox="0 0 800 165" role="img" aria-label="روند روزانهٔ پورسانت؛ جزئیات در جدول زیر نمودار">
    {[20,80,140].map(y => <line key={y} x1="20" x2="780" y1={y} y2={y} stroke="currentColor" opacity=".12" />)}
    <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    {series.length === 1 && <circle cx="20" cy={140-series[0].commissionRials/max*120} r="4" fill="currentColor" />}
  </svg><div className="partner-chart-dates"><span>{partnerDate(series[0]?.date)}</span><span>{partnerDate(series[series.length-1]?.date)}</span></div>
  <details><summary>جزئیات روزانه</summary><div className="partner-table-wrap"><table><thead><tr><th>روز</th><th>مشتری جدید</th><th>پورسانت</th></tr></thead><tbody>{series.map(row => <tr key={row.date}><td>{partnerDate(row.date)}</td><td>{count(row.newCustomers)}</td><td>{money(row.commissionRials)}</td></tr>)}</tbody></table></div></details></div>;
}

function PartnerAuth({ login, register, busy, run, onAuthenticated }) {
  const [signup, setSignup] = useState(false);
  const [form, setForm] = useState({ fullName:"", phone:"", password:"", confirmPassword:"" });
  return <section className="partner-panel partner-auth" id="partner-start"><h2>{signup ? "ساخت حساب همکاری" : "ورود به پنل"}</h2><p>با حساب منتورا وارد شو، یا حساب تازه بساز.</p>
    <form onSubmit={e => { e.preventDefault(); run(async()=>{await (signup ? register(form) : login(form.phone,form.password));onAuthenticated();}); }}>
      {signup && <label>نام و نام خانوادگی<input required maxLength={120} autoComplete="name" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} /></label>}
      <label>شماره موبایل<input required type="tel" autoComplete="tel" dir="ltr" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></label>
      <label>رمز عبور<input required type="password" autoComplete={signup ? "new-password" : "current-password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></label>
      {signup && <label>تکرار رمز عبور<input required type="password" autoComplete="new-password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} /></label>}
      <button className="partner-primary" disabled={busy}>{busy ? "لطفاً صبر کن…" : signup ? "ساخت حساب" : "ورود به پنل"}</button>
    </form><button className="partner-text-button" disabled={busy} onClick={()=>setSignup(!signup)}>{signup ? "حساب دارم؛ ورود" : "حساب ندارم؛ ثبت‌نام"}</button>
  </section>;
}

function ApplicationForm({ account, busy, run, reload }) {
  const [form, setForm] = useState({channelName:account?.channelName || "",channelPlatform:account ? account.channelPlatform || "other" : "",channelUrl:account?.channelUrl || "",description:account?.description || ""});
  return <section className="partner-panel partner-media-form"><h2>{account ? "اطلاعات رسانه" : "رسانه‌ات را معرفی کن"}</h2><p>شبکهٔ اجتماعی و لینک یا آیدی صفحه‌ات را وارد کن.</p>
    <form onSubmit={e=>{e.preventDefault();run(async()=>{await affiliateRequest("/api/affiliates/application",jsonWrite("POST",form));await reload();});}}>
      <label>نام رسانه یا صفحه<input required maxLength={120} value={form.channelName} onChange={e=>setForm({...form,channelName:e.target.value})} /></label>
      <label>شبکهٔ اجتماعی<select required value={form.channelPlatform} onChange={e=>setForm({...form,channelPlatform:e.target.value})}><option value="" disabled>انتخاب کن</option>{Object.entries(channelPlatforms).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label>لینک یا آیدی صفحه / کانال<input required type="text" maxLength={500} dir="ltr" placeholder="@your_channel یا https://…" value={form.channelUrl} onChange={e=>setForm({...form,channelUrl:e.target.value})} /></label>
      <label>دربارهٔ مخاطبانت<textarea maxLength={1000} rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></label>
      <button className="partner-primary" disabled={busy}>{account?.status === "active" ? "ذخیره اطلاعات رسانه" : "ثبت درخواست همکاری"}</button>
    </form></section>;
}

function BankForm({ account, busy, run, reload }) {
  const [iban, setIban] = useState(account.iban);
  const [accountHolder, setHolder] = useState(account.accountHolder);
  return <form onSubmit={e=>{e.preventDefault();run(async()=>{await affiliateRequest("/api/affiliates/bank-account",jsonWrite("PATCH",{iban,accountHolder}));await reload();},"اطلاعات بانکی ذخیره شد.");}}>
    <label>شماره شبا<input required maxLength={64} dir="ltr" placeholder="IR…" value={iban} onChange={e=>setIban(e.target.value)} /></label>
    <label>نام صاحب حساب<input required maxLength={120} value={accountHolder} onChange={e=>setHolder(e.target.value)} /></label>
    <button disabled={busy}>ذخیره اطلاعات بانکی</button>
  </form>;
}

export default function AffiliatePortal() {
  const { isAuthenticated, loading:authLoading, profile, login, register, logout } = useApp();
  const [searchParams,setSearchParams] = useSearchParams();
  const section = panelSections.find(item=>item.id === searchParams.get("section")) || panelSections[0];
  const [account, setAccount] = useState(undefined);
  const [report, setReport] = useState(null);
  const [commissions, setCommissions] = useState(null);
  const [payouts, setPayouts] = useState(null);
  const [days, setDays] = useState(30);
  const [commissionPage, setCommissionPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const generation = useRef({ value:0 }).current;
  const writing = useRef(false);
  const reload = useCallback(async () => {
    const id = ++generation.value;
    setLoading(true); setError(""); setReport(null);
    if (!isAuthenticated) { setAccount(undefined); setLoading(false); return; }
    try {
      const result = await affiliateRequest("/api/affiliates/application");
      if (id !== generation.value) return;
      setAccount(result.account);
      if (result.account && ["active","suspended"].includes(result.account.status)) {
        const [dashboard, sales, settlements] = await Promise.all([
          affiliateRequest(`/api/affiliates/dashboard?days=${days}`),
          affiliateRequest(`/api/affiliates/commissions?page=${commissionPage}`),
          affiliateRequest(`/api/affiliates/payouts?page=${payoutPage}`),
        ]);
        if (id !== generation.value) return;
        setReport(dashboard); setCommissions(sales); setPayouts(settlements);
      }
    } catch (err) { if (id === generation.value) setError(err.message); }
    finally { if (id === generation.value) setLoading(false); }
  }, [isAuthenticated, days, commissionPage, payoutPage, generation]);
  useEffect(()=>{reload();return()=>{generation.value++;};},[reload,profile?.id,generation]);
  const run = async (action, success = "") => {
    if (writing.current) return;
    writing.current = true; setBusy(true); setError(""); setNotice("");
    try { await action(); setNotice(success); } catch (err) { setError(err.message); }
    finally { writing.current = false; setBusy(false); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(account.referralUrl); setNotice("لینک کپی شد."); setError(""); }
    catch (_) { setError("لینک را از کادر انتخاب و دستی کپی کن."); }
  };
  const active = account?.status === "active";
  const openPayout = report?.stats.reservedRials > 0;
  const mediaLink = "?section=media";
  const feedback = <div className="partner-feedback" aria-live="polite">{error && <div role="alert" className="partner-error">{error}{!busy && isAuthenticated && !report && <button onClick={reload}>تلاش دوباره</button>}</div>}{notice && <p className="partner-notice" role="status"><Check size={18}/>{notice}</p>}</div>;
  return <div className={`affiliate-portal ${isAuthenticated ? "partner-dashboard" : ""}`} dir="rtl">
    <header className="partner-header"><a className="partner-brand" href="https://mentoralearn.ir"><img src="/logo-mark.png" alt="" />منتورا <span>همکاری در فروش</span></a>
      {isAuthenticated ? <button disabled={busy} onClick={logout}><LogOut size={17} />خروج</button> : <a href="#partner-start">ورود / ثبت‌نام <ArrowUpLeft size={17}/></a>}
    </header><main className="partner-container">
      {!isAuthenticated && !authLoading && <>
      <section className="partner-hero"><div><span className="partner-eyebrow">برای سازندگان محتوا و مشاوران آموزشی</span><h1>منتورا را معرفی کن.<br/><span>در فروشش شریک شو.</span></h1><p>لینک اختصاصی بگیر، خریدهای معرفی‌شده را ببین و سهمت را دریافت کن.</p><a className="partner-primary" href="#partner-start">{isAuthenticated ? "پنل همکاری من" : "شروع همکاری"}<ArrowUpLeft size={18}/></a></div>
      <div className="partner-ladder"><h2>مخاطبان بیشتر، سهم بیشتر</h2><p>درصد هر خرید اول، بر اساس تعداد مشتری‌های جدیدت</p><div className="partner-table-wrap"><table><thead><tr><th>مشتری جدید</th><th>۱ و ۳ ماهه</th><th>۶ ماهه و سالانه</th></tr></thead><tbody>{[["۱ تا ۱۰","۱۵٪","۲۰٪"],["۱۱ تا ۵۰","۲۰٪","۲۵٪"],["۵۱ به بعد","۲۵٪","۳۰٪"]].map(row=><tr key={row[0]}>{row.map(cell=><td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div><div className="partner-renewal"><strong>۵٪ سهم تمدید</strong><span>تا ۱۸ ماه از اولین خرید هر مشتری</span></div></div></section>
      <div className="partner-policy"><span><Link2 size={18}/>اعتبار معرفی: ۳۰ روز</span><span><Wallet size={18}/>آزادسازی پورسانت: ۱۴ روز پس از خرید</span><span><Users size={18}/>فعال‌سازی پس از بررسی درخواست</span></div>
      {feedback}
      {!loading && <PartnerAuth {...{login,register,busy,run}} onAuthenticated={()=>setSearchParams({section:"overview"},{replace:true})} />}
      </>}
      {authLoading && <p role="status" className="partner-empty">در حال دریافت اطلاعات…</p>}
      {isAuthenticated && !authLoading && <div className="partner-workspace" id="partner-start">
        <aside className="partner-sidebar">
          <div className="partner-identity"><span className="partner-avatar" aria-hidden="true">{profile?.name?.slice(0,1) || "م"}</span><div><strong>{profile?.name || "حساب همکاری من"}</strong><small>همکار منتورا</small></div></div>
          <nav aria-label="منوی پنل همکاری">{panelSections.map(({id,label,icon:Icon})=><Link key={id} className={id==="terms" ? "partner-nav-terms" : undefined} to={`?section=${id}`} aria-current={section.id===id ? "page" : undefined}><Icon size={20} aria-hidden="true"/>{label}</Link>)}</nav>
          <div className="partner-sidebar-note"><Link2 size={20}/><strong>سهم تو از هر معرفی</strong><p>۱۵٪ تا ۳۰٪ از خرید اول<br/>۵٪ از تمدید تا ۱۸ ماه</p><small>پورسانت ۱۴ روز پس از خرید آزاد می‌شود.</small></div>
          <a className="partner-back-site" href="https://mentoralearn.ir">رفتن به منتورا <ArrowUpLeft size={16}/></a>
        </aside>
        <div className="partner-workspace-main">
          <div className="partner-page-heading"><div><span className="partner-eyebrow">پنل همکاری در فروش</span><h1>{section.title}</h1></div>{!loading && account !== undefined && (account ? <PartnerStatus value={account.status}/> : <span className="partner-status">رسانه ثبت نشده</span>)}</div>
          {feedback}
          {loading ? <p role="status" className="partner-empty">در حال دریافت اطلاعات…</p> : <>
          {account?.decisionNote && <div className="partner-panel partner-review-note"><strong>پیام بررسی درخواست</strong><p>{account.decisionNote}</p></div>}
          {section.id === "terms" && <CommissionTerms/>}
          {section.id === "overview" && !error && !report && <>
            <section className="partner-welcome partner-panel"><div className="partner-welcome-icon">{account?.status==="pending" ? <Clock3 size={30}/> : <Radio size={30}/>}</div><div><span className="partner-eyebrow">{profile?.name ? `${profile.name}، خوش آمدی` : "به پنل همکاری خوش آمدی"}</span><h2>{account?.status==="pending" ? "درخواستت در حال بررسی است" : account?.status==="rejected" ? "اطلاعات رسانه‌ات را تکمیل کن" : "همکاری از رسانهٔ تو شروع می‌شود"}</h2><p>{account?.status==="pending" ? "رسانه‌ات ثبت شده است. نتیجهٔ بررسی را همین‌جا می‌بینی؛ پس از تأیید، لینک اختصاصی و گزارش فروش فعال می‌شوند." : "هر وقت آماده بودی، صفحه یا کانالت را در بخش رسانهٔ من اضافه کن تا درخواست همکاری بررسی شود."}</p><Link className="partner-primary" to={mediaLink}>{account ? "مشاهده اطلاعات رسانه" : "افزودن رسانه"}<ArrowUpLeft size={18}/></Link></div></section>
            <section className="partner-panel partner-steps"><h2>مسیر شروع همکاری</h2><ol>{[["معرفی رسانه","شبکهٔ اجتماعی و لینک یا آیدی صفحه‌ات را ثبت کن.",!!account],["بررسی درخواست","منتورا رسانه‌ات را بررسی و نتیجه را در پنل اعلام می‌کند.",active],["دریافت لینک و شروع معرفی","بعد از تأیید، لینک اختصاصی بگیر و فروش‌هایت را دنبال کن.",active]].map(([title,text,done],i)=><li key={title} className={done ? "is-complete" : ""}><span>{done ? <CircleCheck size={21}/> : count(i+1)}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol></section>
          </>}
          {section.id === "media" && account !== undefined && <>
            {account?.status === "suspended" ? <section className="partner-panel"><h2>{account.channelName}</h2><p>{channelPlatforms[account.channelPlatform] || channelPlatforms.other} · <bdi>{account.channelUrl}</bdi></p><p>حساب همکاری معلق است؛ برای تغییر رسانه با پشتیبانی تماس بگیر.</p></section> : <ApplicationForm key={account?.id || "new"} {...{account,busy,run,reload}}/>}
          </>}
          {["income","wallet"].includes(section.id) && !report && !error && <section className="partner-panel partner-locked"><Wallet size={32}/><h2>این بخش پس از تأیید رسانه فعال می‌شود</h2><p>{account?.status === "pending" ? "درخواست همکاری‌ات در حال بررسی است." : "ابتدا رسانه‌ات را معرفی کن تا همکاری‌ات بررسی شود."}</p><Link to={mediaLink}>رفتن به رسانهٔ من <ArrowUpLeft size={17}/></Link></section>}
          {report && section.id === "overview" && <>
          {active ?
          <section className="partner-panel partner-link"><div><h2>لینک اختصاصی شما</h2><p>این لینک را در محتوایت به اشتراک بگذار.</p></div><label className="partner-sr-only" htmlFor="partner-url">لینک اختصاصی شما</label><input id="partner-url" dir="ltr" readOnly value={account.referralUrl} onFocus={e=>e.target.select()}/><button onClick={copy}><Copy size={18}/>کپی لینک</button></section>
          : <section className="partner-panel partner-review-note"><h2>لینک معرفی موقتاً غیرفعال است</h2><p>تا رفع تعلیق، معرفی و ثبت تسویهٔ جدید انجام نمی‌شود. سوابق حسابت در دسترس است.</p></section>}
          <div className="partner-heading"><div><h2>حساب درآمد</h2><p>ماندهٔ کل حساب، مستقل از بازهٔ نمودار</p></div><span>سهم خرید بعدی: {count(report.level.shortRate)}٪ / {count(report.level.longRate)}٪</span></div>
          <div className="partner-stats">{[["آمادهٔ تسویه","availableRials"],["در انتظار آزادسازی","pendingRials"],["در جریان تسویه","reservedRials"],["تسویه شده","paidRials"]].map(([label,key],i)=><section className={`partner-stat ${i===0 ? "partner-stat-featured" : ""}`} key={key}><span>{label}</span><strong>{money(report.stats[key])}</strong></section>)}</div>
          <section className="partner-panel"><div className="partner-heading"><div><h2>عملکرد لینک</h2><p>{count(report.level.newCustomerCount)} مشتری جدید در کل{report.level.nextThreshold ? ` · سطح بعد از مشتری ${count(report.level.nextThreshold)}` : " · بالاترین سطح پورسانت"}</p></div><label>بازهٔ گزارش<select disabled={busy || loading} value={days} onChange={e=>setDays(Number(e.target.value))}>{[7,30,90].map(n=><option key={n} value={n}>{count(n)} روز اخیر</option>)}</select></label></div>
            <div className="partner-mini-stats">{[["بازدید یکتا","uniqueVisits"],["ثبت‌نام","registrations"],["مشتری جدید","newCustomers"],["خرید تمدید","renewalSales"]].map(([label,key])=><div key={key}><strong>{count(report.stats[key])}</strong><span>{label}</span></div>)}</div><SalesChart series={report.series}/>
          </section>
          </>}
          {report && section.id === "income" && <>
          <section className="partner-panel"><div className="partner-heading"><h2>خریدها و پورسانت‌ها</h2><span>بدون نمایش اطلاعات شخصی دانش‌آموزان</span></div><CommissionTable data={commissions} onPage={setCommissionPage} disabled={busy}/></section>
          </>}
          {report && section.id === "wallet" && <>
          <div className="partner-split"><section className="partner-panel"><h2>اطلاعات دریافت وجه</h2><p>مبلغ درخواست از ماندهٔ آزادشده محاسبه می‌شود.</p><BankForm key={`${account.iban}-${account.accountHolder}`} {...{account,busy,run,reload}}/></section><section className="partner-panel partner-settlement"><Wallet size={28}/><h2>درخواست تسویه</h2><strong>{money(report.stats.availableRials)}</strong><p>پس از درخواست، مبلغ تا بررسی و واریز توسط منتورا رزرو می‌شود.</p><button className="partner-primary" disabled={busy || !active || !report.stats.availableRials || openPayout || !account.iban || !account.accountHolder} onClick={()=>run(async()=>{await affiliateRequest("/api/affiliates/payouts",jsonWrite("POST",{}));await reload();},"درخواست تسویه ثبت شد.")}>درخواست تسویه</button>{openPayout && <p>یک درخواست تسویهٔ باز داری.</p>}{!active && <p>در حساب معلق، ثبت تسویهٔ جدید غیرفعال است.</p>}</section></div>
          <section className="partner-panel"><h2>تاریخچهٔ تسویه</h2><div className="partner-table-wrap"><table><thead><tr><th>ثبت درخواست</th><th>مبلغ</th><th>وضعیت</th><th>شناسهٔ رسید</th><th>یادداشت</th></tr></thead><tbody>{payouts.items.map(row=><tr key={row.id}><td>{partnerDate(row.createdAt)}</td><td>{money(row.amountRials)}</td><td><PartnerStatus value={row.status}/></td><td>{row.receiptReference || "—"}</td><td>{row.note || "—"}</td></tr>)}</tbody></table></div>{!payouts.items.length && <p className="partner-empty">هنوز درخواست تسویه‌ای ثبت نشده</p>}<PartnerPages data={payouts} onPage={setPayoutPage} disabled={busy}/></section>
          </>}
          </>}
        </div>
      </div>}
    </main><footer className="partner-footer">منتورا · همکاری در فروش <a href="https://mentoralearn.ir/aboutus">دربارهٔ منتورا</a></footer>
  </div>;
}
