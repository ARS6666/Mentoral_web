import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminAffiliates from "./AdminAffiliates";
import { apiJson } from "../utils/api";
jest.mock("../utils/api",()=>({apiJson:jest.fn()}));
const ok=data=>({response:{ok:true,status:200},data});
const account={id:1,status:"pending",channelName:"رسانهٔ آزمایشی",name:"همکار آزمایشی",phone:"09120000001",channelUrl:"https://example.com",description:"آموزش",iban:"IR880100000000000000000001",accountHolder:"آزمایشی"};
const empty={items:[],page:1,total:0,pageSize:25};
beforeEach(()=>{jest.clearAllMocks();apiJson.mockImplementation(async url=>{
  if(url==="/api/admin/affiliates/1") return ok({account,stats:{availableRials:0,pendingRials:0,paidRials:0},commissions:empty});
  return ok({...empty,items:url.includes("payouts") ? [] : [account]});
});});
test("approval requires a note and sends only the selected account decision",async()=>{
  render(<AdminAffiliates admin={{id:7}}/>);
  fireEvent.click(await screen.findByRole("button",{name:"بررسی رسانهٔ آزمایشی"}));
  const approve=await screen.findByRole("button",{name:"تأیید همکاری"});
  expect(approve).toBeDisabled();
  fireEvent.change(screen.getByLabelText("یادداشت تصمیم"),{target:{value:"رسانه بررسی شد"}});
  fireEvent.click(approve);
  await waitFor(()=>expect(apiJson).toHaveBeenCalledWith("/api/admin/affiliates/1/status",expect.objectContaining({method:"POST",body:JSON.stringify({status:"active",note:"رسانه بررسی شد"})})));
});
test("forbidden access is visible and does not display applications",async()=>{
  apiJson.mockResolvedValue({response:{ok:false,status:403},data:{error:"دسترسی مجاز نیست"}});
  render(<AdminAffiliates admin={{id:7}}/>);
  expect(await screen.findByRole("alert")).toHaveTextContent("دسترسی مجاز نیست");
  expect(screen.queryByRole("button",{name:"بررسی رسانهٔ آزمایشی"})).not.toBeInTheDocument();
});

test.each(["@math_channel", "javascript:alert(1)"])("admin displays %s as text, not a clickable URL",async address=>{
  apiJson.mockImplementation(async url=>url==="/api/admin/affiliates/1"
    ? ok({account:{...account,channelPlatform:"telegram",channelUrl:address},stats:{availableRials:0,pendingRials:0,paidRials:0},commissions:empty})
    : ok({...empty,items:url.includes("payouts") ? [] : [account]}));
  render(<AdminAffiliates admin={{id:7}}/>);
  fireEvent.click(await screen.findByRole("button",{name:"بررسی رسانهٔ آزمایشی"}));
  expect(await screen.findByText(address)).toBeInTheDocument();
  expect(screen.queryByRole("link",{name:address})).not.toBeInTheDocument();
  expect(screen.getByText(/تلگرام/)).toBeInTheDocument();
});
test("marking a payout paid requires a real receipt and preserves its server amount",async()=>{
  apiJson.mockImplementation(async url=>ok({...empty,items:url.includes("payouts") ? [{id:9,status:"processing",claimedBy:7,claimedByName:"مدیر",channelName:"آزمایشی",amountRials:600000,iban:account.iban,accountHolder:"آزمایشی",createdAt:"2026-10-15"}] : []}));
  render(<AdminAffiliates admin={{id:7}}/>);
  fireEvent.click(await screen.findByRole("button",{name:"بررسی تسویه 9"}));
  const paid=screen.getByRole("button",{name:"ثبت واریز انجام‌شده"});
  fireEvent.change(screen.getByLabelText("یادداشت تسویه"),{target:{value:"واریز دستی بررسی شد"}});
  expect(paid).toBeDisabled();
  fireEvent.change(screen.getByLabelText("شناسهٔ رسید واریز"),{target:{value:"BANK-001"}});
  fireEvent.click(paid);
  await waitFor(()=>expect(apiJson).toHaveBeenCalledWith("/api/admin/affiliates/payouts/9/transition",expect.objectContaining({body:JSON.stringify({action:"paid",note:"واریز دستی بررسی شد",receiptReference:"BANK-001"})})));
});

test("another admin cannot see transfer instructions or mark a claimed payout paid",async()=>{
  apiJson.mockImplementation(async url=>ok({...empty,items:url.includes("payouts") ? [{id:9,status:"processing",claimedBy:99,claimedByName:"مدیر دیگر",channelName:"آزمایشی",amountRials:600000,iban:account.iban,accountHolder:"آزمایشی",createdAt:"2026-10-15"}] : []}));
  render(<AdminAffiliates admin={{id:7}}/>);
  fireEvent.click(await screen.findByRole("button",{name:"بررسی تسویه 9"}));
  expect(screen.queryByRole("button",{name:"ثبت واریز انجام‌شده"})).not.toBeInTheDocument();
  expect(screen.queryByText(/ابتدا واریز واقعی/)).not.toBeInTheDocument();
  expect(screen.getByText(/در اختیار مدیر دیگر/)).toBeInTheDocument();
});
