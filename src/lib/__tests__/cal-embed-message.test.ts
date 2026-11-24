import { describe, it, expect } from 'vitest'
import { isCalCloseAction, readCalEmbedMessage } from '@/lib/cal-embed-message'

describe('readCalEmbedMessage', () => {
  it('reads the embed SDK fullType and a height on data', () => {
    expect(readCalEmbedMessage({
      fullType: 'CAL::__dimensionChanged',
      data: { iframeHeight: 640 },
    })).toEqual({ action: '__dimensionChanged', height: 640 })
  })

  it('reads a namespaced fullType', () => {
    expect(readCalEmbedMessage({
      fullType: 'CAL:booking:__closeIframe',
      data: {},
    }).action).toBe('__closeIframe')
  })

  it('keeps the legacy type field and a nested height', () => {
    expect(readCalEmbedMessage({
      type: '__dimensionChanged',
      data: { data: { iframeHeight: 700 } },
    })).toEqual({ action: '__dimensionChanged', height: 700 })
  })

  it('rejects a non-finite height and an empty payload', () => {
    expect(readCalEmbedMessage({ type: '__dimensionChanged', data: { iframeHeight: Number.NaN } }).height).toBeNull()
    expect(readCalEmbedMessage(null)).toEqual({ action: null, height: null })
  })
})

describe('isCalCloseAction', () => {
  it('accepts the SDK close action and the legacy names', () => {
    expect(isCalCloseAction('__closeIframe')).toBe(true)
    expect(isCalCloseAction('cal:close')).toBe(true)
    expect(isCalCloseAction('__closeModal')).toBe(true)
    expect(isCalCloseAction('__dimensionChanged')).toBe(false)
    expect(isCalCloseAction(null)).toBe(false)
  })
})
