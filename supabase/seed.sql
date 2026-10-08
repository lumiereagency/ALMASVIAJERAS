-- Seed de HOMOLOGAÇÃO. Dados fictícios: nenhum dado pessoal real. Preços de exemplo.
insert into fx_rates (from_currency, to_currency, rate, effective_on) values
  ('USD', 'MXN', 18.00, current_date), ('EUR', 'MXN', 20.00, current_date)
on conflict do nothing;

with e as (
  insert into experiences (slug, title, summary, description, category, regions, intents, companions, duration_days, status, faq) values
  ('cenotes-alma-caribena', 'Cenotes sagrados y alma caribeña', 'Agua, selva y descanso en la Riviera Maya.',
   'Ejemplo de homologación. Cenotes, bienestar y tiempo para ti.', 'Naturaleza · Bienestar',
   '{riviera-maya}', '{descanso,conexion}', '{pareja,amigos,solo}', 5, 'published',
   '[{"q":"¿Incluye vuelos?","a":"Ejemplo: no incluye vuelos internacionales."}]'),
  ('grecia-islas-mediterraneo', 'Islas, historia y vida mediterránea', 'Cultura e islas griegas a tu ritmo.',
   'Ejemplo de homologación.', 'Cultura · Exploración', '{grecia}', '{descubrir,cultura}', '{pareja,familia}', 8, 'published', '[]'),
  ('peru-montanas-proposito', 'Montañas, cultura y propósito', 'Machu Picchu y los Andes con sentido.',
   'Ejemplo de homologación.', 'Conexión · Aventura', '{peru}', '{descubrir,conexion}', '{amigos,solo}', 7, 'published', '[]'),
  ('japon-borrador', 'Japón (borrador)', 'No debe aparecer en el catálogo público.',
   null, 'Cultura', '{japon}', '{descubrir}', '{solo}', 10, 'draft', '[]')
  returning id, slug
)
insert into experience_prices (experience_id, amount, currency)
select id, case slug
  when 'cenotes-alma-caribena' then 18900 when 'grecia-islas-mediterraneo' then 32400
  when 'peru-montanas-proposito' then 24800 else 50000 end, 'MXN'
from e;

insert into commission_rules (scope, kind, value, currency)
values ('global', 'percent', 5, 'MXN'); -- VALOR FICTÍCIO: substituir pela regra comercial real

-- Usuários de teste são criados pelo painel/CLI do Supabase de homologação, depois:
--   insert into user_roles (user_id, role) values ('<uuid>', 'admin');
