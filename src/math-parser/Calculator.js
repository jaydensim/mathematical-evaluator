class Calculator {
  stack = [];
  variables = {};
  maps = new Map();
  constructor() {
    this.stack = [];
    this.variables = {};
    this.maps = new Map();
  }

  registerNewLiteral(id, value) {
    this.variables[id] = Number(value);
  }

  registerNewMap(varID, opID) {
    this.maps.set(varID, opID);
  }

  peformOperation(id, type, values) {
    let calcOutput = 0;
    const valueDictionary = values.map((value) => {
      let finalVal = 0;
      if (value.startsWith("VLIT") || value.startsWith("OPER")) {
        finalVal = Number(this.variables[value]);
      } else if (value.startsWith("RCAL")) {
        finalVal = Number(this.variables[this.maps.get(value)]);
      }
      return finalVal;
    });
    switch (type) {
      case "multiply": {
        calcOutput = valueDictionary.reduce((a, b) => a * b);
        break;
      }
      case "divide": {
        calcOutput = valueDictionary.reduce((a, b) => a / b);
        break;
      }
      case "add": {
        calcOutput = valueDictionary.reduce((a, b) => a + b);
        break;
      }
      case "subtract": {
        calcOutput = valueDictionary.reduce((a, b) => a - b);
        break;
      }
      case "expo": {
        calcOutput = Math.pow(valueDictionary[0], valueDictionary[1]);
        break;
      }
    }
    this.variables[id] = calcOutput;
    this.stack.push({ id: id, value: calcOutput });
    return calcOutput;
  }
  clearTree() {
    this.stack = [];
  }
}

export default Calculator;
