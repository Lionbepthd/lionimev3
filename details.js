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

// --- Fungsi ambil link streaming dari Consumet API ---
async function loadConsumetStreamingLinks(animeTitle) {
  try {
    // Gunakan judul dari Jikan untuk mencari di Consumet
    const encodedTitle = encodeURIComponent(animeTitle);
    const response = await fetch(`https://api.consumet.org/anime/gogoanime/${encodedTitle}`);
    const data = await response.json();

    const streamList = document.getElementById('consumetStreamingList');
    streamList.innerHTML = '';

    if (!data.results || data.results.length === 0) {
      streamList.innerHTML = '<p>Tidak ada link streaming ditemukan di Consumet.</p>';
      return;
    }

    // Ambil episode pertama sebagai contoh
    const firstResult = data.results[0]; // Ambil hasil pertama dari pencarian
    if (firstResult && firstResult.id) {
      // Ambil ID episode untuk mendapatkan link video
      const episodeResponse = await fetch(`https://api.consumet.org/anime/gogoanime/episode?id=${firstResult.id}`);
      const episodeData = await episodeResponse.json();

      if (episodeData.sources && episodeData.sources.length > 0) {
        // Ambil link video pertama
        const videoLink = episodeData.sources[0].url;

        // Tampilkan video player langsung (ini bisa berisiko legalitas!)
        streamList.innerHTML = `<video controls><source src="${videoLink}" type="video/mp4">Browser kamu tidak mendukung video.</video>`;

        // ATAU, tampilkan link ke halaman watch.html dengan ID episode Consumet
        // const watchLink = document.createElement('a');
        // watchLink.href = `watch.html?episodeId=${firstResult.id}&source=gogoanime`;
        // watchLink.textContent = `Episode ${firstResult.episodeNumber || '1'} (via Consumet)`;
        // watchLink.target = '_blank'; // Lebih aman
        // watchLink.style.display = 'block';
        // watchLink.style.margin = '0.5rem 0';
        // watchLink.style.color = '#ff6b6b';
        // watchLink.style.textDecoration = 'none';
        // streamList.appendChild(watchLink);
      } else {
          streamList.innerHTML = '<p>Tidak ditemukan sumber video untuk episode ini.</p>';
      }
    } else {
      streamList.innerHTML = '<p>Tidak ditemukan episode untuk anime ini di Consumet.</p>';
    }

  } catch (error) {
    console.error("Error fetching Consumet streaming links:", error);
    document.getElementById('consumetStreamingList').innerHTML = '<p>Gagal memuat link streaming dari Consumet.</p>';
  }
}


// --- Fungsi utama load detail ---
async function loadAnimeDetails(id) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
    const data = await response.json();
    const anime = data.data;

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

    // Muat link streaming Consumet (menggunakan judul)
    loadConsumetStreamingLinks(anime.title);

  } catch (error) {
    console.error("Error fetching details:", error);
    document.getElementById('animeDetail').innerHTML = '<p>Gagal memuat detail anime.</p>';
    document.getElementById('streamingList').innerHTML = '<p>Gagal memuat link streaming.</p>';
    document.getElementById('consumetStreamingList').innerHTML = '<p>Gagal memuat link streaming Consumet.</p>';
  }
}

// Panggil fungsi utama saat halaman dimuat
if (animeId) {
  loadAnimeDetails(animeId);
} else {
  document.getElementById('animeDetail').innerHTML = '<p>ID anime tidak ditemukan.</p>';
  document.getElementById('streamingList').style.display = 'none';
  document.getElementById('consumetStreamingList').style.display = 'none';
}
