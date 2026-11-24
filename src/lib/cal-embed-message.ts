// Cal.com's embed SDK reads postMessage payloads as
// `{ fullType: "CAL::<namespace>:<action>", data }` and parses the action from
// fullType (`@calcom/embed-core` parseAction). Older frames sent
// `{ type: "<action>", data: { iframeHeight } }` instead. Accept both.

const CLOSE_ACTIONS = new Set(['__closeIframe', 'cal:close', '__closeModal'])

export interface CalEmbedMessage {
  action: string | null
  height: number | null
}

function finiteHeight(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function actionFrom(message: Record<string, unknown>): string | null {
  if (typeof message.fullType === 'string') {
    const parts = message.fullType.split(':')
    // "CAL::__closeIframe" or "CAL:ns:__dimensionChanged" — the action is the
    // third colon segment, matching embed-core's parseAction.
    if (parts[0] === 'CAL' && parts.length >= 3 && parts[2]) return parts[2]
  }
  if (typeof message.type === 'string' && message.type) return message.type
  return null
}

function heightFrom(message: Record<string, unknown>): number | null {
  const payload = message.data
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const direct = finiteHeight(record.iframeHeight)
    if (direct !== null) return direct
    const nested = record.data
    if (nested && typeof nested === 'object') {
      return finiteHeight((nested as Record<string, unknown>).iframeHeight)
    }
  }
  return finiteHeight(message.iframeHeight)
}

export function readCalEmbedMessage(data: unknown): CalEmbedMessage {
  if (!data || typeof data !== 'object') return { action: null, height: null }
  const message = data as Record<string, unknown>
  return { action: actionFrom(message), height: heightFrom(message) }
}

export function isCalCloseAction(action: string | null): boolean {
  return action !== null && CLOSE_ACTIONS.has(action)
}
