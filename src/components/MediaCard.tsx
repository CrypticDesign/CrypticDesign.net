import Image from "next/image";
import Link from "next/link";

type Props = { href: string; image: string; eyebrow: string; title: string; body?: string; accent?: "cyan" | "gold" | "magenta" | "green" };

export default function MediaCard({ href, image, eyebrow, title, body, accent = "cyan" }: Props) {
  return <Link href={href} className={`media-card accent-${accent}`}>
    <div className="media-card__image"><Image src={image} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" /></div>
    <div className="media-card__body"><span className="kicker">{eyebrow}</span><h3>{title}</h3>{body && <p>{body}</p>}<span className="text-link">Open <b>+</b></span></div>
  </Link>;
}
