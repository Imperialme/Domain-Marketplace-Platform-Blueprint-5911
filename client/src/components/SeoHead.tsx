import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string;
  /** JSON-LD structured data object */
  structuredData?: object;
}

/**
 * SeoHead — sets document title, meta description, Open Graph, canonical, and JSON-LD.
 * Uses direct DOM manipulation (no react-helmet dependency needed).
 */
export default function SeoHead({
  title,
  description,
  canonical,
  ogImage = "/logo-brand.png",
  keywords,
  structuredData,
}: SeoHeadProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Helper to upsert a <meta> tag
    function setMeta(selector: string, content: string) {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attr, val] = selector.replace(/[\[\]"]/g, "").split("=");
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }

    // Helper to upsert a <link> tag
    function setLink(rel: string, href: string) {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    }

    setMeta('meta[name="description"]', description);
    if (keywords) setMeta('meta[name="keywords"]', keywords);

    // Open Graph
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:type"]', "website");
    setMeta('meta[property="og:image"]', ogImage);
    if (canonical) setMeta('meta[property="og:url"]', canonical);

    // Twitter Card
    setMeta('meta[name="twitter:card"]', "summary_large_image");
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', ogImage);

    // Canonical
    if (canonical) setLink("canonical", canonical);

    // JSON-LD structured data
    const existingLd = document.getElementById("__jsonld__");
    if (structuredData) {
      const script = existingLd || document.createElement("script");
      script.id = "__jsonld__";
      (script as HTMLScriptElement).type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      if (!existingLd) document.head.appendChild(script);
    } else if (existingLd) {
      existingLd.remove();
    }

    return () => {
      // Reset to default on unmount
      document.title = "Procure.parts — B2B Spare Parts Procurement";
    };
  }, [title, description, canonical, ogImage, keywords, structuredData]);

  return null;
}
