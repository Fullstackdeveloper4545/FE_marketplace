import { useLocale } from '../hooks/useLocale';

/**
 * Full-width hero (Figma-style). Background image:
 * - Set VITE_HERO_IMAGE_URL in .env to any URL, or
 * - Export from Figma → place at public/images/hero-banner.jpg and set VITE_HERO_IMAGE_URL=/images/hero-banner.jpg
 * Default uses a royalty-free track photo until you replace it.
 */
const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=2400&q=82';

export default function HomeHero() {
  const { t } = useLocale();
  const bgUrl = (import.meta.env.VITE_HERO_IMAGE_URL || '').trim() || DEFAULT_HERO;
  const title = t('home.hero.title');
  const subtitle = t('home.hero.subtitle');
  const cta = t('home.hero.cta');
  const ctaHref = t('home.hero.ctaHref') || '#store-catalog';

  return (
    <section className="store-hero" aria-labelledby="store-hero-title">
      <div
        className="store-hero__bg"
        style={{
          backgroundImage: `linear-gradient(105deg, rgba(0, 0, 0, 0.58) 0%, rgba(0, 0, 0, 0.28) 55%, rgba(0, 0, 0, 0.2) 100%), url(${bgUrl})`,
        }}
      />
      <div className="store-hero__inner">
        <h2 id="store-hero-title" className="store-hero__title">
          {title}
        </h2>
        <p className="store-hero__subtitle">{subtitle}</p>
        <a className="store-hero__cta" href={ctaHref}>
          {cta}
        </a>
      </div>
    </section>
  );
}
