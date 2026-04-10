export interface ArithmeticPrompt {
  left: number;
  right: number;
  prompt: string;
  answer: string;
}

export interface EqualityPrompt {
  leftPrompt: string;
  rightPrompt: string;
  prompt: string;
  answer: "yes" | "no";
}

export interface EquivalencePrompt {
  left: number;
  right: number;
  target: number;
  prompt: string;
}

export interface PlatformAccessChallengeSet {
  stageOne: ArithmeticPrompt;
  stageTwo: EqualityPrompt;
  stageThree: EquivalencePrompt;
}

export interface PlatformAccessRecord {
  unlockedAt: string;
  accessKey: string;
  accessKeyId?: string | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOperator() {
  return Math.random() > 0.5 ? "+" : "-";
}

function buildExpression(total: number) {
  const operator = pickOperator();

  if (operator === "+") {
    const left = randomInt(1, Math.max(2, total - 1));
    const right = total - left;

    return {
      prompt: `${left} + ${right}`,
      value: total,
    };
  }

  const right = randomInt(1, 9);
  const left = total + right;

  return {
    prompt: `${left} - ${right}`,
    value: total,
  };
}

export function createPlatformAccessChallengeSet(): PlatformAccessChallengeSet {
  const stageOneLeft = randomInt(2, 8);
  const stageOneRight = randomInt(2, 8);
  const stageOneTotal = stageOneLeft + stageOneRight;

  const stageTwoTarget = randomInt(4, 15);
  const leftExpression = buildExpression(stageTwoTarget);
  const shouldMatch = Math.random() > 0.35;
  const rightTarget = shouldMatch
    ? stageTwoTarget
    : stageTwoTarget + (Math.random() > 0.5 ? 1 : -1) * randomInt(1, 3);
  const rightExpression = buildExpression(Math.max(1, rightTarget));

  const stageThreeLeft = randomInt(2, 9);
  const stageThreeRight = randomInt(2, 9);

  return {
    stageOne: {
      left: stageOneLeft,
      right: stageOneRight,
      prompt: `${stageOneLeft} + ${stageOneRight} =`,
      answer: String(stageOneTotal),
    },
    stageTwo: {
      leftPrompt: leftExpression.prompt,
      rightPrompt: rightExpression.prompt,
      prompt: `${leftExpression.prompt} = ${rightExpression.prompt}`,
      answer: shouldMatch ? "yes" : "no",
    },
    stageThree: {
      left: stageThreeLeft,
      right: stageThreeRight,
      target: stageThreeLeft + stageThreeRight,
      prompt: `${stageThreeLeft} + ${stageThreeRight} =`,
    },
  };
}

function tokenizeExpression(input: string) {
  const sanitized = input.replace(/\s+/g, "");

  if (!sanitized || /[^0-9+\-*/().]/.test(sanitized)) {
    return null;
  }

  const tokens = sanitized.match(/\d+|[()+\-*/]/g);

  return tokens && tokens.join("") === sanitized ? tokens : null;
}

function precedence(operator: string) {
  return operator === "+" || operator === "-" ? 1 : 2;
}

function applyOperator(values: number[], operator: string) {
  const right = values.pop();
  const left = values.pop();

  if (left === undefined || right === undefined) {
    throw new Error("Malformed expression");
  }

  switch (operator) {
    case "+":
      values.push(left + right);
      break;
    case "-":
      values.push(left - right);
      break;
    case "*":
      values.push(left * right);
      break;
    case "/":
      if (right === 0) {
        throw new Error("Division by zero");
      }

      values.push(left / right);
      break;
    default:
      throw new Error("Unknown operator");
  }
}

export function evaluateArithmeticExpression(input: string) {
  const tokens = tokenizeExpression(input);

  if (!tokens) {
    return null;
  }

  const values: number[] = [];
  const operators: string[] = [];

  try {
    for (const token of tokens) {
      if (/^\d+$/.test(token)) {
        values.push(Number(token));
        continue;
      }

      if (token === "(") {
        operators.push(token);
        continue;
      }

      if (token === ")") {
        while (operators.length && operators[operators.length - 1] !== "(") {
          applyOperator(values, operators.pop() as string);
        }

        if (operators.pop() !== "(") {
          return null;
        }

        continue;
      }

      while (
        operators.length &&
        operators[operators.length - 1] !== "(" &&
        precedence(operators[operators.length - 1] as string) >= precedence(token)
      ) {
        applyOperator(values, operators.pop() as string);
      }

      operators.push(token);
    }

    while (operators.length) {
      const operator = operators.pop() as string;

      if (operator === "(") {
        return null;
      }

      applyOperator(values, operator);
    }

    if (values.length !== 1 || !Number.isFinite(values[0])) {
      return null;
    }

    return values[0] as number;
  } catch {
    return null;
  }
}
