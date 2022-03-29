function parseInternal(input, CalculationtreeConstructor) {
  let calculation = CalculationtreeConstructor;
  let inputTransformed = input;
  let basicOperationMatcher = (opMatcher, input, onResult) => {
    //const matchString = "([VO][a-zA-Z0-9]+IX)((\\)*\\s*\\" + opMatcher + "\\s*)([VO][a-zA-Z0-9]+IX))+";
    const matchString =
      "([VOR][a-zA-Z0-9]+IX)((\\s*\\" +
      opMatcher +
      "\\s*)([VOR][a-zA-Z0-9]+IX))+";
    let matcher = new RegExp(matchString, "g");
    return input.replaceAll(matcher, (match) => {
      return onResult(match.replaceAll(" ", "").split(opMatcher));
    });
  };

  let transformers = [
    // Match Literals
    () => {
      inputTransformed = inputTransformed.replaceAll(
        /(\[\-[\d\.]+\])|[\d\.]+/g,
        (match) => {
          //console.log(match);
          return " " + calculation.createLiteral(match);
        }
      );
      return "literals";
    },
    // Match exponents
    () => {
      inputTransformed = basicOperationMatcher(
        "^",
        inputTransformed,
        (match) => {
          return calculation.createBasicOperation("expo", match);
        }
      );
      return "expo";
    },
    // Match Multiplication
    () => {
      inputTransformed = basicOperationMatcher(
        "*",
        inputTransformed,
        (match) => {
          return calculation.createBasicOperation("multiply", match);
        }
      );
      return "multiply";
    },
    // Match Division
    () => {
      inputTransformed = basicOperationMatcher(
        "/",
        inputTransformed,
        (match) => {
          return calculation.createBasicOperation("divide", match);
        }
      );
      return "divide";
    },
    // Match Addition
    () => {
      inputTransformed = basicOperationMatcher(
        "+",
        inputTransformed,
        (match) => {
          return calculation.createBasicOperation("add", match);
        }
        // Are you still reading this? I'm sorry.
      );
      return "add";
    },
    // Match Subtraction
    () => {
      inputTransformed = basicOperationMatcher(
        "-",
        inputTransformed,
        (match) => {
          return calculation.createBasicOperation("subtract", match);
        }
      );
      return "subtract";
    },
  ];
  transformers.forEach((transformer) => {
    //console.log(inputTransformed);
    let op = transformer();
    inputTransformed = inputTransformed.replaceAll("  ", " ");
  });
  return calculation.constructedTree.flow[
    calculation.constructedTree.flow.length - 1
  ].id;
}

function generateParseFunction(input, CalculationtreeConstructor) {
  let IDrandomGen = () => {
    let numStr = (Math.random() + 1)
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substring(2);
    return "RCAL" + numStr + "IX";
  };

  let sections = new Map();
  let inputTransformed = input;
  inputTransformed = inputTransformed.replaceAll(
    /(\((\-)?[\d]+\))/g,
    (match) => {
      //console.log(match);
      return match.replaceAll("(", "[").replaceAll(")", "]");
    }
  );
  inputTransformed =
    "(*" + inputTransformed.replaceAll("(", "(*").replaceAll(")", "*)") + "*)";

  //console.log(inputTransformed);
  let inputWithBrackets = inputTransformed;

  const bracketmatcher =
    /\(+\*+(?:(?:\(+\*+(?:(?:\(+\*+(?:[^*(]|(?:\*+[^)*])|(?:\(+[^*(]))*\*+\)+)|[^*(]|(?:\*+[^)*])|(?:\(+[^*(]))*\*+\)+)|[^*(]|(?:\*+[^)*])|(?:\(+[^*(]))*\*+\)+/g;
  // Thanks to whoever built this. I feel sorry for you. (https://regex101.com/r/NsVPFp/3)

  let matcherFunction = (input) => {};
  matcherFunction = (input) => {
    let matches = input.match(bracketmatcher);
    if (matches) {
      matches.forEach((matched) => {
        const match = matched.substring(2, matched.length - 2);
        let generatedID = IDrandomGen();
        inputTransformed = inputTransformed.replace(matched, generatedID);
        sections.set(generatedID, match);
        matcherFunction(match);
      });
    }
  };
  matcherFunction(inputWithBrackets);
  let parseGroups = Array.from(sections);
  let reversedParseGroups = Array.from(sections).reverse();
  let mapper = (id) => {
    parseGroups = parseGroups.map((item) => [
      item[0],
      item[1].replace("(*" + id[1] + "*)", id[0]),
    ]);
  };
  reversedParseGroups.forEach(mapper);
  parseGroups.forEach(mapper);
  let mapdirectory = new Map();

  parseGroups = parseGroups.reverse();
  parseGroups.forEach((group) => {
    let groupCalc = group[1];
    Array.from(mapdirectory).forEach((mapEl) => {
      groupCalc.replaceAll(mapEl[0], mapEl[1]);
    });
    const parseID = parseInternal(groupCalc, CalculationtreeConstructor);
    mapdirectory.set(group[0], parseID);
    CalculationtreeConstructor.pushVarMap(group[0], parseID);
  });
  //console.log(CalculationtreeConstructor.constructedTree);

  return CalculationtreeConstructor;
}

const parse = (input, CTC) => {
  return new Promise((resolve, reject) => {
    //console.log(input);
    try {
      const transport = generateParseFunction(input, CTC);
      resolve(transport);
    } catch (e) {
      reject("ParseError");
    }
  });
};

export default parse;
