import React, { useState } from "react";

const phases = {
  connect_tcp: "اتصال TCP و یافتن مقصد",
  start_tls: "مذاکرهٔ TLS",
  send_request_headers: "ارسال سرآیند درخواست",
  send_request_body: "نوشتن بدنه در سوکت",
  receive_response_headers: "دریافت سرآیند پاسخ",
  receive_response_body: "دریافت بدنهٔ پاسخ",
  response_closed: "بستن پاسخ",
  close: "بستن اتصال",
};
const checkNames = { get: "دسترسی به سرویس", small_post: "ارسال کوچک", large_post: "ارسال حدود ۹ کیلوبایت", model: "درخواست واقعی مدل" };
const states = { started: "شروع", complete: "پایان", failed: "شکست" };

function phaseName(value = "") {
  const parts = value.split(".");
  return phases[parts[1]] || value || "ثبت نشده";
}

export function TransportDetails({ trace }) {
  if (!trace) return null;
  return (
    <details className="mt-2 text-dark" open={Boolean(trace.failedPhase)}>
      <summary className="small fw-bold">جزئیات اتصال {trace.requestId && <code className="text-break">{trace.requestId}</code>}</summary>
      <div className="small mt-2 d-flex flex-wrap gap-3">
        <span>بدنه: {trace.requestBytes ?? "نامشخص"} بایت</span>
        <span>زمان: {trace.elapsedMs ?? "نامشخص"} ms</span>
        <span>HTTP: {trace.httpStatus ?? "بدون پاسخ"} {trace.httpVersion || ""}</span>
        {trace.tlsVersion && <span>TLS: {trace.tlsVersion}</span>}
        {trace.cfRay && <span>CF-Ray: <code>{trace.cfRay}</code></span>}
      </div>
      {trace.failedPhase && <p className="small text-danger mt-2 mb-1">مرحلهٔ شکست: {phaseName(trace.failedPhase)}</p>}
      <ol className="small mt-2 ps-0" style={{ listStyle: "none", borderInlineStart: "2px solid #2E7F81", paddingInlineStart: "1rem" }}>
        {(trace.events || []).map((event, index) => {
          const state = event.name.split(".").pop();
          return <li key={index} className={`py-1 ${state === "failed" ? "text-danger fw-bold" : "text-secondary"}`}>
            {phaseName(event.name)} · {states[state] || state}
            <span className="d-inline-block ms-2" dir="ltr">{event.elapsedMs} ms{event.durationMs != null ? ` / ${event.durationMs} ms` : ""}</span>
          </li>;
        })}
      </ol>
      {(trace.events || []).some(event => event.name.includes("send_request_body")) && <p className="small text-secondary">پایان نوشتن در سوکت به‌معنی رسیدن به مقصد نیست.</p>}
      {(trace.exceptionChain || []).map((item, index) => <div className="small text-danger text-break" key={index}><code>{item.type}</code>: {item.message}</div>)}
      <details className="small mt-2"><summary>دادهٔ فنی پاک‌سازی‌شده</summary><pre dir="ltr" className="p-2 bg-light border rounded mt-2" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(trace, null, 2)}</pre></details>
    </details>
  );
}

export default function ProviderDiagnostics({ runtime, reports = [], onRun }) {
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async mode => {
    if (busy) return;
    if (mode === "model" && !window.confirm("یک درخواست واقعی کوتاه با کلید و مدل فعلی ارسال می‌شود و ممکن است هزینهٔ اندکی داشته باشد. اجرا شود؟")) return;
    setBusy(true);
    setError("");
    try { setReport(await onRun(mode)); }
    catch (err) { setError(err.message || "تست اجرا نشد."); }
    finally { setBusy(false); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `mentora-diagnostic-${report.requestId}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const fields = runtime ? [
    ["مدل در حال استفاده", runtime.model], ["شناسهٔ پردازش", runtime.pid],
    ["ارائه‌دهنده", runtime.provider], ["تصاویر منابع درسی", runtime.sourceImagesEnabled == null ? "نامشخص" : runtime.sourceImagesEnabled ? "فعال" : "غیرفعال"],
    ["مسیر اجرای سرویس", runtime.workingDirectory], ["مسیر کد", runtime.codeDirectory],
    ["کامیت زمان بارگذاری", runtime.commit], ["کامیت فعلی روی دیسک", runtime.diskCommit], ["مقصد اتصال", runtime.origin],
    ["بارگذاری تنظیمات", runtime.loadedAt], ["تلاش مجدد", runtime.maxRetries],
    ["Python", runtime.python], ["TLS کتابخانه", runtime.openssl],
    ["متغیرهای پراکسی تنظیم‌شده", (runtime.proxyVariablesSet || []).join(", ") || "هیچ‌کدام"],
    ...Object.entries(runtime.versions || {}),
  ] : [];
  return (
    <section className="bg-white border rounded-3 p-3 p-md-4 mt-4" aria-label="تشخیص اتصال مدل">
      <h2 className="h5 fw-bold" style={{ color: "#256A6C" }}>تشخیص اتصال مدل</h2>
      <p className="small text-secondary">تست‌ها از خود سرور اجرا می‌شوند. تست اتصال بدون کلید و بدون فراخوانی مدل است.</p>
      <details className="mb-3"><summary className="fw-bold small">تنظیمات واقعی سرویس</summary>
        <dl className="row small mt-3 mb-0">{fields.map(([label, value]) => <div className="col-12 col-md-6 mb-2" key={label}>
          <dt className="text-secondary fw-normal">{label}</dt><dd className="mb-0 text-break" style={{ fontFamily: "monospace" }} dir="auto">{value ?? "نامشخص"}</dd>
        </div>)}</dl>
      </details>
      <div className="d-flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm text-white" style={{ background: "#256A6C" }} disabled={busy} onClick={() => run("transport")}>تست اتصال بدون مصرف مدل</button>
        <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => run("model")}>تست واقعی مدل</button>
        {report && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={download}>دانلود گزارش</button>}
      </div>
      {busy && <p className="small mt-3 mb-0" role="status">تست در حال اجراست؛ ممکن است حدود یک دقیقه طول بکشد.</p>}
      {error && <p className="text-danger small mt-3" role="alert">{error}</p>}
      <div aria-live="polite">
        {report && <div className="mt-3">
          <div className="small text-secondary mb-2">شناسهٔ گزارش: <code>{report.requestId}</code></div>
          {(report.checks || []).map(check => <div key={check.name} className="border rounded-3 p-3 mb-2" style={{ borderInlineStart: `4px solid ${check.status === "success" ? "#256A6C" : "#a4161a"}` }}>
            <strong className="small">{checkNames[check.name] || check.name} · {check.status === "success" ? "موفق" : check.status === "unexpected_response" ? "پاسخ غیرمنتظره" : "ناموفق"}</strong>
            {check.errorType && <p className="small text-danger mt-2 mb-0"><code>{check.errorType}</code></p>}
            {check.errorMessage && <p className="small text-danger text-break mb-0">{check.errorMessage}</p>}
            <TransportDetails trace={check} />
          </div>)}
        </div>}
      </div>
      {reports.some(item => item.metadata?.checks) && <details className="small mt-3"><summary>تست‌های ذخیره‌شده</summary>
        <div className="d-flex flex-column gap-2 mt-2">{reports.filter(item => item.metadata?.checks).map(item => <button key={item.id} type="button" className="btn btn-sm btn-light text-break text-start border" disabled={busy} onClick={() => setReport(item.metadata)}>
          {item.metadata.mode === "model" ? "مدل" : "اتصال"} · {new Date(item.createdAt).toLocaleString("fa-IR")} · {item.metadata.requestId}
        </button>)}</div>
      </details>}
    </section>
  );
}
