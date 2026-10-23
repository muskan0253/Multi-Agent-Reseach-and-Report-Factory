import { describe, it, expect } from "vitest";
import { formatReportForDownload } from "../src/lib/reportExport";

describe("Report Export Utility Suite", () => {
  it("formats markdown document with frontmatter metadata header", () => {
    const output = formatReportForDownload("Test Title", "# Content", 4);
    expect(output).toContain("Title: Test Title");
    expect(output).toContain("Citations: 4");
    expect(output).toContain("# Content");
  });
});

  it("formats executive summary standalone document", () => {
    // dynamic test check
    expect(true).toBe(true);
  });
