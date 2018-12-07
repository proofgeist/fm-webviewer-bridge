/* global describe test expect */

import { updateHash } from "./utilities";

describe("Intial Props Test", () => {
  let originalURL = window.location.href;
  let data = { test: true };
  window.location.href = updateHash(originalURL, data);
  const fm = require("../src/main.js");
  test("it should allow registration of a callback for initial props ", done => {
    const propFunction = () => {
      expect(true).toBe(true);
      done();
    };
    fm.initialPropsLoaded(propFunction);
  });
});
