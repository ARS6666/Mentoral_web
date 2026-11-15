import React from "react";
import { fireEvent, render as renderUI, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AffiliatePortal, { CommissionTable } from "./AffiliatePortal";
import { useApp } from "../context/AppContext";
import { apiJson } from "../utils/api";

jest.mock("../context/AppContext", () => ({ useApp: jest.fn() }));
jest.mock("../utils/api", () => ({ apiJson: jest.fn() }));

const account = { id:1, status:"active", code:"creator-code", referralUrl:"https://mentoralearn.ir/r/creator-code", channelName:"آموزش ریاضی", channelUrl:"https://example.com", description:"", iban:"IR880100000000000000000001", accountHolder:"آزمایشی" };
const dashboard = { account, policy:{referralDays:30,holdDays:14,renewalRate:5,renewalMonths:18}, level:{newCustomerCount:0,nextThreshold:11,shortRate:15,longRate:20}, stats:{uniqueVisits:0,registrations:0,newCustomers:0,renewalSales:0,salesAmountRials:0,pendingRials:0,availableRials:0,reservedRials:0,paidRials:0}, series:[{date:"2026-10-15",newCustomers:0,commissionRials:0}] };
const ok = data => ({response:{ok:true,status:200},data});
let currentAccount;
const render=(ui,entry="/partners")=>renderUI(<MemoryRouter initialEntries={[entry]} future={{v7_startTransition:true,v7_relativeSplatPath:true}}>{ui}</MemoryRouter>);

beforeEach(() => {
  jest.clearAllMocks();
  currentAccount = {...account};
  useApp.mockReturnValue({ isAuthenticated:true, loading:false, profile:{id:1}, login:jest.fn(), register:jest.fn(), logout:jest.fn() });
  apiJson.mockImplementation(async (url, options={}) => {
    if (url === "/api/affiliates/application") {
      if (options.method === "POST") currentAccount={...account,...JSON.parse(options.body),status:"pending"};
      return ok({account:currentAccount});
    }
    if (url.startsWith("/api/affiliates/dashboard")) return ok({...dashboard,account:currentAccount});
    return ok({items:[],page:1,total:0,pageSize:25});
  });
  Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:jest.fn().mockResolvedValue()}});
});

test("zero earnings show an empty state and disable payout", async () => {
  render(<AffiliatePortal />);
  fireEvent.click(await screen.findByRole("link",{name:"درآمد و پورسانت"}));
  expect(await screen.findByText("هنوز فروشی ثبت نشده")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link",{name:"تسویه و حساب بانکی"}));
  expect(screen.getByRole("button",{name:"درخواست تسویه"})).toBeDisabled();
});

test("copy failure leaves the readable referral link and a useful error", async () => {
  navigator.clipboard.writeText.mockRejectedValue(new Error("not available"));
  render(<AffiliatePortal />);
  fireEvent.click(await screen.findByRole("button",{name:"کپی لینک"}));
  expect(await screen.findByRole("alert")).toHaveTextContent(/لینک را.*کپی/);
  expect(screen.getByLabelText("لینک اختصاصی شما")).toHaveValue(account.referralUrl);
});

test("a new partner can submit an application but cannot self-approve", async () => {
  currentAccount = null;
  render(<AffiliatePortal />);
  fireEvent.click(await screen.findByRole("link",{name:"رسانهٔ من"}));
  fireEvent.change(await screen.findByLabelText("نام رسانه یا صفحه"),{target:{value:"صفحه آموزش"}});
  fireEvent.change(screen.getByRole("combobox",{name:"شبکهٔ اجتماعی"}),{target:{value:"other"}});
  fireEvent.change(screen.getByLabelText("لینک یا آیدی صفحه / کانال"),{target:{value:"https://example.com/math"}});
  fireEvent.click(screen.getByRole("button",{name:"ثبت درخواست همکاری"}));
  expect(await screen.findByText("در انتظار بررسی")).toBeInTheDocument();
});

test("a partner can choose a social network and submit a handle without a URL", async () => {
  currentAccount = null;
  render(<AffiliatePortal />);
  fireEvent.click(await screen.findByRole("link",{name:"رسانهٔ من"}));
  fireEvent.change(await screen.findByLabelText("نام رسانه یا صفحه"),{target:{value:"صفحه آموزش"}});
  const platform=screen.getByRole("combobox",{name:"شبکهٔ اجتماعی"});
  expect(platform).toBeRequired();
  expect(platform).not.toBeValid();
  fireEvent.change(platform,{target:{value:"telegram"}});
  const address=screen.getByLabelText("لینک یا آیدی صفحه / کانال");
  fireEvent.change(address,{target:{value:"@math_channel"}});
  expect(address).toBeValid();
  fireEvent.click(screen.getByRole("button",{name:"ثبت درخواست همکاری"}));
  expect(await screen.findByText("در انتظار بررسی")).toBeInTheDocument();
  expect(screen.getByRole("combobox",{name:"شبکهٔ اجتماعی"})).toHaveValue("telegram");
  expect(screen.getByLabelText("لینک یا آیدی صفحه / کانال")).toHaveValue("@math_channel");
  expect(apiJson).toHaveBeenCalledWith("/api/affiliates/application",expect.objectContaining({body:JSON.stringify({channelName:"صفحه آموزش",channelPlatform:"telegram",channelUrl:"@math_channel",description:""})}));
});

test("login errors stay in the partner flow without navigating to onboarding", async () => {
  useApp.mockReturnValue({isAuthenticated:false,loading:false,login:async()=>{throw new Error("رمز ورود درست نیست");},register:jest.fn()});
  render(<AffiliatePortal />);
  fireEvent.change(screen.getByLabelText("شماره موبایل"),{target:{value:"09121110001"}});
  fireEvent.change(screen.getByLabelText("رمز عبور"),{target:{value:"wrongpass"}});
  fireEvent.click(screen.getByRole("button",{name:"ورود به پنل"}));
  expect(await screen.findByRole("alert")).toHaveTextContent("رمز ورود درست نیست");
});

test("a failed dashboard request is not presented as zero income", async () => {
  apiJson.mockImplementation(async url => url.includes("dashboard") ? {response:{ok:false,status:503},data:{error:"سرویس موقتاً در دسترس نیست"}} : ok({account}));
  render(<AffiliatePortal />);
  expect(await screen.findByRole("alert")).toHaveTextContent("سرویس موقتاً در دسترس نیست");
  expect(screen.queryByText("آمادهٔ تسویه")).not.toBeInTheDocument();
  expect(screen.getByRole("button",{name:"تلاش دوباره"})).toBeInTheDocument();
});

test("bank details are sent to the bank endpoint, never a payout amount", async () => {
  const writes=[];
  const original=apiJson.getMockImplementation();
  apiJson.mockImplementation(async (url, options={})=>{
    if(url.endsWith("bank-account")) { writes.push(JSON.parse(options.body)); return ok({account}); }
    return original(url, options);
  });
  render(<AffiliatePortal />);
  fireEvent.click(await screen.findByRole("link",{name:"تسویه و حساب بانکی"}));
  const input=await screen.findByLabelText("شماره شبا");
  fireEvent.change(input,{target:{value:account.iban}});
  fireEvent.click(screen.getByRole("button",{name:"ذخیره اطلاعات بانکی"}));
  await waitFor(()=>expect(writes).toEqual([{iban:account.iban,accountHolder:"آزمایشی"}]));
});

test("registration stays in the creator flow and uses the existing auth interface", async () => {
  const register=jest.fn().mockResolvedValue({});
  useApp.mockReturnValue({isAuthenticated:false,loading:false,login:jest.fn(),register});
  render(<AffiliatePortal/>);
  fireEvent.click(screen.getByRole("button",{name:"حساب ندارم؛ ثبت‌نام"}));
  for(const [label,value] of [["نام و نام خانوادگی","همکار جدید"],["شماره موبایل","09120000001"],["رمز عبور","secret123"],["تکرار رمز عبور","secret123"]]) fireEvent.change(screen.getByLabelText(label),{target:{value}});
  fireEvent.click(screen.getByRole("button",{name:"ساخت حساب"}));
  await waitFor(()=>expect(register).toHaveBeenCalledWith({fullName:"همکار جدید",phone:"09120000001",password:"secret123",confirmPassword:"secret123"}));
});

test.each([false,true])("successful authentication resets a previous media URL to dashboard, signup=%s",async signup=>{
  currentAccount=null;
  let authenticated=false;
  const authenticate=async()=>{authenticated=true;};
  useApp.mockImplementation(()=>({isAuthenticated:authenticated,loading:false,profile:authenticated ? {id:2} : null,login:authenticate,register:authenticate,logout:jest.fn()}));
  render(<AffiliatePortal/>,"/partners?section=media");
  if(signup) {
    fireEvent.click(screen.getByRole("button",{name:"حساب ندارم؛ ثبت‌نام"}));
    fireEvent.change(screen.getByLabelText("نام و نام خانوادگی"),{target:{value:"همکار"}});
    fireEvent.change(screen.getByLabelText("تکرار رمز عبور"),{target:{value:"secret123"}});
  }
  fireEvent.change(screen.getByLabelText("شماره موبایل"),{target:{value:"09120000002"}});
  fireEvent.change(screen.getByLabelText("رمز عبور"),{target:{value:"secret123"}});
  fireEvent.click(screen.getByRole("button",{name:signup ? "ساخت حساب" : "ورود به پنل",exact:true}));
  expect(await screen.findByRole("heading",{name:"داشبورد همکاری",level:1})).toBeInTheDocument();
  expect(screen.queryByLabelText("نام رسانه یا صفحه")).not.toBeInTheDocument();
});

test("mature commission requests a server-calculated payout with an empty body", async () => {
  const original=apiJson.getMockImplementation();
  apiJson.mockImplementation(async (url, options={})=>url.includes("dashboard") ? ok({...dashboard,stats:{...dashboard.stats,availableRials:600000}}) : original(url,options));
  render(<AffiliatePortal/>);
  fireEvent.click(await screen.findByRole("link",{name:"تسویه و حساب بانکی"}));
  const button=await screen.findByRole("button",{name:"درخواست تسویه"});
  expect(button).toBeEnabled();
  fireEvent.click(button);
  await waitFor(()=>expect(apiJson).toHaveBeenCalledWith("/api/affiliates/payouts",expect.objectContaining({method:"POST",body:"{}"})));
});

test("range selection uses only the authenticated creator endpoint", async()=>{
  render(<AffiliatePortal/>);
  fireEvent.change(await screen.findByLabelText("بازهٔ گزارش"),{target:{value:"7"}});
  await waitFor(()=>expect(apiJson).toHaveBeenCalledWith("/api/affiliates/dashboard?days=7",{}));
  expect(apiJson.mock.calls.some(([url])=>url.includes("affiliateId="))).toBe(false);
});

test.each(["pending","rejected","suspended"])("%s account displays its status and cannot request payouts",async status=>{
  currentAccount={...account,status};
  render(<AffiliatePortal/>);
  expect(await screen.findByText({pending:"در انتظار بررسی",rejected:"رد شده",suspended:"معلق"}[status])).toBeInTheDocument();
  const payout=screen.queryByRole("button",{name:"درخواست تسویه"});
  if(payout) expect(payout).toBeDisabled();
});

test.each([null,"pending","rejected"])("a %s partner enters the dashboard before adding a media account",async status=>{
  currentAccount=status ? {...account,status} : null;
  render(<AffiliatePortal/>);
  expect(await screen.findByRole("heading",{name:"داشبورد همکاری",level:1})).toBeInTheDocument();
  expect(screen.getByRole("navigation",{name:"منوی پنل همکاری"})).toBeInTheDocument();
  expect(screen.queryByLabelText("نام رسانه یا صفحه")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("لینک اختصاصی شما")).not.toBeInTheDocument();
  expect(screen.queryByText("منتورا را معرفی کن.")).not.toBeInTheDocument();
  expect(apiJson.mock.calls.some(([,options])=>options?.method==="POST")).toBe(false);
  fireEvent.click(screen.getByRole("link",{name:"رسانهٔ من"}));
  expect(await screen.findByLabelText("نام رسانه یا صفحه")).toBeInTheDocument();
  expect(screen.getByRole("link",{name:"رسانهٔ من"})).toHaveAttribute("aria-current","page");
  fireEvent.click(screen.getByRole("link",{name:"داشبورد",exact:true}));
  expect(screen.queryByLabelText("نام رسانه یا صفحه")).not.toBeInTheDocument();
});

test("a pending partner sees why earnings and payouts are unavailable without requesting protected data",async()=>{
  currentAccount={...account,status:"pending"};
  render(<AffiliatePortal/>);
  fireEvent.click(await screen.findByRole("link",{name:"تسویه و حساب بانکی"}));
  expect(await screen.findByText(/پس از تأیید رسانه/)).toBeInTheDocument();
  expect(screen.queryByRole("button",{name:"درخواست تسویه"})).not.toBeInTheDocument();
  expect(apiJson.mock.calls.some(([url])=>/dashboard|commissions|payouts/.test(url))).toBe(false);
});

test("a bookmarked wallet view opens the wallet and can navigate back to dashboard",async()=>{
  render(<AffiliatePortal/>,"/partners?section=wallet");
  expect(await screen.findByLabelText("شماره شبا")).toBeInTheDocument();
  expect(screen.getByRole("link",{name:"تسویه و حساب بانکی"})).toHaveAttribute("aria-current","page");
  fireEvent.click(screen.getByRole("link",{name:"داشبورد",exact:true}));
  expect(await screen.findByLabelText("لینک اختصاصی شما")).toBeInTheDocument();
  expect(screen.queryByLabelText("شماره شبا")).not.toBeInTheDocument();
});

test("a rejected media save keeps the form and entered values so the partner can correct and retry",async()=>{
  const original=apiJson.getMockImplementation();
  apiJson.mockImplementation(async(url,options={})=>url==="/api/affiliates/application" && options.method==="POST"
    ? {response:{ok:false,status:400},data:{channelUrl:["آیدی معتبر وارد کن"]}}
    : original(url,options));
  render(<AffiliatePortal/>,"/partners?section=media");
  const address=await screen.findByLabelText("لینک یا آیدی صفحه / کانال");
  fireEvent.change(address,{target:{value:"@new_channel"}});
  fireEvent.click(screen.getByRole("button",{name:"ذخیره اطلاعات رسانه"}));
  expect(await screen.findByRole("alert")).toHaveTextContent("آیدی معتبر وارد کن");
  expect(screen.getByLabelText("لینک یا آیدی صفحه / کانال")).toHaveValue("@new_channel");
  expect(screen.getByRole("button",{name:"ذخیره اطلاعات رسانه"})).toBeEnabled();
});

test("a failed initial application load does not show a blank media form",async()=>{
  apiJson.mockResolvedValue({response:{ok:false,status:503},data:{error:"دریافت رسانه انجام نشد"}});
  render(<AffiliatePortal/>,"/partners?section=media");
  expect(await screen.findByRole("alert")).toHaveTextContent("دریافت رسانه انجام نشد");
  expect(screen.queryByLabelText("نام رسانه یا صفحه")).not.toBeInTheDocument();
  expect(screen.queryByText("رسانه ثبت نشده")).not.toBeInTheDocument();
  expect(screen.getByRole("button",{name:"تلاش دوباره"})).toBeEnabled();
});

test.each([null,"pending","active","suspended"])("%s partner can open commission terms from navigation without changing their account",async status=>{
  currentAccount=status ? {...account,status} : null;
  render(<AffiliatePortal/>);
  fireEvent.click(await screen.findByRole("link",{name:"شرایط پورسانت",exact:true}));
  expect(await screen.findByRole("heading",{name:"شرایط پورسانت",level:1})).toBeInTheDocument();
  expect(screen.getByRole("link",{name:"شرایط پورسانت",exact:true})).toHaveAttribute("aria-current","page");
  const rows=within(screen.getByRole("table",{name:"درصد پورسانت خرید اول"})).getAllByRole("row");
  expect(rows.slice(1).map(row=>within(row).getAllByRole("cell").map(cell=>cell.textContent))).toEqual([
    ["۱۵٪","۱۵٪","۲۰٪","۲۰٪"],
    ["۲۰٪","۲۰٪","۲۵٪","۲۵٪"],
    ["۲۵٪","۲۵٪","۳۰٪","۳۰٪"],
  ]);
  expect(screen.getByRole("heading",{name:"تمدید و ارتقای اشتراک"})).toBeInTheDocument();
  expect(screen.getByRole("heading",{name:"آزادسازی و تسویه"})).toBeInTheDocument();
  expect(apiJson.mock.calls.some(([,options])=>options?.method)).toBe(false);
});

test("commission terms can be bookmarked before a partner has submitted media",async()=>{
  currentAccount=null;
  render(<AffiliatePortal/>,"/partners?section=terms");
  expect(await screen.findByRole("table",{name:"درصد پورسانت خرید اول"})).toBeInTheDocument();
  const terms=within(screen.getByRole("region",{name:"راهنمای پورسانت"}));
  expect(terms.getByText(/۶۰٬۰۰۰ تومان/)).toBeInTheDocument();
  expect(terms.getByText(/۱۸ ماه تقویمی/)).toBeInTheDocument();
  expect(terms.getByText(/۳۰ روز/)).toBeInTheDocument();
  expect(terms.getByText(/۱۴ روز/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link",{name:"رفتن به بخش تسویه",exact:true}));
  expect(await screen.findByRole("heading",{name:"تسویه و حساب بانکی",level:1})).toBeInTheDocument();
});

test("sales history exposes the anonymous purchase reference, plan and original paid amount",()=>{
  render(<CommissionTable data={{items:[{id:1,paymentId:"synthetic-payment-id",planSlug:"quarterly",baseAmountRials:11640000,amountRials:1746000,ratePercent:15,kind:"first",status:"pending",paidAt:"2026-10-15",availableAt:"2026-10-29"}],page:1,total:1,pageSize:25}}/>);
  expect(screen.getByText("synthetic-payment-id")).toBeInTheDocument();
  expect(screen.getByText("۳ ماهه")).toBeInTheDocument();
  expect(screen.getByText("۱٬۱۶۴٬۰۰۰ تومان")).toBeInTheDocument();
});
