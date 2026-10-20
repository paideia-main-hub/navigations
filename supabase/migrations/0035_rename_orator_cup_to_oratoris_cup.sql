-- Rename competition display title from "Orator Cup" / "Oratoris — Orator Cup"
-- to "Oratoris Cup". Slug stays `oratoris-cup` so existing URLs and hamper
-- drafts keep working. Also refresh denormalized titles and body copy.

update competitions
set
  title = 'Oratoris Cup',
  overview = replace(replace(coalesce(overview, ''), 'Oratoris — Orator Cup', 'Oratoris Cup'), 'Orator Cup', 'Oratoris Cup')
where slug = 'oratoris-cup';

update competitions
set short_description = replace(coalesce(short_description, ''), 'Orator Cup', 'Oratoris Cup')
where slug = 'oratoris-cup'
  and coalesce(short_description, '') like '%Orator Cup%';

update registrations
set competition_title = 'Oratoris Cup'
where competition_slug = 'oratoris-cup'
  and competition_title is distinct from 'Oratoris Cup';

update registration_payments
set competition_title = 'Oratoris Cup'
where competition_slug = 'oratoris-cup'
  and competition_title is distinct from 'Oratoris Cup';

update competition_faqs
set
  question = replace(coalesce(question, ''), 'Orator Cup', 'Oratoris Cup'),
  answer = replace(coalesce(answer, ''), 'Orator Cup', 'Oratoris Cup')
where competition_id = (select id from competitions where slug = 'oratoris-cup');
