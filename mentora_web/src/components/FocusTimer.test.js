import { act, fireEvent, render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import FocusTimer from "./FocusTimer";
import { apiJson, getToken } from "../utils/api";

jest.mock("../utils/api", () => ({
  apiJson: jest.fn(() =>
    Promise.resolve({ response: { ok: true } })
  ),
  getToken: jest.fn(() => "test-token"),
}));

test("leaving the timer records elapsed focus once", async () => {
  jest.useFakeTimers();

  getToken.mockReturnValue("test-token");
  apiJson.mockResolvedValue({
    response: { ok: true },
  });

  const view = render(
    <HelmetProvider>
      <FocusTimer />
    </HelmetProvider>
  );

  const startButton = screen.getByRole("button", {
    name: "شروع تایمر",
  });

  fireEvent.click(startButton);

  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(screen.getByText("24:59")).toBeInTheDocument();

  view.unmount();

  expect(apiJson).toHaveBeenCalledTimes(1);

  expect(
    JSON.parse(apiJson.mock.calls[0][1].body)
  ).toMatchObject({
    mode: "focus",
    status: "interrupted",
    elapsedSeconds: 1,
  });

  jest.useRealTimers();
});