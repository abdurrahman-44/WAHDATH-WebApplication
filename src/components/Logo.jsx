export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="11" className="fill-emerald-900" />
      {/* Two overlapping pointed arches — a mihrab silhouette abstracted
          into a monogram, rather than a generic initial-in-a-box mark. */}
      <path
        d="M10 29V19.5C10 14.8 13.6 11 18 11C22.4 11 26 14.8 26 19.5V29"
        stroke="#C9A05C"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 29V22C14 18.7 16.7 16 20 16C23.3 16 26 18.7 26 22V29"
        stroke="#F6F8F5"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}
