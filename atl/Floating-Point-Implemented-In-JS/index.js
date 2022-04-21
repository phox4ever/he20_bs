// Bits:  0   1  2  3  4  5  6    7  8  9  10 11 12 13 14 15
// Type:  S   E  E  E  E  E  E    M  M  M  M  M  M  M  M  M

const EXP_BITS = 5;
const MANTISSA_BITS = 10;
const NON_SIGN_BITS = EXP_BITS + MANTISSA_BITS;

const encode = n => {
  const sign = Math.sign(1 / n) === -1 ? 1 : 0;

  if (n === 0) {
    return sign === 0 ? 0 : (1 << NON_SIGN_BITS);
  }

  //console.log(`Math.log(Math.abs(n)) == ${Math.log(Math.abs(n))} Math.log(2)) == ${Math.log(2)}`);
  let exponent = Math.floor(Math.log(Math.abs(n)) / Math.log(2));
  const lower = 2**exponent;
  const upper = 2**(exponent + 1);
  //console.log(`exponent: ${exponent}`);

  // Fehlende Prüfung auf exponent overflow
  if (exponent + 15 < 0 || exponent + 15 > 31) {
    exponent = 0 & 0b11111;
  }
  else {
    exponent = (exponent + 15) & 0b11111;
  }


  const percentage = Math.round(1000 * (Math.abs(n) - lower) / (upper - lower)) / 1000;

  // Mantissa muss gerundet werden
  const mantissa = Math.round(1024 * percentage);

  console.log(`sign: ${sign} exponent: ${exponent} percentage: ${percentage} mantissa: ${mantissa}`);
  console.log(`+`.padEnd(4, '-') + `+`.padEnd(EXP_BITS + 3, '-') + `+`.padEnd(MANTISSA_BITS + 3,'-') + `+`)
  console.log(`| ${dec2bin(sign)} | ${dec2bin(exponent, EXP_BITS)} | ${dec2bin(mantissa, MANTISSA_BITS)} |`);
  console.log(`+`.padEnd(4, '-') + `+`.padEnd(EXP_BITS + 3, '-') + `+`.padEnd(MANTISSA_BITS + 3,'-') + `+`)

  return (sign << NON_SIGN_BITS) | (exponent << MANTISSA_BITS) | mantissa;
};


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

  const wholePart = exponent === 0 ? 0 : 1;

  const percentage = mantissa / 1024;

  return (-1)**sign * (wholePart + percentage) * 2**(exponent - 15);
}

function dec2bin(dec, s) {
  return (dec >>> 0).toString(2).padStart(s, '0');
}

/*
const original = 0.000052571;
const encoded = encode(original);
const decoded = decode(encoded);
const infinityCheck = decode(0b0111110000000000);
const minusInfinityCheck = decode(0b1111110000000000);
const nanCheck = decode(0b1111110000000001);
*/

const nums = [
    1720.5,
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
    -17.2,
]

nums.forEach(n => {const e = encode(n);const d = decode(e); console.log(`${n}: ${dec2bin(e, NON_SIGN_BITS + 1)} (${e}) => ${d}`) })

//console.log(`original: ${original}`);
//console.log(`encoded: ${encoded}`);
//console.log(`decoded: ${decoded}`);
//console.log(`infinity: ${infinityCheck}`);
//console.log(`-infinity: ${minusInfinityCheck}`);
//console.log(`nan: ${nanCheck}`);