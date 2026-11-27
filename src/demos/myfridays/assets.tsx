/* eslint-disable @next/next/no-img-element -- small local SVGs; next/image adds nothing here */
import type { CSSProperties } from 'react'

export const mfAsset = (file: string) => `/demos/myfridays/${file}`

/** Plain decorative SVG at a fixed size. */
export function Svg({ src, width, height, className = '' }: { src: string; width: number; height: number; className?: string }) {
  return <img src={mfAsset(src)} alt="" aria-hidden width={width} height={height} className={`block shrink-0 ${className}`} />
}

/** A fixed-colour SVG from the file, recoloured to currentColor with a CSS mask. */
export function MaskSvg({ src, width, height, className = '' }: { src: string; width: number; height: number; className?: string }) {
  const url = `url(${mfAsset(src)})`
  const style: CSSProperties = { width, height, maskImage: url, WebkitMaskImage: url, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }
  return <span aria-hidden className={`block shrink-0 bg-current ${className}`} style={style} />
}

// Cause icons: each SVG sits in a 24px box with the inset, flip and bleed
// it has in the Figma instance (some are mirrored on the canvas). The 40px
// instances on Payment are the same icon scaled up, stroke and all.
type Flip = 'none' | 'x' | 'y'
interface IconSpec { file: string; inset: string; flip: Flip; bleed: string }

const BOX = { 16: 'size-4', 20: 'size-5', 24: 'size-6', 40: 'size-10' } as const
type IconSize = keyof typeof BOX

function Icon24({ file, inset, flip, bleed, size = 24 }: IconSpec & { size?: IconSize }) {
  const flipClass = flip === 'x' ? '-scale-x-100' : flip === 'y' ? '-scale-y-100' : ''
  return (
    <span aria-hidden className={`relative block shrink-0 overflow-hidden ${BOX[size]}`}>
      <span className={`absolute block ${flipClass}`} style={{ inset }}>
        <span className="absolute block" style={{ inset: bleed }}>
          <img src={mfAsset(file)} alt="" className="block size-full max-w-none" />
        </span>
      </span>
    </span>
  )
}

const CAUSE_ICONS = {
  community: { file: 'cause-community.svg', inset: '8.33%', flip: 'y', bleed: '-3.75%' },
  disaster: { file: 'cause-disaster.svg', inset: '8.33% 20.83%', flip: 'none', bleed: '-3.75% -5.36%' },
  education: { file: 'cause-education.svg', inset: '8.33% 12.5%', flip: 'none', bleed: '-3.75% -4.17%' },
  elderly: { file: 'cause-elderly.svg', inset: '8.33% 20.83%', flip: 'y', bleed: '-3.75% -5.36%' },
  food: { file: 'cause-food.svg', inset: '8.33%', flip: 'none', bleed: '-3.75% -3.75% -3.74% -3.75%' },
  healthcare: { file: 'cause-healthcare.svg', inset: '8.33% 16.67%', flip: 'x', bleed: '-3.75% -4.69%' },
  local: { file: 'cause-local.svg', inset: '12.5% 16.67% 12.5% 8.33%', flip: 'none', bleed: '-4.17%' },
  medical: { file: 'cause-medical.svg', inset: '8.33% 16.67%', flip: 'x', bleed: '-3.75% -4.69%' },
  orphans: { file: 'cause-orphans.svg', inset: '8.33%', flip: 'y', bleed: '-3.75%' },
  refugee: { file: 'cause-refugee.svg', inset: '8.33% 25%', flip: 'none', bleed: '-3.75% -6.27%' },
  sadaqah: { file: 'cause-sadaqah.svg', inset: '8.33% 12.5%', flip: 'y', bleed: '-3.75% -4.17%' },
  zakat: { file: 'cause-zakat.svg', inset: '8.33%', flip: 'y', bleed: '-3.75%' },
} satisfies Record<string, IconSpec>

export type CauseIconName = keyof typeof CAUSE_ICONS

export function CauseIcon({ name, size = 24 }: { name: CauseIconName; size?: 24 | 40 }) {
  return <Icon24 {...(CAUSE_ICONS[name] as IconSpec)} size={size} />
}

// The 16px icons in Payment's donation split keep a 1.5px stroke, so they're
// their own exports rather than the 24px ones shrunk.
const SPLIT_ICONS = {
  food: { file: 'split-food.svg', inset: '8.33% 8.34% 8.33% 8.33%', flip: 'none', bleed: '-5.62% -5.63% -5.61% -5.62%' },
  education: { file: 'split-education.svg', inset: '8.33% 12.5%', flip: 'none', bleed: '-5.62% -6.25%' },
  sadaqah: { file: 'split-sadaqah.svg', inset: '8.34% 12.5% 8.33% 12.5%', flip: 'y', bleed: '-5.62% -6.25% -5.63% -6.25%' },
} satisfies Partial<Record<CauseIconName, IconSpec>>

export type SplitCause = keyof typeof SPLIT_ICONS

export function SplitIcon({ name }: { name: SplitCause }) {
  return <Icon24 {...(SPLIT_ICONS[name] as IconSpec)} size={16} />
}

export function SearchIcon() {
  return <Icon24 file="search.svg" inset="8.33%" flip="x" bleed="-3.75%" />
}

/** The city field's global-search icon (20px). */
export function GlobalSearchIcon() {
  return <Icon24 file="global-search.svg" inset="8.33%" flip="none" bleed="-4.5%" size={20} />
}

// ── Payment methods ──────────────────────────────────────────────────

export function CardIcon() {
  return (
    <span aria-hidden className="relative block size-6 shrink-0">
      <span className="absolute block" style={{ inset: '13.54% 5.21%' }}>
        <img src={mfAsset('pay-card.svg')} alt="" className="absolute inset-0 block size-full max-w-none" />
      </span>
    </span>
  )
}

export function ApplePayLogo() {
  return <Svg src="pay-apple.svg" width={42} height={17.364} />
}

/** "G Pay": the G and "Pay" sit in a grid, as in the file. */
export function GooglePayLogo() {
  return (
    <span aria-hidden className="relative block h-[16.664px] w-[40.476px] shrink-0">
      <img src={mfAsset('pay-g.svg')} alt="" width={13.393} height={13.865} className="absolute top-0 left-0 block max-w-none" />
      <img src={mfAsset('pay-gpay.svg')} alt="" width={23.336} height={15.704} className="absolute top-[0.96px] left-[17.14px] block max-w-none" />
    </span>
  )
}

export function PayPalLogo() {
  return <Svg src="pay-paypal.svg" width={17.992} height={21.941} />
}

/** The mobile header's burger (menu-01). */
export function MenuIcon() {
  return <Icon24 file="m-menu.svg" inset="20.83% 16.67%" flip="none" bleed="-5.36% -4.69%" />
}

// Charity logos (Figma "Component 1", 40px). MAP and Penny Appeal are
// layered vectors with masks; they're drawn at 40px and scaled, so the
// pixel mask sizes from the file stay right.
export type CharityLogoName =
  | 'ehsaas' | 'nzf' | 'penny' | 'map' | 'water' | 'baznas'
  | 'hidaya' | 'hrf' | 'muslimaid' | 'nisa' | 'oin' | 'gosh'

const layer = (inset: string, file: string, mask?: CSSProperties) => (
  <span key={file} className="absolute block" style={{ inset, ...mask }}>
    <img src={mfAsset(file)} alt="" className="absolute inset-0 block size-full max-w-none" />
  </span>
)
const maskStyle = (images: string[], extra: CSSProperties): CSSProperties => {
  const maskImage = images.map(f => `url("${mfAsset(f)}")`).join(', ')
  return { maskImage, WebkitMaskImage: maskImage, maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', ...extra } as CSSProperties
}

function MapLayers() {
  return (
    <>
      {layer('35.42% 31.48% 40.07% 41.4%', 'map/v1.svg')}
      {layer('55.43% 30.92% 39.72% 41.67%', 'map/v2.svg')}
      {layer('55.43% 30.92% 41.1% 41.67%', 'map/v3.svg')}
      {layer('58.81% 33.82% 40.57% 44.12%', 'map/v4.svg')}
      {layer('59.06% 34.6% 39.72% 51.06%', 'map/v5.svg')}
      {layer('55.43% 32.18% 40.11% 42.75%', 'map/v6.svg')}
      {layer('36.2% 15.15% 35.39% 15.42%', 'map/v7.svg')}
      {layer('61.16% 75.92% 35.34% 21.74%', 'map/g1.svg', maskStyle(['map/mask1.svg'], { maskMode: 'luminance', maskComposite: 'intersect', maskClip: 'no-clip', maskSize: '0.936px 1.403px' }))}
      {layer('61.06% 16.45% 35.34% 24.64%', 'map/g2.svg', maskStyle(['map/mask2.svg'], { maskMode: 'luminance', maskComposite: 'intersect', maskClip: 'no-clip', maskPosition: '-3.689px -10.257px', maskSize: '27.772px 11.694px' }))}
    </>
  )
}

function PennyLayers() {
  return (
    <>
      {layer('47.06% 31.77% 44.96% 8.82%', 'penny/v1.svg', maskStyle(['penny/mask.svg'], { maskMode: 'alpha', maskComposite: 'intersect', maskClip: 'no-clip', maskPosition: '-1.695px -1.989px', maskSize: '36.459px 6.41px' }))}
      {layer('45.27% 19.24% 47.08% 68.95%', 'penny/g.svg', maskStyle(['penny/mask.svg', 'penny/mask2.svg'], { maskPosition: '-25.746px -1.271px, -25.746px -1.27px', maskSize: '36.459px 6.41px, 36.363px 6.37px' }))}
      {layer('42.09% 4.51% 41.99% 4.58%', 'penny/v2.svg', maskStyle(['penny/mask.svg'], { maskMode: 'alpha', maskComposite: 'intersect', maskClip: 'no-clip', maskSize: '36.459px 6.41px' }))}
    </>
  )
}

/** A logo from the Figma file, or a charity's own site icon (US / Australia). */
export type CharityLogoSrc = { kind: 'file'; name: CharityLogoName } | { kind: 'web'; src: string }

/** Charity logo: 36px like the cards in the file, the full 40px (web Payment) or 24px (phone Payment). */
export function CharityLogo({ logo, size = 36 }: { logo: CharityLogoSrc; size?: 24 | 36 | 40 }) {
  const box = size === 40 ? 'size-10' : size === 24 ? 'size-6' : 'size-9'
  const scale = size === 40 ? '' : size === 24 ? 'scale-60' : 'scale-90'
  if (logo.kind === 'web') {
    // Site icons sit in a white disc so they read as the same round logos.
    return (
      <span aria-hidden className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--mf-white) ${box}`}>
        <img src={mfAsset(`web/${logo.src}`)} alt="" className="block size-[72%] object-contain" />
      </span>
    )
  }
  const { name } = logo
  return (
    <span aria-hidden className={`relative block shrink-0 ${box}`}>
      <span className={`absolute top-0 left-0 block size-10 origin-top-left ${scale}`}>
        <img src={mfAsset(`charity-${name}.svg`)} alt="" className="absolute inset-0 block size-full max-w-none" />
        {name === 'map' && <MapLayers />}
        {name === 'penny' && <PennyLayers />}
      </span>
    </span>
  )
}
