import HomePage from "@/app/page";
import { render, screen } from "@/test/test-utils";

describe("HomePage", () => {
  it("renders the Phase 1 foundation shell", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: /a stable architecture shell for neuroledger/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /marketplace/i })).toHaveAttribute(
      "href",
      "/marketplace",
    );
    expect(screen.getByText("Strict TypeScript")).toBeInTheDocument();
  });
});
