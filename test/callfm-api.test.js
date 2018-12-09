/* global describe test expect */

import * as fm from "../src/main.js";

describe("callFMScript Test", () => {
  test("It should be a function", () => {
    expect(fm.callFMScript).toBeInstanceOf(Function);
  });

  test("It should build and trigger an fmpurl", done => {
    const fmURLTest = event => {
      expect(event.target.href).toBe(
        "fmp://$/some%20test?script=some%20script&param=undefined"
      );
      document.body.removeEventListener("click", fmURLTest);
      done();
    };
    document.body.addEventListener("click", fmURLTest);
    fm.callFMScript("some test", "some script");
  });
  test("It should include a script parameter", done => {
    const fmURLParamTest = event => {
      expect(event.target.href).toBe(
        "fmp://$/some%20test?script=some%20script&param=data"
      );
      document.body.removeEventListener("click", fmURLParamTest);
      done();
    };
    document.body.addEventListener("click", fmURLParamTest);
    fm.callFMScript("some test", "some script", "data");
  });
});
