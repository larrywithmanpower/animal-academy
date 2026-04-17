// 用 Web Audio API 合成音效，不需外部音檔，PWA 離線可用
let audioCtx: AudioContext | null = null

const getCtx = (): AudioContext => {
  if (!audioCtx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// 答對：do-mi-sol 上行三音歡快音階
const playCorrect = () => {
  if (typeof window === 'undefined') return
  const ctx = getCtx()
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = ctx.currentTime + i * 0.13
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.45, t + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38)
    osc.start(t)
    osc.stop(t + 0.4)
  })
}

// 答錯：輕柔下行兩音，不刺耳
const playWrong = () => {
  if (typeof window === 'undefined') return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(350, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.45)
  gain.gain.setValueAtTime(0.35, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.5)
}

// 貓叫：頻率滑音 + 顫音
const playCat = () => {
  if (typeof window === 'undefined') return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const vibOsc = ctx.createOscillator()
  const vibGain = ctx.createGain()

  vibOsc.connect(vibGain)
  vibGain.connect(osc.frequency)
  osc.connect(gain)
  gain.connect(ctx.destination)

  vibOsc.frequency.value = 6
  vibGain.gain.value = 18
  osc.type = 'sine'
  osc.frequency.setValueAtTime(380, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(580, ctx.currentTime + 0.1)
  osc.frequency.linearRampToValueAtTime(430, ctx.currentTime + 0.45)

  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55)

  vibOsc.start(ctx.currentTime)
  osc.start(ctx.currentTime)
  vibOsc.stop(ctx.currentTime + 0.6)
  osc.stop(ctx.currentTime + 0.6)
}

// 狗叫：兩聲短促方波爆音
const playDog = () => {
  if (typeof window === 'undefined') return
  const ctx = getCtx()
  ;[0, 0.22].forEach(delay => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(320, ctx.currentTime + delay)
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + delay + 0.14)
    gain.gain.setValueAtTime(0.28, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + 0.2)
  })
}

// 熊吼：低頻鋸齒波 + 低通濾波
const playBear = () => {
  if (typeof window === 'undefined') return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  filter.type = 'lowpass'
  filter.frequency.value = 280

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(85, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(125, ctx.currentTime + 0.2)
  osc.frequency.linearRampToValueAtTime(85, ctx.currentTime + 0.55)

  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.1)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.7)
}

export const useSound = () => {
  const playAnimal = (grade: number) => {
    if (grade === 1) playCat()
    else if (grade === 2) playDog()
    else playBear()
  }

  return { playCorrect, playWrong, playAnimal }
}
