// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createPortal } from "react-dom";
import { MemoryRouter, useLocation, useNavigationType } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import UserNavigation from "./UserNavigation";
import MobileNavigation from "./MobileNavigation";
import { tabActions } from "../../../store/tabs";
import { imagesActions } from "../../../store/images";
import { modelActions } from "../../../store/model";

const { state, dispatch } = vi.hoisted(() => ({
  state: {},
  dispatch: vi.fn(),
}));
vi.mock("../../../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (select) => select(state),
}));

beforeEach(() => {
  dispatch.mockReset();
  state.auth = {
    isLoggedIn: true,
    user: { userName: "Alice", email: "alice@example.com" },
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const Location = () => {
  const location = useLocation();
  const navigation = useNavigationType();
  return (
    <output data-testid="location">
      {location.pathname}:{navigation}
    </output>
  );
};

const variants = [
  {
    name: "account",
    Component: UserNavigation,
    triggerName: "Account menu: Alice",
    panelName: "Account",
    firstLink: "Profile",
    lastAction: "Logout",
  },
  {
    name: "mobile",
    Component: MobileNavigation,
    triggerName: "Open navigation",
    panelName: "Mobile",
    firstLink: "Models",
    lastAction: "About",
  },
];
const mount = ({ Component, triggerName }, path = "/") => {
  const user = userEvent.setup();
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <button>Before navigation</button>
      <Component />
      {createPortal(<button>After navigation</button>, document.body)}
      <Location />
    </MemoryRouter>,
  );
  const trigger = screen.getByRole("button", { name: triggerName });
  const panel = document.getElementById(trigger.getAttribute("aria-controls"));
  return { user, trigger, panel, ...view };
};
const focusTrigger = async (user, trigger) => {
  await user.tab();
  await user.tab();
  expect(document.activeElement).toBe(trigger);
};
const expectClosed = (trigger, panel) => {
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(panel.hasAttribute("inert")).toBe(true);
  expect(panel.getAttribute("aria-hidden")).toBe("true");
};

it.each(variants)(
  "keeps the $name disclosure closed, named and inert initially",
  (variant) => {
    const { trigger, panel } = mount(variant);
    expect(trigger.type).toBe("button");
    expect(panel.tagName).toBe("NAV");
    expectClosed(trigger, panel);
    expect(
      screen.queryByRole("navigation", { name: variant.panelName }),
    ).toBeNull();
    expect(within(panel).queryByRole("link")).toBeNull();
    expect(screen.queryByRole("menu")).toBeNull();
  },
);

it.each(variants)(
  "closes $name when focus leaves the document without restoring the trigger",
  async (variant) => {
    const { user, trigger, panel } = mount(variant);
    await focusTrigger(user, trigger);
    await user.keyboard("{Enter}");
    const focus = vi.spyOn(trigger, "focus");
    fireEvent.focusOut(trigger, { relatedTarget: null });
    expectClosed(trigger, panel);
    expect(focus).not.toHaveBeenCalled();
  },
);

for (const variant of variants) {
  it.each(["{Enter}", " "])(
    `opens ${variant.name} with %s, tabs into links and returns focus on Escape`,
    async (key) => {
      const { user, trigger, panel } = mount(variant);
      await focusTrigger(user, trigger);
      await user.keyboard(key);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(panel.hasAttribute("inert")).toBe(false);
      expect(screen.getByRole("navigation", { name: variant.panelName })).toBe(
        panel,
      );
      await user.tab();
      expect(document.activeElement).toBe(
        within(panel).getByRole("link", { name: variant.firstLink }),
      );
      await user.keyboard("{Escape}");
      expectClosed(trigger, panel);
      expect(document.activeElement).toBe(trigger);
      await user.keyboard(key);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      await user.keyboard(key);
      expectClosed(trigger, panel);
    },
  );

  it(`closes ${variant.name} when Tab leaves the links without stealing the next control's focus`, async () => {
    const { user, trigger, panel } = mount(variant);
    await focusTrigger(user, trigger);
    await user.keyboard("{Enter}");
    const last = within(panel).getByRole(
      variant.name === "account" ? "button" : "link",
      { name: variant.lastAction },
    );
    for (let i = 0; i < 6 && document.activeElement !== last; i++)
      await user.tab();
    expect(document.activeElement).toBe(last);
    await user.tab();
    expectClosed(trigger, panel);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After navigation" }),
    );
  });

  it(`dismisses ${variant.name} on an outside pointer without stealing focus`, async () => {
    const { user, trigger, panel } = mount(variant);
    await focusTrigger(user, trigger);
    await user.keyboard("{Enter}");
    const outside = screen.getByRole("button", { name: "After navigation" });
    await user.click(outside);
    expectClosed(trigger, panel);
    expect(document.activeElement).toBe(outside);
  });
}

it("preserves account hover opening without moving focus, and dismisses it on pointer leave or Escape", async () => {
  const { user, trigger, panel } = mount(variants[0]);
  const before = screen.getByRole("button", { name: "Before navigation" });
  await user.tab();
  await user.hover(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement).toBe(before);
  await user.hover(within(panel).getByRole("link", { name: "Profile" }));
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  await user.unhover(within(panel).getByRole("link", { name: "Profile" }));
  expectClosed(trigger, panel);
  await user.hover(trigger);
  await user.keyboard("{Escape}");
  expectClosed(trigger, panel);
  expect(document.activeElement).toBe(before);
});

it("keeps the account menu open when a mouse click follows hover opening", async () => {
  const { user, trigger, panel } = mount(variants[0]);
  await user.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  await user.click(trigger);
  expectClosed(trigger, panel);
});

it("opens the account disclosure on the first touch and closes it on the next touch", async () => {
  const { user, trigger, panel } = mount(variants[0]);
  await user.pointer([
    { keys: "[TouchA>]", target: trigger },
    { keys: "[/TouchA]" },
  ]);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  await user.pointer([
    { keys: "[TouchA>]", target: trigger },
    { keys: "[/TouchA]" },
  ]);
  expectClosed(trigger, panel);
});

it("keeps the account menu visible when the pointer leaves while its links hold keyboard focus", async () => {
  const { user, trigger } = mount(variants[0]);
  await focusTrigger(user, trigger);
  await user.keyboard("{Enter}");
  await user.tab();
  const profile = document.activeElement;
  await user.hover(trigger);
  await user.unhover(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement).toBe(profile);
});

it.each(variants)(
  "closes $name after following Profile and preserves the existing reset actions",
  async (variant) => {
    const { user, trigger, panel } = mount(variant);
    await focusTrigger(user, trigger);
    await user.keyboard("{Enter}");
    const profile = within(panel).getByRole("link", { name: "Profile" });
    for (let i = 0; i < 5 && document.activeElement !== profile; i++)
      await user.tab();
    expect(document.activeElement).toBe(profile);
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("location").textContent).toBe("/profile:PUSH");
    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
      tabActions.resetActiveTabs(),
      imagesActions.resetCollectionListState(),
      modelActions.setActiveCarouselData(null),
    ]);
    expectClosed(trigger, panel);
    expect(document.activeElement).toBe(trigger);
  },
);

it("preserves logout and its replacement navigation to the home page", async () => {
  const { user, trigger, panel } = mount(variants[0], "/profile");
  await focusTrigger(user, trigger);
  await user.keyboard("{Enter}");
  await user.tab();
  await user.tab();
  expect(document.activeElement).toBe(
    within(panel).getByRole("button", { name: "Logout" }),
  );
  await user.keyboard(" ");
  expect(dispatch).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ type: "auth/logout" }),
  );
  expect(screen.getByTestId("location").textContent).toBe("/:REPLACE");
  expectClosed(trigger, panel);
});

it("keeps public mobile navigation limited to Home and About", async () => {
  state.auth.isLoggedIn = false;
  const { user, trigger, panel } = mount(variants[1]);
  await focusTrigger(user, trigger);
  await user.keyboard("{Enter}");
  expect(
    within(panel)
      .getAllByRole("link")
      .map((link) => link.textContent),
  ).toEqual(["Home", "About"]);
});

it("gives concurrent disclosures separate controlled IDs and closes the first when focus enters the second", async () => {
  const { user, trigger, panel } = mount({
    ...variants[0],
    Component: () => (
      <>
        <UserNavigation />
        <MobileNavigation />
      </>
    ),
  });
  const mobile = screen.getByRole("button", { name: "Open navigation" });
  expect(mobile.getAttribute("aria-controls")).not.toBe(
    trigger.getAttribute("aria-controls"),
  );
  await focusTrigger(user, trigger);
  await user.keyboard("{Enter}");
  await user.tab();
  await user.tab();
  await user.tab();
  expect(document.activeElement).toBe(mobile);
  expectClosed(trigger, panel);
  await user.keyboard("{Enter}");
  expect(mobile.getAttribute("aria-expanded")).toBe("true");
});

it("removes outside-pointer, focus and keyboard listeners when an open disclosure unmounts", async () => {
  const { user, trigger, unmount } = mount(variants[1]);
  const add = vi.spyOn(document, "addEventListener");
  const remove = vi.spyOn(document, "removeEventListener");
  await focusTrigger(user, trigger);
  await user.keyboard("{Enter}");
  const handlers = add.mock.calls.filter(([type]) =>
    ["pointerdown", "focusin", "keydown"].includes(type),
  );
  expect(handlers).toHaveLength(3);
  unmount();
  for (const [type, handler, options] of handlers) {
    if (options === undefined)
      expect(remove).toHaveBeenCalledWith(type, handler);
    else expect(remove).toHaveBeenCalledWith(type, handler, options);
  }
});
