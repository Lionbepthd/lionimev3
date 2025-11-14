// Fungsi untuk ambil data dari Jikan API
async function fetchAnimeData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching ", error);
    return [];
  }
}

// Render daftar anime ke dalam grid
function renderAnimeList(animeList, sectionTitle) {
  const main = document.querySelector('main');
  const section = document.createElement('section');
  section.innerHTML = `<h2 class="section-title">${sectionTitle}</h2><div class="anime-grid" id="grid-${sectionTitle.replace(/\s+/g, '')}"></div>`;
  main.appendChild(section);

  const grid = document.getElementById(`grid-${sectionTitle.replace(/\s+/g, '')}`);

  if (!animeList || animeList.length === 0) {
    grid.innerHTML = '<p>Tidak ada anime ditemukan.</p>';
    return;
  }

  animeList.forEach(anime => {
    const genres = anime.genres ? anime.genres.map(g => g.name).join(', ') : 'Unknown';
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <div class="title">${anime.title}</div>
      <div class="genres">${genres}</div>
    `;
    card.onclick = () => showAnimeDetails(anime.mal_id);
    grid.appendChild(card);
  });
}

// Fungsi untuk menampilkan detail (akan buka halaman details.html)
function showAnimeDetails(id) {
  window.open(`details.html?id=${id}`, '_self');
}

// Fungsi pencarian
async function searchAnime() {
  const query = document.getElementById('searchInput').value;
  if (!query) return;

  const data = await fetchAnimeData(`https://api.jikan.moe/v4/anime?q=${query}`);
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  renderAnimeList(data, 'Hasil Pencarian');
}

// Fungsi load anime home (sedang tayang, terbaru, populer)
async function loadAnimeListHome() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  // 1. Anime Sedang Tayang
  const ongoing = await fetchAnimeData('https://api.jikan.moe/v4/anime?status=airing');
  renderAnimeList(ongoing, 'Sedang Tayang');

  // 2. Anime Terbaru (berdasarkan tanggal dibuat)
  const latest = await fetchAnimeData('https://api.jikan.moe/v4/anime?order_by=created_at&sort=desc');
  renderAnimeList(latest, 'Baru Ditambahkan');

  // 3. Anime Populer (berdasarkan jumlah anggota)
  const popular = await fetchAnimeData('https://api.jikan.moe/v4/anime?order_by=members&sort=desc');
  renderAnimeList(popular, 'Populer');
}

// Fungsi load semua anime
async function loadAnimeListAll() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  const data = await fetchAnimeData('https://api.jikan.moe/v4/anime');
  renderAnimeList(data, 'Semua Anime');
}

// Fungsi load genre
async function loadGenres() {
  try {
    const response = await fetch('https://api.jikan.moe/v4/genres/anime');
    const data = await response.json();
    const genres = data.data;

    const main = document.querySelector('main');
    main.innerHTML = '<h2 class="section-title">Pilih Genre</h2><div id="genreList"></div>';

    const genreGrid = document.getElementById('genreList');
    genreGrid.innerHTML = '';

    genres.forEach(genre => {
      const card = document.createElement('div');
      card.className = 'anime-card';
      card.innerHTML = `<div class="title">${genre.name}</div>`;
      card.onclick = () => loadAnimeByGenre(genre.mal_id);
      genreGrid.appendChild(card);
    });

  } catch (error) {
    console.error("Error fetching genres:", error);
    document.querySelector('main').innerHTML = '<p>Gagal memuat genre.</p>';
  }
}

// Fungsi untuk load anime berdasarkan genre
async function loadAnimeByGenre(genreId) {
  const data = await fetchAnimeData(`https://api.jikan.moe/v4/anime?genres=${genreId}`);
  document.querySelector('main').innerHTML = `<h2 class="section-title">Anime Genre ${data[0]?.genres.find(g => g.mal_id === genreId)?.name || '...'}</h2><div id="animeGrid" class="anime-grid"></div>`;
  renderAnimeList(data, '');
}

// Fungsi load movie
async function loadMovies() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  const data = await fetchAnimeData('https://api.jikan.moe/v4/anime?status=movie');
  renderAnimeList(data, 'Anime Movie');
}

// Fungsi load jadwal
async function loadSchedule() {
  try {
    const response = await fetch('https://api.jikan.moe/v4/schedules');
    const data = await response.json();
    const schedule = data.data;

    const main = document.querySelector('main');
    main.innerHTML = '<h2 class="section-title">Jadwal Rilis Anime</h2><div id="scheduleList"></div>';

    const scheduleDiv = document.getElementById('scheduleList');

    schedule.forEach(day => {
      const dayTitle = document.createElement('h3');
      dayTitle.textContent = day.day.charAt(0).toUpperCase() + day.day.slice(1);
      scheduleDiv.appendChild(dayTitle);

      const dayGrid = document.createElement('div');
      dayGrid.className = 'anime-grid';

      day.entries.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
          <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
          <div class="title">${anime.title}</div>
          <div class="genres">${anime.genres ? anime.genres.map(g => g.name).join(', ') : 'Unknown'}</div>
        `;
        card.onclick = () => showAnimeDetails(anime.mal_id);
        dayGrid.appendChild(card);
      });

      scheduleDiv.appendChild(dayGrid);
    });

  } catch (error) {
    console.error("Error fetching schedule:", error);
    document.querySelector('main').innerHTML = '<p>Gagal memuat jadwal.</p>';
  }
}