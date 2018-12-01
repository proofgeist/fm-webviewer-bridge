//attatch a windows error handler to make it easier to see errors on windows
import { attach } from "./win.error.handler";
attach();

//polyfill Object.assign for IE
import { polyfill } from "es6-object-assign";
polyfill();

//setup functions and vars for use below
let propsLoadedCallback, loadedProps;

/**
 * this callback runs when props have been loaded
 * if props have already been loaded it runs immediately
 *
 * @param {*} callback
 */
export const initialPropsLoaded = callback => {
  if (loadedProps) return callback(loadedProps);
  propsLoadedCallback = callback;
};

const _saveProps = props => {
  console.log(props);
  loadedProps = props;
  if (propsLoadedCallback) return propsLoadedCallback(props);
};

//start looking for Data from the WebViewer
//this is sync
export const initialProps = (() => {
  if (window.__FM__INLINED__DATA__) {
    //found it directly inlined
    console.log("found props inline");
    _saveProps(__FM__INLINED__DATA__);
    return __FM__INLINED__DATA__;
  } else {
    //look for it on the hash
    let props = decodeURIComponent(location.hash.substr(1));
    try {
      props = JSON.parse(props);
      //found it on the hash
      console.log("found props on hash");
      _saveProps(props);
      return props;
    } catch (e) {
      loadedProps = undefined;
    }
  }
})();

// if we got here we are likely in debug mode.
// look for the example file - this is async
if (!loadedProps) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "data.json", true);
  xhr.responseType = "json";
  xhr.timeout = 100;
  xhr.onload = function() {
    let status = xhr.status;
    if (status === 200) {
      let exampleData = xhr.response;
      console.log("found props in example.json");
      _saveProps(exampleData);
    }
  };
  xhr.onerror = function(e) {
    console.log(e);
  };
  xhr.send();
}

/**
 * @param {string} fileName the name of the file that has the script
 * @param {string} scriptName the name ofthe script to call
 * @param {object|string} data an object or string containing the data to send as the parameter
 */
export const callFMScript = (fileName, scriptName, data, callback) => {
  let parameter = encodeURIComponent(data);
  console.log("calling FM script", scriptName);
  console.log("---->file", fileName);
  console.log("---->parameter!", data);

  if (parameter.length > 1000 && window.clipboardData) {
    window.clipboardData.setData("Text", data);
    parameter = "giant";
  }

  const url =
    "fmp://$/" + fileName + "?script=" + scriptName + "&param=" + parameter;

  //window.location = url;
  const href = window.location.href;
  const body = document.getElementsByTagName("body")[0];
  const a = document.createElement("a");
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
export const externalAPI = (methods = {}) => {
  const apiListener = event => {
    console.log("hash changed");
    // eslint-disable-next-line no-restricted-globals
    let hash = decodeURIComponent(location.hash.substr(1));
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

    const functionName = hash.function;

    let parameter = hash.parameter;
    try {
      parameter = JSON.parse(parameter);
    } catch (e) {}
    const file = hash.callback
      ? hash.callback.file
        ? hash.callback.file
        : ""
      : "";
    const script = hash.callback
      ? hash.callback.script
        ? hash.callback.script
        : ""
      : "";

    console.log("----> function: " + functionName);
    console.log("----> parameter:", parameter);
    console.log("----> callback:", { file, script });
    let result;
    if (methods[functionName]) {
      result = methods[functionName](parameter);
    } else {
      result = {
        errorCode: -2,
        type: "WebViewerAPI",
        descriptor: "function not found: " + functionName
      };
    }

    const handleResult = result => {
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
    addMethods: object => {
      Object.assign(methods, object);
    },
    /**
     * start the API listening for events on Hash change
     */
    start: () => {
      // eslint-disable-next-line no-restricted-globals
      console.log("webviewer api listening");
      window.addEventListener("hashchange", apiListener, false);
    },
    /**
     * remove the listeners
     */
    stop: () => {
      // eslint-disable-next-line no-restricted-globals
      window.removeEventListener("hashchange", apiListener, false);
    }
  };
};
