import type { SVGProps } from "react";

/**
 * Iconografía propia. Un solo lenguaje: viewBox 24, trazo 1.5, extremos
 * redondos, sin relleno. Son diez formas; una librería costaría identidad
 * (todas se parecen entre sí) sin ahorrar trabajo real.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Mi lista: un paquete con lazo. */
export function GiftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 11.5h17V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-8.5Z" />
      <path d="M2.75 8.5h18.5v3H2.75z" />
      <path d="M12 8.5V21" />
      <path d="M12 8.5S10.9 3 8.4 3a2.2 2.2 0 0 0 0 5.5Z" />
      <path d="M12 8.5S13.1 3 15.6 3a2.2 2.2 0 0 1 0 5.5Z" />
    </Icon>
  );
}

/** Su lista: una etiqueta de regalo con corazón. */
export function TagHeartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.2 12.6 12.6 20.2a2 2 0 0 1-2.8 0l-6-6a2 2 0 0 1-.6-1.5l.3-6.2a2 2 0 0 1 1.9-1.9l6.2-.3a2 2 0 0 1 1.5.6l6 6a2 2 0 0 1 .1 2.8Z" />
      <path d="M7.6 7.6h.01" />
      <path d="M12.6 15.4c-1.6-1.3-2.6-2.1-2.6-3.1a1.4 1.4 0 0 1 2.6-.7 1.4 1.4 0 0 1 2.6.7c0 1-1 1.8-2.6 3.1Z" />
    </Icon>
  );
}

/** Juntos: dos círculos que se solapan. */
export function TogetherIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="12" r="6.25" />
      <circle cx="15" cy="12" r="6.25" />
    </Icon>
  );
}

/** Yo: un retrato. */
export function PersonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4.5" />
    </Icon>
  );
}

/** Elige por mí: un dado con cinco puntos. Los puntos van rellenos a propósito. */
export function DiceIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4" />
      <g fill="currentColor" stroke="none">
        <circle cx="8" cy="8" r="1.15" />
        <circle cx="16" cy="8" r="1.15" />
        <circle cx="12" cy="12" r="1.15" />
        <circle cx="8" cy="16" r="1.15" />
        <circle cx="16" cy="16" r="1.15" />
      </g>
    </Icon>
  );
}

/** Enlace: dos eslabones de cadena. */
export function LinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5" />
      <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5L12.5 17" />
    </Icon>
  );
}

/** Cerrar: una cruz. */
export function XIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Icon>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 4.75h12a1 1 0 0 1 1 1v13.9a.6.6 0 0 1-.93.5L12 16.2l-6.07 3.95a.6.6 0 0 1-.93-.5V5.75a1 1 0 0 1 1-1Z" />
    </Icon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.75" y="5.5" width="16.5" height="14.75" rx="1.5" />
      <path d="M3.75 10h16.5M8.5 3.75v3.5M15.5 3.75v3.5" />
    </Icon>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Z" />
      <path d="M14.5 6.5 17.5 9.5" />
    </Icon>
  );
}
