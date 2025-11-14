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

// Fungsi untuk ambil data dari SankaVollerei API
async function fetchSankaData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching from SankaVollerei: ", error);
    return [];
  }
}

// Fungsi render khusus untuk data dari SankaVollerei
function renderSankaAnimeList(animeList, sectionTitle) {
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
    // Struktur data dari SankaVollerei bisa bervariasi, sesuaikan dengan respons API
    // Contoh: anime.title, anime.image, anime.slug
    const genres = anime.genres ? anime.genres.map(g => g.name).join(', ') : 'Unknown'; // Jika genres ada
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
      <img src="${anime.image}" alt="${anime.title}">
      <div class="title">${anime.title}</div>
      <div class="genres">${genres}</div>
    `;
    card.onclick = () => showAnimeDetailsFromTitle(anime.title); // Fungsi baru
    grid.appendChild(card);
  });
}

// Fungsi baru: Cari ID Jikan dari judul dan arahkan ke details.html
async function showAnimeDetailsFromTitle(title) {
    try {
        const searchResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
        const searchData = await searchResponse.json();

        if (searchData.data && searchData.data.length > 0) {
            const jikanId = searchData.data[0].mal_id;
            window.open(`details.html?id=${jikanId}`, '_self');
        } else {
            alert(`Detail untuk "${title}" tidak ditemukan di database Jikan.`);
        }
    } catch (error) {
        console.error("Error searching Jikan ID for details:", error);
        alert("Gagal mengambil detail anime.");
    }
}

// Fungsi pencarian (menggunakan SankaVollerei)
async function searchAnime() {
  const query = document.getElementById('searchInput').value;
  if (!query) return;

  const data = await fetchSankaData(`https://www.sankavollerei.com/anime/search/${encodeURIComponent(query)}`);
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  renderSankaAnimeList(data, 'Hasil Pencarian');
}

// Fungsi load anime home (dari SankaVollerei)
async function loadAnimeListHome() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;

  const homeData = await fetchSankaData('https://www.sankavollerei.com/anime/home');

  // Asumsikan struktur data dari /home adalah { ongoing: [...], newAdded: [...], populer: [...] }
  // Jika struktur berbeda, sesuaikan
  const ongoing = homeData.ongoing || [];
  const latest = homeData.newAdded || [];
  const popular = homeData.populer || [];

  renderSankaAnimeList(ongoing, 'Sedang Tayang');
  renderSankaAnimeList(latest, 'Baru Ditambahkan');
  renderSankaAnimeList(popular, 'Populer');
}

// Fungsi load semua anime (dari SankaVollerei)
async function loadAnimeListAll() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  const data = await fetchSankaData('https://www.sankavollerei.com/anime/anime');
  renderSankaAnimeList(data, 'Semua Anime');
}

// Fungsi load genre (dari SankaVollerei)
async function loadGenres() {
  try {
    const genres = await fetchSankaData('https://www.sankavollerei.com/anime/genres');

    const main = document.querySelector('main');
    main.innerHTML = '<h2 class="section-title">Pilih Genre</h2><div id="genreList"></div>';

    const genreGrid = document.getElementById('genreList');
    genreGrid.innerHTML = '';

    genres.forEach(genre => {
      const card = document.createElement('div');
      card.className = 'anime-card';
      card.innerHTML = `<div class="title">${genre.name}</div>`; // Sesuaikan dengan struktur data genre
      card.onclick = () => loadAnimeByGenreSanka(genre.id); // Gunakan ID genre
      genreGrid.appendChild(card);
    });

  } catch (error) {
    console.error("Error fetching genres:", error);
    document.querySelector('main').innerHTML = '<p>Gagal memuat genre.</p>';
  }
}

// Fungsi untuk load anime berdasarkan genre (dari SankaVollerei)
async function loadAnimeByGenreSanka(genreId) {
  const data = await fetchSankaData(`https://www.sankavollerei.com/anime/genres/${genreId}`);
  document.querySelector('main').innerHTML = `<h2 class="section-title">Anime Genre ${data[0]?.genres?.find(g => g.id === genreId)?.name || '...'}</h2><div id="animeGrid" class="anime-grid"></div>`;
  renderSankaAnimeList(data, '');
}

// Fungsi load movie (dari SankaVollerei)
async function loadMovies() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  const data = await fetchSankaData('https://www.sankavollerei.com/anime/movie');
  renderSankaAnimeList(data, 'Anime Movie');
}

// Fungsi load jadwal (dari SankaVollerei)
async function loadSchedule() {
  try {
    const schedule = await fetchSankaData('https://www.sankavollerei.com/anime/schedule');

    const main = document.querySelector('main');
    main.innerHTML = '<h2 class="section-title">Jadwal Rilis Anime</h2><div id="scheduleList"></div>';

    const scheduleDiv = document.getElementById('scheduleList');

    // Struktur schedule bisa bervariasi, contoh: [{ day: "monday", anime: [...] }, ...]
    // Sesuaikan dengan struktur data sebenarnya
    schedule.forEach(day => {
      const dayTitle = document.createElement('h3');
      dayTitle.textContent = day.day.charAt(0).toUpperCase() + day.day.slice(1); // Format judul hari
      scheduleDiv.appendChild(dayTitle);

      const dayGrid = document.createElement('div');
      dayGrid.className = 'anime-grid';

      day.anime.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
          <img src="${anime.image}" alt="${anime.title}">
          <div class="title">${anime.title}</div>
          <!-- Tambahkan info lain jika tersedia -->
        `;
        card.onclick = () => showAnimeDetailsFromTitle(anime.title);
        dayGrid.appendChild(card);
      });

      scheduleDiv.appendChild(dayGrid);
    });

  } catch (error) {
    console.error("Error fetching schedule:", error);
    document.querySelector('main').innerHTML = '<p>Gagal memuat jadwal.</p>';
  }
}
