# Sorted Updates Operator Pattern

```txt
Shared WhatsApp Intake
-> Client Router
-> Dedicated Client Website Operator
-> Client Rules + Memory + Templates
-> Dry Run / Preview / Apply
```

## Shared WhatsApp Intake

The intake receives provider webhooks and normalizes them into the inbound message schema. It should not decide whether a website update is safe.

## Client Router

The Client Router identifies the right Client Website Operator from an explicit `client_id` or a known placeholder phone mapping.

## Dedicated Client Website Operator

Each Client Website Operator owns one client's route, site paths, brand rules, approved update menu, templates, and safety gates.

## Client Rules, Memory, And Templates

Rules define current behaviour. Memory is seeded for future preference learning but does not mutate production behaviour yet. Templates define approved page and component scaffolds.

## Dry Run, Preview, Apply

This scaffold implements dry-run only. Preview branches, GitHub pull requests, deploys, and live applies are deferred.

