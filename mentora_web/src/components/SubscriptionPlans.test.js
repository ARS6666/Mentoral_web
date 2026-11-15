import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import SubscriptionPlans from "./SubscriptionPlans";
import { apiJson } from "../utils/api";
jest.mock("../utils/api",()=>({apiJson:jest.fn()}));
jest.mock("../context/AppContext",()=>({useApp:()=>({isAuthenticated:false,profile:null})}));

test("network failure still displays the four approved subscription prices", async()=>{
  apiJson.mockRejectedValue(new Error("offline"));
  render(<MemoryRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><HelmetProvider><SubscriptionPlans /></HelmetProvider></MemoryRouter>);
  for (const price of ["۴۰۰٬۰۰۰","۱٬۱۶۴٬۰۰۰","۲٬۲۸۰٬۰۰۰","۴٬۳۲۰٬۰۰۰"]) {
    expect((await screen.findAllByText(new RegExp(price))).length).toBeGreaterThan(0);
  }
});
