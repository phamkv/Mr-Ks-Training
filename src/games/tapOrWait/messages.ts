import type { GameMessages } from '../../core/game';
import type { Language } from '../../core/language';

export interface TapMessages extends GameMessages {
  tap: string;
  ruleCircle: string;
  ruleSquare: string;
  demoSteps: [string, string, string];
}

export const messages: Record<Language, TapMessages> = {
  en: {
    title: 'Tap or wait',
    instructions: 'A shape appears. If it is a circle, tap the button. If it is a square, wait and do nothing.',
    scoreLabel: 'Shortest display time',
    tap: 'Tap',
    ruleCircle: 'Circle: tap',
    ruleSquare: 'Square: wait',
    demoSteps: [
      'A shape appears in the middle.',
      'If it is a circle, tap the button.',
      "If it is a square, don't tap. Just wait for the next shape.",
    ],
  },
  de: {
    title: 'Tippen oder warten',
    instructions: 'Eine Form erscheint. Bei einem Kreis tippen Sie auf die Taste. Bei einem Quadrat warten Sie und tun nichts.',
    scoreLabel: 'Kürzeste Anzeigezeit',
    tap: 'Tippen',
    ruleCircle: 'Kreis: tippen',
    ruleSquare: 'Quadrat: warten',
    demoSteps: [
      'In der Mitte erscheint eine Form.',
      'Bei einem Kreis tippen Sie auf die Taste.',
      'Bei einem Quadrat tippen Sie nicht. Warten Sie einfach auf die nächste Form.',
    ],
  },
  vi: {
    title: 'Chạm hay chờ',
    instructions: 'Một hình hiện ra. Nếu là hình tròn, chạm vào nút. Nếu là hình vuông, chờ và không làm gì cả.',
    scoreLabel: 'Thời gian hiện ngắn nhất',
    tap: 'Chạm',
    ruleCircle: 'Hình tròn: chạm',
    ruleSquare: 'Hình vuông: chờ',
    demoSteps: [
      'Một hình hiện ra ở giữa.',
      'Nếu là hình tròn, chạm vào nút.',
      'Nếu là hình vuông, đừng chạm. Chỉ cần chờ hình tiếp theo.',
    ],
  },
};
