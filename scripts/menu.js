const variables = {
    protocol: "https",
    domain: "vps-3858808-x.dattaweb.com",
    port: 8443,
    api: "wines"
};

const url = `${variables.protocol}://${variables.domain}:${variables.port}/${variables.api}`;
const wineList = "getAll";


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
  
        const precioFormateado = vino.price.toLocaleString('es-AR');
    
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

    
    for (const categoria in categoriaActual) {
        const seccion = document.getElementById(categoria);
        seccion.innerHTML = categoriaActual[categoria];

       
        setTimeout(() => { 
            const botones = seccion.querySelectorAll("[id^='btnComprar-']");
            if (botones.length === 0) {
                console.error(`No se encontraron botones en la categoría ${categoria}`);
            } else {
                console.log(`Botones encontrados: ${botones.length} en la categoría ${categoria}`);
            }

            botones.forEach(button => {
                button.addEventListener('click', () => {
                    const vinoId = button.value; 
                    const vino = vinos.find(v => v.id == vinoId); 
                    const vinoObj = {
                        id: vino.id,
                        name: vino.name,
                        price: vino.price,
                        type: vino.type,
                        year: vino.year
                    };
                    crearCarrito(vinoObj);
                    console.log(`Vino agregado al carrito: ${vino.name}`);
                });
            });
        }, 100); 
    }
}

let carrito = [];
function agregarAlCarrito(id) {
    carrito.push(id);
    console.log(carrito);
}




async function obtenerVinoPorId(id) {
    const getAWine = (id) => `getWine?id=${id}`;
    let vinoEncontrado = null;

    try {
      
        const response = await fetch(`${url}/${getAWine(id)}`);
        if (response.ok) {
            vinoEncontrado = await response.json();
        } else {
            console.error("Error en la respuesta del servidor:", response.status);
        }
    } catch (error) {
        console.error("Ocurrió el siguiente error: ", error);
    }

   
    return vinoEncontrado || null; 
}

function crearCarrito(vinoObj){
    carrito=JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(vinoObj);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito(carrito);
}

function eliminarDelCarrito(id) {
  
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    
    carrito = carrito.filter(vino => vino.id.toString() !== id);
  
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
   
    mostrarCarrito(carrito); 
}

function mostrarCarrito(carro = null) {
    let dentroCarrito = document.getElementById("carrito");

    
    if (!carro) {
        carro = JSON.parse(localStorage.getItem('carrito')) || [];
    }

    let contenido = "<ul class='list-group list-group-flush'>";
    let precioTotal = 0;

    carro.forEach(vino => {
        
        precioTotal += parseFloat(vino.price);        
        contenido +=
        `<li class="list-group-item">${vino.name}. ${vino.type} del ${vino.year} - <b>$${vino.price}</b>
        <button type="button" class="btn-close" aria-label="Close" value="${vino.id}"></button>
        </li>`;
    });
    const precioTotalFormateado = precioTotal.toLocaleString('es-AR');
    contenido += `<li class="list-group-item finalLista">Precio Total: $${precioTotalFormateado}</li></ul>`;
    dentroCarrito.innerHTML = contenido;

   
    dentroCarrito.querySelectorAll('.btn-close').forEach(button => {
        button.addEventListener('click', () => {
            console.log(`Intentando eliminar el vino con ID: ${button.value}`); 
            eliminarDelCarrito(button.value);
        });
    });
}