// script.js - Versi menggunakan Jikan API

// Fungsi untuk ambil data dari Jikan API
async function fetchAnimeDataJikan(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching from Jikan: ", error);
    return [];
  }
}

// Fungsi render untuk data dari Jikan
function renderJikanAnimeList(animeList, sectionTitle) {
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
    card.onclick = () => showAnimeDetails(anime.mal_id); // Gunakan ID Jikan
    grid.appendChild(card);
  });
}

// Fungsi pencarian (menggunakan Jikan)
async function searchAnime() {
  const query = document.getElementById('searchInput').value;
  if (!query) return;

  const data = await fetchAnimeDataJikan(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`);
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  renderJikanAnimeList(data, 'Hasil Pencarian');
}

// Fungsi load anime home (dari Jikan - Ongoing, Latest, Popular)
async function loadAnimeListHome() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;

  // 1. Anime Sedang Tayang
  const ongoing = await fetchAnimeDataJikan('https://api.jikan.moe/v4/anime?status=airing');
  renderJikanAnimeList(ongoing, 'Sedang Tayang');

  // 2. Anime Terbaru (berdasarkan tanggal dibuat)
  const latest = await fetchAnimeDataJikan('https://api.jikan.moe/v4/anime?order_by=created_at&sort=desc');
  renderJikanAnimeList(latest, 'Baru Ditambahkan');

  // 3. Anime Populer (berdasarkan jumlah anggota)
  const popular = await fetchAnimeDataJikan('https://api.jikan.moe/v4/anime?order_by=members&sort=desc');
  renderJikanAnimeList(popular, 'Populer');
}

// Fungsi load semua anime (dari Jikan)
async function loadAnimeListAll() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  const data = await fetchAnimeDataJikan('https://api.jikan.moe/v4/anime');
  renderJikanAnimeList(data, 'Semua Anime');
}

// Fungsi load genre (dari Jikan)
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

// Fungsi untuk load anime berdasarkan genre (dari Jikan)
async function loadAnimeByGenre(genreId) {
  const data = await fetchAnimeDataJikan(`https://api.jikan.moe/v4/anime?genres=${genreId}`);
  document.querySelector('main').innerHTML = `<h2 class="section-title">Anime Genre ${data[0]?.genres.find(g => g.mal_id === genreId)?.name || '...'}</h2><div id="animeGrid" class="anime-grid"></div>`;
  renderJikanAnimeList(data, '');
}

// Fungsi load movie (dari Jikan)
async function loadMovies() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  const data = await fetchAnimeDataJikan('https://api.jikan.moe/v4/anime?status=movie');
  renderJikanAnimeList(data, 'Anime Movie');
}

// Fungsi load jadwal (dari Jikan)
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

// Fungsi untuk menampilkan detail (akan buka halaman details.html dengan ID Jikan)
function showAnimeDetails(id) {
  window.open(`details.html?id=${id}`, '_self');
}
