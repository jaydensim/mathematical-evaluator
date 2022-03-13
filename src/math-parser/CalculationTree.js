class CalculationTree {
  constructedTree = {
    literals: [],
    varMaps: [],
    flow: [],
  };
  constructor() {
    this.constructedTree = {
      literals: [],
      varMaps: [],
      flow: [],
    };
  }

  #IDrandomGen() {
    return (Math.random() + 1)
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substring(2);
  }

  /* declarations */
  createLiteral(value) {
    const parsedValue = Number(value.replaceAll("[", "").replaceAll("]", ""));
    const randomID = this.#IDrandomGen();
    this.constructedTree.literals.push({
      id: "VLIT" + randomID + "IX",
      value: parsedValue,
    });
    return "VLIT" + randomID + "IX";
  }

  /* operations */
  createBasicOperation(opType, literals) {
    if (!"add,subtract,multiply,divide,expo".split(",").includes(opType)) {
      throw new Error("Invalid operation type");
    }
    const randomID = this.#IDrandomGen();
    this.constructedTree.flow.push({
      id: "OPER" + randomID + "IX",
      type: opType,
      values: literals.join(",").split(","),
    });
    return "OPER" + randomID + "IX";
  }
  pushVarMap(varID, opID) {
    this.constructedTree.varMaps.push([varID, opID]);
  }

  serialise() {
    return [this.constructedTree][0];
  }
}

export default CalculationTree;
