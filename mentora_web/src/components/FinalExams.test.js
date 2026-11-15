import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import FinalExams from "./FinalExams";
import { apiJson } from "../utils/api";

jest.mock("../utils/api", () => ({ apiJson: jest.fn() }));
const artifact = { id: 1, lessonId: 1, revision: 1, kind: "tree", createdAt: "2026-09-26", document: { title: "مستند", background: "#E7F1EE", nodes: [{ id: "root", parent: null, title: "ریشه", body: "متن" }] } };
const removedCopy = ["زمان‌ها بر پایهٔ مطالعهٔ هر روز از امروز و شروع از صفر محاسبه شده‌اند؛ زمان واقعی افراد متفاوت است.", "ظرفیت زمانی محاسبه شد؛ زمان پایان درس‌ها پس از ثبت برآورد ساعتِ همهٔ درس‌ها مشخص می‌شود.", "این محاسبه فرض می‌کند هر روز همین زمان را اختصاص بدهی."];
beforeEach(() => {
  apiJson.mockClear();
  apiJson.mockImplementation(async (path, options = {}) => {
    let data;
    if (path === "/api/final/catalog") data = { grade: "دوازدهم", major: "تجربی", dailyMinutes: 60, kinds: { tree: "نمودار درختی" }, subjects: [{ key: "dini-12", name: "دین و زندگی", estimate: {}, lessons: [{ id: 1, number: 1, title: "درس تست", hasContent: true, source: { isSample: true } }] }] };
    else if (path === "/api/final/roadmaps") data = { history: [] };
    else if (options.method === "PATCH") data = { artifact: { ...artifact, revision: 2, document: JSON.parse(options.body).document } };
    else if (options.method === "POST") data = { artifact: { ...artifact, id: 2 } };
    else data = { artifacts: [artifact] };
    return { response: { ok: true }, data };
  });
});
function mount() { return render(<HelmetProvider><MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><FinalExams /></MemoryRouter></HelmetProvider>); }

test("written practice is explicitly in development and does not call practice APIs", async () => {
  mount();
  fireEvent.click(await screen.findByRole("button", { name: "تمرین تشریحی" }));
  expect(screen.getByText("در حال توسعه")).toBeInTheDocument();
  expect(apiJson.mock.calls.some(([path]) => path.includes("practices"))).toBe(false);
});

test("natural request is submitted directly without a manual card or type selection", async () => {
  mount();
  fireEvent.click(await screen.findByRole("button", { name: "تولید محتوای درسی" }));
  fireEvent.click(screen.getByRole("button", { name: "امتحان با نمونهٔ دینی ۳" }));
  fireEvent.click(screen.getByRole("button", { name: "ساخت و ذخیرهٔ خروجی" }));
  expect(await screen.findByRole("status")).toHaveTextContent("خروجی ساخته و ذخیره شد");
  expect(apiJson).toHaveBeenCalledWith("/api/final/artifacts", expect.objectContaining({ method: "POST", body: expect.stringContaining('"request":') }));
});

test("color preview and save do not make another AI request", async () => {
  const { container } = mount();
  fireEvent.click(await screen.findByRole("button", { name: "تولید محتوای درسی" }));
  fireEvent.click(screen.getByRole("button", { name: "مستند · نمودار درختی" }));
  fireEvent.click(screen.getByRole("button", { name: "ویرایش متن و ظاهر" }));
  fireEvent.input(container.querySelector(".final-edit-fields input[type=color]"), { target: { value: "#cfe8ff" } });
  expect(container.querySelector(".final-document")).toHaveStyle({ backgroundColor: "#cfe8ff" });
  fireEvent.click(screen.getByRole("button", { name: "ذخیرهٔ تغییرات" }));
  expect(await screen.findByRole("status")).toHaveTextContent("تغییرات ذخیره شد");
  expect(apiJson).toHaveBeenCalledWith("/api/final/artifacts/1", expect.objectContaining({ method: "PATCH", body: expect.stringContaining('"background":"#cfe8ff"') }));
  expect(apiJson.mock.calls.some(([path, options]) => path === "/api/final/artifacts" && options?.method === "POST")).toBe(false);
});

test.each([
  [0.5, "کمبود نسبت به حداقل تخمین: ۳ ساعت.", true],
  [0.75, "ظرفیتت در بازهٔ تخمین است؛ تا سقف تخمین ۱۶ ساعت فاصله داری.", true],
  [1.5, "زمانت کل بازهٔ تخمین را پوشش می‌دهد؛ ۱۴ ساعت برای مرور بیشتر باقی می‌ماند.", false],
])("totals and saved daily capacity comparison for %s hours", async (hours, comparison, needsMore) => {
  const previous = apiJson.getMockImplementation();
  apiJson.mockImplementation(async (path, options = {}) => {
    if (path === "/api/final/catalog") return { response: { ok: true }, data: {
      grade: "دوازدهم", major: "تجربی", dailyMinutes: 60, kinds: {}, subjects: [
        { key: "a", name: "فارسی", lessons: [], estimate: { study: [10, 20], review: [2, 4], practice: [3, 6], basis: "نمرهٔ ۲۰ تضمین نمی‌شود" } },
        { key: "b", name: "دینی", lessons: [], estimate: { study: [5, 10], review: [1, 2], practice: [2, 4] } },
      ],
    } };
    if (path === "/api/final/roadmaps" && options.method === "POST") {
      const dailyMinutes = JSON.parse(options.body).dailyMinutes;
      const scenario = { dailyMinutes, hoursToEid: 0, hoursToKhordad: dailyMinutes * 40 / 60, shortfallHours: 0 };
      return { response: { ok: true }, data: { snapshot: { asOf: "2026-09-26", targetDate: "2027-05-22", daysRemaining: 40, current: scenario, moreTime: { ...scenario, dailyMinutes: dailyMinutes + 30 }, recommendations: removedCopy } } };
    }
    return previous(path, options);
  });
  const { container } = mount();
  await screen.findByRole("heading", { name: "برآورد زمان درس‌ها" });
  expect(screen.queryByText(/تضمین|مبنای تخمین/)).not.toBeInTheDocument();
  expect(screen.getAllByRole("columnheader")).toHaveLength(4);
  const rows = container.querySelector("tfoot").rows;
  expect(Array.from(rows[0].cells, c => c.textContent)).toEqual(["مجموع", "۱۵ تا ۳۰ ساعت", "۳ تا ۶ ساعت", "۵ تا ۱۰ ساعت"]);
  expect(rows[1]).toHaveTextContent("۲۳ تا ۴۶ ساعت");
  fireEvent.change(screen.getByLabelText("ساعت مطالعهٔ روزانه"), { target: { value: hours } });
  fireEvent.click(screen.getByRole("button", { name: "محاسبه و ذخیره" }));
  expect(await screen.findByText(comparison)).toBeInTheDocument();
  expect(!!screen.queryByText(/حدود روزی ۶۹ دقیقه/)).toBe(needsMore);
  expect(screen.queryByText("با نیم ساعت بیشتر")).not.toBeInTheDocument();
  expect(container.querySelector(".final-time-comparison").closest("section")).toHaveTextContent("ظرفیت مطالعه");
  removedCopy.forEach(text => expect(screen.queryByText(text)).not.toBeInTheDocument());
});

test.each(["tree", "mindmap"])("%s has its own connected diagram instead of a card grid", async kind => {
  const previous = apiJson.getMockImplementation();
  apiJson.mockImplementation((path, options) => path === "/api/final/artifacts" ? Promise.resolve({ response: { ok: true }, data: { artifacts: [{ ...artifact, kind, document: { ...artifact.document, nodes: [...artifact.document.nodes, { id: "child", parent: "root", title: "شاخه", body: "توضیح شاخه" }] } }] } }) : previous(path, options));
  const { container } = mount();
  fireEvent.click(await screen.findByRole("button", { name: "تولید محتوای درسی" }));
  fireEvent.click(screen.getByRole("button", { name: /مستند ·/ }));
  expect(container.querySelector(`.final-diagram-${kind}`)).toBeInTheDocument();
  expect(container.querySelector(".final-diagram-scroll")).toHaveAttribute("tabindex", "0");
  expect(screen.getByText("شاخه")).toBeInTheDocument();
  expect(screen.queryByText(/محتوای مرجع|درس مرجع|توتر/)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "پرسیدن از مربی هوشمند" })).toBeInTheDocument();
});

test("flashcard deck reveals answers and hides them again when moving cards", async () => {
  const previous = apiJson.getMockImplementation();
  apiJson.mockImplementation((path, options) => path === "/api/final/artifacts" ? Promise.resolve({ response: { ok: true }, data: { artifacts: [{ ...artifact, kind: "flashcards", document: { ...artifact.document, nodes: [
    { id: "one", parent: null, title: "سؤال اول", body: "پاسخ اول" }, { id: "two", parent: null, title: "سؤال دوم", body: "پاسخ دوم" },
  ] } }] } }) : previous(path, options));
  mount();
  fireEvent.click(await screen.findByRole("button", { name: "تولید محتوای درسی" }));
  fireEvent.click(screen.getByRole("button", { name: /مستند ·/ }));
  expect(screen.queryByText("پاسخ اول")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "نمایش پاسخ" }));
  expect(screen.getByText("پاسخ اول")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "کارت بعدی" }));
  expect(screen.getByText("سؤال دوم")).toBeInTheDocument();
  expect(screen.queryByText("پاسخ دوم")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "کارت بعدی" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "کارت قبلی" }));
  expect(screen.queryByText("پاسخ اول")).not.toBeInTheDocument();
});

test("missing estimates do not produce misleading totals", async () => {
  const { container } = mount();
  await screen.findByRole("heading", { name: "برآورد زمان درس‌ها" });
  expect(container.querySelector("tfoot")).toHaveTextContent("مجموع———");
  expect(screen.queryByText("مجموع هر سه مرحله")).not.toBeInTheDocument();
});

test("latest saved roadmap still loads without showing history or old boilerplate", async () => {
  const previous = apiJson.getMockImplementation();
  apiJson.mockImplementation((path, options) => path === "/api/final/roadmaps" ? Promise.resolve({ response: { ok: true }, data: { history: [{ id: 1, createdAt: "2026-09-26", snapshot: {
    grade: "دوازدهم", major: "تجربی", asOf: "2026-09-26", targetDate: "2027-05-22", current: { dailyMinutes: 60, hoursToEid: 100, hoursToKhordad: 238 }, recommendations: [...removedCopy, "برای مرور وقت نگه دار."],
  } }] } }) : previous(path, options));
  mount();
  expect(await screen.findByRole("heading", { name: "ظرفیت مطالعه" })).toBeInTheDocument();
  expect(screen.getByText("۲۳۸ ساعت")).toBeInTheDocument();
  expect(screen.getByText("برای مرور وقت نگه دار.")).toBeInTheDocument();
  removedCopy.forEach(text => expect(screen.queryByText(text)).not.toBeInTheDocument());
  expect(screen.queryByText("برآوردهای ذخیره‌شده")).not.toBeInTheDocument();
});

test.each(["tree", "mindmap"])("%s selects details, collapses branches and focuses without changing saved content", async kind => {
  const previous = apiJson.getMockImplementation();
  apiJson.mockImplementation((path, options) => path === "/api/final/artifacts" ? Promise.resolve({ response: { ok: true }, data: { artifacts: [{ ...artifact, kind, document: { ...artifact.document, nodes: [...artifact.document.nodes,
    { id: "branch", parent: "root", title: "پیدایش", body: "توضیح کامل پیدایش" },
    { id: "leaf", parent: "branch", title: "نیاز به علت", body: "متن کامل استدلال" },
    { id: "other", parent: "root", title: "بقا", body: "توضیح بقا" },
  ] } }] } }) : previous(path, options));
  const { container } = mount();
  fireEvent.click(await screen.findByRole("button", { name: "تولید محتوای درسی" }));
  fireEvent.click(screen.getByRole("button", { name: /مستند ·/ }));
  expect(container.querySelectorAll(".final-diagram-links path")).toHaveLength(3);
  expect(screen.queryByText("توضیح کامل پیدایش")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "پیدایش", exact: true }));
  expect(within(screen.getByRole("complementary", { name: "توضیح شاخه" })).getByText("توضیح کامل پیدایش")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "جمع کردن شاخهٔ پیدایش" }));
  expect(screen.queryByRole("button", { name: "نیاز به علت", exact: true })).not.toBeInTheDocument();
  expect(container.querySelectorAll(".final-diagram-links path")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "باز کردن شاخهٔ پیدایش" }));
  fireEvent.click(screen.getByRole("button", { name: "تمرکز روی این شاخه" }));
  expect(screen.queryByRole("button", { name: "بقا", exact: true })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "نیاز به علت", exact: true })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /همهٔ شاخه‌ها/ }));
  expect(screen.getByRole("button", { name: "بقا", exact: true })).toBeInTheDocument();
  expect(apiJson.mock.calls.every(([, options]) => !options?.method || options.method === "GET")).toBe(true);
});

test("fullscreen uses the browser API and handles rejection without losing the diagram", async () => {
  const original = HTMLElement.prototype.requestFullscreen;
  HTMLElement.prototype.requestFullscreen = jest.fn().mockRejectedValue(new Error("denied"));
  try {
    mount();
    fireEvent.click(await screen.findByRole("button", { name: "تولید محتوای درسی" }));
    fireEvent.click(screen.getByRole("button", { name: /مستند ·/ }));
    fireEvent.click(screen.getByRole("button", { name: "نمایش تمام‌صفحه" }));
    expect(await screen.findByRole("status")).toHaveTextContent("مرورگر اجازهٔ تمام‌صفحه نداد");
    expect(HTMLElement.prototype.requestFullscreen).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("region", { name: "نمودار درختی" })).toBeInTheDocument();
  } finally { HTMLElement.prototype.requestFullscreen = original; }
});
