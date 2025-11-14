const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');

// --- Fungsi untuk menampilkan tab ---
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`.tab[onclick*="${tabName}"]`).classList.add('active');
}

// --- Fungsi untuk mendapatkan slug SankaVollerei dari judul ---
async function getSankaSlugFromTitle(title) {
  try {
    const response = await fetch(`https://www.sankavollerei.com/anime/search/${encodeURIComponent(title)}`);
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].slug; // Misal: "one-piece"
    }
  } catch (error) {
    console.error("Gagal mencari slug SankaVollerei:", error);
  }
  return null;
}

// --- Fungsi untuk memuat link streaming dari SankaVollerei ---
async function loadSankaStreamingLinks(slug) {
  try {
    const response = await fetch(`https://www.sankavollerei.com/anime/anime/${slug}`);
    const data = await response.json();

    if (!data.data || !data.data.episodes || data.data.episodes.length === 0) {
      document.getElementById('sankaStreamingList').innerHTML = '<p>Tidak ada episode ditemukan di SankaVollerei.</p>';
      return;
    }

    const episodeList = data.data.episodes;
    const streamList = document.getElementById('sankaStreamingList');
    streamList.innerHTML = '';

    episodeList.forEach(ep => {
      const epSlug = ep.slug; // Misal: "one-piece-episode-1149"
      const link = document.createElement('a');
      link.href = `watch.html?episodeSlug=${epSlug}`;
      link.textContent = `Episode ${ep.title}`;
      link.target = '_blank';
      link.style.display = 'block';
      link.style.margin = '0.5rem 0';
      link.style.color = '#ff6b6b';
      link.style.textDecoration = 'none';
      streamList.appendChild(link);
    });

  } catch (error) {
    console.error("Error fetching SankaVollerei streaming links:", error);
    document.getElementById('sankaStreamingList').innerHTML = '<p>Gagal memuat link streaming SankaVollerei.</p>';
  }
}

// --- Fungsi ambil link streaming dari Jikan ---
async function loadStreamingLinks(id) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/streaming`);
    const data = await response.json();

    const streamList = document.getElementById('streamingList');
    streamList.innerHTML = '';

    if (data.data.length === 0) {
      streamList.innerHTML = '<p>Tidak ada link streaming tersedia.</p>';
      return;
    }

    data.data.forEach(item => {
      const link = document.createElement('a');
      link.href = item.url;
      link.textContent = `Tonton di ${item.site}`;
      link.target = '_blank';
      link.style.display = 'block';
      link.style.margin = '0.5rem 0';
      link.style.color = '#ff6b6b';
      link.style.textDecoration = 'none';
      streamList.appendChild(link);
    });
  } catch (error) {
    console.error("Error fetching Jikan streaming links:", error);
    document.getElementById('streamingList').innerHTML = '<p>Gagal memuat link streaming.</p>';
  }
}

// --- Fungsi utama load detail ---
async function loadAnimeDetails(id) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
    const data = await response.json();
    const anime = data.data;

    // Ambil slug SankaVollerei berdasarkan judul
    const sankaSlug = await getSankaSlugFromTitle(anime.title);

    const genres = anime.genres ? anime.genres.map(g => g.name).join(', ') : 'Unknown';
    const detailHTML = `
      <h1>${anime.title}</h1>
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}" style="max-width: 300px; border-radius: 8px;">
      <p><strong>Rating:</strong> ${anime.score}</p>
      <p><strong>Genres:</strong> ${genres}</p>
      <p><strong>Status:</strong> ${anime.status}</p>
      <p><strong>Episode:</strong> ${anime.episodes || 'TBA'}</p>
      <p>${anime.synopsis}</p>
    `;
    document.getElementById('animeDetail').innerHTML = detailHTML;

    // Muat link streaming Jikan
    loadStreamingLinks(id);

    // Muat link streaming SankaVollerei (jika slug ditemukan)
    if (sankaSlug) {
        loadSankaStreamingLinks(sankaSlug);
    } else {
        document.getElementById('sankaStreamingList').innerHTML = '<p>Slug SankaVollerei tidak ditemukan atau gagal diambil.</p>';
    }

  } catch (error) {
    console.error("Error fetching details:", error);
    document.getElementById('animeDetail').innerHTML = '<p>Gagal memuat detail anime.</p>';
    document.getElementById('streamingList').innerHTML = '<p>Gagal memuat link streaming.</p>';
    document.getElementById('sankaStreamingList').innerHTML = '<p>Gagal memuat link streaming SankaVollerei.</p>';
  }
}

// Panggil fungsi utama saat halaman dimuat
if (animeId) {
  loadAnimeDetails(animeId);
} else {
  document.getElementById('animeDetail').innerHTML = '<p>ID anime tidak ditemukan.</p>';
  document.getElementById('streamingList').style.display = 'none';
  document.getElementById('sankaStreamingList').style.display = 'none';
}
