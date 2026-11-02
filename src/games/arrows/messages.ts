import type { GameMessages } from '../../core/game';
import type { Language } from '../../core/language';

export interface ArrowsMessages extends GameMessages {
  question: string;
  left: string;
  right: string;
  demoSteps: [string, string, string];
}

export const messages: Record<Language, ArrowsMessages> = {
  en: {
    title: 'Arrows',
    instructions: 'Five arrows appear in a row. Tap the way the middle arrow points. Ignore the others.',
    scoreLabel: 'Fastest answer time',
    question: 'Which way does the middle arrow point?',
    left: 'Left',
    right: 'Right',
    demoSteps: [
      'Five arrows appear in a row. Only the middle one matters.',
      'The others may point the opposite way. Ignore them.',
      'Here the middle arrow points right, so you tap "Right".',
    ],
  },
  de: {
    title: 'Pfeile',
    instructions: 'Fünf Pfeile erscheinen in einer Reihe. Tippen Sie an, wohin der mittlere Pfeil zeigt. Die anderen sind egal.',
    scoreLabel: 'Schnellste Antwortzeit',
    question: 'Wohin zeigt der mittlere Pfeil?',
    left: 'Links',
    right: 'Rechts',
    demoSteps: [
      'Fünf Pfeile erscheinen in einer Reihe. Nur der mittlere zählt.',
      'Die anderen können in die andere Richtung zeigen. Beachten Sie sie nicht.',
      'Hier zeigt der mittlere Pfeil nach rechts, also tippen Sie auf „Rechts“.',
    ],
  },
  vi: {
    title: 'Mũi tên',
    instructions: 'Năm mũi tên hiện thành một hàng. Chạm vào hướng của mũi tên ở giữa. Không cần để ý các mũi tên còn lại.',
    scoreLabel: 'Thời gian trả lời nhanh nhất',
    question: 'Mũi tên ở giữa chỉ về hướng nào?',
    left: 'Trái',
    right: 'Phải',
    demoSteps: [
      'Năm mũi tên hiện thành một hàng. Chỉ mũi tên ở giữa là quan trọng.',
      'Các mũi tên khác có thể chỉ hướng ngược lại. Đừng để ý đến chúng.',
      'Ở đây mũi tên giữa chỉ sang phải, nên chạm vào “Phải”.',
    ],
  },
};
