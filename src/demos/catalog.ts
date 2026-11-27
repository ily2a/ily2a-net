// The list of live demos: id → how it's framed and labelled.
//
// Plain data with no React imports, so the Sanity Studio schema can read it
// to build the "Live demo" picker without pulling the demo components in.
// The components themselves are wired up in ./registry.tsx. Its type makes
// the build fail if an id here has no component there.

/** The frame a demo sits in on the case page. */
export type DemoDevice = 'phone' | 'browser'

/** A demo's design size in one frame. It's built at exactly this size and scaled to fit. */
export interface DemoScreen {
  width: number
  height: number
}

export interface DemoMeta {
  /** Shown in the Studio picker. */
  title: string
  /**
   * The frames the demo is built for. With both, wide screens get a
   * Web / Mobile switch (Web first) and phones get the phone layout only.
   */
  screens: Partial<Record<DemoDevice, DemoScreen>>
  /** Fake address shown in the browser frame's URL bar. */
  url?: string
}

/** What every demo is rendered with: the frame it's in, so it can lay itself out for it. */
export interface DemoProps {
  device: DemoDevice
}

export const DEMO_CATALOG = {
  'lean-onboarding': {
    title: 'Lean: onboarding flow',
    screens: { phone: { width: 375, height: 812 } },
  },
  'myfridays-donor': {
    title: 'MyFridays: donor flow',
    screens: { browser: { width: 1440, height: 1024 }, phone: { width: 393, height: 852 } },
    url: 'myfridays.com',
  },
} satisfies Record<string, DemoMeta>

export type DemoId = keyof typeof DEMO_CATALOG

export const isDemoId = (value: unknown): value is DemoId =>
  typeof value === 'string' && Object.hasOwn(DEMO_CATALOG, value)
