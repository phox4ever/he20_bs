// Bits:  0   1  2  3  4  5  6  7  8     9  10 11 12 13 14 15 16 17 18 19 ... 31
// Type:  S   E  E  E  E  E  E  E  E     M  M  M  M  M  M  M  M  M  M  M      M

const EXP_BITS = 8;
const MANTISSA_BITS = 23;
const NON_SIGN_BITS = EXP_BITS + MANTISSA_BITS;
const EXP_BIAS = 127;

const Float32 = {};

Float32.encode = n => {
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
  if (exponent + EXP_BIAS < 0 || exponent + EXP_BIAS > 255) {
    exponent = 0 & 0b11111111;
  }
  else {
    exponent = (exponent + EXP_BIAS) & 0b1111111111;
  }

  const percentage = Math.round(10**MANTISSA_BITS * (Math.abs(n) - lower) / (upper - lower)) / 10**MANTISSA_BITS;

  // Mantissa muss gerundet werden
  const mantissa = Math.round(2**MANTISSA_BITS * percentage);

  console.log(`sign: ${sign} exponent: ${exponent} percentage: ${percentage} mantissa: ${mantissa}`);
  console.log(`+`.padEnd(4, '-') + `+`.padEnd(EXP_BITS + 3, '-') + `+`.padEnd(MANTISSA_BITS + 3,'-') + `+`)
  console.log(`| ${dec2bin(sign)} | ${dec2bin(exponent, EXP_BITS)} | ${dec2bin(mantissa, MANTISSA_BITS)} |`);
  console.log(`+`.padEnd(4, '-') + `+`.padEnd(EXP_BITS + 3, '-') + `+`.padEnd(MANTISSA_BITS + 3,'-') + `+`)

  return (sign << NON_SIGN_BITS) | (exponent << MANTISSA_BITS) | mantissa;
};

Float32.decode = n => {
  const sign     = (n & 0b10000000000000000000000000000000) >> NON_SIGN_BITS;
  const exponent = (n & 0b01111111100000000000000000000000) >> MANTISSA_BITS;
  const mantissa = (n & 0b00000000011111111111111111111111);

  if (exponent === 0 && mantissa === 0) {
    return sign === 1 ? -0 : 0;
  }

  if (exponent === 0b1111111111) {
    if (mantissa === 0) {
      return sign === 0 ? Infinity : -Infinity;
    } else {
      return NaN;
    }
  }

  const wholePart = exponent === 0 ? 0 : 1;

  const percentage = mantissa / 2**MANTISSA_BITS;

  return (-1)**sign * (wholePart + percentage) * 2**((exponent === 0 ? 1 : exponent) - EXP_BIAS);
}

const dec2bin = function(dec, s) {
  return (dec >>> 0).toString(2).padStart(s, '0');
}

export default Float32
export const NON_SIGN_BITS32 = NON_SIGN_BITS;
