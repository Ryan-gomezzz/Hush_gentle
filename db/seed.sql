-- Seed data for Hush Gentle MVP

insert into public.categories (name, slug, description)
values
  ('Hand Care', 'hand-care', 'Everyday softness for hands that do a lot.'),
  ('Foot Care', 'foot-care', 'Comfort for tired feet and cracked heels.'),
  ('Body Care', 'body-care', 'Nourishing rituals for the whole body.'),
  ('Face Care', 'face-care', 'Gentle formulas for daily face care.')
on conflict (slug) do nothing;

with cats as (
  select id, slug from public.categories
),
ins as (
  insert into public.products (
    category_id,
    name,
    slug,
    short_benefit,
    description,
    ingredients,
    how_to_use,
    why_gentle,
    price_inr,
    is_active,
    is_featured,
    attributes
  )
  values
    (
      (select id from cats where slug = 'hand-care'),
      'Hush Gentle Soothing Hand Butter',
      'soothing-hand-butter',
      'Comforting hydration for dry, hardworking hands.',
      'A rich, calming hand butter that melts in gently. Made for everyday use—especially when your hands feel dry, tight, or overwashed.',
      'Cold-pressed oils, organic butters, lanolin, vitamin E, essential oils.',
      'Warm a small amount between palms and massage into hands and cuticles. Use after washing or whenever needed.',
      'Simple, skin-respecting ingredients—no harsh chemicals, suitable for sensitive skin.',
      399,
      true,
      true,
      jsonb_build_object('organic', true, 'cruelty_free', true, 'no_chemicals', true, 'sensitive_skin', true, 'use_case', 'hand')
    ),
    (
      (select id from cats where slug = 'foot-care'),
      'Hush Gentle Peppermint Foot Butter',
      'peppermint-foot-butter',
      'Cooling comfort for tired feet.',
      'A refreshing foot butter with a gentle peppermint note—made to soften and soothe after long days.',
      'Cold-pressed oils, organic butters, lanolin, vitamin E, peppermint essential oil.',
      'Massage into clean feet, focusing on heels and dry areas. Best used at night.',
      'Gentle formula, no harsh additives, crafted for regular use.',
      449,
      true,
      false,
      jsonb_build_object('organic', true, 'cruelty_free', true, 'no_chemicals', true, 'sensitive_skin', true, 'use_case', 'foot')
    ),
    (
      (select id from cats where slug = 'body-care'),
      'Hush Gentle Tea Tree Deodorant Cream',
      'tea-tree-deodorant-cream',
      'A soft, clean feel—without harshness.',
      'A gentle deodorant cream designed for comfort. Lightly scented with tea tree—made for everyday confidence without aggressive ingredients.',
      'Organic butters, cold-pressed oils, vitamin E, tea tree essential oil.',
      'Apply a pea-sized amount to clean, dry underarms. Let it absorb before dressing.',
      'No harsh chemicals; a simple, skin-first approach.',
      499,
      true,
      false,
      jsonb_build_object('organic', true, 'cruelty_free', true, 'no_chemicals', true, 'sensitive_skin', true, 'use_case', 'body')
    ),
    (
      (select id from cats where slug = 'face-care'),
      'Hush Gentle Magic Dust Blackhead Remover',
      'magic-dust-blackhead-remover',
      'A gentle reset for congested skin.',
      'A mild, skin-friendly clarifying powder meant for occasional use—when skin feels a little clogged and needs a gentle refresh.',
      'Plant-based powders, gentle clays, soothing oils, vitamin E.',
      'Mix a small amount with water to form a paste. Apply to T-zone for 5–8 minutes, then rinse gently. Use 1–2x weekly.',
      'Designed to be kind to skin—no aggressive stripping.',
      599,
      true,
      false,
      jsonb_build_object('organic', true, 'cruelty_free', true, 'no_chemicals', true, 'sensitive_skin', true, 'use_case', 'face')
    ),
    (
      (select id from cats where slug = 'foot-care'),
      'Hush Gentle Shih Tzu Thing Foot Repair',
      'shih-tzu-thing-foot-repair',
      'Repair-focused comfort for very dry feet.',
      'A deeper, richer foot repair balm for rough patches—made to feel comforting and non-irritating.',
      'Organic butters, lanolin, cold-pressed oils, vitamin E.',
      'Apply to heels and rough areas. For best results, wear cotton socks overnight.',
      'Soft, no-nonsense ingredients—made for sensitive skin.',
      499,
      true,
      false,
      jsonb_build_object('organic', true, 'cruelty_free', true, 'no_chemicals', true, 'sensitive_skin', true, 'use_case', 'foot')
    ),
    (
      (select id from cats where slug = 'body-care'),
      'Hush Gentle Coconut Massage Body Butter',
      'coconut-massage-body-butter',
      'Slow, soothing nourishment for body care.',
      'A comforting coconut body butter with a soft glide—made for massage and daily moisture.',
      'Organic butters, cold-pressed oils, vitamin E, coconut extract.',
      'Massage onto damp skin after showering, or use for a slow evening self-care ritual.',
      'Gentle, minimal ingredients. No harsh chemicals.',
      549,
      true,
      true,
      jsonb_build_object('organic', true, 'cruelty_free', true, 'no_chemicals', true, 'sensitive_skin', true, 'use_case', 'body')
    ),
    (
      (select id from cats where slug = 'foot-care'),
      'Hush Gentle Eucalyptus Scented Foot Balm',
      'eucalyptus-scented-foot-balm',
      'A calm eucalyptus touch for nightly wind-down.',
      'A soothing balm with a gentle eucalyptus aroma—made for a relaxed, nightly routine.',
      'Organic butters, cold-pressed oils, vitamin E, eucalyptus essential oil.',
      'Massage into feet before bed, focusing on dry areas.',
      'Comfort-first formula with simple, skin-safe ingredients.',
      429,
      true,
      false,
      jsonb_build_object('organic', true, 'cruelty_free', true, 'no_chemicals', true, 'sensitive_skin', true, 'use_case', 'foot')
    )
  returning id, slug
)
select * from ins;

-- Product images (use provided assets as placeholders for now)
insert into public.product_images (product_id, path, alt, sort_order)
select p.id, 'images/brand/Product1_handbutter.png', p.name, 0
from public.products p
where p.slug in ('soothing-hand-butter')
on conflict do nothing;

insert into public.product_images (product_id, path, alt, sort_order)
select p.id, 'images/brand/Product2_handbutter.png', p.name, 0
from public.products p
where p.slug in ('coconut-massage-body-butter')
on conflict do nothing;

insert into public.product_images (product_id, path, alt, sort_order)
select p.id, 'images/brand/Banner_product.png', p.name, 0
from public.products p
where p.slug not in ('soothing-hand-butter','coconut-massage-body-butter')
on conflict do nothing;

-- Testimonials
insert into public.testimonials (display_name, rating, content, is_published)
values
  ('Asha', 5, 'My hands feel soft without any heaviness. The scent is calm and subtle.', true),
  ('Rohit', 5, 'The foot butter feels comforting after long days. Simple and effective.', true),
  ('Meera', 4, 'Love the minimal ingredients approach. Feels gentle on my sensitive skin.', true)
on conflict do nothing;

-- Amazon reviews (manual import style; linked to products)
insert into public.amazon_reviews (product_id, rating, title, content, reviewer_name, reviewed_at, is_verified)
select p.id, 5, 'Soothing and non-greasy', 'Absorbs well and feels gentle. Perfect for daily use.', 'Verified Amazon Customer', '2025-06-03', true
from public.products p
where p.slug = 'soothing-hand-butter'
on conflict do nothing;


