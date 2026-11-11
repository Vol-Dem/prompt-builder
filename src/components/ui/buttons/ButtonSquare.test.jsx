// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";

import ButtonSquare from "./ButtonSquare";
import ButtonSquareSave from "./ButtonSquareSave";

afterEach(cleanup);

it.each([
  { name: "square button", Component: ButtonSquare },
  { name: "save button", Component: ButtonSquareSave },
])(
  "prevents pointer activation and focus while the $name is disabled, then allows keyboard activation when enabled",
  async ({ Component }) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const controls = (disabled) => (
      <>
        <button type="button">Before</button>
        <Component
          type="button"
          disabled={disabled}
          onClick={onClick}
          aria-label="Action"
        />
        <button type="button">After</button>
      </>
    );
    const { rerender } = render(controls(true));
    const action = screen.getByRole("button", { name: "Action" });

    await user.click(action);
    expect(onClick).not.toHaveBeenCalled();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Before" }),
    );
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After" }),
    );
    action.focus();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After" }),
    );

    rerender(controls(false));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(action);
    await user.keyboard("{Enter} ");
    expect(onClick).toHaveBeenCalledTimes(2);
    await user.click(action);
    expect(onClick).toHaveBeenCalledTimes(3);
  },
);
