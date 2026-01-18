/**
 * Plays a notification sound using Web Audio API
 * Simple "ding" sound that works without external files
 */
export function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Create a pleasant "ding" sound
    oscillator.frequency.value = 800 // Start frequency
    oscillator.type = 'sine'

    // Envelope for the sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    // Frequency sweep for a more pleasant sound
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    // Fallback: try to play a system beep if Web Audio API fails
    console.warn('Could not play notification sound:', error)
  }
}
