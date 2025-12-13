## Image upload & naming guide (placeholders → real assets)

This MVP uses local images from the Next.js `public/` folder and simple DB paths stored in `product_images.path`.

### 1) Brand images
- **Logo**: put your final logo at `public/images/brand/logo.png`
  - Used by: header across the site.
- **Hero banner**: put your final hero/banner at `public/images/brand/Banner_product.png`
  - Used by: homepage hero section.

### 2) Product images (recommended approach)
Create one image per product slug under:
- `public/images/products/<product-slug>.png`

Example filenames:
- `public/images/products/soothing-hand-butter.png`
- `public/images/products/peppermint-foot-butter.png`
- `public/images/products/tea-tree-deodorant-cream.png`
- `public/images/products/magic-dust-blackhead-remover.png`
- `public/images/products/shih-tzu-thing-foot-repair.png`
- `public/images/products/coconut-massage-body-butter.png`
- `public/images/products/eucalyptus-scented-foot-balm.png`

Then update the database table `product_images`:\n
- **path** should be `images/products/<product-slug>.png` (no leading `/`).\n
\n
You can update this via SQL in Supabase:\n
```sql
insert into public.product_images (product_id, path, alt, sort_order)
select id, 'images/products/soothing-hand-butter.png', name, 0
from public.products
where slug = 'soothing-hand-butter';
```\n

### 3) Quick swap (no DB change)
If you don’t want to touch the DB yet, you can overwrite the current placeholder files that are already referenced by the seed:\n
- `public/images/brand/Product1_handbutter.png`\n
- `public/images/brand/Product2_handbutter.png`\n
- `public/images/brand/Banner_product.png`\n

### Notes
- Keep images reasonably sized for mobile (e.g. 1200px wide, compressed).\n
- Don’t upload secrets/keys into `public/`.\n

