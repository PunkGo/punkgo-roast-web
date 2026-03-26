export interface RadarValue {
  id: string;
  label: string;
  value: number;
}

import analysisConfig from './analysis.json';

export type AnalysisConfig = typeof analysisConfig;

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Simple formula evaluator for radar dimension formulas.
 * Supports: +, -, *, /, clamp(), parentheses, variable lookup.
 */
function evaluateFormula(formula: string, vars: Record<string, number>): number {
  // Handle clamp(expr, min, max) by extracting and evaluating
  const clampMatch = formula.match(/^clamp\((.+),\s*(\d+),\s*(\d+)\)$/);
  if (clampMatch) {
    const innerExpr = clampMatch[1];
    const min = Number(clampMatch[2]);
    const max = Number(clampMatch[3]);
    const innerVal = evaluateSimpleExpr(innerExpr, vars);
    return clamp(innerVal, min, max);
  }

  return evaluateSimpleExpr(formula, vars);
}

function evaluateSimpleExpr(expr: string, vars: Record<string, number>): number {
  let pos = 0;
  const str = expr.trim();

  function parseNumber(): number {
    let start = pos;
    while (pos < str.length && (str[pos] >= '0' && str[pos] <= '9' || str[pos] === '.')) pos++;
    return parseFloat(str.substring(start, pos));
  }

  function parseVariable(): number {
    let start = pos;
    while (pos < str.length && (str[pos] >= 'a' && str[pos] <= 'z' || str[pos] === '_')) pos++;
    const name = str.substring(start, pos);
    return vars[name] ?? 0;
  }

  function skipSpaces() { while (pos < str.length && str[pos] === ' ') pos++; }

  function parsePrimary(): number {
    skipSpaces();
    if (str[pos] === '(') {
      pos++; // skip (
      const val = parseAddSub();
      skipSpaces();
      if (str[pos] === ')') pos++; // skip )
      return val;
    }
    if (str[pos] >= 'a' && str[pos] <= 'z') return parseVariable();
    return parseNumber();
  }

  function parseMulDiv(): number {
    let left = parsePrimary();
    skipSpaces();
    while (pos < str.length && (str[pos] === '*' || str[pos] === '/')) {
      const op = str[pos++];
      const right = parsePrimary();
      left = op === '*' ? left * right : (right !== 0 ? left / right : 0);
      skipSpaces();
    }
    return left;
  }

  function parseAddSub(): number {
    let left = parseMulDiv();
    skipSpaces();
    while (pos < str.length && (str[pos] === '+' || str[pos] === '-')) {
      const op = str[pos++];
      const right = parseMulDiv();
      left = op === '+' ? left + right : left - right;
      skipSpaces();
    }
    return left;
  }

  return parseAddSub();
}

/**
 * Compute 6-dimension radar values.
 * Uses formulas from analysis.json config.
 * Personality radar_bias overrides formula-computed values.
 */
export function computeRadar(
  metrics: Record<string, number>,
  bias: Record<string, number> = {},
  config?: AnalysisConfig
): RadarValue[] {
  const cfg = config ?? analysisConfig;
  return cfg.radar.dimensions.map(dim => ({
    id: dim.id,
    label: dim.label,
    value: Math.round(
      bias[dim.id] !== undefined
        ? bias[dim.id]
        : evaluateFormula(dim.formula, metrics)
    ),
  }));
}
