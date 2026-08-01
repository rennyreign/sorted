# Nod Pipeline

The CRM tracks a prospect through the route from discovery to delivery:

```
new -> outreached -> responded -> mockup_revealed -> build -> quote -> paid -> lost
```

All stage movements are manual except `mockup_revealed`, which is recorded automatically when the prospect reveals their personalised mockup on the review page.

The pipeline relates to the approval gates as follows:

- A response and mockup approval lead to Nod 1 and the `build` stage.
- The working static site is shown for Nod 2.
- A quote is then presented at the `quote` stage for Nod 3.
- Payment moves the work to `paid`, completing Nod 4 and starting delivery.

Source: `doctrine/operator-chain.md`, `doctrine/sorted-operating-model.md`.
