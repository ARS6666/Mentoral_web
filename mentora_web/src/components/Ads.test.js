import React from "react";
import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getToken } from "../utils/api";
import AdSlot, { loadAds } from "./AdSlot";
import BottomAd from "./BottomAd";
import AdContainer from "./Adcontainer";
import SideAd from "./SideAd";
import SideAd2 from "./SideAd2";

jest.mock("../context/AppContext", () => ({ useApp: jest.fn() }));
jest.mock("../utils/api", () => ({ getToken: jest.fn() }));
const location = window.location;
const slots = () => <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AdSlot /><BottomAd /><AdContainer /><SideAd /><SideAd2 /></MemoryRouter>;
beforeEach(() => {
  jest.useFakeTimers();
  Object.defineProperty(window, "location", { configurable: true, value: { hostname: "mentoralearn.ir" } });
  getToken.mockReturnValue(null);
  useApp.mockReturnValue({ loading: false, profile: { subscriptionActive: false } });
  delete window.yektanet;
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  document.querySelectorAll('script[src*="cdn.yektanet.com"]').forEach(script => script.remove());
  Object.defineProperty(window, "location", { configurable: true, value: location });
  delete window.yektanet;
});

test.each([
  { loading: true, profile: null },
  { loading: false, profile: { subscriptionActive: true } },
])("no slots or ad SDK while loading or subscribed: %j", profile => {
  useApp.mockReturnValue(profile);
  const { container } = render(slots());
  act(() => jest.runOnlyPendingTimers());
  expect(container.querySelector('[id^="ynpos-"], [id^="pos-article"]')).toBeNull();
  expect(window.yektanet).toBeUndefined();
  expect(document.querySelector('script[src*="cdn.yektanet.com"]')).toBeNull();
});

test("free accounts get every placement and exactly one SDK; activation removes them and expiration restores them", () => {
  const view = render(slots());
  act(() => jest.runOnlyPendingTimers());
  expect(view.container.querySelectorAll('[id^="ynpos-"], [id^="pos-article"]')).toHaveLength(5);
  expect(document.querySelectorAll('script[src*="cdn.yektanet.com"]')).toHaveLength(1);
  const requests = window.yektanet.q.length;
  useApp.mockReturnValue({ loading: false, profile: { subscriptionActive: true } });
  view.rerender(slots());
  act(() => jest.runOnlyPendingTimers());
  expect(view.container.querySelector('[id^="ynpos-"]')).toBeNull();
  expect(window.yektanet.q).toHaveLength(requests);
  useApp.mockReturnValue({ loading: false, profile: { subscriptionActive: false } });
  view.rerender(slots());
  act(() => jest.runOnlyPendingTimers());
  expect(view.container.querySelectorAll('[id^="ynpos-"], [id^="pos-article"]')).toHaveLength(5);
  expect(window.yektanet.q.length).toBeGreaterThan(requests);
});

test("activation cancels pending ad loads and unresolved authenticated profiles fail closed", () => {
  window.yektanet = jest.fn();
  const view = render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AdSlot /></MemoryRouter>);
  useApp.mockReturnValue({ loading: false, profile: { subscriptionActive: true } });
  view.rerender(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AdSlot /></MemoryRouter>);
  act(() => jest.runOnlyPendingTimers());
  expect(window.yektanet).not.toHaveBeenCalled();
  getToken.mockReturnValue("test-token");
  useApp.mockReturnValue({ loading: false, profile: null });
  view.rerender(slots());
  act(() => jest.runOnlyPendingTimers());
  expect(view.container.querySelector('[id^="ynpos-"]')).toBeNull();
  expect(window.yektanet).not.toHaveBeenCalled();
});

test("local previews never contact the ad network", () => {
  Object.defineProperty(window, "location", { configurable: true, value: { hostname: "127.0.0.1" } });
  loadAds();
  expect(window.yektanet).toBeUndefined();
});
