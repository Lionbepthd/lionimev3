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
    if(data && data.status === 'success' && data.data) {
        return data.data;
    } else {
        throw new Error("Data tidak valid dari SankaVollerei");
    }
  } catch (error) {
    console.error("Error fetching from SankaVollerei: ", error);
    return null;
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
    // Gunakan nilai default jika field tidak ada
    const title = anime.title || 'Untitled';
    const image = anime.poster || 'https://via.placeholder.com/150'; // Gambar placeholder

    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
      <img src="${image}" alt="${title}">
      <div class="title">${title}</div>
      <!-- Genre tidak tersedia di data ini, jadi kita hilangkan -->
    `;
    card.onclick = () => showAnimeDetailsFromTitle(title); // Fungsi baru
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
  if(data && data.results) {
      renderSankaAnimeList(data.results, 'Hasil Pencarian');
  } else {
      document.querySelector('main').innerHTML += '<p style="color: red;">Gagal mencari anime. Silakan coba lagi.</p>';
  }
}

// Fungsi load anime home (dari SankaVollerei - Ongoing)
async function loadAnimeListHome() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;

  try {
    // Ambil data ongoing
    const ongoingData = await fetchSankaData('https://www.sankavollerei.com/anime/ongoing-anime');
    if(!ongoingData || !ongoingData.ongoing_anime) {
        throw new Error("Data ongoing tidak valid");
    }

    const ongoingList = ongoingData.ongoing_anime;

    // Untuk demo, kita duplikasi data ongoing untuk newAdded dan populer
    // Atau jika kamu ingin data yang berbeda, cari endpoint khusus untuk newAdded dan populer.
    const latestList = ongoingList.slice(0, 5); // Ambil 5 pertama
    const popularList = ongoingList.slice(5, 10); // Ambil 5 berikutnya

    renderSankaAnimeList(ongoingList, 'Sedang Tayang');
    renderSankaAnimeList(latestList, 'Baru Ditambahkan');
    renderSankaAnimeList(popularList, 'Populer');

  } catch (error) {
    console.error("Error loading home ", error);
    document.querySelector('main').innerHTML += '<p style="color: red;">Gagal memuat data dari server. Silakan coba lagi nanti.</p>';
  }
}

// Fungsi load semua anime (dari SankaVollerei - Perlu endpoint spesifik)
// SankaVollerei sepertinya tidak punya endpoint untuk semua anime sekaligus
// Kita bisa gunakan pencarian kosong atau paging
async function loadAnimeListAll() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  // Kita gunakan pencarian kosong untuk mendapatkan "semua" (mungkin perlu paging)
  const data = await fetchSankaData('https://www.sankavollerei.com/anime/search/'); // Cari kosong
  if(data && data.results) {
      renderSankaAnimeList(data.results, 'Semua Anime');
  } else {
      document.querySelector('main').innerHTML += '<p style="color: red;">Gagal memuat daftar anime. Silakan coba lagi.</p>';
  }
}

// Fungsi load genre (dari SankaVollerei - Perlu endpoint spesifik)
// SankaVollerei sepertinya tidak punya endpoint genre
// Kita gunakan pencarian untuk genre umum
async function loadGenres() {
  const genres = [
    { name: "Action", slug: "action" },
    { name: "Comedy", slug: "comedy" },
    { name: "Fantasy", slug: "fantasy" },
    { name: "Romance", slug: "romance" },
    { name: "Sci-Fi", slug: "sci-fi" },
    { name: "Slice of Life", slug: "slice-of-life" },
    { name: "Sports", slug: "sports" },
    { name: "Supernatural", slug: "supernatural" },
    { name: "Mecha", slug: "mecha" },
    { name: "Horror", slug: "horror" }
  ];

  const main = document.querySelector('main');
  main.innerHTML = '<h2 class="section-title">Pilih Genre</h2><div id="genreList"></div>';

  const genreGrid = document.getElementById('genreList');
  genreGrid.innerHTML = '';

  genres.forEach(genre => {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `<div class="title">${genre.name}</div>`;
    card.onclick = () => searchAnimeByGenre(genre.slug);
    genreGrid.appendChild(card);
  });
}

// Fungsi bantu untuk pencarian genre
function searchAnimeByGenre(genreSlug) {
    document.getElementById('searchInput').value = genreSlug;
    searchAnime();
}

// Fungsi load movie (dari SankaVollerei - Perlu endpoint spesifik)
// SankaVollerei sepertinya tidak punya endpoint movie
// Kita gunakan pencarian untuk "movie"
async function loadMovies() {
  document.querySelector('main').innerHTML = `<div class="search-box">
      <input type="text" id="searchInput" placeholder="Cari judul anime...">
      <button onclick="searchAnime()">Cari</button>
    </div>`;
  const data = await fetchSankaData('https://www.sankavollerei.com/anime/search/movie');
  if(data && data.results) {
      renderSankaAnimeList(data.results, 'Anime Movie');
  } else {
      document.querySelector('main').innerHTML += '<p style="color: red;">Gagal memuat daftar movie. Silakan coba lagi.</p>';
  }
}

// Fungsi load jadwal (dari SankaVollerei)
async function loadSchedule() {
  try {
    const scheduleData = await fetchSankaData('https://www.sankavollerei.com/anime/schedule');
    if(!scheduleData || !scheduleData.schedule) {
        throw new Error("Data jadwal tidak valid");
    }

    const schedule = scheduleData.schedule;

    const main = document.querySelector('main');
    main.innerHTML = '<h2 class="section-title">Jadwal Rilis Anime</h2><div id="scheduleList"></div>';

    const scheduleDiv = document.getElementById('scheduleList');

    // Struktur schedule bisa bervariasi, contoh: { "monday": [...], "tuesday": [...] }
    for (const [day, animeList] of Object.entries(schedule)) {
      const dayTitle = document.createElement('h3');
      dayTitle.textContent = day.charAt(0).toUpperCase() + day.slice(1); // Format judul hari
      scheduleDiv.appendChild(dayTitle);

      const dayGrid = document.createElement('div');
      dayGrid.className = 'anime-grid';

      if(animeList && animeList.length > 0) {
          animeList.forEach(anime => {
              const card = document.createElement('div');
              card.className = 'anime-card';
              card.innerHTML = `
                <img src="${anime.poster || 'https://via.placeholder.com/150'}" alt="${anime.title}">
                <div class="title">${anime.title}</div>
              `;
              card.onclick = () => showAnimeDetailsFromTitle(anime.title);
              dayGrid.appendChild(card);
          });
      } else {
          dayGrid.innerHTML = '<p>Tidak ada anime yang tayang hari ini.</p>';
      }

      scheduleDiv.appendChild(dayGrid);
    }

  } catch (error) {
    console.error("Error fetching schedule:", error);
    document.querySelector('main').innerHTML = '<p>Gagal memuat jadwal.</p>';
  }
}
