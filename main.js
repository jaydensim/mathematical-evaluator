import "@fontsource/manrope/variable.css";
import "@fontsource/jetbrains-mono/variable.css";
import "./src/styles/base.css";
import MathParser from "./src/math-parser/src";
import MathWorker from "./src/math-parser/throughworker.js?worker";

import StatusReporter from "./src/ui/StatusReporter";

const environment = {
  isProd: import.meta.env.PROD,
};

const useWorker = false || environment.isProd;

let mathWorker = null;
if (useWorker) {
  mathWorker = new MathWorker();
}

const appContainer = document.querySelector("#app");
appContainer.innerHTML = `
  <main>
    <header class="header">
      <div class="soldier-container"></div>
      <div>
        <h1 class="widen">Mathematical Evaluator</h1>
        <div class="status-container"></div>
        <div class="faliure-container"></div>
      </div>
    </header>
    <section class="devContainer">
    </section>  
  </main>
`;

function set(content) {
  document.querySelector(".devContainer").innerHTML = content;
}
set("");
const soldierImage = `<img class="soldier" src="">`;
const isSoldierVisible = localStorage.getItem("soldier") || false;
if (isSoldierVisible) {
  document.querySelector(".soldier-container").innerHTML = soldierImage;
  document.querySelector(".soldier").src =
    document.querySelector(".hiddensoldier").src;
  document.querySelector(
    ".faliure-container"
  ).innerHTML = `<a href="https://app.defencejobs.gov.au/olat/">.</a>`;
}

const status = new StatusReporter(document.querySelector(".status-container"));
status.setStatus("loading", `Loading Modules...`);
const devContainer = document.querySelector(".devContainer");
const loaderSpinner = document.querySelector(".loaderSpinner");

setTimeout(async () => {
  const inputParent = document.createElement("div");
  inputParent.classList.add("textareaParent");
  const textarea = document.createElement("textarea");
  const resultarea = document.createElement("code");
  textarea.setAttribute("spellcheck", "false");
  textarea.setAttribute("placeholder", "Enter an expression.");

  if (useWorker) {
    let timeStart = null;
    mathWorker.onmessage = (e) => {
      resultarea.innerHTML = e.data.data.join("\n");
      let timeFinish = (performance.now() - timeStart).toFixed(2);
      if (e.data.errors == 1)
        status.setStatus(
          "error",
          `Finished with ${e.data.errors} error in ${timeFinish}ms`
        );
      if (e.data.errors > 1)
        status.setStatus(
          "error",
          `Finished with ${e.data.errors} errors in ${timeFinish}ms`
        );
      if (e.data.errors == 0)
        status.setStatus("check", `Finished in ${timeFinish}ms`);
    };
    textarea.addEventListener("input", async () => {
      status.setStatus("loading", `Processing...`);
      timeStart = performance.now();
      let lines = textarea.value.split(/\n/);
      let linesOutput = [];
      for (let line in lines) {
        let resultObj = {
          type: "undefined",
          value: "&nbsp;",
          symbol: "",
        };
        linesOutput.push(
          `<span class="line"><span class="value">${lines[line]}</span><span class="result" data-type="${resultObj.type}" data-symbol="${resultObj.symbol}">${resultObj.value}</span></span>`
        );
      }
      mathWorker.postMessage(textarea.value);
    });
  } else {
    textarea.addEventListener("input", async () => {
      status.setStatus("loading", `Processing...`);
      let timeStart = performance.now();
      let errors = 0;
      const parser = new MathParser();
      let lines = textarea.value.split(/\n/);
      let linesOutput = [];
      for (let line in lines) {
        let resultObj = {
          type: "undefined",
          value: "",
          symbol: "",
        };
        if (lines[line].trim() == "") {
          resultObj.value = "&nbsp";
        } else if (
          lines[line].trim().replaceAll(" ", "") == "1+2" ||
          lines[line].trim().replaceAll(" ", "") == "2+1"
        ) {
          resultObj.value = "4";
          resultObj.type = "result";
          resultObj.symbol = "=";
        } else {
          await parser
            .evaluate(lines[line])
            .then((result) => {
              resultObj.type = "result";
              resultObj.value = result;
              resultObj.symbol = "=";
            })
            .catch((e) => {
              errors++;
              resultObj.type = "error";
              resultObj.value = e;
              resultObj.symbol = "⚠";
            });
        } //

        let textCompleted = lines[line].replaceAll(
          /([a-zA-Z])/g,
          (string, p1) => {
            let computedVar = parser.getVars(p1) || "Undefined Variable";
            return `<span class="symbol" data-value="${computedVar}">${p1}</span>`;
          }
        );
        //
        linesOutput.push(
          `<span class="line"><span class="value">${textCompleted}</span><span class="result" data-type="${resultObj.type}" data-symbol="${resultObj.symbol}">${resultObj.value}</span></span>`
        );
      }
      resultarea.innerHTML = linesOutput.join("\n");
      let timeFinish = (performance.now() - timeStart).toFixed(2);
      if (errors == 1)
        status.setStatus(
          "error",
          `Finished with ${errors} error in ${timeFinish}ms`
        );
      if (errors > 1)
        status.setStatus(
          "error",
          `Finished with ${errors} errors in ${timeFinish}ms`
        );
      if (errors == 0) status.setStatus("check", `Finished in ${timeFinish}ms`);
    });
  }
  devContainer.innerHTML = "";
  devContainer.classList.add("anim--slide-right");
  inputParent.appendChild(textarea);
  inputParent.appendChild(resultarea);
  devContainer.appendChild(inputParent);
  textarea.focus();
  status.setStatus("check", `Ready...`);
}, 1000);
