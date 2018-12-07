/* global describe test expect */

import * as fm from "../src/main.js";

describe("Main Export Test", () => {
  test("it should have specific properties", () =>
    expect(fm).toHaveProperty(
      "externalAPI",
      "callFMScript",
      "initialProps",
      "initialPropsLoaded"
    ));

  test("it should have a externalAPI function", () =>
    expect(fm.externalAPI).toBeInstanceOf(Function));

  test("it should have a callFMScript function", () =>
    expect(fm.callFMScript).toBeInstanceOf(Function));

  test("it should have an initialPropsLoaded function", () =>
    expect(fm.initialPropsLoaded).toBeInstanceOf(Function));
});
