let imgBaseUrl = "";
const apiUrl = "https://www.artic.edu/iiif/2/";
const imgSize = "/full/200,/0/default.jpg";

fetch("https://api.artic.edu/api/v1/artworks?fields=id,title,image_id,department_title,place_of_origin,dimensions,thumbnail")
    .then(res => res.json())
    .then(data => {
        const contenedor = document.getElementById("pokemon-container");
        contenedor.innerHTML = "";
        data.data.forEach(artWork =>{
            const imgUrl = apiUrl + artWork.image_id + imgSize;
            contenedor.innerHTML += `
                    <div class="pokemon-card">
                        <img src="${imgUrl}" alt="cuadro">
                        <p class="pokemon-name">${artWork.title}</p>
                        <p class="pokemon-name">${artWork.department_title}</p>
                        <p class="pokemon-name">${artWork.place_of_origin}</p>
                        <p class="pokemon-name">${artWork.dimensions}</p>
                    </div>
                    `;
        })
    })
    .catch(error => {
        document.getElementById("pokemon-container").innerHTML = "Error al cargar las pinturas";
        console.log(error)
    })