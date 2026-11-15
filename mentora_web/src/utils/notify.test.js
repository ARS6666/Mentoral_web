import { confirmDialog } from "./notify";

afterEach(() => {
  document.body.innerHTML = "";
});

test("Enter does not approve a destructive confirmation globally", async () => {
  const result = confirmDialog("این گفتگو حذف شود؟", { danger: true });
  const cancel = Array.from(document.querySelectorAll("button")).find(
    (button) => button.textContent === "انصراف"
  );

  cancel.focus();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
  expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();

  cancel.click();
  await expect(result).resolves.toBe(false);
});

test("Escape cancels and restores focus", async () => {
  const trigger = document.createElement("button");
  document.body.appendChild(trigger);
  trigger.focus();

  const result = confirmDialog("آیا مطمئن هستید؟");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

  await expect(result).resolves.toBe(false);
  expect(trigger).toHaveFocus();
});
