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
        const precioFormateado = vino.price.toLocaleString('es-AR');
        // Agregar el HTML del vino, incluyendo la imagen y la descripción
        if (precioFormateado) {
            categoriaActual[vino.category] += `
                <div class="container">
                    <div class="row">
                        <article class="card centrada">
                            <img src="data:image/jpeg;base64,${vino.photo}" class="card-img-top" alt="Ilustracion de ${vino.name}" style="width:120px; height:176px;">
                            <div class="card-body">
                                <h5 class="card-title">${vino.name}</h5>
                                <p class="card-text">${vino.type}. ${vino.year} <br>
                            <b>    $${precioFormateado} </b> </p>
                                <button type="button" class="button button-blue" id="btnComprar-${vino.id}" value="${vino.id}">Comprar</button>
                            </div>
                        </article>
                    </div> 
                </div>`;
        }
    }

    // Agregar el contenido HTML de cada categoría en su sección correspondiente
    for (const categoria in categoriaActual) {
        const seccion = document.getElementById(categoria);
        seccion.innerHTML = categoriaActual[categoria];

        // Agregar event listener a los botones de compra
        setTimeout(() => { // Añadimos un pequeño retraso para asegurarnos de que el HTML ha sido renderizado
            const botones = seccion.querySelectorAll("[id^='btnComprar-']");
            if (botones.length === 0) {
                console.error(`No se encontraron botones en la categoría ${categoria}`);
            } else {
                console.log(`Botones encontrados: ${botones.length} en la categoría ${categoria}`);
            }

            botones.forEach(button => {
                button.addEventListener('click', () => {
                    const vinoId = button.value; // Obtener el id del vino
                    const vino = vinos.find(v => v.id == vinoId); // Buscar el vino correspondiente por id
                    const vinoObj = {
                        id: vino.id,
                        nombre: vino.name,
                        precio: vino.price
                    };
                    crearCarrito(vinoObj);
                    console.log(`Vino agregado al carrito: ${vino.name}`);
                });
            });
        }, 100); // Un retraso de 100ms para dar tiempo a que el DOM se actualice
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

function crearCarrito(vinoObj){
    carrito=JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(vinoObj);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito(carrito);
}

function eliminarDelCarrito(id) {
    // Obtener el carrito desde localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Filtrar el carrito
    carrito = carrito.filter(vino => vino.id.toString() !== id); // Asegurando la comparación de tipos
    
    // Guardar el carrito actualizado en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Volver a mostrar el carrito actualizado
    mostrarCarrito(carrito); // Pasa el carrito actualizado aquí
}

function mostrarCarrito(carro = null) {
    let dentroCarrito = document.getElementById("carrito");

    // Si no se pasa el carrito como argumento, lo obtenemos desde localStorage
    if (!carro) {
        carro = JSON.parse(localStorage.getItem('carrito')) || [];
    }

    let contenido = "<ul class='list-group list-group-flush'>";
    let precioTotal = 0;

    carro.forEach(vino => {
        precioTotal += parseFloat(vino.precio);        
        contenido +=
        `<li class="list-group-item">${vino.nombre} - $${vino.precio}
        <button type="button" class="btn-close" aria-label="Close" value="${vino.id}"></button>
        </li>`;
    });

    contenido += `<li class="list-group-item">Precio Total de Compra: $${precioTotal}</li></ul>`;
    dentroCarrito.innerHTML = contenido;

    // Agregar event listener a los botones de eliminar del carrito
    dentroCarrito.querySelectorAll('.btn-close').forEach(button => {
        button.addEventListener('click', () => {
            console.log(`Intentando eliminar el vino con ID: ${button.value}`); // Para verificar el ID
            eliminarDelCarrito(button.value);
        });
    });
}