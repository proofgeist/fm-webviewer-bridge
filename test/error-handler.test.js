/* global describe test expect */
import $ from "jquery";
import { attach } from "../src/win.error.handler";

describe("callFMScript Test", () => {
  test("it should be a function", () => {
    expect(attach).toBeInstanceOf(Function);
  });
  test("it should attach to the window if clipboardData is supported", () => {
    window.onerror = "";
    window.clipboardData = true;
    attach();
    expect(window.onerror).toBeInstanceOf(Function);
  });
  test("it should append an error to the document body", done => {
    window.onerror("error message", window.location.href, 1, 1);
    expect(
      $("div")
        .first()
        .children("h1")
        .text()
    ).toBe("Error!");
    expect(
      $("div")
        .first()
        .children("p")
        .text()
    ).toBe("error message");
    done();
  });
  test("it should not attach to the window if clipboardData is not supported", done => {
    window.onerror = (message, source, lineno, colno, error) => {
      expect(message).toBe("error message");
      done();
    };
    window.clipboardData = false;
    attach();
    window.onerror("error message", window.location.href, 1, 1);
  });
});
