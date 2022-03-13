import MathParser from "./src.js";

onmessage = async function (e) {
  let errors = 0;
  const parser = new MathParser();
  let lines = e.data.split(/\n/);
  let linesOutput = [];
  for (let line in lines) {
    let resultObj = {
      type: "undefined",
      value: "",
      symbol: "",
    };
    if (lines[line].trim() == "") {
      resultObj.value = "&nbsp";
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
    linesOutput.push(
      `<span class="line"><span class="value">${lines[line]}</span><span class="result" data-type="${resultObj.type}" data-symbol="${resultObj.symbol}">${resultObj.value}</span></span>`
    );
  }
  postMessage({ data: linesOutput, errors: errors });
};
