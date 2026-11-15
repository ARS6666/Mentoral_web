import normalizeMathMarkdown from "./normalizeMathMarkdown";

test("normalizes model math delimiters without changing code", () => {
  expect(
    normalizeMathMarkdown(
      "Inline \\(\\sqrt{x}\\), display \\[x^2\\], code `\\(\\sqrt{x}\\)`, and $y$."
    )
  ).toBe(
    "Inline $\\sqrt{x}$, display $$x^2$$, code `\\(\\sqrt{x}\\)`, and $y$."
  );
});
