import MathParser from "./src.js";

onmessage = async function (e) {
  let errors = 0;
  const parser = new MathParser();
  let lines = e.data[0].split(/\n/);
  let linesOutput = [];
  let totalLines = lines.length;
  let currentLine = 0;
  for (let line in lines) {
    currentLine++;
    let resultObj = {
      type: "undefined",
      value: "",
      symbol: "",
    };
    if (lines[line].trim() == "") {
      resultObj.value = "&nbsp";
    } else if (
      e.data[1].flags.includes("faliure") &&
      (lines[line].trim().replaceAll(" ", "") == "1+2" ||
        lines[line].trim().replaceAll(" ", "") == "2+1")
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
    }
    let textCompleted = lines[line].replaceAll(/([a-zA-Z])/g, (string, p1) => {
      let computedVar = parser.getVars(p1) || "Undefined Variable";
      return `<span class="symbol" data-value="${computedVar}">${p1}</span>`;
    });
    linesOutput.push(
      `<span class="line"><span class="value">${textCompleted}</span><span class="result" data-type="${resultObj.type}" data-symbol="${resultObj.symbol}">${resultObj.value}</span></span>`
    );
    postMessage({
      type: "status",
      status: currentLine,
      totalLines: totalLines,
    });
  }
  postMessage({
    type: "final",
    data: linesOutput,
    errors: errors,
  });
};
