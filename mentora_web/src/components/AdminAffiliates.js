import React, { useCallback, useEffect, useRef, useState } from "react";
import { affiliateRequest, jsonWrite, money, partnerDate, PartnerStatus, PartnerPages, CommissionTable, channelPlatforms } from "./AffiliatePortal";

export default function AdminAffiliates({ admin }) {
  const [accounts,setAccounts]=useState(null);
  const [payouts,setPayouts]=useState(null);
  const [detail,setDetail]=useState(null);
  const [settlement,setSettlement]=useState(null);
  const [note,setNote]=useState("");
  const [receipt,setReceipt]=useState("");
  const [search,setSearch]=useState("");
  const [query,setQuery]=useState("");
  const [status,setStatus]=useState("");
  const [payoutStatus,setPayoutStatus]=useState("requested");
  const [page,setPage]=useState(1);
  const [payoutPage,setPayoutPage]=useState(1);
  const [loading,setLoading]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const generation=useRef({value:0}).current;
  const selection=useRef({value:0}).current;
  const writing=useRef(false);
  const load=useCallback(async()=>{
    const id=++generation.value;
    setLoading(true);setError("");setAccounts(null);setPayouts(null);
    try {
      const [a,p]=await Promise.all([
        affiliateRequest(`/api/admin/affiliates?${new URLSearchParams({search:query,status,page})}`),
        affiliateRequest(`/api/admin/affiliates/payouts?${new URLSearchParams({status:payoutStatus,page:payoutPage})}`),
      ]);
      if(id===generation.value){setAccounts(a);setPayouts(p);}
    } catch(err){if(id===generation.value)setError(err.message);}
    finally{if(id===generation.value)setLoading(false);}
  },[query,status,page,payoutStatus,payoutPage,generation]);
  useEffect(()=>{load();return()=>{generation.value++;selection.value++;};},[load,generation,selection]);
  const showAccount=async(id,commissionPage=1)=>{
    const version=++selection.value;
    setDetail(null);setSettlement(null);setNote("");setError("");
    try{const data=await affiliateRequest(`/api/admin/affiliates/${id}${commissionPage===1 ? "" : `?page=${commissionPage}`}`);if(version===selection.value)setDetail(data);}
    catch(err){if(version===selection.value)setError(err.message);}
  };
  const write=async(url,payload)=>{
    if(writing.current)return;
    writing.current=true;setBusy(true);setError("");
    try{await affiliateRequest(url,jsonWrite("POST",payload));selection.value++;setDetail(null);setSettlement(null);setNote("");setReceipt("");await load();}
    catch(err){setError(err.message);}
    finally{writing.current=false;setBusy(false);}
  };
  const decision=status=>write(`/api/admin/affiliates/${detail.account.id}/status`,{status,note:note.trim()});
  const transition=action=>write(`/api/admin/affiliates/payouts/${settlement.id}/transition`,{action,note:note.trim(),receiptReference:receipt.trim()});
  const ownsSettlement=settlement?.claimedBy === admin?.id;
  return <section className="affiliate-portal"><div className="partner-panel"><h2>همکاری در فروش</h2><p>درخواست‌ها، ماندهٔ پورسانت و تسویه‌های دستی</p>
    {error && <div role="alert" className="partner-error">{error}<button disabled={busy} onClick={load}>تلاش دوباره</button></div>}
    <form className="partner-admin-actions" onSubmit={e=>{e.preventDefault();setPage(1);setQuery(search.trim());}}>
      <label>جستجوی همکار<input maxLength={120} value={search} onChange={e=>setSearch(e.target.value)}/></label>
      <label>وضعیت همکاری<select disabled={busy} value={status} onChange={e=>{setPage(1);setStatus(e.target.value);}}><option value="">همه</option>{["pending","active","rejected","suspended"].map(s=><option key={s} value={s}>{{pending:"در انتظار بررسی",active:"فعال",rejected:"رد شده",suspended:"معلق"}[s]}</option>)}</select></label>
      <button disabled={busy || loading}>جستجو</button>
    </form>
    {loading && <p role="status">در حال دریافت اطلاعات…</p>}
    {accounts && <>{accounts.items.map(account=><div className="partner-admin-row" key={account.id}><div><strong>{account.channelName}</strong><small>{account.name} · <bdi>{account.phone}</bdi></small></div><PartnerStatus value={account.status}/><button disabled={busy} aria-label={`بررسی ${account.channelName}`} onClick={()=>showAccount(account.id)}>بررسی</button></div>)}{!accounts.items.length && <p className="partner-empty">درخواستی در این بازه نیست.</p>}<PartnerPages data={accounts} onPage={setPage} disabled={busy}/></>}
  </div>
  {detail && <section className="partner-panel" aria-label="بررسی همکاری"><div className="partner-heading"><h2>{detail.account.channelName}</h2><button disabled={busy} onClick={()=>{selection.value++;setDetail(null);}}>بستن بررسی</button></div><PartnerStatus value={detail.account.status}/><p>{channelPlatforms[detail.account.channelPlatform] || channelPlatforms.other} · <bdi>{/^https?:\/\//i.test(detail.account.channelUrl) ? <a href={detail.account.channelUrl} target="_blank" rel="noopener noreferrer">{detail.account.channelUrl}</a> : detail.account.channelUrl}</bdi></p><p>{detail.account.description}</p><p>آمادهٔ تسویه: {money(detail.stats.availableRials)} · در انتظار: {money(detail.stats.pendingRials)} · پرداخت‌شده: {money(detail.stats.paidRials)}</p>
    <label>یادداشت تصمیم<textarea maxLength={1000} value={note} onChange={e=>setNote(e.target.value)}/></label>
    <div className="partner-admin-actions">{[["active","تأیید همکاری"],["rejected","رد درخواست"],["suspended","تعلیق همکاری"]].map(([value,label])=><button key={value} disabled={busy || !note.trim() || detail.account.status===value} onClick={()=>decision(value)}>{label}</button>)}</div>
    <h2 style={{marginTop:24}}>پورسانت‌ها</h2><p>ابطال فقط برای پورسانت رزرو‌نشده است؛ دلیل را در یادداشت تصمیم بنویس.</p><CommissionTable data={detail.commissions} onPage={page=>showAccount(detail.account.id,page)} disabled={busy || !note.trim()} onVoid={row=>write(`/api/admin/affiliates/commissions/${row.id}/void`,{note:note.trim()})}/>
  </section>}
  <section className="partner-panel"><div className="partner-heading"><h2>صف تسویه</h2><label>وضعیت تسویه<select disabled={busy} value={payoutStatus} onChange={e=>{setPayoutPage(1);setPayoutStatus(e.target.value);}}><option value="">همه</option>{[["requested","درخواست شده"],["processing","در حال واریز"],["paid","تسویه شده"],["rejected","رد شده"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div>
    {payouts && <>{payouts.items.map(row=><div className="partner-admin-row" key={row.id}><div><strong>{row.channelName}</strong><small>{money(row.amountRials)} · {partnerDate(row.createdAt)}</small></div><PartnerStatus value={row.status}/><button disabled={busy} aria-label={`بررسی تسویه ${row.id}`} onClick={()=>{selection.value++;setDetail(null);setSettlement(row);setNote("");setReceipt("");}}>بررسی</button></div>)}{!payouts.items.length && <p className="partner-empty">درخواست تسویه‌ای در این وضعیت نیست.</p>}<PartnerPages data={payouts} onPage={setPayoutPage} disabled={busy}/></>}
  </section>
  {settlement && <section className="partner-panel" aria-label="بررسی تسویه"><div className="partner-heading"><h2>تسویهٔ {settlement.channelName}</h2><button disabled={busy} onClick={()=>setSettlement(null)}>بستن تسویه</button></div><PartnerStatus value={settlement.status}/><p>{money(settlement.amountRials)} · {settlement.accountHolder}</p><p dir="ltr">{settlement.iban}</p>
    {settlement.status==="requested" && <p>ابتدا بررسی را به نام خودت ثبت کن؛ تا آن زمان واریز انجام نده.</p>}
    {settlement.status==="processing" && (ownsSettlement ? <p>این تسویه در اختیار توست. ثبت رسید، انتقال وجه بانکی انجام نمی‌دهد؛ ابتدا واریز واقعی را انجام بده.</p> : <p>این تسویه در اختیار {settlement.claimedByName || "ادمین دیگری"} است؛ واریز یا تغییر آن را انجام نده.</p>)}
    {(settlement.status==="requested" || (settlement.status==="processing" && ownsSettlement)) ? <><label>یادداشت تسویه<textarea maxLength={1000} value={note} onChange={e=>setNote(e.target.value)}/></label>{settlement.status==="processing" && <label>شناسهٔ رسید واریز<input maxLength={120} value={receipt} onChange={e=>setReceipt(e.target.value)}/></label>}<div className="partner-admin-actions">{settlement.status==="requested" ? <button disabled={busy || !note.trim()} onClick={()=>transition("processing")}>شروع بررسی واریز</button> : <button disabled={busy || !note.trim() || !receipt.trim()} onClick={()=>transition("paid")}>ثبت واریز انجام‌شده</button>}<button disabled={busy || !note.trim()} onClick={()=>transition("rejected")}>رد تسویه و آزادسازی مبلغ</button></div></> : <><p>رسید: {settlement.receiptReference || "—"}</p><p>{settlement.note}</p></>}
  </section>}
  </section>;
}
