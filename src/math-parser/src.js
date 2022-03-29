import CalculationTree from "./CalculationTree";
import Calculator from "./Calculator";
import evaluator from "./evaluator";
import parse from "./parse";

class MathParser {
  transport = null;
  calculator = null;
  variables = null;
  constructor() {
    this.transport = new CalculationTree();
    this.calculator = new Calculator();
    this.variables = new Map();
  }

  evaluate(input) {
    return new Promise(async (resolve, reject) => {
      const matchString = /([a-zA-Z\.])\s*\=\s*(.+)$/g;
      const opMatchString = /[\+\-\*\/\^]/g;
      const matches = input.match(matchString);
      if (matches) {
        const varDecs = matchString.exec(input);
        if (varDecs[2].match(opMatchString)) {
          let inputString = this.#replacer(varDecs[2], this.variables);
          this.#parse(inputString + "-0")
            .then((out) => {
              this.variables.set(varDecs[1], out);
              resolve(`Declare ${varDecs[1]} as ${out}`);
            })
            .catch((e) => {
              reject(e);
            });
        } else {
          let inputString = this.#replacer(varDecs[2], this.variables);
          this.variables.set(varDecs[1], inputString);
          resolve(`Declare ${varDecs[1]} as ${inputString}`);
        }
      } else {
        let inputString = this.#replacer(input, this.variables);
        if (inputString.match(opMatchString)) {
          this.#parse(inputString)
            .then((out) => {
              resolve(out);
            })
            .catch((e) => {
              reject(e);
            });
        } else {
          resolve(inputString);
        }
      }
    });
  }
  getVars(val) {
    return this.variables.get(val) || null;
  }
  async #parse(input) {
    return new Promise(async (resolve, reject) => {
      try {
        this.calculator.clearTree();
        const parsedTransport = await parse(input, this.transport);
        const calculationTree = parsedTransport.serialise();
        resolve(evaluator(calculationTree, this.calculator));
      } catch (e) {
        reject(e);
      }
    });
  }
  // Why are you still reading this?
  #replacer(str, map) {
    map.set("e", Math.E);
    let inputString = str;
    Array.from(map).forEach((element) => {
      let matchFns = [
        () => {
          const matchStr = new RegExp(
            `([a-zA-Z0-9\\.]*)([${element[0]}])([a-zA-Z0-9\\.]*)`,
            "g"
          );
          for (let i = 0; i <= 100; i++) {
            inputString = inputString.replaceAll(
              matchStr,
              (match, p1, p2, p3) => {
                let pe1 = p1;
                let pe3 = p3;
                //console.log(p1, p3);
                if (pe3 !== "") pe3 = pe3 + "*";
                if (pe1 !== "") pe1 = pe1 + "*";
                return `${pe1}${element[1]}${pe3}`;
              }
            );
          }
        },
        () => {
          const matchStr = new RegExp(
            `([\\+\\-\\*\\/\\^\\s]*)([${element[0]}])([\\+\\-\\*\\/\\^\\s]*)`,
            "g"
          );
          inputString = inputString.replaceAll(
            matchStr,
            (match, p1, p2, p3) => {
              return `${p1}${element[1]}${p3}`;
            }
          );
        },
      ];
      matchFns.forEach((fn) => fn());
    });
    return inputString;
  }
}

export default MathParser;
