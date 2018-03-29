'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var attach = function () {
  if (window.clipboardData) {
    window.onerror = function(message, source, lineno, colno, error) {
      var errorDiv = document.createElement("div");
      var title = document.createElement("h1");
      title.innerHTML = "Error!";
      errorDiv.appendChild(title);
      var messageP = document.createElement("p");
      messageP.innerHTML = message;
      errorDiv.appendChild(messageP);
      var sourceP = document.createElement("p");
      var n = source.indexOf("#");
      source = source.substring(0, n);
      sourceP.innerHTML = source;
      errorDiv.appendChild(sourceP);

      var ul = document.createElement("ul");
      var line = document.createElement("li");
      line.innerHTML = "line number: " + lineno;
      ul.appendChild(line);

      var col = document.createElement("li");
      col.innerHTML = "column number: " + colno;
      ul.appendChild(col);
      errorDiv.appendChild(ul);
      var body = document.getElementsByTagName("body")[0];
      errorDiv.setAttribute("style", "color:red; font-size:small");
      body.appendChild(errorDiv);
    };
  }
};

/**
 * Code refactored from Mozilla Developer Network:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */

function assign(target, firstSource) {
  var arguments$1 = arguments;

  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }

  var to = Object(target);
  for (var i = 1; i < arguments.length; i++) {
    var nextSource = arguments$1[i];
    if (nextSource === undefined || nextSource === null) {
      continue;
    }

    var keysArray = Object.keys(Object(nextSource));
    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      var nextKey = keysArray[nextIndex];
      var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey];
      }
    }
  }
  return to;
}

function polyfill() {
  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: assign
    });
  }
}

var es6ObjectAssign = {
  assign: assign,
  polyfill: polyfill
};
var es6ObjectAssign_2 = es6ObjectAssign.polyfill;

//attatch a windows error handler to make it easier to see errors on windows
attach();
es6ObjectAssign_2();

/**
 * returns the props attached at startup
 */
var initialProps = (function () {
  var props = decodeURIComponent(location.hash.substr(1));
  try {
    props = JSON.parse(props);
  } catch (e) {}
  console.log("initialProps");
  console.log(props);
  return props;
})();

/**
 * @param {string} fileName the name of the file that has the script
 * @param {string} scriptName the name ofthe script to call
 * @param {object|string} data an object or string containing the data to send as the parameter
 */
var callFMScript = function (fileName, scriptName, data, callback) {
  var parameter = encodeURIComponent(data);
  console.log("calling FM script", scriptName);
  console.log("---->file", fileName);
  console.log("---->parameter!", data);

  if (parameter.length > 1000 && window.clipboardData) {
    window.clipboardData.setData("Text", data);
    parameter = "giant";
  }

  var url =
    "fmp://$/" + fileName + "?script=" + scriptName + "&param=" + parameter;

  //window.location = url;
  var href = window.location.href;
  var body = document.getElementsByTagName("body")[0];
  var a = document.createElement("a");
  a.href = url;
  a.style.display = "none";
  body.appendChild(a);
  a.click();
  a.parentNode.removeChild(a);

  //IE FIX
  if (href.indexOf("#") > -1) {
    setTimeout(function() {
      window.location.href = href;
    }, 1);
  }
};

/**
 * Turns the API on
 * @param {object} [methods={}] object containing a key for each function to expose
 */
var externalAPI = function (methods) {
  if ( methods === void 0 ) methods = {};

  var apiListener = function (event) {
    console.log("hash changed");
    // eslint-disable-next-line no-restricted-globals
    var hash = decodeURIComponent(location.hash.substr(1));
    if (window.clipboardData && hash === "giant") {
      hash = window.clipboardData.getData("Text");
      hash = hash.substr(1);
    }

    if (!hash) {
      console.log("----> hash was empty");
      return;
    }
    //const href = window.location.href;

    window.location.hash = ""; // clear this for the next call

    hash = hash.split("h^").join("#");
    hash = JSON.parse(hash);
    console.log(hash);

    var functionName = hash.function;

    var parameter = hash.parameter;
    try {
      parameter = JSON.parse(parameter);
    } catch (e) {}
    var file = hash.callback
      ? hash.callback.file ? hash.callback.file : ""
      : "";
    var script = hash.callback
      ? hash.callback.script ? hash.callback.script : ""
      : "";

    console.log("----> function: " + functionName);
    console.log("----> parameter:", parameter);
    console.log("----> callback:", { file: file, script: script });
    var result;
    if (methods[functionName]) {
      result = methods[functionName](parameter);
    } else {
      result = {
        errorCode: -2,
        type: "WebViewerAPI",
        descriptor: "function not found: " + functionName
      };
    }

    var handleResult = function (result) {
      console.log("RESULT", result);
      if (script) {
        if (typeof result === "string" || result instanceof String) {
          //no-op
        } else {
          result = JSON.stringify(result);
        }

        callFMScript(file, script, result);
      }
    };

    if (result && result.then && typeof result.then === "function") {
      // the result was a promise
      return result.then(handleResult);
    } else {
      return handleResult(result);
    }
  };
  return {
    /**
     * add more methods to the API
     * @param {object} object an object with keys for each function/method to add
     */
    addMethods: function (object) {
      Object.assign(methods, object);
    },
    /**
     * start the API listening for events on Hash change
     */
    start: function () {
      // eslint-disable-next-line no-restricted-globals
      console.log("webviewer api listening");
      window.addEventListener("hashchange", apiListener, false);
    },
    /**
     * remove the listeners
     */
    stop: function () {
      // eslint-disable-next-line no-restricted-globals
      window.removeEventListener("hashchange", apiListener, false);
    }
  };
};

exports.initialProps = initialProps;
exports.callFMScript = callFMScript;
exports.externalAPI = externalAPI;
