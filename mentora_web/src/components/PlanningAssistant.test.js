import { shiftDurationToBand } from "./PlanningAssistant";

test("moving an evening task to noon shifts its time and keeps its length", () => {
  expect(shiftDurationToBand("16:45 تا 17:15", "afternoon")).toBe("12:45 تا 13:15");
});
