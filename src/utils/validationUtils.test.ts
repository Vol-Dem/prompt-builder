import { describe, expect, it, vi } from "vitest";

import { isNumber, validateInput } from "./validationUtils";
import { ERROR_MESSAGE_INVALID_MODEL_ID, VALIDATION_PASSWORD_MIN_LENGTH } from "../variables/constants";
import type { ValidationTypes } from "../types/general.types";

vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", () => ({ getFirestore: () => ({}) }));

describe("validateInput", () => {
  it("accepts an unchanged loaded value while validating edits against current rules", () => {
    const rules = { required: true, maxLength: 3, acceptedValue: "Legacy name" };
    expect(validateInput(rules, "Legacy name")).toEqual({
      inputValue: "Legacy name", isValid: true, errorMessage: "",
    });
    expect(validateInput(rules, "Different name").errorMessage).toBe("Value cannot be more than 3 characters");
    expect(validateInput(rules, "").errorMessage).toBe("This field is required");
    expect(validateInput(rules, "New").isValid).toBe(true);
    expect(validateInput(rules, "Legacy name").isValid).toBe(true);
  });

  it("distinguishes an accepted empty loaded value from a new empty required field", () => {
    expect(validateInput({ required: true, acceptedValue: "" }, "").isValid).toBe(true);
    expect(validateInput({ required: true, acceptedValue: undefined }, "").isValid).toBe(false);
    expect(validateInput({ required: true, acceptedValue: " " }, "").isValid).toBe(false);
  });

  it("returns the original input without trimming or normalizing it", () => {
    expect(validateInput({ required: true }, "  Portrait  ")).toEqual({
      inputValue: "  Portrait  ", isValid: true, errorMessage: "",
    });
    expect(validateInput({ required: true }, " \t\n ")).toEqual({
      inputValue: " \t\n ", isValid: false, errorMessage: "This field is required",
    });
  });

  it("accepts input when no rules are enabled", () => {
    expect(validateInput({}, "")).toEqual({ inputValue: "", isValid: true, errorMessage: "" });
    expect(validateInput({
      required: false, email: false, password: false, number: false, modelId: false,
      maxLength: undefined, minLength: undefined,
    }, "")).toEqual({ inputValue: "", isValid: true, errorMessage: "" });
  });

  it.each(["", " ", "\n\t"])("rejects an empty required value %j", (value) => {
    expect(validateInput({ required: true }, value).errorMessage).toBe("This field is required");
  });

  it.each([
    ["User@Example.test", true], ["@", true], ["user.example.test", false], ["", false],
  ])("retains the current email policy for %j", (value, isValid) => {
    expect(validateInput({ email: true }, value)).toEqual({
      inputValue: value, isValid,
      errorMessage: isValid ? "" : "Please enter a valid email address",
    });
  });

  it.each([2, 3, 4])("checks maximum length at %s characters", (length) => {
    const result = validateInput({ maxLength: 3 }, "x".repeat(length));
    expect(result.isValid).toBe(length <= 3);
    expect(result.errorMessage).toBe(length <= 3 ? "" : "Value cannot be more than 3 characters");
  });

  it.each([2, 3, 4])("checks minimum length at %s characters", (length) => {
    expect(validateInput({ minLength: 3 }, "x".repeat(length))).toEqual({
      inputValue: "x".repeat(length), isValid: length >= 3,
      errorMessage: length >= 3 ? "" : "Value must be at least 3 characters",
    });
  });

  it("counts the original string's spaces toward length limits", () => {
    expect(validateInput({ maxLength: 3 }, " x ").isValid).toBe(true);
    expect(validateInput({ maxLength: 3 }, "  x ").isValid).toBe(false);
  });

  it("preserves zero length limits as disabled rules", () => {
    expect(validateInput({ maxLength: 0, minLength: 0 }, "value").isValid).toBe(true);
  });

  it("selects the first failed rule in the supplied order", () => {
    expect(validateInput({ required: true, email: true }, "").errorMessage)
      .toBe("This field is required");
    expect(validateInput({ email: true, required: true }, "").errorMessage)
      .toBe("Please enter a valid email address");
    expect(validateInput({ maxLength: 3, email: true }, "long").errorMessage)
      .toBe("Value cannot be more than 3 characters");
  });

  it("ignores blur configuration when evaluating validity and error priority", () => {
    for (const disableErrorOnBlur of [false, true]) {
      expect(validateInput({ disableErrorOnBlur, required: true }, ""))
        .toEqual(validateInput({ required: true }, ""));
    }
  });

  it.each([
    "42",
    "https://civitai.com/models/42/example?modelVersionId=7",
    "urn:air:sd1:checkpoint:civitai:42@7",
  ])("accepts a supported model identifier %j", (value) => {
    expect(validateInput({ modelId: true }, value)).toEqual({
      inputValue: value, isValid: true, errorMessage: "",
    });
  });

  it.each(["", "0", "not-an-id"])("rejects an invalid model identifier %j", (value) => {
    expect(validateInput({ modelId: true }, value)).toEqual({
      inputValue: value, isValid: false, errorMessage: ERROR_MESSAGE_INVALID_MODEL_ID,
    });
  });

  it.each(["", " \t\n ", "0", "-1", "1.5", " 2 ", "1e3", "0x10"])(
    "accepts optional numeric input %j", (value) => {
      expect(validateInput({ number: true }, value)).toEqual({
        inputValue: value, isValid: true, errorMessage: "",
      });
    },
  );

  it.each(["abc", "NaN", "Infinity", "-Infinity", "1e309", "1.2.3", "12px", "12,34"])(
    "rejects invalid or nonfinite numeric input %j", (value) => {
      expect(validateInput({ number: true }, value)).toEqual({
        inputValue: value, isValid: false, errorMessage: "Value must be a number",
      });
    },
  );

  it("allows optional blanks but still enforces a required numeric field", () => {
    expect(validateInput({ required: true, number: true }, " ").errorMessage)
      .toBe("This field is required");
    expect(validateInput({ number: false }, "abc").isValid).toBe(true);
  });

  it("retains rule order when a number fails multiple checks", () => {
    expect(validateInput({ number: true, maxLength: 2 }, "abc").errorMessage)
      .toBe("Value must be a number");
    expect(validateInput({ maxLength: 2, number: true }, "abc").errorMessage)
      .toBe("Value cannot be more than 2 characters");
  });

  it("does not mutate a frozen rule configuration", () => {
    const rules: ValidationTypes = Object.freeze({ required: true, email: true, maxLength: 5 });
    expect(validateInput(rules, "long value").errorMessage).toBe("Please enter a valid email address");
    expect(rules).toEqual({ required: true, email: true, maxLength: 5 });
  });
});

describe("configured password rules", () => {
  it("accepts a mixed-case password at the minimum without requiring digits or special characters", () => {
    const value = "Ab" + "c".repeat(VALIDATION_PASSWORD_MIN_LENGTH - 2);
    expect(validateInput({ password: true }, value)).toEqual({
      inputValue: value, isValid: true, errorMessage: "",
    });
  });

  it("rejects a mixed-case password below the minimum", () => {
    const value = "Ab" + "c".repeat(VALIDATION_PASSWORD_MIN_LENGTH - 3);
    expect(validateInput({ password: true }, value).isValid).toBe(false);
  });

  it.each(["abcdef", "ABCDEF", "123456"])("rejects %j without the configured letter combination", (value) => {
    expect(validateInput({ password: true }, value)).toEqual({
      inputValue: value, isValid: false,
      errorMessage: `Password must be at leas ${VALIDATION_PASSWORD_MIN_LENGTH} characters long, contain a mix of upper and lower case letters`,
    });
  });

  it("only applies password strength when enabled by the caller", () => {
    expect(validateInput({ required: true, password: false }, "old").isValid).toBe(true);
    expect(validateInput({ required: true, password: true }, "old").isValid).toBe(false);
  });
});

describe("isNumber", () => {
  it.each([0, -1, 1.5, Number.MAX_VALUE])("accepts the finite number %s", (value) => {
    expect(isNumber(value)).toBe(true);
  });

  it.each([NaN, Infinity, -Infinity, "1", "", null, undefined, true, {}, []])(
    "rejects nonfinite or nonnumeric value %j", (value) => {
      expect(isNumber(value)).toBe(false);
    },
  );
});
