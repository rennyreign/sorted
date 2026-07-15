-- Shift initial outreach away from a trust-led claim and toward enquiry leakage.
-- Many local businesses already feel trusted. The sharper commercial pain is
-- that their current site may not turn enough interested visitors into enquiries.

UPDATE outreach_campaigns
SET subject = 'We redesigned your website',
    body_template = 'Hi,

We redesigned your website.

Here''s the review and the new design:

{{review_url}}

Curious to hear what you think.

Renaldo Edmondson
Founder, Sorted
+44 7386 468085
sortmydigital.site',
    version = 5
WHERE id = 'sorted_initial_outreach_v1';
