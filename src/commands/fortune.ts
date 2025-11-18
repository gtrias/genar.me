import type { Command, CommandContext } from './types';
import { box, colors } from '../terminal/ui';

/**
 * Fortune command - displays random inspirational quotes
 */
export const fortuneCommand: Command = {
  name: 'fortune',
  description: 'Display a random inspirational quote',
  category: 'system',

  execute: ({ terminal }: CommandContext) => {
    const fortunes = [
      { quote: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
      { quote: 'Code is like humor. When you have to explain it, it\'s bad.', author: 'Cory House' },
      { quote: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
      { quote: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler' },
      { quote: 'The only way to learn a new programming language is by writing programs in it.', author: 'Dennis Ritchie' },
      { quote: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' },
      { quote: 'The most disastrous thing that you can ever learn is your first programming language.', author: 'Alan Kay' },
      { quote: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
      { quote: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
      { quote: 'The best code is no code at all.', author: 'Jeff Atwood' },
    ];

    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    
    const content = `${colors.italic(colors.cyan(`"${randomFortune.quote}"`))}\n${colors.dim(`                                        - ${randomFortune.author}`)}`;
    
    const fortuneBox = box(content, {
      borderColor: 'pink',
      borderStyle: 'rounded',
      padding: 2,
      align: 'center'
    });

    terminal.writeln(fortuneBox);
    terminal.writeln('');
  }
};

