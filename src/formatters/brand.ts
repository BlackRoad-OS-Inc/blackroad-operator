// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import chalk from 'chalk'

const TAGLINES = [
  'The road you build by running on it.',
  'The OS that runs the current time.',
  'Built for dreamers. Powered by agents. Owned by you.',
  'You bring the chaos. BlackRoad brings the road.',
  'Your chaos. Our structure. One road.',
  'The undefined path. On purpose.',
  'We were root before you knew you needed one.',
  'Light always remembers.',
] as const

export const brand = {
  hotPink: chalk.hex('#FF1D6C'),
  amber: chalk.hex('#F5A623'),
  violet: chalk.hex('#9C27B0'),
  electricBlue: chalk.hex('#2979FF'),

  logo() {
    return this.hotPink('▙') + this.amber('▟') + ' ' + this.violet('BlackRoad') + ' ' + this.electricBlue('OS')
  },

  header(text: string) {
    return this.hotPink('━'.repeat(60)) + '\n' + chalk.bold(text) + '\n' + this.hotPink('━'.repeat(60))
  },

  tagline(index?: number) {
    const i = index !== undefined ? index % TAGLINES.length : Math.floor(Math.random() * TAGLINES.length)
    return chalk.italic(chalk.dim(TAGLINES[i]))
  },

  shebang() {
    return chalk.dim('#') + chalk.bold('!') + chalk.dim(' is ') + this.hotPink('BlackRoad')
  },

  footer() {
    return chalk.dim('━'.repeat(60)) + '\n' +
      this.logo() + '  ' + this.tagline(0) + '\n' +
      chalk.dim('© 2023-2026 BlackRoad OS, Inc. All Rights Reserved.')
  },

  manifesto() {
    return [
      this.header('BRAND MANIFESTO'),
      '',
      this.amber('  You bring the chaos. We bring the road.'),
      '',
      chalk.dim('  The browser is your computer now.'),
      chalk.dim('  Every device a terminal. Every dream a deployable.'),
      '',
      '  ' + chalk.dim('#') + chalk.bold.white('!') + chalk.dim('/') +
        chalk.dim(' — we\'re the line that tells the whole system how to run.'),
      '',
      chalk.dim('  The robots run the current time.'),
      chalk.dim('  Not a roadmap. Not a vision statement. ') + chalk.white('Now.'),
      '',
      '  ' + this.hotPink('Your chaos is not a problem.'),
      '  ' + this.hotPink('Your chaos is the input.'),
      '',
      chalk.dim('  Your half-finished songs. Your scattered notes.'),
      chalk.dim('  Your wild idea at 2am. Your old hardware nobody wants.'),
      chalk.dim('  Your dreams that got commented out.'),
      '',
      '  ' + chalk.dim('#') + ' is silence.  ' +
        chalk.bold('!') + ' is you.  ' +
        this.hotPink('#!') + ' is BlackRoad.',
      '',
      '  ' + chalk.italic(this.violet('Light always remembers.')),
      '',
      chalk.dim('━'.repeat(60)),
    ].join('\n')
  },
}
