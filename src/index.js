import "./styles.css";

/* 
    Declaración de constantes
*/
const baseUrl = "https://api.mercadolibre.com/";
const searchButton = document.getElementById("searchButton");
const downloadButton = document.getElementById("download");
const inputSeller = document.getElementById("seller");
const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");
let log = [];
/*
    Función que recibe el id del vendedor para realiza el llamado al
    primer endpoint de la api y parsear la data para poder mostrar
    solamente los parametros pedidos.
    Dentro del map se llama a la función getCategory para obtener el nombre 
    de la categoría llamando al segundo endpoint.
*/
const getItemsFromSeller = async (id) =>
  await fetch(`${baseUrl}/sites/MLA/search?seller_id=${id}`)
    .then((res) => res.json())
    .then((data) =>
      Promise.all(
        data.results.map(async ({ id, title, category_id }) => {
          return {
            id,
            title,
            category_id,
            name: await getCategory(category_id),
          };
        })
      )
    )
    .catch((error) => console.error(error));

/* 
    Función que realiza el llamado al segundo endpoint por id de categoría y retorna
    la información de la misma.
 */
const getCategory = async (categoryId) =>
  await fetch(`${baseUrl}/categories/${categoryId}`)
    .then((res) => res.json())
    .then((data) => data.name)
    .catch((error) => console.error(error));

/* 
 Evento listener del boton "buscar" que espera ser clickeado para 
 realizar la llamada a la api y luego cargar los datos en la tabla
*/
searchButton.addEventListener("click", async () => {
  const sellerId = inputSeller.value ?? null;
  const items = await getItemsFromSeller(sellerId);

  const th = `<tr>
    <td>id</td>
    <td>Titulo</td>
    <td>Id de Categoria</td>
    <td>Nombre</td>
  </tr>`;
  const td = items
    .map(({ id, title, category_id, name }) => {
      return `<tr>
          <td>${id}</td>
          <td>${title}</td>
          <td>${category_id}</td>
          <td>${name}</td>
        </tr>`;
    })
    .join("");

  tableHead.innerHTML = th;
  tableBody.innerHTML = td;

  if (items.length > 0) {
    downloadButton.disabled = false;
  }
  log = items;
});

downloadButton.addEventListener("click", () => {
  downloadLog(
    "output-log.txt",
    log.map((item) => JSON.stringify(item))
  );
});

/* función para deshabilitar el boton de busqueda si no contiene valor*/
inputSeller.oninput = () => {
  inputSeller.value
    ? (searchButton.disabled = false)
    : (searchButton.disabled = true);
};

const downloadLog = (filename, text) => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};
