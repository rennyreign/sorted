// Stage 1 client identity and review contact configuration.
// Set once per client during Frontend Build (Op 4). This is review
// plumbing, not CMS content — do not wire it to JSON content files.
//
// workspaceNextStepsUrl: the client's workspace Next Steps URL
//   https://sortmydigital.site/workspace/<workspace-slug>/next-steps
// The workspace slug is the prospect's review_slug and may differ
// from this site's project slug. Leave null when no workspace
// exists — PendingPage falls back to a mailto review action.
// Do not invent a slug, prices, or payment links.

export const siteConfig = {
  businessName: "Client",
  workspaceNextStepsUrl: null as string | null,
  reviewEmail: "hello@sortmydigital.site",
}
