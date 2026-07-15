-- Update the initial outreach campaign to reflect the trust-pivot positioning.
-- The email now leads with the website score and rebuilt mockup, framing the
-- value around increased trust, enquiries, and customers.

UPDATE outreach_campaigns
SET subject = 'Your website score + rebuilt mockup',
    body_template = 'Hi,

We scored your website and rebuilt a new version.

We think the new version will increase trust, leading to more enquiries and customers.

View the score and new version here:

{{review_url}}

No cost, no commitment.

Renaldo
Sorted',
    version = 2
WHERE id = 'sorted_initial_outreach_v1';
