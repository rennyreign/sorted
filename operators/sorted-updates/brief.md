# Build Brief: Sorted Updates Operator Core Scaffold

Build the core scaffold for the first Sorted Updates Operator system.

The system allows small business owners to send website update requests via WhatsApp. It identifies the client, routes the request to that client's dedicated website update operator, classifies the requested change, checks it against the client's approved update menu, and produces a safe dry-run update plan.

The first dedicated client operator is for Gracie Barra Halesowen.

This build does not include production WhatsApp integration, GitHub branch creation, live deploys, or writes to the live GB Halesowen Next.js route. It covers only the core operator architecture, client routing, request classification, safety policy, dry-run output, and GB Halesowen client operator scaffold.

## Naming Model

- `Sorted Updates`: overall service/system
- `WhatsApp Intake`: front door
- `Client Router`: identifies which client operator receives the request
- `Client Website Operator`: dedicated worker for one client site
- `GB Halesowen Operator`: first dedicated client website operator

## Core Flow

```txt
Inbound WhatsApp-style message
-> Normalise inbound message
-> Identify client from sender phone number or explicit client id
-> Load dedicated client operator config
-> Classify request
-> Apply client-specific safety rules
-> Generate dry-run update plan
-> Return suggested WhatsApp response
```

## Out Of Scope

- Real WhatsApp API calls
- Real GitHub branch creation or PRs
- Modifying live `app/gbhalesowen` files
- Secrets
- General-purpose AI agent behaviour

