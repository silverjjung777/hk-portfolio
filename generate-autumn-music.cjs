// Original, deterministic 6/8 instrumental sketch for the portfolio.
const fs = require('fs');

const rate = 22050;
const bpm = 82;
const eighth = 60 / bpm / 2;
const bar = eighth * 6;
const bars = 16;
const duration = bars * bar;
const samples = new Float64Array(Math.ceil(duration * rate));
const midi = note => 440 * Math.pow(2, (note - 69) / 12);

function note(pitch, start, length, gain, voice = 'piano') {
  const freq = midi(pitch);
  const from = Math.max(0, Math.floor(start * rate));
  const to = Math.min(samples.length, Math.ceil((start + length) * rate));
  for (let i = from; i < to; i++) {
    const t = i / rate - start;
    const attack = 1 - Math.exp(-t * (voice === 'pad' ? 4 : 90));
    const envelope = voice === 'pad'
      ? attack * Math.min(1, (length - t) * 3) * .78
      : attack * Math.exp(-t * (voice === 'bell' ? 1.4 : 2.5));
    const angle = 2 * Math.PI * freq * t;
    const tone = voice === 'pad'
      ? .6 * Math.sin(angle) + .25 * Math.sin(angle * 1.004) + .15 * Math.sin(angle * 2)
      : voice === 'bell'
        ? .62 * Math.sin(angle) + .27 * Math.sin(angle * 2.01) + .11 * Math.sin(angle * 3.92)
        : .62 * Math.sin(angle) + .25 * Math.sin(angle * 2) + .10 * Math.sin(angle * 3) + .03 * Math.sin(angle * 4);
    samples[i] += tone * envelope * gain;
  }
}

const harmony = [
  { chord: [52, 55, 59], melody: [71, 74, 76] }, // Em
  { chord: [48, 52, 55], melody: [72, 71, 67] }, // C
  { chord: [55, 59, 62], melody: [71, 74, 79] }, // G
  { chord: [50, 54, 57], melody: [76, 74, 69] }, // D
];

for (let b = 0; b < bars; b++) {
  const start = b * bar;
  const phrase = harmony[b % harmony.length];
  for (const pitch of phrase.chord) note(pitch - 12, start, bar + .4, .028, 'pad');
  const arpeggio = [0, 2, 1, 2, 0, 1];
  arpeggio.forEach((index, step) => {
    const octave = step === 4 ? 12 : 0;
    note(phrase.chord[index] + octave, start + step * eighth, 1.35, .115);
  });
  phrase.melody.forEach((pitch, index) => {
    note(pitch + (b > 11 && index === 2 ? 12 : 0), start + index * 2 * eighth + .04, 1.55, .069, 'bell');
  });
  if (b === 7 || b === 15) note(phrase.chord[0] + 24, start + 4 * eighth, 1.4, .03, 'bell');
}

// Faint, filtered rustle evokes dry leaves without obscuring the melody.
let seed = 246813579;
let previous = 0;
for (let i = 0; i < samples.length; i++) {
  seed = (1664525 * seed + 1013904223) >>> 0;
  const noise = (seed / 4294967296) * 2 - 1;
  previous = previous * .985 + noise * .015;
  const pulse = Math.pow(Math.max(0, Math.sin(2 * Math.PI * (i / rate) / (bar * 2))), 4);
  samples[i] += previous * pulse * .008;
}

const output = Buffer.alloc(44 + samples.length * 2);
output.write('RIFF', 0);
output.writeUInt32LE(output.length - 8, 4);
output.write('WAVEfmt ', 8);
output.writeUInt32LE(16, 16);
output.writeUInt16LE(1, 20);
output.writeUInt16LE(1, 22);
output.writeUInt32LE(rate, 24);
output.writeUInt32LE(rate * 2, 28);
output.writeUInt16LE(2, 32);
output.writeUInt16LE(16, 34);
output.write('data', 36);
output.writeUInt32LE(samples.length * 2, 40);

for (let i = 0; i < samples.length; i++) {
  const fadeIn = Math.min(1, i / (rate * .6));
  const fadeOut = Math.min(1, (samples.length - 1 - i) / (rate * 1.5));
  const value = Math.tanh(samples[i] * 1.6) * .78 * Math.max(0, Math.min(fadeIn, fadeOut));
  output.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
}

fs.mkdirSync('dist/assets', { recursive: true });
fs.writeFileSync('dist/assets/autumn-letters.wav', output);
console.log(`Wrote ${duration.toFixed(1)} s original autumn instrumental`);
