# FM Web Viewer Bridge

## Introduction

This library creates a Bridge between the FileMaker WebViewer and the HTML/JS?CSS App running inside it. It enables two way communication between FileMaker and the App running in the web viewer.

## Goals

1.  make it possible to call JavaScript functions in a web viewer via FileMaker scripts, WITHOUT causing the web viewer to refresh each time.
1.  Allow JavaScript apps to call FileMaker Scripts using the fmp url, with huge amounts of data as the script parameter

## Credits and History
The techniques used in this module are not new. Some of them date back almost 10 years. I presented at DevCon on this topic back when 8.5 shipped. The techniques have changed over the years as Internet explorer improved. I am not sure who first discovered using onHashChange or using an a tag to call an fmp script. I am pretty sure that Jason Young at Seedcode was the first one to use the clipboard as a way to get around the URL length limit. 

Beezwax has also done lots of stuff in this area. Their fmAJAX project and blog posts about it are good source material and informed some of the decisions I made when buulding this module.

https://github.com/beezwax/FMAjax
https://blog.beezwax.net/2015/09/18/fmajax-and-filemaker-web-viewers/

What is new here is the abstraction and the API. It is an attempt to make an API that is easy to understand for JS devs and for FileMaker Devs. It is also an attempt to image what an API might look like if it every made it's way into FileMaker's web viewer.

## Limits

* This will not work on FileMaker WebDirect
* It uses the clipboard on windows, and therefor may interfere with clipboard contents.
* Doesn't work with a data URL. It must be a real URL. It can be to a server somewhere or a locally exported file
* FileMaker 16 and later only.

## Installation

### With ES6 Modules

```
npm install fm-webviewer-bridge
```

then in your app

```
import * as fm from 'fm-webviewer-bridge'
fm.callFMScript(file, script, data)
```

NOTE: if you are going to use ES6 you'll need to transpile your code to ES5 if you want it to work with Windows. You can do this with either babel.js or buble.js

### With a script tag

Include the umd version of the script in the header of your page. The file is in the 'dist' folder. Or You can load it straight from the unpkg.com CDN like so.

```
<script src='https://unpkg.com/fm-webviewer-bridge/dist/fm-webviewer-bridge.umd.js'></script>
```

then later use the `fm` object in other scripts

```
<script>
fm.callFMScript(file, script, data);
//etc...
</script>
```

## How it works

### JavaScript Side

the `fm` object has a some methods on it that let you expose specific JavaScript functions to FileMaker scripts and call back to FileMaker scripts. Here is how you would expose a function called hello to FileMaker Scripts

```
  <script>

  // here is a function called 'hello' that we'll expose
  // to FM below

    const hello = ({ who }) => {
      alert("Hello " + who);

      // anything you return from a function can get
      // sent back to fm by providing a callback;
      return { message: "hello " + who }
    }


    // create the externalAPIbridge and give it a function
    //called 'hello' but expose it to FM as 'fmHello

    const exteralAPI = fm.externalAPI({ fmHello: hello })
    exteralAPI.start();


    //later you can add more 'methods' ie 'functions'

    exteralAPI.addMethods({
      goodbye : ()=>{alert('goodbye')},
      seeYouSoon : ()=>{alert('see you soon')}
    })

    // when you want to call a FileMaker script
    fm.callFMScript('TestFile', 'myScript', someJSON);
  </script>
```

## FileMaker Side

There is a FileMaker Web Viewer Bridge Module that is designed to work with the JavaScript API. It has a couple of scripts that you call to first load the web app into a given web viewer, and then execute JavaScript on that web viewer

Here are the two scripts

* Load WebViewer App ( {webViewer; url , initialProps } )
* Execute JavaScript ( { function, parameter, ...} )

Both of these take JSON objects as parameters. Each property is documented within those scripts.

### Load Webviewer

You call "Load WebViewer..." first. When that script is done you can safely assume the web app is ready to receive calls from FileMaker.

The properties of that JSON Parameter tell what URL to load on what WebViewer. And also provide a way to load a bunch of JSON into the app on startup through the `intialProps` parameter. Anything passed there will be available on `fm.initialProps` in your JavaScript application

### Execute JavaScript On A WebViewer

Calling JavaScript on a webViewer amounts to describing the name of the function you want to call and the parameters to call it with as part of a JSON Object. Here is an example.

```json
{
  "function" : "hello",
  "parameter" : {"who": "Todd"},
  "webViewer" : "webAppWebViewer",
  "callback" : {
    "script": "Handle CallBack FileMaker Script"},
    "file" : "Contacts.fmp12"
  }
}
```

Passing that JSON to "Execute JavaScript..." script will attempt to call a JavaSCript function exposed as "hello", with the parameter `{"who": "Todd"}`, and it will call the script "Handle CallBack FileMaker Script" in the file "Contacts.fmp12" with the results of the function.

## Example

See the FM-WebViewer-Bridge.fmp12 file for a full working example.
