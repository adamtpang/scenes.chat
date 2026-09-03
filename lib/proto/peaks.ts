// Server-side waveform peaks from a WAV file at ingest (CLAUDE.md
// non-negotiable 5). The prototype captures WAV on the client precisely so
// this can be plain PCM parsing with no decoder dependency. Phase 1 will
// transcode to Opus after peaks are computed.

export type WavInfo = {
  sampleRate: number;
  channels: number;
  durationMs: number;
  peaks: number[];
};

const PCM = 1;
const IEEE_FLOAT = 3;
const EXTENSIBLE = 0xfffe;

function fourcc(view: DataView, offset: number) {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

export function analyzeWav(buffer: ArrayBuffer, buckets = 200): WavInfo {
  const view = new DataView(buffer);
  if (buffer.byteLength < 44) throw new Error("Not a WAV file: too short.");
  if (fourcc(view, 0) !== "RIFF" || fourcc(view, 8) !== "WAVE") {
    throw new Error("Not a WAV file: missing RIFF/WAVE header.");
  }

  let format = 0;
  let channels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let dataOffset = -1;
  let dataSize = 0;

  let offset = 12;
  while (offset + 8 <= buffer.byteLength) {
    const id = fourcc(view, offset);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;

    if (id === "fmt ") {
      format = view.getUint16(body, true);
      channels = view.getUint16(body + 2, true);
      sampleRate = view.getUint32(body + 4, true);
      bitsPerSample = view.getUint16(body + 14, true);
      if (format === EXTENSIBLE && size >= 26) {
        format = view.getUint16(body + 24, true);
      }
    } else if (id === "data") {
      dataOffset = body;
      dataSize = Math.min(size, buffer.byteLength - body);
      break;
    }

    offset = body + size + (size % 2);
  }

  if (dataOffset < 0) throw new Error("WAV has no data chunk.");
  if (!channels || !sampleRate || !bitsPerSample) {
    throw new Error("WAV has no usable fmt chunk.");
  }
  if (format !== PCM && format !== IEEE_FLOAT) {
    throw new Error(`Unsupported WAV format ${format}.`);
  }

  const bytesPerSample = bitsPerSample / 8;
  const frameBytes = bytesPerSample * channels;
  const frames = Math.floor(dataSize / frameBytes);
  if (frames === 0) throw new Error("WAV has no audio frames.");

  const read = sampleReader(view, format, bitsPerSample);
  const count = Math.min(buckets, frames);
  const peaks = new Array<number>(count).fill(0);
  const perBucket = frames / count;

  for (let b = 0; b < count; b++) {
    const start = Math.floor(b * perBucket);
    const end = Math.floor((b + 1) * perBucket);
    let max = 0;
    for (let f = start; f < end; f++) {
      const base = dataOffset + f * frameBytes;
      for (let c = 0; c < channels; c++) {
        const v = Math.abs(read(base + c * bytesPerSample));
        if (v > max) max = v;
      }
    }
    peaks[b] = max;
  }

  const ceiling = Math.max(...peaks, 1e-6);
  for (let i = 0; i < peaks.length; i++) {
    peaks[i] = Math.round((peaks[i] / ceiling) * 1000) / 1000;
  }

  return {
    sampleRate,
    channels,
    durationMs: Math.round((frames / sampleRate) * 1000),
    peaks,
  };
}

function sampleReader(view: DataView, format: number, bits: number) {
  if (format === IEEE_FLOAT) {
    if (bits === 32) return (o: number) => view.getFloat32(o, true);
    if (bits === 64) return (o: number) => view.getFloat64(o, true);
    throw new Error(`Unsupported float bit depth ${bits}.`);
  }
  switch (bits) {
    case 8:
      return (o: number) => (view.getUint8(o) - 128) / 128;
    case 16:
      return (o: number) => view.getInt16(o, true) / 32768;
    case 24:
      return (o: number) => {
        const v =
          view.getUint8(o) |
          (view.getUint8(o + 1) << 8) |
          (view.getInt8(o + 2) << 16);
        return v / 8388608;
      };
    case 32:
      return (o: number) => view.getInt32(o, true) / 2147483648;
    default:
      throw new Error(`Unsupported PCM bit depth ${bits}.`);
  }
}
