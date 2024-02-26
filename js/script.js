const baseURL = 'http://api.valantis.store:40000/';
const password = 'Valantis';


// Аутентификация
function authenticate() {
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const authString = md5(`${password}_${timestamp}`);
  return authString;
}

// Запрос к API
async function fetchData(action, params) {
  const auth = authenticate();
  const response = await fetch(baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth': auth
    },
    body: JSON.stringify({ action, params })
  });
  return await response.json();
}

// Получения списка идентификаторов товаров
async function getProducts(offset, limit) {
  const response = await fetchData('get_ids', { offset, limit });
  return response.result;
}

// Получения деталей товаров по id
async function getProductDetails(ids) {
  const response = await fetchData('get_items', { ids });
  return response.result;
}

// Отображения товаров
async function displayProducts(offset, limit) {
  const productIds = await getProducts(offset, limit);
  const productDetails = await getProductDetails(productIds);
  const productsList = document.getElementById('getItemsResult');

   // Очищаем список товаров перед добавлением новых
  productsList.innerHTML = '';

   // Создаем элемент списка для каждого товара и добавляем его в список
  productDetails.forEach(product => {
    const productElement = document.createElement('li');
    productElement.classList.add('list__item');
    productElement.innerHTML = `
      <p>ID: ${product.id}</p>
      <p>Product: ${product.product}</p>
      <p>Price: ${product.price}</p>
      <p>Brand: ${product.brand ? product.brand : 'N/A'}</p>
    `;
    productsList.appendChild(productElement);
  });
}

 // Получаем значения фильтров
const applyFilterButton = document.getElementById('applyFilterButton');
applyFilterButton.addEventListener('click', () => {
  const priceFilterInput = document.getElementById('priceFilter');
  const productFilterInput = document.getElementById('productFilter');
  const brandFilterInput = document.getElementById('brandFilter');

  const filters = {
    price: parseFloat(priceFilterInput.value),
    product: productFilterInput.value.trim(),
    brand: brandFilterInput.value.trim()
  };

  applyFilters(filters);
});

// Применения фильтров
async function applyFilters(filters) {
  const response = await fetchData('filter', filters);
  const filteredProductIds = response.result;
  const productDetails = await getProductDetails(filteredProductIds);

  const productsList = document.getElementById('getItemsResult');
  productsList.innerHTML = '';

  productDetails.forEach(product => {
    const productElement = document.createElement('li');
    productElement.classList.add('list__item');
    productElement.innerHTML = `
      <p>ID: ${product.id}</p>
      <p>Product: ${product.product}</p>
      <p>Price: ${product.price}</p>
      <p>Brand: ${product.brand ? product.brand : 'N/A'}</p>
    `;
    productsList.appendChild(productElement);
  });
}

let currentPage = 1;
const productsPerPage = 10;

// Отображение товаров 
const getItemsButton = document.getElementById('getItemsButton');
getItemsButton.addEventListener('click', () => {
    displayProducts((currentPage - 1) * productsPerPage, productsPerPage);
});


// Пагинация
const pagination = document.getElementById('pagination');

function updatePage(page) {
  currentPage = page;
  displayProducts((currentPage - 1) * productsPerPage, productsPerPage);
}

function createPaginationButtons() {
  const totalProducts = 50; 
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.addEventListener('click', () => updatePage(i));
    pagination.appendChild(button);
  }
}

createPaginationButtons();
