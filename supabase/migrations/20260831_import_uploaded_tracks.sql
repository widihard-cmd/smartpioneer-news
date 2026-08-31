insert into public.tracks (id, title, artist, album, file_path, track_number, is_published)
select
  name,
  trim(regexp_replace(regexp_replace(name, '[.]mp3$', ''), '_', ' ', 'g')),
  'SmartPioneer',
  'SmartPioneer Music',
  name,
  row_number() over (order by name) + 12,
  true
from storage.objects
where bucket_id = 'music'
  and name !~ '^(0[1-9]|1[0-2])-'
on conflict (id) do update set
  title = excluded.title,
  artist = excluded.artist,
  album = excluded.album,
  file_path = excluded.file_path,
  is_published = true;
