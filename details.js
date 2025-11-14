const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');

if (!animeId) {
  document.getElementById('animeDetail').innerHTML = '<p>ID anime tidak ditemukan.</p>';
  document.getElementById('streamingLinks').style.display = 'none';
} else {
  loadAnimeDetails(animeId);
  loadStreamingLinks(animeId);
}

// Fungsi ambil detail anime
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
  } catch (error) {
    console.error("Error fetching details:", error);
    document.getElementById('animeDetail').innerHTML = '<p>Gagal memuat detail anime.</p>';
  }
}

// Fungsi ambil link streaming
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
    console.error("Error fetching streaming links:", error);
    document.getElementById('streamingList').innerHTML = '<p>Gagal memuat link streaming.</p>';
  }
}