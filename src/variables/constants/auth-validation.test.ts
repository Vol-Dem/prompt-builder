import { describe, expect, it, vi } from "vitest";

import { AUTH_VALIDATION } from "./auth-validation";
import { validateInput } from "../../utils/validationUtils";
import { VALIDATION_EMAIL_MAX_LENGTH, VALIDATION_PASSWORD_MAX_LENGTH, VALIDATION_USERNAME_MAX_LENGTH } from "./validation.js";

vi.mock("../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", () => ({ getFirestore: () => ({}) }));

describe("authentication validation policies", () => {
  it.each(["a", "lowercasepassword"])("accepts existing password %j without applying new-password strength", (value) => {
    expect(validateInput(AUTH_VALIDATION.login.password, value).isValid).toBe(true);
    expect(validateInput(AUTH_VALIDATION.reauthentication.password, value).isValid).toBe(true);
    expect(validateInput(AUTH_VALIDATION.signup.password, value).isValid).toBe(false);
    expect(validateInput(AUTH_VALIDATION.profile.newPassword, value).isValid).toBe(false);
  });

  it.each(["", " \t "])("requires a password for login, signup and reauthentication (%j)", (value) => {
    for (const rules of [AUTH_VALIDATION.login.password, AUTH_VALIDATION.signup.password,
      AUTH_VALIDATION.reauthentication.password, AUTH_VALIDATION.profile.newPassword]) {
      expect(validateInput(rules, value).errorMessage).toBe("This field is required");
    }
  });

  it("accepts a password meeting the configured new-password rules", () => {
    expect(validateInput(AUTH_VALIDATION.signup.password, "Abcdef").isValid).toBe(true);
    expect(validateInput(AUTH_VALIDATION.profile.newPassword, "Abcdef").isValid).toBe(true);
  });

  it("retains password length limits only in workflows that already had them", () => {
    const atLimit = "A" + "b".repeat(VALIDATION_PASSWORD_MAX_LENGTH - 1);
    const overLimit = atLimit + "b";
    for (const rules of [AUTH_VALIDATION.reauthentication.password, AUTH_VALIDATION.profile.newPassword]) {
      expect(validateInput(rules, atLimit).isValid).toBe(true);
      expect(validateInput(rules, overLimit).errorMessage)
        .toBe(`Value cannot be more than ${VALIDATION_PASSWORD_MAX_LENGTH} characters`);
    }
    expect(validateInput(AUTH_VALIDATION.login.password, overLimit).isValid).toBe(true);
    expect(validateInput(AUTH_VALIDATION.signup.password, overLimit).isValid).toBe(true);
  });

  it("keeps the profile's current password optional and free of strength or length restrictions", () => {
    for (const value of ["", "a", "x".repeat(VALIDATION_PASSWORD_MAX_LENGTH + 1)]) {
      expect(validateInput(AUTH_VALIDATION.profile.currentPassword, value).isValid).toBe(true);
    }
  });

  it.each([
    ["login", AUTH_VALIDATION.login.email], ["signup", AUTH_VALIDATION.signup.email],
    ["reset", AUTH_VALIDATION.reset.email], ["profile", AUTH_VALIDATION.profile.email],
  ])("retains required, format and length rules for %s email", (_, rules) => {
    expect(validateInput(rules, "").errorMessage).toBe("This field is required");
    expect(validateInput(rules, "missing-at").errorMessage).toBe("Please enter a valid email address");
    const atLimit = "a".repeat(VALIDATION_EMAIL_MAX_LENGTH - 2) + "@b";
    expect(validateInput(rules, atLimit).isValid).toBe(true);
    expect(validateInput(rules, atLimit + "c").isValid).toBe(false);
  });

  it("retains the profile name's required and length checks without trimming the returned value", () => {
    expect(validateInput(AUTH_VALIDATION.profile.name, " ").isValid).toBe(false);
    expect(validateInput(AUTH_VALIDATION.profile.name, "x".repeat(VALIDATION_USERNAME_MAX_LENGTH)).isValid).toBe(true);
    expect(validateInput(AUTH_VALIDATION.profile.name, "x".repeat(VALIDATION_USERNAME_MAX_LENGTH + 1)).isValid).toBe(false);
    expect(validateInput(AUTH_VALIDATION.profile.name, " New name ").inputValue).toBe(" New name ");
  });
});
