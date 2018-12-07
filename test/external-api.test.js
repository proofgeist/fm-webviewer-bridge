/* global describe beforeEach afterEach test expect */

import * as fm from "../src/main.js";
import { updateHash } from "./utilities";

describe("External API", () => {
  let originalURL = window.location.href;
  let externalAPI;
  beforeEach(() => {
    externalAPI = fm.externalAPI();
  });

  afterEach(() => {
    externalAPI.stop();
    externalAPI = "";
  });

  test("it should be an object", () =>
    expect(externalAPI).toBeInstanceOf(Object));

  test("it should have specific properties", () =>
    expect(fm.externalAPI()).toHaveProperty(
      "addMethods",
      "start",
      "initialPropsLoaded",
      "stop"
    ));

  test("it should have a start function", () =>
    expect(externalAPI.start).toBeInstanceOf(Function));

  test("it should have an addMethods function", () =>
    expect(externalAPI.addMethods).toBeInstanceOf(Function));

  test("it should have a stop function", () =>
    expect(externalAPI.stop).toBeInstanceOf(Function));

  test("it should not require function registration before starting", () => {
    externalAPI = fm.externalAPI();
    externalAPI.start();
    return expect(externalAPI.start).toBeInstanceOf(Function);
  });

  test("it should allow you to register a function after starting", done => {
    const test = () => {
      expect(true).toEqual(true);
      done();
    };
    externalAPI.start();
    externalAPI.addMethods({ test });
    window.location.href = originalURL + '#{"function":"test"}';
  });

  // test("it should allow you to register a promise after starting", done => {
  //   const test = () => Promise.resolve(true);

  //   externalAPI.start();
  //   externalAPI.addMethods({ test });
  //   window.location.href = originalURL + '#{"function":"test"}';
  // });

  test("it should should listen for an updated hash", done => {
    let data = {
      function: "test"
    };
    const test = () => {
      expect(true).toEqual(true);
      newExternalAPI.stop();
      done();
    };
    let newExternalAPI = fm.externalAPI({ test });
    newExternalAPI.start();
    window.location.href = updateHash(originalURL, data);
  });

  test("it should stop listening for an updated hash", done => {
    let data = {
      function: "test"
    };
    const test = () => {
      expect(false).toEqual(true);
      done();
    };
    let newExternalAPI = fm.externalAPI({ test });
    newExternalAPI.start();
    newExternalAPI.stop();
    window.location.href = updateHash(originalURL, data);
    setTimeout(() => done(), 2000);
  });

  test("it should pass a parameter to a registered function", done => {
    let data = {
      function: "test",
      parameter: '"data"'
    };
    const test = data => {
      setTimeout(() => done(), 1000);
      expect(data).toEqual("data");
      return data;
    };
    externalAPI.addMethods({ test });
    externalAPI.start();

    window.location.href = updateHash(originalURL, data);
  });

  test("it should not parse an invalid json parameter", done => {
    let data = {
      function: "test",
      parameter: "{invalid:True}"
    };
    const test = data => {
      setTimeout(() => done(), 2000);
      expect(data).toBe("{invalid:True}");
      return data;
    };
    externalAPI.addMethods({ test });
    externalAPI.start();

    window.location.href = updateHash(originalURL, data);
  });

  test("it should parse a valid json parameter", done => {
    let data = {
      function: "test",
      parameter: JSON.stringify({ data: true })
    };
    const test = data => {
      setTimeout(() => done(), 2000);
      expect(data).toBeInstanceOf(Object);
      expect(data).toEqual({ data: true });
      return data;
    };
    externalAPI.addMethods({ test });
    externalAPI.start();

    window.location.href = updateHash(originalURL, data);
  });
});
