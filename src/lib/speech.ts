export function speechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined"
}

export function stopSpeaking() {
  if (!speechAvailable()) return
  window.speechSynthesis.cancel()
}

export function speakText(text: string, onDone: () => void) {
  if (!speechAvailable()) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "en-GB"
  utterance.rate = 1
  utterance.onend = onDone
  utterance.onerror = onDone
  window.speechSynthesis.speak(utterance)
  return true
}

// Browser speech for now. A licensed Alonso voice from ElevenLabs or Grok
// can replace speakGuide without changing the chat button.
export function speakGuide(text: string, onDone: () => void) {
  return speakText(text, onDone)
}
