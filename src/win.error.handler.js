export const attach = () => {
  if (window.clipboardData) {
    window.onerror = function(message, source, lineno, colno, error) {
      const errorDiv = document.createElement("div");
      const title = document.createElement("h1");
      title.innerHTML = "Error!";
      errorDiv.appendChild(title);
      const messageP = document.createElement("p");
      messageP.innerHTML = message;
      errorDiv.appendChild(messageP);
      const sourceP = document.createElement("p");
      const n = source.indexOf("#");
      source = source.substring(0, n);
      sourceP.innerHTML = source;
      errorDiv.appendChild(sourceP);

      const ul = document.createElement("ul");
      const line = document.createElement("li");
      line.innerHTML = "line number: " + lineno;
      ul.appendChild(line);

      const col = document.createElement("li");
      col.innerHTML = "column number: " + colno;
      ul.appendChild(col);
      errorDiv.appendChild(ul);
      const body = document.getElementsByTagName("body")[0];
      errorDiv.setAttribute("style", "color:red; font-size:small");
      body.appendChild(errorDiv);
    };
  }
};
