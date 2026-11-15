import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Clock, MessageSquare, Plus, Save, Trash2, Settings2, Building2, Lightbulb, UserRound, Sun, ChevronRight, ChevronLeft, Maximize2, Minimize2, Focus, X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { apiJson } from "../utils/api";
import { confirmDialog } from "../utils/notify";
import "./FinalExams.css";

const fa = value => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(value);
const dateLabel = value => value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" }) : "—";
const rangeLabel = values => values ? `${fa(values[0])} تا ${fa(values[1])}` : "هنوز برآورد نشده";
const stages = ["study", "review", "practice"];
const example = "از درس ۱ دینی ۳ یک نمودار درختی آبی با برگ‌های سفید و پس‌زمینه طرح‌دار بساز؛ همهٔ بخش‌های درس را پوشش بده.";
const icons = { book: BookOpen, gears: Settings2, building: Building2, lamp: Lightbulb, person: UserRound, light: Sun };
const inkFor = color => {
  const rgb = color.slice(1).match(/.{2}/g).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .179 ? "#000000" : "#FFFFFF";
};
async function request(path, method = "GET", body) {
  const { response, data } = await apiJson(`/api/${path}`, { method, ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}) });
  if (!response.ok) throw new Error(data.error || "دریافت اطلاعات انجام نشد؛ دوباره تلاش کن.");
  return data;
}

function FlashcardDeck({ nodes }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { setIndex(0); setRevealed(false); }, [nodes]);
  const card = nodes[Math.min(index, nodes.length - 1)];
  const move = step => { setIndex(i => Math.max(0, Math.min(nodes.length - 1, i + step))); setRevealed(false); };
  return <div className="final-deck">
    <div className="final-deck-meta"><span>مرور درس</span><span>کارت {fa(index + 1)} از {fa(nodes.length)}</span></div>
    <progress aria-label="پیشرفت مرور کارت‌ها" value={index + 1} max={nodes.length} />
    <article className={`final-study-card${revealed ? " answered" : ""}`} aria-live="polite">
      <span className="final-card-label">سؤال</span><h4>{card.title}</h4>
      {revealed && <div className="final-card-answer"><span className="final-card-label">پاسخ</span><p>{card.body || "پاسخی ثبت نشده است."}</p></div>}
      <button className="final-primary" aria-expanded={revealed} onClick={() => setRevealed(!revealed)}>{revealed ? "پنهان کردن پاسخ" : "نمایش پاسخ"}</button>
    </article>
    <div className="final-deck-navigation"><button aria-label="کارت قبلی" disabled={index === 0} onClick={() => move(-1)}><ChevronRight size={18} /> قبلی</button><span>{fa(index + 1)} / {fa(nodes.length)}</span><button aria-label="کارت بعدی" disabled={index === nodes.length - 1} onClick={() => move(1)}>بعدی <ChevronLeft size={18} /></button></div>
  </div>;
}

function DiagramView({ nodes, kind }) {
  const scroll = useRef(null);
  const stage = useRef(null);
  const workspace = useRef(null);
  const drag = useRef(null);
  const root = nodes.find(n => !n.parent);
  const [selectedId, setSelectedId] = useState(root?.id);
  const [focusId, setFocusId] = useState(null);
  const [collapsed, setCollapsed] = useState(new Set());
  const [zoom, setZoom] = useState(.85);
  const [links, setLinks] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const selected = nodes.find(n => n.id === selectedId) || root;
  const viewRoot = nodes.find(n => n.id === focusId) || root;
  const children = new Map();
  nodes.forEach(n => children.set(n.parent, [...(children.get(n.parent) || []), n]));
  const fitDiagram = () => {
    if (stage.current?.offsetWidth && scroll.current?.clientWidth) setZoom(Math.max(.01, Math.min(1, (scroll.current.clientWidth - 16) / stage.current.offsetWidth, (scroll.current.clientHeight - 16) / stage.current.offsetHeight)));
  };
  useEffect(() => { setSelectedId(root?.id); setFocusId(null); setCollapsed(new Set()); }, [nodes, root?.id]);
  useEffect(() => {
    const onFullscreen = () => setFullscreen(window.document.fullscreenElement === workspace.current);
    window.document.addEventListener("fullscreenchange", onFullscreen);
    return () => window.document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);
  useLayoutEffect(() => {
    const diagram = stage.current, viewport = scroll.current;
    if (!diagram || !viewport) return;
    const measure = () => {
      const origin = diagram.getBoundingClientRect();
      const elements = new Map(Array.from(diagram.querySelectorAll("[data-map-node]"), el => [el.dataset.mapNode, el.getBoundingClientRect()]));
      const curves = nodes.flatMap(n => {
        const parent = elements.get(n.parent), child = elements.get(n.id);
        if (!parent || !child) return [];
        const left = child.left < parent.left;
        const x1 = ((left ? parent.left : parent.right) - origin.left) / zoom, y1 = (parent.top + parent.height / 2 - origin.top) / zoom;
        const x2 = ((left ? child.right : child.left) - origin.left) / zoom, y2 = (child.top + child.height / 2 - origin.top) / zoom;
        const bend = (x1 + x2) / 2;
        return [{ id: n.id, d: `M ${x1} ${y1} C ${bend} ${y1}, ${bend} ${y2}, ${x2} ${y2}` }];
      });
      setLinks(old => JSON.stringify(old) === JSON.stringify(curves) ? old : curves);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(diagram);
    const center = diagram.querySelector('[data-map-root="true"]')?.getBoundingClientRect();
    if (center) {
      const bounds = viewport.getBoundingClientRect();
      viewport.scrollLeft += center.left + center.width / 2 - bounds.left - bounds.width / 2;
      viewport.scrollTop += center.top + center.height / 2 - bounds.top - bounds.height / 2;
    }
    return () => observer?.disconnect();
  }, [nodes, kind, focusId, collapsed, zoom, fullscreen]);
  const toggle = id => setCollapsed(previous => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const nodeView = node => {
    const hasChildren = children.has(node.id), isRoot = node.id === viewRoot?.id, Icon = icons[node.icon];
    return <div className={`final-map-node final-role-${node.role || "concept"}${isRoot ? " final-map-root" : ""}${hasChildren ? " final-map-branch" : " final-map-leaf"}`} data-map-node={node.id} data-map-root={isRoot}>
      <button className="final-map-label" aria-label={node.title} aria-pressed={selected.id === node.id} onClick={() => setSelectedId(node.id)}>{Icon && <Icon size={16} aria-hidden="true" />}<span>{node.title}</span>{node.role === "conclusion" && <small>نتیجه</small>}</button>
      {hasChildren && <button className="final-map-toggle" aria-label={`${collapsed.has(node.id) ? "باز کردن" : "جمع کردن"} شاخهٔ ${node.title}`} aria-expanded={!collapsed.has(node.id)} onClick={() => toggle(node.id)}>{collapsed.has(node.id) ? <Plus size={12} /> : "−"}</button>}
    </div>;
  };
  const branch = (node, depth = 0) => <li key={node.id}>{nodeView(node)}{depth < 10 && !collapsed.has(node.id) && children.has(node.id) && <ul>{children.get(node.id).map(n => branch(n, depth + 1))}</ul>}</li>;
  const branches = collapsed.has(viewRoot?.id) ? [] : children.get(viewRoot?.id) || [];
  const toggleFullscreen = async () => {
    setFullscreenError("");
    try {
      if (fullscreen) await window.document.exitFullscreen();
      else await workspace.current.requestFullscreen();
    } catch { setFullscreenError("مرورگر اجازهٔ تمام‌صفحه نداد؛ از نمای کامل استفاده کن."); }
  };
  return <div ref={workspace} className={`final-diagram-workspace${fullscreen ? " is-fullscreen" : ""}`}>
    <div className="final-diagram-toolbar">
      <div className="final-diagram-controls"><button aria-label="کوچک‌تر کردن نمودار" disabled={zoom <= .01} onClick={() => setZoom(z => Math.max(.01, z - .15))}>−</button><span>{fa(Math.round(zoom * 100))}٪</span><button aria-label="بزرگ‌تر کردن نمودار" disabled={zoom >= 1.5} onClick={() => setZoom(z => Math.min(1.5, z + .15))}>+</button><button onClick={fitDiagram}>نمای کامل</button><button aria-label={fullscreen ? "خروج از تمام‌صفحه" : "نمایش تمام‌صفحه"} onClick={toggleFullscreen}>{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button></div>
      {focusId ? <button onClick={() => { setFocusId(null); setCollapsed(new Set()); }}>همهٔ شاخه‌ها <X size={14} /></button> : <span className="final-diagram-hint">شاخه را انتخاب کن؛ بوم را بکش.</span>}
    </div>
    {fullscreenError && <p role="status">{fullscreenError}</p>}
    <div className="final-diagram-layout">
      <div ref={scroll} className="final-diagram-scroll" dir="ltr" role="region" aria-label={kind === "tree" ? "نمودار درختی" : "نقشهٔ ذهنی"} tabIndex={0}
        onPointerDown={e => { if (e.button !== 0 || e.target.closest("button")) return; drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, left: e.currentTarget.scrollLeft, top: e.currentTarget.scrollTop }; e.currentTarget.setPointerCapture?.(e.pointerId); }}
        onPointerMove={e => { const start = drag.current; if (start?.id === e.pointerId) { e.currentTarget.scrollLeft = start.left - e.clientX + start.x; e.currentTarget.scrollTop = start.top - e.clientY + start.y; } }}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
        <div ref={stage} className="final-diagram-stage" style={{ zoom }}>
          <svg className="final-diagram-links" aria-hidden="true">{links.map(link => <path key={link.id} d={link.d} className={selectedId === link.id ? "is-selected" : ""} />)}</svg>
          {kind === "tree" ? <ul className="final-diagram-tree final-map-side final-map-left">{viewRoot && branch(viewRoot)}</ul> : viewRoot && <div className="final-diagram-mindmap">
            <ul className="final-map-side final-map-left">{branches.filter((_, i) => i % 2 === 0).map(n => branch(n))}</ul>{nodeView(viewRoot)}<ul className="final-map-side final-map-right">{branches.filter((_, i) => i % 2 !== 0).map(n => branch(n))}</ul>
          </div>}
        </div>
      </div>
      {selected && <aside className="final-diagram-detail" aria-label="توضیح شاخه" aria-live="polite">
        <span className="final-detail-label">{selected.role === "conclusion" ? "نتیجه" : "توضیح شاخه"}</span><h4>{selected.title}</h4><p>{selected.body || "برای دیدن جزئیات، یکی از زیرشاخه‌ها را انتخاب کن."}</p>
        {selected.parent && <button onClick={() => setSelectedId(selected.parent)}><ChevronRight size={14} /> شاخهٔ بالاتر</button>}
        {children.has(selected.id) && <button onClick={() => { setFocusId(selected.id); setCollapsed(new Set()); }}><Focus size={16} /> تمرکز روی این شاخه</button>}
      </aside>}
    </div>
  </div>;
}

function DocumentView({ document, kind }) {
  const nodes = document.nodes;
  const style = { nodeBackground: "#FFFFFF", accent: "#3A8778", pattern: "none", density: "comfortable", ...document.style };
  const content = node => { const Icon = icons[node.icon]; return <><strong>{Icon && <Icon size={18} aria-hidden="true" />}{node.title}</strong>{node.body && <p>{node.body}</p>}</>; };
  return <div className={`final-document final-document-${kind} final-pattern-${style.pattern} final-density-${style.density}`} style={{ backgroundColor: document.background, color: inkFor(document.background), "--doc-background": document.background, "--doc-node": style.nodeBackground, "--doc-ink": inkFor(style.nodeBackground), "--doc-accent": style.accent, "--doc-accent-ink": inkFor(style.accent) }}>
    <h3>{document.title}</h3>
    {kind === "tree" || kind === "mindmap" ? <DiagramView nodes={nodes} kind={kind} /> : kind === "flashcards" ? <FlashcardDeck nodes={nodes} />
      : kind === "comparison" ? <div className="final-table-scroll"><table><thead><tr><th>موضوع</th><th>توضیح</th></tr></thead><tbody>{nodes.map(n => <tr key={n.id}><th>{n.title}</th><td>{n.body}</td></tr>)}</tbody></table></div>
      : nodes.map(n => <section className={`final-node final-role-${n.role || "concept"}`} key={n.id}>{content(n)}</section>)}
  </div>;
}

function ArtifactEditor({ artifact, kinds, busy, onSave, onDelete, onTutor }) {
  const [document, setDocument] = useState(artifact.document);
  const [editing, setEditing] = useState(false);
  const hierarchical = ["tree", "mindmap"].includes(artifact.kind);
  const update = (id, field, value) => setDocument(d => ({ ...d, nodes: d.nodes.map(n => n.id === id ? { ...n, [field]: value } : n) }));
  const restyle = (field, value) => setDocument(d => ({ ...d, style: { nodeBackground: "#FFFFFF", accent: "#3A8778", pattern: "none", density: "comfortable", ...d.style, [field]: value } }));
  const remove = node => setDocument(d => ({ ...d, nodes: d.nodes.filter(n => n.id !== node.id).map(n => n.parent === node.id ? { ...n, parent: node.parent } : n) }));
  const add = () => setDocument(d => ({ ...d, nodes: [...d.nodes, { id: `n-${Date.now()}`, parent: hierarchical ? d.nodes.find(n => !n.parent)?.id : null, title: "بخش تازه", body: "" }] }));
  return <section className="final-panel final-editor">
    <div className="final-section-head"><div><h2>{kinds[artifact.kind]}</h2><span className="final-muted">ذخیره‌شده در {dateLabel(artifact.createdAt)}</span></div>
      <div className="final-actions"><button disabled={busy} onClick={() => setEditing(!editing)}>{editing ? "نمایش خروجی" : "ویرایش متن و ظاهر"}</button><button aria-label="حذف خروجی" disabled={busy} onClick={onDelete}><Trash2 size={16} /></button></div>
    </div>
    {artifact.sourceChanged && <p role="status">متن درس پس از ساخت این خروجی تغییر کرده است؛ این نسخه از متن قبلی ساخته شده.</p>}
    <DocumentView document={document} kind={artifact.kind} />
    {editing && <div className="final-edit-fields">
      <label>عنوان خروجی<input value={document.title} maxLength={300} onChange={e => setDocument({ ...document, title: e.target.value })} /></label>
      <label>پس‌زمینه<input type="color" value={document.background} onInput={e => setDocument({ ...document, background: e.target.value })} onChange={e => setDocument({ ...document, background: e.target.value })} /></label>
      <div className="final-style-fields"><label>رنگ کادرها<input type="color" value={document.style?.nodeBackground || "#FFFFFF"} onChange={e => restyle("nodeBackground", e.target.value)} /></label><label>رنگ تأکید<input type="color" value={document.style?.accent || "#3A8778"} onChange={e => restyle("accent", e.target.value)} /></label><label>طرح پس‌زمینه<select value={document.style?.pattern || "none"} onChange={e => restyle("pattern", e.target.value)}>{[["none", "ساده"], ["dots", "نقطه‌ای"], ["grid", "شبکه‌ای"], ["waves", "موجی"]].map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label><label>فاصلهٔ بخش‌ها<select value={document.style?.density || "comfortable"} onChange={e => restyle("density", e.target.value)}><option value="comfortable">باز</option><option value="compact">فشرده</option></select></label></div>
      {document.nodes.map(n => <fieldset key={n.id} className="final-node-edit"><legend>{n.title || "بخش"}</legend>
        <label>عنوان<input value={n.title} maxLength={300} onChange={e => update(n.id, "title", e.target.value)} /></label>
        <label>{artifact.kind === "flashcards" ? "پاسخ" : "متن"}<textarea value={n.body} maxLength={12000} onChange={e => update(n.id, "body", e.target.value)} /></label>
        {hierarchical && n.parent && <label>شاخهٔ بالاتر<select value={n.parent} onChange={e => update(n.id, "parent", e.target.value)}>{document.nodes.filter(p => p.id !== n.id).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>}
        <button disabled={busy || document.nodes.length === 1 || (hierarchical && !n.parent)} onClick={() => remove(n)}>حذف بخش</button>
      </fieldset>)}
      <div className="final-actions"><button onClick={add} disabled={busy || document.nodes.length >= 120}><Plus size={16} /> افزودن بخش</button>
        <button className="final-primary" disabled={busy} onClick={async () => { if (await onSave(document)) setEditing(false); }}><Save size={16} /> ذخیرهٔ تغییرات</button></div>
    </div>}
    <div className="final-actions"><button disabled={busy} onClick={onTutor}><MessageSquare size={16} /> پرسیدن از مربی هوشمند</button></div>
  </section>;
}

export default function FinalExams() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("roadmap");
  const [hours, setHours] = useState(1);
  const [roadmap, setRoadmap] = useState(null);
  const [instruction, setInstruction] = useState("");
  const [artifacts, setArtifacts] = useState([]);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const cards = catalog?.subjects.flatMap(s => s.lessons.filter(l => l.hasContent).map(l => ({ ...l, subject: s.name }))) || [];
  const totals = catalog?.subjects.length && catalog.subjects.every(s => stages.every(stage => s.estimate[stage]?.length === 2))
    ? stages.map(stage => [0, 1].map(i => catalog.subjects.reduce((sum, s) => sum + s.estimate[stage][i], 0))) : null;
  const requiredHours = totals ? [0, 1].map(i => totals.reduce((sum, interval) => sum + interval[i], 0)) : null;
  const capacity = roadmap?.current.hoursToKhordad;

  useEffect(() => {
    let active = true;
    Promise.all([request("final/catalog"), request("final/roadmaps"), request("final/artifacts")]).then(([c, r, a]) => {
      if (!active) return;
      setCatalog(c); setHours(c.dailyMinutes / 60); setArtifacts(a.artifacts.filter(item => item.kind !== "exam_notes"));
      const latest = r.history.find(p => p.snapshot.grade === c.grade && p.snapshot.major === c.major);
      if (latest) setRoadmap(latest.snapshot);
    }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function run(action) {
    if (busy) return;
    setBusy(true); setError(""); setStatus("");
    try { await action(); return true; }
    catch (e) { setError(e.message || "ارتباط با سرور برقرار نشد."); return false; }
    finally { setBusy(false); }
  }

  const saveRoadmap = event => {
    event.preventDefault();
    run(async () => {
      const data = await request("final/roadmaps", "POST", { dailyMinutes: Math.round(Number(hours) * 60) });
      setRoadmap(data.snapshot); setStatus("برآورد ذخیره شد.");
    });
  };
  const generate = event => {
    event.preventDefault();
    run(async () => {
      const data = await request("final/artifacts", "POST", { request: instruction });
      setArtifacts(items => [data.artifact, ...items]); setActiveArtifact(data.artifact); setStatus("خروجی ساخته و ذخیره شد.");
    });
  };
  const saveArtifact = document => run(async () => {
    const data = await request(`final/artifacts/${activeArtifact.id}`, "PATCH", { revision: activeArtifact.revision, document });
    setActiveArtifact(data.artifact); setArtifacts(items => items.map(a => a.id === data.artifact.id ? data.artifact : a)); setStatus("تغییرات ذخیره شد.");
  });
  const deleteArtifact = async () => {
    if (!await confirmDialog("این خروجی حذف شود؟", { confirmText: "حذف", danger: true })) return;
    run(async () => { await request(`final/artifacts/${activeArtifact.id}`, "DELETE"); setArtifacts(items => items.filter(a => a.id !== activeArtifact.id)); setActiveArtifact(null); });
  };
  const openTutor = id => run(async () => { const data = await request("tutor/sessions", "POST", { finalLessonId: id }); navigate(`/tutor?session=${data.session.id}`); });

  if (loading) return <main className="final-exams" aria-busy="true"><p>در حال دریافت بخش نهایی…</p></main>;
  if (!catalog) return <main className="final-exams"><p role="alert">{error}</p><button onClick={() => window.location.reload()}>تلاش دوباره</button></main>;
  return <main className="final-exams">
    <Helmet><title>امتحان نهایی | منتورا</title></Helmet>
    <header className="final-page-head"><div><h1>امتحان نهایی</h1><p>{catalog.grade} · {catalog.major} · دروس عمومی</p></div><BookOpen size={28} aria-hidden="true" /></header>
    <nav className="final-tabs" aria-label="بخش‌های امتحان نهایی">{[["roadmap", "مسیر مطالعه"], ["lessons", "تولید محتوای درسی"], ["practice", "تمرین تشریحی"]].map(([id, title]) => <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => { setTab(id); setStatus(""); setError(""); }}>{title}</button>)}</nav>
    {error && <p className="final-notice" role="alert">{error}</p>}
    {status && <p className="final-notice" role="status">{status}</p>}
    {!catalog.subjects.length ? <section className="final-panel"><h2>پروفایل را تکمیل کن</h2><p>برای نمایش کتاب‌ها، پایه و رشته باید مشخص باشند.</p><Link to="/profile">ویرایش پروفایل</Link></section>
      : tab === "practice" ? <section className="final-panel final-empty"><BookOpen size={28} /><h2>تمرین تشریحی</h2><p>در حال توسعه</p></section>
      : tab === "roadmap" ? <>
        <section className="final-panel final-capacity"><h2>تا خرداد چقدر وقت داری؟</h2>
          <form onSubmit={saveRoadmap}><label>ساعت مطالعهٔ روزانه<input required type="number" min="0.25" max="8" step="0.25" value={hours} onChange={e => setHours(e.target.value)} /></label><button className="final-primary" disabled={busy}><Clock size={16} /> محاسبه و ذخیره</button></form>
        </section>
        {roadmap && <>
          <section className="final-panel"><div className="final-section-head"><h2>ظرفیت مطالعه</h2><span className="final-muted">محاسبه‌شده در {dateLabel(roadmap.asOf)}</span></div>
            <p className="final-muted">هدف: {dateLabel(roadmap.targetDate)}، شروع خرداد. این تاریخ برنامهٔ رسمی امتحان نیست.</p>
            <div className="final-scenarios"><div className="final-scenario"><h3>با زمان انتخابی</h3><p>روزی {fa(roadmap.current.dailyMinutes)} دقیقه</p><dl><div><dt>تا عید</dt><dd>{fa(roadmap.current.hoursToEid)} ساعت</dd></div><div><dt>تا خرداد</dt><dd>{fa(capacity)} ساعت</dd></div></dl>{roadmap.current.studyCompletion && <p>پایان دور اول: {dateLabel(roadmap.current.studyCompletion[0])} تا {dateLabel(roadmap.current.studyCompletion[1])}</p>}</div>
              {requiredHours && <div className="final-time-comparison" aria-label="مقایسهٔ زمان مطالعه"><h3>تحلیل زمان تو</h3>
                <p>با روزی {fa(roadmap.current.dailyMinutes)} دقیقه، تا خرداد {fa(capacity)} ساعت فرصت داری؛ زمان موردنیاز {rangeLabel(requiredHours)} ساعت است.</p>
                {capacity < requiredHours[0] ? <p>کمبود نسبت به حداقل تخمین: {fa(requiredHours[0] - capacity)} ساعت.</p>
                  : capacity < requiredHours[1] ? <p>ظرفیتت در بازهٔ تخمین است؛ تا سقف تخمین {fa(requiredHours[1] - capacity)} ساعت فاصله داری.</p>
                    : <p>زمانت کل بازهٔ تخمین را پوشش می‌دهد؛ {fa(capacity - requiredHours[1])} ساعت برای مرور بیشتر باقی می‌ماند.</p>}
                {capacity < requiredHours[1] && roadmap.daysRemaining > 0 && <p>برای پوشش سقف تخمین تا خرداد، حدود روزی {fa(Math.ceil(requiredHours[1] * 60 / roadmap.daysRemaining))} دقیقه زمان بگذار.</p>}
              </div>}
            </div>
            <ul className="final-recommendations">{roadmap.recommendations.filter(r => !/^(زمان‌ها بر پایهٔ مطالعهٔ هر روز|ظرفیت زمانی محاسبه شد|این محاسبه فرض می‌کند)/.test(r)).map(r => <li key={r}>{r.replace("سناریوی نیم ساعت بیشتر را مقایسه کن و ", "")}</li>)}</ul>
          </section>
        </>}
        <section className="final-panel"><h2>برآورد زمان درس‌ها</h2><p className="final-muted">تخمین حدودی بر اساس توصیه‌های مشاوران</p>
          <div className="final-table-scroll"><table className="final-estimate-table"><thead><tr><th>درس</th><th>دور اول</th><th>مرور</th><th>تمرین</th></tr></thead>
            <tbody>{catalog.subjects.map(s => <tr key={s.key}><th scope="row">{s.name}</th>{stages.map(stage => <td key={stage}>{s.estimate[stage] ? `${rangeLabel(s.estimate[stage])} ساعت` : "—"}</td>)}</tr>)}</tbody>
            <tfoot><tr><th scope="row">مجموع</th>{stages.map((stage, i) => <td key={stage}>{totals ? `${rangeLabel(totals[i])} ساعت` : "—"}</td>)}</tr>{requiredHours && <tr><th scope="row">مجموع هر سه مرحله</th><td colSpan={3}>{rangeLabel(requiredHours)} ساعت</td></tr>}</tfoot>
          </table></div>
        </section>
      </> : <>
        <section className="final-panel final-compose"><h2>چه چیزی برایت بسازیم؟</h2><p className="final-muted">درس، نوع خروجی و ظاهر دلخواهت را بنویس.</p>
          <form onSubmit={generate}><label>درخواست تو<textarea required rows={4} placeholder={example} maxLength={4000} value={instruction} onChange={e => setInstruction(e.target.value)} /></label><div className="final-actions"><button className="final-primary" disabled={busy || !instruction.trim() || !cards.length}>{busy ? "در حال انتخاب محتوا و ساخت خروجی…" : "ساخت و ذخیرهٔ خروجی"}</button>{cards.some(c => c.source?.isSample) && <button type="button" disabled={busy} onClick={() => setInstruction(example)}>امتحان با نمونهٔ دینی ۳</button>}</div></form>
          <div className="final-formats">{Object.entries(catalog.kinds).filter(([kind]) => kind !== "exam_notes").map(([kind, label]) => <span key={kind}>{label}</span>)}</div><p className="final-muted final-quota-note">هر ساخت موفق یک پیام از سهمیهٔ AI مصرف می‌کند؛ ویرایش متن و ظاهر رایگان است.</p>{!cards.length && <p>محتوای این پایه هنوز آماده نشده است.</p>}
        </section>
        {artifacts.length > 0 && <section className="final-panel"><h2>خروجی‌های ذخیره‌شده</h2><div className="final-history">{artifacts.map(a => <button key={a.id} disabled={busy} aria-pressed={activeArtifact?.id === a.id} onClick={() => setActiveArtifact(a)}>{a.document.title} · {catalog.kinds[a.kind]}</button>)}</div></section>}
        {activeArtifact && <ArtifactEditor key={`${activeArtifact.id}-${activeArtifact.revision}`} artifact={activeArtifact} kinds={catalog.kinds} busy={busy} onSave={saveArtifact} onDelete={deleteArtifact} onTutor={() => openTutor(activeArtifact.lessonId)} />}
      </>}
  </main>;
}
