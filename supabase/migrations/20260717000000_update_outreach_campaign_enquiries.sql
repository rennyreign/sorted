-- Revert outreach campaign wording back to "enquiries" for consistency with the
-- updated site theme (Build Trust | Handle Enquiries | Grow Customers).
-- American spelling ("inquiries") may be applied later based on visitor IP.

UPDATE outreach_campaigns
SET body_template = 'Hi,

We scored your website and rebuilt a new version.

We think the new version will increase trust, leading to more enquiries and more customers.

View the score and new version here:

{{review_url}}

No cost, no commitment.

Renaldo
Sorted',
    version = 4
WHERE id = 'sorted_initial_outreach_v1';
