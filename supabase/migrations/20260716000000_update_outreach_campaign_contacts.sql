-- Update outreach campaign to use location-neutral "contacts" wording instead of
-- British "enquiries" so the theme stays consistent across the site.

UPDATE outreach_campaigns
SET body_template = 'Hi,

We scored your website and rebuilt a new version.

We think the new version will increase trust, leading to more contacts and more customers.

View the score and new version here:

{{review_url}}

No cost, no commitment.

Renaldo
Sorted',
    version = 3
WHERE id = 'sorted_initial_outreach_v1';
