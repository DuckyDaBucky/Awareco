import type { ReactNode } from "react"

type Props = { name: string; id: string }

const stroke = "#cedc00"
const ink = "#ffffff"
const fill = "#0c2420"

export function Portrait({ name, id }: Props) {
  return (
    <svg className="portrait" viewBox="0 0 160 200" role="img" aria-label={`Editorial illustration of ${name}, an illustrative guide`}>
      <rect width="160" height="200" fill="#050605" />
      <rect x="10" y="10" width="140" height="180" fill="none" stroke="#00665e" />
      {art[id] ?? art.aleto}
    </svg>
  )
}

const art: Record<string, ReactNode> = {
  aleto: (
    <>
      <path d="M52 74 Q80 46 108 74 Q116 116 80 128 Q44 116 52 74" fill={fill} stroke={stroke} />
      <path d="M62 72 Q80 60 98 72" fill="none" stroke={ink} />
      <path d="M48 148 H112 L122 188 H38 Z" fill="#00352f" stroke={ink} />
      <path d="M72 148 V170 H88 V148" fill="none" stroke={stroke} />
    </>
  ),
  "accelerate-women": (
    <>
      <path d="M58 44 Q80 26 112 62 Q122 100 80 126 Q42 102 58 44" fill={fill} stroke={ink} />
      <circle cx="80" cy="88" r="20" fill="none" stroke={stroke} />
      <path d="M40 156 Q80 132 120 156 V188 H40 Z" fill="#00473f" stroke={ink} />
    </>
  ),
  "racing-pride": (
    <>
      <path d="M44 60 H116 L108 92 H52 Z" fill="#00665e" stroke={stroke} />
      <circle cx="80" cy="114" r="26" fill={fill} stroke={ink} />
      <path d="M36 154 H124 L132 188 H28 Z" fill="#00352f" stroke={stroke} />
      <path d="M54 168 H106" stroke={ink} />
    </>
  ),
  "paddle-uk": (
    <>
      <path d="M50 50 Q80 34 114 62 Q102 112 80 124 Q56 108 50 50" fill={fill} stroke={ink} />
      <path d="M32 148 Q80 126 128 148 L118 188 H42 Z" fill="#00473f" stroke={stroke} />
      <path d="M120 36 L136 156" stroke={stroke} />
    </>
  ),
  techvets: (
    <>
      <path d="M50 72 H110 Q118 112 80 128 Q42 112 50 72" fill={fill} stroke={ink} />
      <path d="M46 60 H114" stroke={stroke} />
      <path d="M38 146 H122 L112 188 H48 Z" fill="#00352f" stroke={ink} />
      <rect x="68" y="152" width="24" height="16" fill="none" stroke={stroke} />
    </>
  ),
  mechanics: (
    <>
      <path d="M46 54 H114 L108 82 H52 Z" fill={stroke} />
      <circle cx="80" cy="110" r="28" fill={fill} stroke={ink} />
      <path d="M34 154 H126 V188 H34 Z" fill="#00665e" stroke={ink} />
      <path d="M48 166 H112" stroke={stroke} />
    </>
  ),
  "make-a-mark-day": (
    <>
      <circle cx="80" cy="88" r="30" fill={fill} stroke={stroke} />
      <path d="M58 64 Q80 46 104 66" fill="none" stroke={ink} />
      <path d="M44 144 Q80 126 116 144 L108 188 H52 Z" fill="#00352f" stroke={ink} />
      <path d="M28 118 Q42 152 34 176" fill="none" stroke={stroke} />
    </>
  ),
  "aramco-intern": (
    <>
      <path d="M54 48 Q80 32 112 60 Q118 110 80 126 Q44 106 54 48" fill={fill} stroke={ink} />
      <path d="M40 150 H120 L128 188 H32 Z" fill="#00473f" stroke={stroke} />
      <path d="M64 150 L80 174 L96 150" fill="none" stroke={ink} />
    </>
  ),
  "stem-racing": (
    <>
      <path d="M48 46 H112 L104 94 H56 Z" fill={fill} stroke={stroke} />
      <circle cx="80" cy="114" r="24" fill="#00352f" stroke={ink} />
      <path d="M36 152 H124 L116 188 H44 Z" fill="#00665e" stroke={ink} />
      <path d="M70 66 H90" stroke={stroke} />
    </>
  ),
  afbe: (
    <>
      <path d="M50 62 Q80 40 112 64 Q108 114 80 126 Q52 112 50 62" fill={fill} stroke={ink} />
      <circle cx="68" cy="90" r="7" fill="none" stroke={stroke} />
      <circle cx="92" cy="90" r="7" fill="none" stroke={stroke} />
      <path d="M58 88 H102" stroke={stroke} />
      <path d="M42 148 H118 V188 H42 Z" fill="#00352f" stroke={ink} />
    </>
  ),
  neurodiversity: (
    <>
      <path d="M46 70 Q72 38 104 58 Q124 92 108 122 Q80 134 52 114 Q34 92 46 70" fill={fill} stroke={stroke} />
      <path d="M38 146 Q80 130 122 154 V188 H38 Z" fill="#00473f" stroke={ink} />
      <path d="M56 162 Q80 176 104 162" fill="none" stroke={stroke} />
    </>
  ),
  fundraising: (
    <>
      <circle cx="80" cy="90" r="28" fill={fill} stroke={ink} />
      <path d="M48 68 Q80 46 116 74" fill="none" stroke={stroke} />
      <path d="M36 144 H124 L116 188 H44 Z" fill="#00352f" stroke={ink} />
      <path d="M26 148 Q50 170 34 186" fill="none" stroke={stroke} />
      <path d="M134 148 Q110 170 126 186" fill="none" stroke={stroke} />
    </>
  ),
}
