const variables = {
    protocol: "https",
    domain: "vps-3858808-x.dattaweb.com",
    port: 8443,
    api: "wines"
};

const url = `${variables.protocol}://${variables.domain}:${variables.port}/${variables.api}`;
const wineList = "getAll";

// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    fetch(`${url}/${wineList}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
            }
            return response.json();
        })
        .then(data => {
            const vinos = data;
            crearCategorias(vinos);
            exhibirVinos(vinos);
        })
        .catch(error => console.error("Ocurrió el siguiente error: ", error));

    // Mostrar el carrito al cargar la página
    mostrarCarrito();
});



function crearCategorias(vinos) {
    const menu = document.getElementById("menu");
    let categorias = '';
    let guardaCategorias = [];

    vinos.forEach(vino => {
        if (!guardaCategorias.some((catego) => catego === vino.category)) {
            guardaCategorias.push(vino.category);
            categorias += `
                <h2 class="categorias">${vino.category}</h2>   
                <section id="${vino.category}" class="secciones">   
                </section>`;
        }
    });

    menu.innerHTML = categorias;
}

async function exhibirVinos(vinos) {
    let categoriaActual = [];
    for (const vino of vinos) {
        if (!categoriaActual[vino.category]) {
            categoriaActual[vino.category] = "";
        }
        // Obtener el vino completo
        const vinoCompleto = await obtenerVinoPorId(vino.id);
        // Formatear el precio con separadores de miles
        const precioFormateado = vinoCompleto.price.toLocaleString('es-AR');
        // Agregar el HTML del vino, incluyendo la imagen y la descripción
        if (vinoCompleto) {
            categoriaActual[vino.category] += `
                <div class="container">
                    <div class="row">
                        <article class="card centrada">
                            <img src="data:image/jpeg;base64,${vinoCompleto.photo}" class="card-img-top" alt="Ilustracion de ${vinoCompleto.name}" style="width:120px; height:176px;">
                            <div class="card-body">
                                <h5 class="card-title">${vinoCompleto.name}</h5>
                                <p class="card-text">${vinoCompleto.type}. ${vinoCompleto.year} <br>
                            <b>    $${precioFormateado} </b> </p>
                                <button type="button" class="btn btn-primary" id="btn-${vinoCompleto.id}" value="${vinoCompleto.id}">Agregar al Carrito</button>
                            </div>
                        </article>
                    </div> 
                </div>`;
        }
    }


    for (const categoria in categoriaActual) {
        const seccion = document.getElementById(categoria);
        seccion.innerHTML = categoriaActual[categoria];

        // Agregar event listener a los botones
        seccion.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const vino = vinos.find(p => p.id == button.value);
                const vinoObj = {
                    id: vino.id,
                    nombre: vino.name,
                    precio: vino.price
                };

                // Almacenar el objeto en localStorage
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                carrito.push(vinoObj);
                localStorage.setItem('carrito', JSON.stringify(carrito));

                // Mostrar el carrito actualizado
                mostrarCarrito();
            });
        });
    }
}


let carrito = [];
function agregarAlCarrito(id) {
    carrito.push(id);
    console.log(carrito);
}



// Función para obtener el vino por ID usando fetch
async function obtenerVinoPorId(id) {
    const getAWine = (id) => `getWine?id=${id}`;
    let vinoEncontrado = null;

    try {
        // Realizar la solicitud para obtener el vino
        const response = await fetch(`${url}/${getAWine(id)}`);
        if (response.ok) {
            vinoEncontrado = await response.json();
        } else {
            console.error("Error en la respuesta del servidor:", response.status);
        }
    } catch (error) {
        console.error("Ocurrió el siguiente error: ", error);
    }

    // Si el vino es encontrado, devolver el objeto completo
    return vinoEncontrado || null; // Devuelve el vino o null si no se encuentra
}


function mostrarCarrito() {
    const carritoDiv = document.getElementById("carrito");

    // Obtener el carrito desde localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Crear el contenido HTML para mostrar el carrito
    let contenido = "<ul class='list-group list-group-flush'>";
    let precioTotal = 0;
    carrito.forEach(vino => {
        precioTotal += parseFloat(vino.price);

        contenido += `
            <li class="list-group-item">
                ${vino.name} - $${vino.price}
                <button type="button" class="btn-close" aria-label="Close" value="${vino.id}"></button>
            </li>
        `;
    });
    contenido += `<li class="list-group-item">Precio Total de Compra: $${precioTotal}</li></ul>`;

    // Insertar el contenido en el elemento con id "carrito"
    carritoDiv.innerHTML = contenido;

    // Añadir event listener a los botones "Eliminar"
    carritoDiv.querySelectorAll('.btn-close').forEach(button => {
        button.addEventListener('click', () => {
            eliminarDelCarrito(button.value); // Llamar a la función de eliminar
        });
    });
}

function eliminarDelCarrito(id) {
    // Obtener el carrito desde localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];


    carrito = carrito.filter(vino => vino.id !== id);

    // Guardar el carrito actualizado en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Volver a mostrar el carrito actualizado
    mostrarCarrito();
}