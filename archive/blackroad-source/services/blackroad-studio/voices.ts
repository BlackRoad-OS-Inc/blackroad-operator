import { VoiceOption } from '@/lib/types'

export const VOICE_OPTIONS: VoiceOption[] = [
  // Narrators
  { id: 'narrator-warm', name: 'Warm Narrator', gender: 'male', style: 'narrator', sampleText: 'Once upon a time, in a colorful little town...' },
  { id: 'narrator-bright', name: 'Bright Narrator', gender: 'female', style: 'narrator', sampleText: 'It was a beautiful sunny day in the neighborhood!' },
  { id: 'narrator-calm', name: 'Calm Narrator', gender: 'male', style: 'narrator', sampleText: 'Let me take you on a journey through this story.' },
  { id: 'narrator-energetic', name: 'Energetic Host', gender: 'female', style: 'narrator', sampleText: 'Welcome back everyone! Today we have something amazing!' },

  // Children
  { id: 'kid-excited', name: 'Excited Kid', gender: 'female', style: 'child', sampleText: 'Oh wow, look at that! This is going to be so much fun!' },
  { id: 'kid-curious', name: 'Curious Kid', gender: 'male', style: 'child', sampleText: 'Hey, I wonder what would happen if we tried something new?' },
  { id: 'kid-shy', name: 'Shy Kid', gender: 'female', style: 'child', sampleText: 'Um, excuse me... I have something I want to say...' },
  { id: 'kid-playful', name: 'Playful Kid', gender: 'male', style: 'child', sampleText: 'Tag, you\'re it! Come on, let\'s go on an adventure!' },

  // Characters
  { id: 'character-hero', name: 'Hero Voice', gender: 'male', style: 'character', sampleText: 'Don\'t worry everyone, I have a plan!' },
  { id: 'character-wise', name: 'Wise Guide', gender: 'female', style: 'character', sampleText: 'Let me tell you something important that I learned.' },
  { id: 'character-silly', name: 'Silly Friend', gender: 'male', style: 'character', sampleText: 'Ha ha ha! That was the funniest thing I ever saw!' },
  { id: 'character-villain', name: 'Sneaky Villain', gender: 'male', style: 'character', sampleText: 'You thought you could stop me? Think again!' },
  { id: 'character-royal', name: 'Royal Voice', gender: 'female', style: 'character', sampleText: 'By royal decree, let the celebration begin!' },
  { id: 'character-robot', name: 'Robot', gender: 'male', style: 'character', sampleText: 'Processing request. Solution found. Executing now.' },

  // Dramatic
  { id: 'dramatic-deep', name: 'Deep Drama', gender: 'male', style: 'dramatic', sampleText: 'And from that moment on, nothing would ever be the same.' },
  { id: 'dramatic-epic', name: 'Epic Voice', gender: 'female', style: 'dramatic', sampleText: 'Against all odds, they stood together and changed the world forever.' },
]
