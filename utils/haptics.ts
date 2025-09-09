import { impactAsync, ImpactFeedbackStyle, selectionAsync } from 'expo-haptics'

function withHapticsImpact(callback: () => void) {
  impactAsync(ImpactFeedbackStyle.Light).then(callback)
}

function withHapticsSelection(callback: () => void) {
  selectionAsync().then(callback)
}

export { withHapticsImpact, withHapticsSelection }
