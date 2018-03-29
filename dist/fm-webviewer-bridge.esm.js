const initialProps = (() => {
  let props = decodeURIComponent(location.hash.substr(1));
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
const callFMScript = (fileName, scriptName, data, callback) => {
  let parameter = encodeURIComponent(data);
  console.log("calling FM script", scriptName);
  console.log("---->file", fileName);
  console.log("---->parameter!", data);

  if (parameter.length > 1000 && window.clipboardData) {
    window.clipboardData.setData("Text", parameter);
    parameter = "giant";
  }

  const url =
    "fmp://$/" + fileName + "?script=" + scriptName + "&param=" + parameter;

  //window.location = url;
  const href = window.location.href;
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
const externalAPI = (methods = {}) => {
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
      ? hash.callback.file ? hash.callback.file : ""
      : "";
    const script = hash.callback
      ? hash.callback.script ? hash.callback.script : ""
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

export { initialProps, callFMScript, externalAPI };
