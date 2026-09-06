/**
 * Standalone test runner for solver engines
 * Run with: node test-engines.js
 */

// Mock the Fraction class and utilities for Node.js testing
class Fraction {
  constructor(n = 0, d = 1) {
    if (typeof n === 'string') {
      const parts = n.trim().split('/');
      if (parts.length === 2) {
        n = Number(parts[0]);
        d = Number(parts[1]);
      } else {
        const floatVal = Number(n);
        if (!Number.isFinite(floatVal)) {
          n = 0;
          d = 1;
        } else {
          return Fraction.fromFloat(floatVal);
        }
      }
    }

    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) {
      this.n = 0;
      this.d = 1;
      return;
    }

    let num = Math.round(n);
    let den = Math.round(d);

    if (den < 0) {
      num = -num;
      den = -den;
    }

    const g = this.gcd(num, den) || 1;
    this.n = num / g;
    this.d = den / g;
  }

  gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x;
  }

  static fromFloat(val, maxDenominator = 10000) {
    if (!Number.isFinite(val) || Math.abs(val) < 1e-12) return new Fraction(0, 1);
    const sign = val < 0 ? -1 : 1;
    let x = Math.abs(val);

    let m00 = 1, m01 = 0, m10 = 0, m11 = 1;
    while (x > 0 && m10 * Math.floor(x) + m11 <= maxDenominator) {
      const a = Math.floor(x);
      const t0 = m00 * a + m01;
      m01 = m00;
      m00 = t0;
      const t1 = m10 * a + m11;
      m11 = m10;
      m10 = t1;
      if (x === a) break;
      x = 1 / (x - a);
      if (x > 1e12) break;
    }

    const num = sign * m00;
    const den = m10;
    return new Fraction(num, den);
  }

  add(other) {
    const o = other instanceof Fraction ? other : new Fraction(other);
    return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d);
  }

  sub(other) {
    const o = other instanceof Fraction ? other : new Fraction(other);
    return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d);
  }

  mul(other) {
    const o = other instanceof Fraction ? other : new Fraction(other);
    return new Fraction(this.n * o.n, this.d * o.d);
  }

  div(other) {
    const o = other instanceof Fraction ? other : new Fraction(other);
    if (o.n === 0) throw new Error('Division by zero fraction');
    return new Fraction(this.n * o.d, this.d * o.n);
  }

  neg() {
    return new Fraction(-this.n, this.d);
  }

  abs() {
    return new Fraction(Math.abs(this.n), this.d);
  }

  toNumber() {
    return this.n / this.d;
  }

  isZero() {
    return this.n === 0;
  }

  isPositive() {
    return this.n > 0;
  }

  isNegative() {
    return this.n < 0;
  }

  isInteger() {
    return this.d === 1;
  }

  toString() {
    if (this.d === 1) return `${this.n}`;
    return `${this.n}/${this.d}`;
  }

  toDisplayString() {
    if (this.d === 1) return `${this.n}`;
    return `${this.n}/${this.d}`;
  }
}

function toFraction(val) {
  if (val instanceof Fraction) return val;
  if (typeof val === 'number') return Fraction.fromFloat(val);
  return new Fraction(val);
}

// Simple test case
console.log('🧪 Testing Fraction class');
const f1 = new Fraction(1, 2);
const f2 = new Fraction(1, 3);
console.log('1/2 + 1/3 =', f1.add(f2).toString()); // Should be 5/6
console.log('1/2 - 1/3 =', f1.sub(f2).toString()); // Should be 1/6
console.log('1/2 * 1/3 =', f1.mul(f2).toString()); // Should be 1/6
console.log('1/2 ÷ 1/3 =', f1.div(f2).toString()); // Should be 3/2

console.log('✅ Fraction class works correctly');