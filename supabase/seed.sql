-- Seed de HOMOLOGAÇÃO/PRODUÇÃO INICIAL: catálogo real (preços "Desde" por pessoa, USD) e regra de comissão PROVISÓRIA (5%).
-- Já aplicado ao projeto. Não há dados pessoais. fx_rates fica vazio de propósito: o admin cadastra taxas reais.
-- Usuários são criados pelo cadastro do site; o primeiro admin recebe papel por SQL:
--   insert into user_roles (user_id, role) select id, 'admin' from auth.users where email = '<email>';
insert into experiences (slug, title, summary, category, regions, intents, companions, duration_days, status) values
  ('bacalar','Bacalar, la laguna de los siete colores','Un día entre azules imposibles, para bajar el ritmo.','Naturaleza · Descanso','{caribe-mexicano}','{descanso,conexion}','{solo,pareja,amigos,familia}',1,'published'),
  ('chichen-itza','Chichén Itzá, maravilla del mundo maya','Historia viva frente a una de las nuevas maravillas del mundo.','Cultura · Historia','{yucatan}','{descubrir}','{solo,pareja,amigos,familia}',1,'published'),
  ('tulum','Tulum: selva, mar y cenotes','Ruinas frente al Caribe, selva y agua dulce.','Cultura · Mar','{caribe-mexicano}','{descubrir,descanso}','{solo,pareja,amigos,familia}',1,'published'),
  ('holbox','Holbox, la isla del fin del mundo','Arena, aves y un ritmo que se siente en el cuerpo.','Naturaleza · Calma','{caribe-mexicano}','{descanso,conexion}','{solo,pareja,amigos}',1,'published'),
  ('isla-mujeres','Isla Mujeres, la joya del Caribe','Aguas turquesa y tiempo para ti.','Mar · Descanso','{caribe-mexicano}','{descanso,aventura}','{solo,pareja,amigos,familia}',1,'published'),
  ('cozumel','Cozumel: arrecife, snorkel y VIP','Arrecife vivo y agua cristalina; opción VIP disponible.','Aventura · Mar','{caribe-mexicano}','{aventura,descanso}','{solo,pareja,amigos,familia}',1,'published'),
  ('las-coloradas','Las Coloradas, el mar rosa de México','Un paisaje que no se parece a ningún otro.','Aventura · Único','{yucatan}','{descubrir,aventura}','{pareja,amigos,familia}',1,'published'),
  ('xcaret','Xcaret: parque, cultura y naturaleza','Un día completo de naturaleza y cultura para todos.','Experiencia total','{caribe-mexicano}','{aventura,conexion}','{pareja,amigos,familia}',1,'published');
-- Preços (USD): bacalar 949, chichen-itza 699, tulum 1199, holbox 1249, isla-mujeres 649, cozumel 849, las-coloradas 1599, xcaret 2849
-- Mídia: /photos/<slug>.webp (capa). Regra: global, percent, 5 (provisória).
