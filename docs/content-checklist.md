# Inputs needed before launch

The current page is an intentionally honest preview. “Launch preview” describes its status; it is not a proposed product or company name. The workspace was empty and contained no separate specification file; the implementation follows the supplied user brief. No product claims or endorsements should be inferred from the abstract artwork or editorial copy.

## Required

- **Product / brand name**, approved wordmark or logo, and ownership information for the footer.
- **One-sentence value proposition**: what the product does, for whom, and which problem it addresses.
- **Three verified features or benefits**, with approved descriptions and appropriate evidence for any performance claims.
- **Primary conversion goal and real destination**: learn more, contact, purchase, or join a real waitlist. The current CTA only navigates to the overview; it does not imply a working signup.
- **Launch date, availability, and pricing**, if these are approved for publication. Do not add a countdown to an unconfirmed date.
- **Final HTTPS domain** for `SITE_URL`, canonical URLs, and Open Graph sharing.

## Optional, only when approved

- Customer quotations, correct attribution, and publication permission.
- Customer logos and explicit permission to display them.
- Verified adoption figures, measurements, or other social proof.
- Real product imagery with accurate captions and alternative text.
- Contact address, legal entity details, and relevant policy links.
- Analytics provider, measurement requirements, retention and consent requirements. The existing stub sends nothing externally.

## Editorial launch gate

1. Replace the hero's preview copy with approved product positioning.
2. Replace the feature-grid editorial prompts with verified benefits; remove pending labels.
3. Populate the social-proof section with permissioned material or remove it. Do not retain sample endorsements.
4. Confirm FAQ answers match the actual offering.
5. Wire the one primary CTA to the approved destination; do not add an inert or fake email form.
6. Update title, description, social image, favicon, and footer as needed.
7. Set `SITE_URL`, remove the draft `noindex` directive, then rebuild and rerun checks.
8. Deploy `dist/` to the real static host. The temporary Cloudflare development tunnel is not a production deployment.
