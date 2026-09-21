#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, "").split("=")
    return [key, value.join("=")]
  }),
)

const projectName = args.project
const gtmId = args.gtm
const ga4Id = args.ga4
const output = resolve(args.output || "tracking/gtm-container-import.json")

if (!projectName || !/^GTM-[A-Z0-9]+$/.test(gtmId || "") || !/^G-[A-Z0-9]+$/.test(ga4Id || "")) {
  console.error(
    "Usage: node generate-gtm-import.mjs --project=\"Client Name\" --gtm=GTM-XXXX --ga4=G-XXXX [--output=tracking/gtm-container-import.json]",
  )
  process.exit(1)
}

const eventRegex = "^(page_view|scroll_50|key_page_view|cta_click|phone_click|email_click|whatsapp_click|download_click|outbound_click|ghl_embed_view|ghl_embed_interaction|thank_you_view|booking_completed|form_submit|form_error)$"
const parameters = [
  "page_path",
  "page_title",
  "event_source",
  "key_page_type",
  "cta_text",
  "cta_location",
  "destination",
  "link_url",
  "link_text",
  "file_url",
  "file_name",
  "form_name",
  "form_type",
  "conversion_name",
  "conversion_type",
  "coach_name",
  "embed_name",
  "embed_type",
  "embed_url",
  "scroll_threshold",
]

const variables = [
  {
    accountId: "0",
    containerId: "0",
    variableId: "1",
    name: "GA4 Measurement ID",
    type: "c",
    parameter: [{ type: "TEMPLATE", key: "value", value: ga4Id }],
    fingerprint: "0",
  },
  ...parameters.map((name, index) => ({
    accountId: "0",
    containerId: "0",
    variableId: String(index + 2),
    name: `DLV - ${name}`,
    type: "v",
    parameter: [
      { type: "INTEGER", key: "dataLayerVersion", value: "2" },
      { type: "BOOLEAN", key: "setDefaultValue", value: "false" },
      { type: "TEMPLATE", key: "name", value: name },
    ],
    fingerprint: "0",
  })),
]

const document = {
  exportFormatVersion: 2,
  exportTime: new Date().toISOString().replace("T", " ").replace(/\.\d{3}Z$/, ""),
  containerVersion: {
    path: "accounts/0/containers/0/versions/0",
    accountId: "0",
    containerId: "0",
    containerVersionId: "0",
    name: `${projectName} — Website Tracking Profile`,
    container: {
      path: "accounts/0/containers/0",
      accountId: "0",
      containerId: "0",
      name: `${projectName} — Website Tracking Profile`,
      publicId: gtmId,
      usageContext: ["WEB"],
      fingerprint: "0",
      tagManagerUrl: "https://tagmanager.google.com/",
    },
    tag: [],
    trigger: [
      {
        accountId: "0",
        containerId: "0",
        triggerId: "1",
        name: "All Pages",
        type: "PAGEVIEW",
        fingerprint: "0",
      },
      {
        accountId: "0",
        containerId: "0",
        triggerId: "2",
        name: "Custom Event - Sorted standard website events",
        type: "CUSTOM_EVENT",
        customEventFilter: [
          {
            type: "MATCH_REGEX",
            parameter: [
              { type: "TEMPLATE", key: "arg0", value: "{{_event}}" },
              { type: "TEMPLATE", key: "arg1", value: eventRegex },
            ],
          },
        ],
        fingerprint: "0",
      },
    ],
    variable: variables,
    builtInVariable: [
      { accountId: "0", containerId: "0", type: "PAGE_URL", name: "Page URL" },
      { accountId: "0", containerId: "0", type: "PAGE_PATH", name: "Page Path" },
      { accountId: "0", containerId: "0", type: "EVENT", name: "Event" },
    ],
    fingerprint: "0",
    tagManagerUrl: "https://tagmanager.google.com/",
  },
}

mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(document, null, 2)}\n`)
console.log(`Created ${output}`)
console.log("Expected GTM import summary: 0 tags, 2 triggers, 21 variables")
