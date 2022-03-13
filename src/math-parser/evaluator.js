function calcParseAST(input, CalculatorConstructor) {
  let result = 0;
  let calculator = CalculatorConstructor;
  input.literals.forEach((literal) => {
    calculator.registerNewLiteral(literal.id, literal.value);
  });
  input.varMaps.forEach((varmap) => {
    calculator.registerNewMap(varmap[0], varmap[1]);
  });

  input.flow.forEach((flowElement) => {
    result = calculator.peformOperation(
      flowElement.id,
      flowElement.type,
      flowElement.values
    );
    console.log(result);
  });
  return result;
}

const evaluator = (input, calculator) => {
  return calcParseAST(input, calculator);
};

export default evaluator;
