alter table public.ad_review_decisions
  drop constraint if exists ad_review_decisions_status_check;

alter table public.ad_review_decisions
  add constraint ad_review_decisions_status_check
  check (status in ('awaiting_review', 'approved', 'changes_requested', 'rejected'));
