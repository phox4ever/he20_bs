// Bits:  0   1  2  3  4  5  6    7  8  9  10 11 12 13 14 15
// Type:  S   E  E  E  E  E  E    M  M  M  M  M  M  M  M  M

const EXP_BITS = 5;
const MANTISSA_BITS = 10;
const NON_SIGN_BITS = EXP_BITS + MANTISSA_BITS;
const EXP_BIAS = 15;

// Encodieren Dec zu Bin
const encode = n => {

  // Vorzeichen (+ oder -)
  const sign = Math.sign(1 / n) === -1 ? 1 : 0;

  if (n === 0) {
    return sign === 0 ? 0 : (1 << NON_SIGN_BITS);
  }

  // Berechnen des Exponenten mit Hilfe des Logarithmus zur Basis 10 und zur Basis 2
  let exponent = Math.floor(Math.log(Math.abs(n)) / Math.log(2));

  // Bestimmen der Grenzwerte für die Berechnung der Matisse
  const lower = exponent + EXP_BIAS > 0 ? 2**exponent : 0; // 0 falls denormalisierte Zahl
  const upper = exponent + EXP_BIAS > 0 ? 2**(exponent + 1) : 2**((EXP_BIAS - 1) * -1); // 2^-14 falls denormalisierte Zahl

  // Berechnen der Mantisse in Prozent
  const percentage = Math.round(1000 * (Math.abs(n) - lower) / (upper - lower)) / 1000;

  // Runden der Mantisse
  let mantissa = Math.round(2 ** MANTISSA_BITS * percentage);

  // Prüfung auf Exponent Overflow und Underflow
  if (exponent + EXP_BIAS < 0) {
      exponent = 0 & 0b11111111;
  }
  else if (exponent + EXP_BIAS > 2 * EXP_BIAS + 1) {
      exponent = 2 * EXP_BIAS + 1 & 0b11111111;
      mantissa = 0;
  }
  else {
      exponent = (exponent + EXP_BIAS) & 0b1111111111;
  }

  console.log(`sign: ${sign} exponent: ${exponent} percentage: ${percentage} mantissa: ${mantissa}`);
  console.log(`+`.padEnd(4, '-') + `+`.padEnd(EXP_BITS + 3, '-') + `+`.padEnd(MANTISSA_BITS + 3,'-') + `+`)
  console.log(`| ${dec2bin(sign)} | ${dec2bin(exponent, EXP_BITS)} | ${dec2bin(mantissa, MANTISSA_BITS)} |`);
  console.log(`+`.padEnd(4, '-') + `+`.padEnd(EXP_BITS + 3, '-') + `+`.padEnd(MANTISSA_BITS + 3,'-') + `+`)

  return (sign << NON_SIGN_BITS) | (exponent << MANTISSA_BITS) | mantissa;
};

//Decodieren von Bin zu Dec
const decode = n => {
  const sign     = (n & 0b1000000000000000) >> NON_SIGN_BITS;
  const exponent = (n & 0b0111110000000000) >> MANTISSA_BITS;
  const mantissa = (n & 0b0000001111111111);

  if (exponent === 0 && mantissa === 0) {
    return sign === 1 ? -0 : 0;
  }

  if (exponent === 0b11111) {
    if (mantissa === 0) {
      return sign === 0 ? Infinity : -Infinity;
    } else {
      return NaN;
    }
  }

  const wholePart = exponent === 0 ? 0 : 1; // 0 falls denormalisert, sonst 1

  const percentage = mantissa / 2 ** MANTISSA_BITS;

  return (-1)**sign * (wholePart + percentage) * 2**((exponent === 0 ? 1 : exponent) - 15);
}

const dec2bin = function(dec, s) {
    return (dec >>> 0).toString(2).padStart(s, '0');
}

import readline from 'readline';

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }))
}

const nums = [
    0.1,
    0.2,
    0.3,
    1720.5,
    172002.5345,
    1720002.5345,
    172.8254,
    172.5254,
    172.525,
    172.5,
    17.2,
    1.72,
    0.172,
    0.0172,
    0.00172,
    0.000172,
    0.0000172,
    0.00000002,
    0.00000000000000000000000000000000000000172,
    0.0000000000000000000000000000000000000002,
    0.00000000000000000000000000000000000000002,
    -17.2,
]

console.log ("Half Precision (16bit)")
for (const n of nums) {
  console.log(`-`.repeat(70) + `\n* Number: ${n}`.padEnd(70, ' ') + `*\n` + `-`.repeat(70));
  const e = encode(n);
  const d = decode(e);
  console.log(`>> Result: ${dec2bin(e, NON_SIGN_BITS + 1)} (${e}) => ${d}\n` + `=`.repeat(70));
  const ans = await askQuestion("Continue (Y/n)? ");
  if (ans === 'n') {
    break;
  }
}
console.log()
// Höhere Präzision mit single precision (32 bit)
import Float32 from './float32.js'
import NON_SIGN_BITS32 from './float32.js'
console.log ("Single Precision (32bit)")

for (const n of nums) {
  console.log(`-`.repeat(80) + `\n* Number: ${n}`.padEnd(70, ' ') + `*\n` + `-`.repeat(80));
  const e = Float32.encode(n);
  const d = Float32.decode(e);
  console.log(`>> Result: ${dec2bin(e, NON_SIGN_BITS32 + 1)} (${e}) => ${d}\n` + `=`.repeat(80));
  const ans = await askQuestion("Continue (Y/n)? ");
  if (ans === 'n') {
    break;
  }
}