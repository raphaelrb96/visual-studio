import fs from 'fs';
import path from 'path';

export interface WhisperTimestamp {
  word: string;
  start: number;
  end: number;
}

export async function generateAssSubtitles(
  scenes: { id: string; text: string; durationSec: number }[],
  style: string,
  outputPath: string
): Promise<string> {
  // Generates Advanced SubStation Alpha (.ass) format for precise kinetic word highlighting
  const assHeader = `[Script Info]
Title: Visual Studio Kinetic Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: KineticDefault,Montserrat,64,&H00FFFFFF,&H0000FFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,2,40,40,240,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let events = '';
  let currentTime = 0;

  for (const scene of scenes) {
    const startStr = formatAssTime(currentTime);
    const endStr = formatAssTime(currentTime + scene.durationSec);
    const escapedText = scene.text.replace(/{/g, '').replace(/}/g, '');

    events += `Dialogue: 0,${startStr},${endStr},KineticDefault,,0,0,0,,{\\fad(150,150)}${escapedText}\n`;
    currentTime += scene.durationSec;
  }

  const fullAss = assHeader + events;
  fs.writeFileSync(outputPath, fullAss, 'utf-8');
  return outputPath;
}

function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);

  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}
