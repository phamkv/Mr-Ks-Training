import type { GameMessages } from '../../core/game';
import type { Language } from '../../core/language';

export interface SpeedMessages extends GameMessages {
  centreQuestion: string;
  outerQuestion: string;
  car: string;
  truck: string;
  positions: string[];
  demoSteps: string[];
}

export const messages: Record<Language, SpeedMessages> = {
  en: {
    title: 'Speed game',
    instructions: 'A car or a truck appears in the middle, and another car appears further out. They vanish quickly. Then you tap what you saw.',
    scoreLabel: 'Shortest flash',
    centreQuestion: 'What was in the middle?',
    outerQuestion: 'Where was the outer car? Tap the place.',
    car: 'Car',
    truck: 'Truck',
    positions: ['Top', 'Top right', 'Right', 'Bottom right', 'Bottom', 'Bottom left', 'Left', 'Top left'],
    demoSteps: [
      'Look at the cross in the middle.',
      'A car or a truck flashes in the middle. At the same time, another car flashes further out.',
      'Then a pattern covers them for a moment. This is normal.',
      'First, tap what was in the middle. Take as long as you need.',
      'Then tap where the outer car was. Take as long as you need.',
    ],
  },
  de: {
    title: 'Tempo-Spiel',
    instructions: 'In der Mitte erscheint ein Auto oder ein Lastwagen, weiter außen ein weiteres Auto. Beides verschwindet schnell. Danach tippen Sie an, was Sie gesehen haben.',
    scoreLabel: 'Kürzeste Einblendung',
    centreQuestion: 'Was war in der Mitte?',
    outerQuestion: 'Wo war das äußere Auto? Tippen Sie auf die Stelle.',
    car: 'Auto',
    truck: 'Lastwagen',
    positions: ['Oben', 'Oben rechts', 'Rechts', 'Unten rechts', 'Unten', 'Unten links', 'Links', 'Oben links'],
    demoSteps: [
      'Schauen Sie auf das Kreuz in der Mitte.',
      'In der Mitte blitzt ein Auto oder ein Lastwagen auf. Gleichzeitig blitzt weiter außen ein weiteres Auto auf.',
      'Dann verdeckt ein Muster beides für einen Moment. Das ist normal.',
      'Tippen Sie zuerst an, was in der Mitte war. Lassen Sie sich Zeit.',
      'Tippen Sie dann an, wo das äußere Auto war. Lassen Sie sich Zeit.',
    ],
  },
  vi: {
    title: 'Tốc độ',
    instructions: 'Một xe hơi hoặc xe tải hiện ở giữa, và một xe hơi khác hiện ở phía ngoài. Hình biến mất rất nhanh. Sau đó chạm vào những gì đã thấy.',
    scoreLabel: 'Thời gian hiện ngắn nhất',
    centreQuestion: 'Ở giữa là xe gì?',
    outerQuestion: 'Xe hơi phía ngoài ở đâu? Chạm vào chỗ đó.',
    car: 'Xe hơi',
    truck: 'Xe tải',
    positions: ['Trên', 'Trên bên phải', 'Bên phải', 'Dưới bên phải', 'Dưới', 'Dưới bên trái', 'Bên trái', 'Trên bên trái'],
    demoSteps: [
      'Nhìn vào dấu cộng ở giữa.',
      'Một xe hơi hoặc xe tải hiện nhanh ở giữa. Cùng lúc đó, một xe hơi khác hiện nhanh ở phía ngoài.',
      'Sau đó một hình nền che chúng trong giây lát. Điều này là bình thường.',
      'Trước tiên, chạm vào xe đã thấy ở giữa. Không cần vội.',
      'Sau đó, chạm vào chỗ có xe hơi phía ngoài. Không cần vội.',
    ],
  },
};
