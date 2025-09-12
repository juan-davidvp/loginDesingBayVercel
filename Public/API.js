// Variable global para almacenar la URL de la siguiente página de resultados.
let nextUrl = '';
const imageBaseUrl = "https://www.artic.edu/iiif/2/";
const imageParams = "/full/200,/0/default.jpg";


function fetchArtworks(url) {
    const container = document.getElementById("artwork-container");
    const loadMoreButton = document.getElementById("load-more");

    // Muestra un indicador de carga mientras se obtienen los datos
    loadMoreButton.textContent = 'Cargando...';
    loadMoreButton.disabled = true;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            // Guarda la URL de la siguiente página
            nextUrl = data.pagination.next_url;

            // Renderiza cada obra de arte y la añade al contenedor
            data.data.forEach(artwork => {
                if (artwork.image_id && artwork.title) { // Solo muestra obras que tienen una imagen
                    const imageUrl = imageBaseUrl + artwork.image_id + imageParams;
                    const artworkData = {
                        id: artwork.id,
                        title: artwork.title,
                        imageUrl: imageUrl,
                        department: artwork.department_title || 'N/A',
                        origin: artwork.place_of_origin || 'Unknown',
                        dimensions: artwork.dimensions || 'Dimensions not available'
                    };
                    
                    const artworkCard = `
                        <div class="artwork-card">
                            <img src="${imageUrl}" alt="${artwork.title || 'Artwork image'}" loading="lazy">
                            <div class="artwork-info">
                                <p class="artwork-title">${artwork.title}</p>
                                <p class="artwork-detail">${artwork.department_title || 'N/A'}</p>
                                <p class="artwork-detail"><em>${artwork.place_of_origin || 'Unknown'}</em></p>
                                <p class="artwork-detail">${artwork.dimensions || 'Dimensions not available'}</p>
                                <button class="add-to-cart-btn" onclick='addToCart(${JSON.stringify(artworkData)})'>Añadir al carrito</button>
                            </div>
                        </div>
                    `;
                    // Usamos insertAdjacentHTML para añadir las nuevas tarjetas sin borrar las existentes
                    container.insertAdjacentHTML('beforeend', artworkCard);
                }
            });

            // Gestiona la visibilidad y estado del botón "Cargar Más"
            if (nextUrl) {
                loadMoreButton.style.display = 'block';
                loadMoreButton.textContent = 'Ver Más Obras';
                loadMoreButton.disabled = false;
            } else {
                loadMoreButton.style.display = 'none'; // Oculta el botón si no hay más páginas
            }
        })
        .catch(error => {
            container.innerHTML += "<p class='error-message'>Error al cargar las obras de arte. Por favor, intente de nuevo más tarde.</p>";
            console.error(error);
            loadMoreButton.style.display = 'none'; // Oculta el botón en caso de error
        });
}

// Event listener que se dispara cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // URL inicial de la API para la primera carga de obras
    const initialUrl = "https://api.artic.edu/api/v1/artworks?fields=id,title,image_id,department_title,place_of_origin,dimensions,thumbnail";
    fetchArtworks(initialUrl);

    // Añade el event listener al botón para cargar más obras
    const loadMoreButton = document.getElementById("load-more");
    if(loadMoreButton) {
        loadMoreButton.addEventListener('click', () => {
            if (nextUrl) {
                fetchArtworks(nextUrl);
            }
        });
    }
});
