import {
  type LucideIcon,
  ArrowRight,
  Bot,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ExternalLink,
  Github,
  GraduationCap,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Phone,
  Rocket,
  Timer,
  X,
  Zap,
} from 'lucide-react'

export const iconMap: Record<string, LucideIcon> = {
  'building-2': Building2,
  layers: Layers,
  bot: Bot,
  timer: Timer,
  'graduation-cap': GraduationCap,
  zap: Zap,
  rocket: Rocket,
  'arrow-right': ArrowRight,
  check: Check,
  'chevron-down': ChevronDown,
  menu: Menu,
  x: X,
  'external-link': ExternalLink,
  mail: Mail,
  phone: Phone,
  'map-pin': MapPin,
  linkedin: Linkedin,
  github: Github,
  calendar: Calendar,
}

export function getIcon(name: string): LucideIcon | null {
  return iconMap[name] ?? null
}
