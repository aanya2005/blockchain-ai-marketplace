import { Button } from "@/components/ui/button";
import { render, screen } from "@/test/test-utils";

describe("Button", () => {
  it("renders an accessible button", () => {
    render(<Button>Toggle theme</Button>);

    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeEnabled();
  });
});
