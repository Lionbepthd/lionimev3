const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');

// --- Fungsi untuk mengambil ID Otakudesu dari Jikan ---
// Kita perlu mapping dari MAL ID ke Otakudesu ID
// Misalnya: https://api.jikan.moe/v4/anime/5/external
// Tapi Otakudesu mungkin tidak selalu muncul di situ.
// Cara paling aman: Gunakan pencarian Otakudesu berdasarkan judul.
// Kita asumsikan kamu bisa dapat ID Otakudesu dari judul (cara manual atau mapping).

// Ambil judul dari Jikan untuk pencarian Otakudesu
let otakuId = null; // Inisialisasi ID Otakudesu

async function getOtakuIdFromTitle(title) {
  try {
    const response = await fetch(`https://wajik-anime-api.vercel.app/otakudesu/search?q=${encodeURIComponent(title)}`);
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      // Ambil ID dari item pertama (harus disesuaikan jika tidak akurat)
      // Kita ambil href dan ekstrak ID dari sana
      const href = data.data[0].href; // Misal: /anime/one-piece
      if (href) {
         otakuId = href.split('/').pop(); // Ambil bagian terakhir dari URL
         console.log("ID Otakudesu ditemukan:", otakuId);
         return otakuId;
      }
    }
  } catch (error) {
    console.error("Gagal mencari ID Otakudesu:", error);
  }
  return null;
}

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

// --- Fungsi utama load detail ---
async function loadAnimeDetails(id) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
    const data = await response.json();
    const anime = data.data;

    // Ambil ID Otakudesu berdasarkan judul
    const otakuId = await getOtakuIdFromTitle(anime.title);

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

    // Muat link streaming Otakudesu (jika ID ditemukan)
    if (otakuId) {
        loadOtakudesuStreamingLinks(otakuId);
    } else {
        document.getElementById('otakudesuStreamingList').innerHTML = '<p>ID Otakudesu tidak ditemukan atau gagal diambil.</p>';
    }

  } catch (error) {
    console.error("Error fetching details:", error);
    document.getElementById('animeDetail').innerHTML = '<p>Gagal memuat detail anime.</p>';
    document.getElementById('streamingList').innerHTML = '<p>Gagal memuat link streaming.</p>';
    document.getElementById('otakudesuStreamingList').innerHTML = '<p>Gagal memuat link streaming Otakudesu.</p>';
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

// --- Fungsi ambil link streaming dari Otakudesu ---
async function loadOtakudesuStreamingLinks(otakuId) {
  try {
    // Ambil detail anime dari Otakudesu untuk dapatkan list episode
    const response = await fetch(`https://wajik-anime-api.vercel.app/otakudesu/anime/${otakuId}`);
    const data = await response.json();

    if (!data.data || !data.data.episodes || data.data.episodes.length === 0) {
      document.getElementById('otakudesuStreamingList').innerHTML = '<p>Tidak ada episode ditemukan di Otakudesu.</p>';
      return;
    }

    const episodeList = data.data.episodes;
    const streamList = document.getElementById('otakudesuStreamingList');
    streamList.innerHTML = '';

    // Ambil ID episode pertama sebagai contoh
    // Untuk menampilkan semua episode, kamu perlu buat daftar link
    // Misalnya: episodeList.map(ep => ... lalu buat link ke halaman nonton)
    // Kita buat contoh untuk episode pertama dulu
    const firstEpisode = episodeList[0];
    if (firstEpisode && firstEpisode.href) {
      const episodeId = firstEpisode.href.split('/').pop(); // Ekstrak ID episode
      const watchLink = document.createElement('a');
      watchLink.href = `watch.html?episodeId=${episodeId}`; // Arahkan ke halaman watch baru
      watchLink.textContent = `Episode ${firstEpisode.title || '1'} (Lihat di halaman baru)`;
      watchLink.style.display = 'block';
      watchLink.style.margin = '0.5rem 0';
      watchLink.style.color = '#ff6b6b';
      watchLink.style.textDecoration = 'none';
      streamList.appendChild(watchLink);
    }

    // Jika kamu ingin tampilkan semua episode, gunakan loop:
    // episodeList.forEach(ep => {
    //   const epId = ep.href.split('/').pop();
    //   const link = document.createElement('a');
    //   link.href = `watch.html?episodeId=${epId}`;
    //   link.textContent = `Episode ${ep.title}`;
    //   link.style.display = 'block';
    //   link.style.margin = '0.2rem 0';
    //   link.style.color = '#ff6b6b';
    //   link.style.textDecoration = 'none';
    //   streamList.appendChild(link);
    // });

  } catch (error) {
    console.error("Error fetching Otakudesu streaming links:", error);
    document.getElementById('otakudesuStreamingList').innerHTML = '<p>Gagal memuat link streaming Otakudesu.</p>';
  }
}

// Panggil fungsi utama saat halaman dimuat
if (animeId) {
  loadAnimeDetails(animeId);
} else {
  document.getElementById('animeDetail').innerHTML = '<p>ID anime tidak ditemukan.</p>';
  document.getElementById('streamingList').style.display = 'none';
  document.getElementById('otakudesuStreamingList').style.display = 'none';
}
