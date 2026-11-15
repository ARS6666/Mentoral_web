import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProviderDiagnostics, { TransportDetails } from "./ProviderDiagnostics";

const runtime = { pid: 123, model: "test-model", workingDirectory: "/var/www/mentora/backend", codeDirectory: "/var/www/mentora", origin: "https://relay.example.workers.dev", versions: { httpx: "0.28.1" } };
const report = {
  requestId: "report-123", mode: "transport", checks: [{ name: "large_post", status: "error", requestBytes: 9616, elapsedMs: 18000,
    errorType: "RemoteProtocolError", failedPhase: "http11.receive_response_headers", events: [{ name: "http11.receive_response_headers.failed", elapsedMs: 18000, durationMs: 17500 }] }],
};

test("shows the active Luna provider without Gemini branding", () => {
  render(<ProviderDiagnostics runtime={{ ...runtime, provider: "hormouz", model: "openai/gpt-6-luna", sourceImagesEnabled: false }} onRun={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "تشخیص اتصال مدل" })).toBeInTheDocument();
  expect(screen.getByText("openai/gpt-6-luna")).toBeInTheDocument();
  expect(screen.getByText("غیرفعال")).toBeInTheDocument();
});

test("transport test shows failure phase and prevents duplicate clicks while pending", async () => {
  let finish;
  render(<ProviderDiagnostics runtime={runtime} reports={[]} onRun={() => new Promise(resolve => { finish = resolve; })} />);
  fireEvent.click(screen.getByRole("button", { name: "تست اتصال بدون مصرف مدل" }));
  expect(screen.getByRole("button", { name: "تست واقعی مدل" })).toBeDisabled();
  finish(report);
  await screen.findByText("RemoteProtocolError");
  expect(screen.getByText(/مرحلهٔ شکست: دریافت سرآیند پاسخ/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "دانلود گزارش" })).toBeEnabled();
  expect(screen.getByText("test-model")).toBeInTheDocument();
});

test("model test requires confirmation and reports endpoint errors", async () => {
  const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
  render(<ProviderDiagnostics runtime={runtime} reports={[]} onRun={async () => { throw new Error("۹۰ ثانیه صبر کن"); }} />);
  fireEvent.click(screen.getByRole("button", { name: "تست واقعی مدل" }));
  expect(screen.queryByRole("alert")).toBeNull();
  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole("button", { name: "تست واقعی مدل" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("۹۰ ثانیه صبر کن"));
  confirm.mockRestore();
});

test("saved diagnostics can be reopened and socket write is not labelled as Worker receipt", () => {
  render(<ProviderDiagnostics runtime={runtime} reports={[{ id: 1, metadata: report, createdAt: "2026-10-02T10:00:00Z" }]} onRun={async () => report} />);
  fireEvent.click(screen.getByRole("button", { name: /report-123/ }));
  expect(screen.getByText("RemoteProtocolError")).toBeInTheDocument();
  render(<TransportDetails trace={{ events: [{ name: "http11.send_request_body.complete", elapsedMs: 10 }], requestBytes: 100 }} />);
  expect(screen.getByText(/به‌معنی رسیدن به مقصد نیست/)).toBeInTheDocument();
});
