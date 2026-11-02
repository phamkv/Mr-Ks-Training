import type { GameMessages } from '../../core/game';
import type { Language } from '../../core/language';

export interface MemoryMessages extends GameMessages {
  watch: string;
  tapBack: string;
  chosen: string;
  done: string;
  demoSteps: [string, string, string];
}

export const messages: Record<Language, MemoryMessages> = {
  en: {
    title: 'Memory grid',
    instructions: 'Some squares light up for a moment. Remember them, then tap the same squares. There is no time limit for tapping.',
    scoreLabel: 'Squares remembered',
    watch: 'Remember these squares',
    tapBack: 'Tap the same squares',
    chosen: '{n} of {total} chosen',
    done: 'Done',
    demoSteps: [
      'Some squares light up for a moment. Try to remember them.',
      'Then tap the same squares. Tap a square again if you change your mind.',
      'When you have chosen them all, tap "Done".',
    ],
  },
  de: {
    title: 'Merkfelder',
    instructions: 'Einige Felder leuchten kurz auf. Merken Sie sich diese und tippen Sie danach dieselben Felder an. Beim Antippen gibt es kein Zeitlimit.',
    scoreLabel: 'Gemerkte Felder',
    watch: 'Merken Sie sich diese Felder',
    tapBack: 'Tippen Sie dieselben Felder an',
    chosen: '{n} von {total} gewählt',
    done: 'Fertig',
    demoSteps: [
      'Einige Felder leuchten kurz auf. Versuchen Sie, sie sich zu merken.',
      'Tippen Sie dann dieselben Felder an. Wenn Sie es sich anders überlegen, tippen Sie ein Feld noch einmal an.',
      'Wenn Sie alle gewählt haben, tippen Sie auf „Fertig“.',
    ],
  },
  vi: {
    title: 'Nhớ ô vuông',
    instructions: 'Một số ô sáng lên trong giây lát. Hãy nhớ các ô đó, rồi chạm vào đúng các ô ấy. Khi chạm thì không giới hạn thời gian.',
    scoreLabel: 'Số ô nhớ được',
    watch: 'Hãy nhớ các ô này',
    tapBack: 'Chạm vào đúng các ô đó',
    chosen: 'Đã chọn {n} trên {total}',
    done: 'Xong',
    demoSteps: [
      'Một số ô sáng lên trong giây lát. Hãy cố nhớ các ô đó.',
      'Sau đó chạm vào đúng các ô ấy. Nếu đổi ý, chạm lại vào ô đó.',
      'Khi đã chọn đủ, chạm vào “Xong”.',
    ],
  },
};
