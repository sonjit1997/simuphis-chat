import { describe, expect, it } from "vitest";
import { formatDayDivider, formatMessageTime } from "./dateFormatters";

describe("dateFormatters", () => {
  it("formats message time in 12-hour format regardless of timezone", () => {
    // Construct local date
    const localDate = new Date(2026, 9, 11, 14, 30, 0);
    const time = formatMessageTime(localDate.toISOString());
    // Should match e.g. "02:30 pm" or "2:30 PM"
    expect(time.toLowerCase()).toMatch(/\d{1,2}:30\s*(am|pm)/i);
  });

  it("handles empty or invalid timestamp gracefully", () => {
    expect(formatMessageTime("")).toBe("");
    expect(formatMessageTime("invalid-date")).toBe("");
  });

  it("formats day divider for today", () => {
    const now = new Date().toISOString();
    expect(formatDayDivider(now)).toBe("Today");
  });

  it("formats day divider for yesterday", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(formatDayDivider(yesterday)).toBe("Yesterday");
  });
});
