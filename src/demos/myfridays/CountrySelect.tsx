'use client'

import { Svg } from './assets'
import { Select } from './Select'

// Country picker: on the landing (dark) and in Payment's billing details
// (light). UK comes from the file; the US and Australia flags are drawn to
// match its circle-flag style, since the file only has GB.

export interface Country { id: 'gb' | 'us' | 'au'; name: string; flag: string; currency: string }

export const COUNTRIES: Country[] = [
  { id: 'gb', name: 'United Kingdom', flag: 'flag-gb.svg', currency: '£' },
  { id: 'us', name: 'United States', flag: 'flag-us.svg', currency: '$' },
  { id: 'au', name: 'Australia', flag: 'flag-au.svg', currency: 'A$' },
]

const OPTIONS = COUNTRIES.map(c => ({ id: c.id, label: c.name, icon: <Svg src={c.flag} width={20} height={20} /> }))

interface CountrySelectProps {
  value: Country
  onChange: (country: Country) => void
  /** Sets the width: 272px on the web landing (the default), full width elsewhere. */
  className?: string
  fieldClassName?: string
  muted?: boolean
  id?: string
}

export function CountrySelect({ value, onChange, className = 'w-[272px]', fieldClassName, muted, id }: CountrySelectProps) {
  return (
    <Select
      id={id}
      label="Country"
      options={OPTIONS}
      value={value.id}
      onChange={next => onChange(COUNTRIES.find(c => c.id === next)!)}
      className={className}
      fieldClassName={fieldClassName}
      muted={muted}
    />
  )
}
