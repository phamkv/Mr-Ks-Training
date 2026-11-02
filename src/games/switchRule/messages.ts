import type { GameMessages } from '../../core/game';
import type { Language } from '../../core/language';

export interface SwitchMessages extends GameMessages {
  ruleShape: string;
  ruleFill: string;
  circle: string;
  square: string;
  filled: string;
  outline: string;
  demoSteps: [string, string, string];
}

export const messages: Record<Language, SwitchMessages> = {
  en: {
    title: 'Switch the rule',
    instructions: 'A shape appears with a rule above it. The rule tells you what to answer: its shape, or whether it is filled in.',
    scoreLabel: 'Fastest answer time',
    ruleShape: 'Which shape?',
    ruleFill: 'Filled or outline?',
    circle: 'Circle',
    square: 'Square',
    filled: 'Filled',
    outline: 'Outline',
    demoSteps: [
      'A shape appears, and the question above it can change each time.',
      '"Which shape?" means you answer circle or square.',
      '"Filled or outline?" means you answer filled in or only an outline.',
    ],
  },
  de: {
    title: 'Regel wechseln',
    instructions: 'Eine Form erscheint, darüber steht eine Frage. Sie sagt Ihnen, was Sie antworten sollen: die Form, oder ob sie ausgefüllt ist.',
    scoreLabel: 'Schnellste Antwortzeit',
    ruleShape: 'Welche Form?',
    ruleFill: 'Ausgefüllt oder Umriss?',
    circle: 'Kreis',
    square: 'Quadrat',
    filled: 'Ausgefüllt',
    outline: 'Umriss',
    demoSteps: [
      'Eine Form erscheint. Die Frage darüber kann sich jedes Mal ändern.',
      '„Welche Form?“ bedeutet: Sie antworten Kreis oder Quadrat.',
      '„Ausgefüllt oder Umriss?“ bedeutet: Sie antworten, ob die Form ausgefüllt ist oder nur einen Umriss hat.',
    ],
  },
  vi: {
    title: 'Đổi luật',
    instructions: 'Một hình hiện ra cùng câu hỏi ở trên. Câu hỏi cho biết cần trả lời gì: hình dạng, hoặc hình đó được tô kín hay chỉ có viền.',
    scoreLabel: 'Thời gian trả lời nhanh nhất',
    ruleShape: 'Hình gì?',
    ruleFill: 'Tô kín hay chỉ viền?',
    circle: 'Hình tròn',
    square: 'Hình vuông',
    filled: 'Tô kín',
    outline: 'Chỉ viền',
    demoSteps: [
      'Một hình hiện ra. Câu hỏi ở trên có thể thay đổi mỗi lần.',
      '“Hình gì?” nghĩa là trả lời hình tròn hay hình vuông.',
      '“Tô kín hay chỉ viền?” nghĩa là trả lời hình được tô kín hay chỉ có viền.',
    ],
  },
};
