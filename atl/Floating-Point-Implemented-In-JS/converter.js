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

import Float32 from './float32.js'
import NON_SIGN_BITS32 from './float32.js'

let exit = false;
while (exit === false) {
  let ans = await askQuestion("Floating point number? ");
  const n = parseFloat(ans);
  if (isNaN(n)) {
    console.log(ans + ` is not a number.\n`)
    continue;
  }
  console.log(`-`.repeat(80) + `\n* Number: ${n}`.padEnd(80, ' ') + `*\n` + `-`.repeat(80));
  const e = Float32.encode(n);
  const d = Float32.decode(e);
  console.log(`>> Result: ${dec2bin(e, NON_SIGN_BITS32 + 1)} (${e}) => ${d}\n` + `=`.repeat(80));
  ans = await askQuestion("Continue (Y/n)? ");
  if (ans === 'n') {
    exit = true;
  }
}