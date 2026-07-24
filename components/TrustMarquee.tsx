import { trustItems } from "@/lib/content";
import { Users, Headset, Infinity as InfinityIcon, Unlock, Shield, Pin } from "./Icons";

const iconMap = {
  users: Users,
  headset: Headset,
  infinity: InfinityIcon,
  unlock: Unlock,
  shield: Shield,
  pin: Pin,
} as const;

export default function TrustMarquee() {
  // Duplicate the list so the loop is seamless (track scrolls exactly -50%).
  const items = [...trustItems, ...trustItems];
  return (
    <div className="relative border-t border-white/10 bg-white/[0.025] py-7">
      <p className="text-center eyebrow !text-[var(--color-cyan)] mb-5">Trusted Across Jamaica</p>
      <div className="marquee-mask marquee-pause overflow-hidden">
        <div className="marquee-track">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <span
                key={i}
                className="flex items-center gap-2.5 px-7 whitespace-nowrap text-white/90 font-semibold text-lg"
              >
                <Icon className="w-5 h-5 text-[var(--color-cyan)] shrink-0" />
                {item.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
