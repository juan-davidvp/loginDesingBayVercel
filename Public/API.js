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

    // Realiza la solicitud a la API
    fetch(url)
        .then(res => res.json())
        .then(data => {
            // Guarda la URL de la siguiente página
            nextUrl = data.pagination.next_url;

            // Renderiza cada obra de arte y la añade al contenedor
            data.data.forEach(artwork => {
                if (artwork.image_id && artwork.title) { // Solo muestra obras que tienen una imagen
                    const imageUrl = imageBaseUrl + artwork.image_id + imageParams;
                    const title = artwork.title ?? "Sin título";
                    const category = artwork.department_title ?? "Sin categoría";
                    const price = Number(((Math.random() * 500) + 50).toFixed(2));
                    const artworkData = {
                        id: artwork.id,
                        title: title,
                        imageUrl: imageUrl,
                        department: artwork.department_title || 'N/A',
                        origin: artwork.place_of_origin || 'Unknown',
                        dimensions: artwork.dimensions || 'Dimensions not available',
                        price: price
                    };
                    
                    const artworkCard = `
                    <div class="product-card">
                    <img src="${imageUrl}" alt="${title}">
                    <div class="product-info">
                        <h3 class="product-title">${title}</h3>
                        <p class="product-category">${category}</p>
                        <p class="product-price">${price.toFixed(2)}</p>
                    </div>
                    <div class="product-actions">
                        <button class="btn add-cart" onclick='addToCart(${JSON.stringify(artworkData)})'>Añadir Carrito</button>
                        <button class="btn details">Detalles</button>
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
                // Oculta el botón si no hay más páginas
                loadMoreButton.style.display = 'none'; 
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
