const sectionsLis = document.querySelectorAll("main section");
const dropdownBtn = document.querySelector('.dropdown-btn');
const pageBtnList = document.querySelector('.page-btn-list');
const pageBtns = document.querySelectorAll('.page-btn-list button')
const closeListingBtn = document.querySelector('.close-listing')
const listingEl = document.querySelector("#listing");
const allListngsEl = document.querySelector('#all-listings')
const categoryBtns = document.querySelectorAll('#all-listings button')
const modalBackdropEl = document.querySelector(".modal-backdrop");
const addCartBtn = document.querySelector("#listing button");
const cartBtnQty = document.querySelector(".cart-btn span");
const bookForm = document.querySelector('#book-form');
const listingForm = document.querySelector('#submit-listing');
const listingDataEl = document.querySelector('.listing-data');
const cartItemsListEl = document.querySelector('#cart-items')
const cartTotalEl = document.querySelector('.cart-total')

const products = JSON.parse(localStorage.getItem('products')) || [];
const cartData = JSON.parse(localStorage.getItem('cart-data')) || [];


// TOGGLE DROPDOWN NAV BUTTONS AND CART BUTTON
document.addEventListener("click", (e) => {
    if (e.target.matches(".dropdown-btn")) pageBtnList.classList.toggle("hidden");
    else if (e.target.matches(".modal-backdrop")) modalBackdropEl.classList.remove("active");
    else if (e.target.matches(".cart-btn")) {
        modalBackdropEl.classList.toggle("active");

        renderCartData()
    }
});

// TOGGLE BETWEEN PAGES, SET WHITE COLOR FOR THE ACTIVE PAGE BUTTON
pageBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        if (e.target.matches('.all-listings')) {
            document.querySelector('#all-listings').textContent = ''
            location.reload()
        }

        pageBtns.forEach((b) => b.classList.remove("text-white"));
        btn.classList.add("text-white");

        sectionsLis.forEach((section) => (section.style.display = "none"));
        document.querySelector(`#${btn.dataset.page}`).style.display = "block";
        pageBtnList.classList.add("hidden");
    });
});

// TOGGLE BETWEEN CATEGORIES
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach((b) => b.classList.remove('text-cyan-700', 'underline'))
        btn.classList.add('text-cyan-700', 'underline')
        displaySingleCatListings(btn.dataset.category)
    })
})

// CLOSE LISTING PAGE USING CLOSE BUTTON ON THE LISTING PAGE
closeListingBtn.addEventListener("click", () => {
    listingEl.style.display = "none"
    document.querySelector('#all-listings').style.display = "block"
});

// INCREASE CART QTY AND ADD THE LISTING TO THE CART USING 'ADD TO CART' BUTTON
addCartBtn.addEventListener("click", () => {
    cartBtnQty.textContent = +cartBtnQty.textContent + 1;
    flashCartQty()

    const image = listingDataEl.children[0].src
    const title = listingDataEl.children[1].children[0].textContent
    const price = listingDataEl.children[1].children[1].children[1].textContent
    const totalPrice = listingDataEl.children[1].children[1].children[1].textContent
    const qty = 1
    const cartItem = { image, title, price, totalPrice, qty }

    const itemIndex = cartData.findIndex(el => el.title === cartItem.title)

    // Check if item already exists in the cart before adding
    if (itemIndex !== -1) {
        cartData.forEach((el) => {
            if (el.title === cartItem.title) {
                el.totalPrice = (+el.totalPrice + +cartItem.price).toFixed(2)
                el.qty += 1
            }
        })
    }
    else {
        cartData.push(cartItem)
    }
    localStorage.setItem('cart-data', JSON.stringify(cartData))

});

// INCREASE AND DECREASE CART ITEMS QTY AND PRICE USING MINUS AND PLUS BUTTONS
modalBackdropEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-minus')) {
        const title = e.target.parentElement.previousElementSibling.children[2].textContent
        cartBtnQty.textContent = +cartBtnQty.textContent - 1

        //Allow decrease qty antil 1 and then delete item from cart
        cartData.forEach((el) => {
            if (el.qty > 1) {
                if (el.title === title) {
                    el.totalPrice = (+el.totalPrice - +el.price).toFixed(2)
                    el.qty -= 1
                }
            }
            else {
                const itemIndex = cartData.findIndex(el => el.title === title)
                cartData.splice(itemIndex, 1)
            }
        })
        flashCartQty()
    }
    if (e.target.matches('.btn-plus')) {
        const title = e.target.parentElement.previousElementSibling.children[2].textContent
        cartBtnQty.textContent = +cartBtnQty.textContent + 1

        // Increase item qty
        cartData.forEach((el) => {
            if (el.title === title) {
                el.totalPrice = (+el.totalPrice + +el.price).toFixed(2)
                el.qty += 1
            }
        })
        flashCartQty()
    }
    // Update localstorage after increase or decrease and render the new data
    localStorage.setItem('cart-data', JSON.stringify(cartData))
    renderCartData()
})

// QTY FOR CART BUTTON
cartData.forEach(el => cartBtnQty.textContent = +cartBtnQty.textContent + el.qty)


// FORM SUBMIT FOR CREATE LISTING
listingForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const listingData = new FormData(listingForm);
    const listingObj = Object.fromEntries(listingData);

    products.push(listingObj);
    localStorage.setItem('products', JSON.stringify(products));
    listingForm.reset();

    const successEl = document.createElement('p');
    successEl.textContent = 'Listing created successfully!';
    listingForm.appendChild(successEl);

    location.reload()
})

// OPEN SPECIFIC LISTING PAGE
document.querySelector(".listing-list").addEventListener('click', (e) => {
    if (e.target.matches('.listing-list div')) {
        sectionsLis.forEach((section) => (section.style.display = "none"));
        listingEl.style.display = "block";

        // Render api listing (data-id attribute value for created listngs will be undefined)
        if (e.target.dataset.id !== 'undefined') {
            displayApiListing(e.target.dataset.id)
        }
        else {
            // Render created listing
            products.forEach(product => {
                if (product.image === e.target.children[0].src) {
                    renderListingData(product)
                }
            })
        }
    }
})


// <<<<<<<<<< HELPER FUNCTIONS >>>>>>>>>>>>>>

// CREATE CART ELEMENTS BASED ON CART DATA SAVED IN LOCALSTORAGE
const renderCartData = () => {
    cartItemsListEl.textContent = ''

    let total = 0
    cartData.forEach(el => {
        total += +el.totalPrice

        const cartItemEl = document.createElement('div')
        const itemContentEl = document.createElement('div')
        const buttonsWrapperEl = document.createElement('div')
        const imagEl = document.createElement('img')
        const titleEl = document.createElement('p')
        const priceEl = document.createElement('span')
        const minusBtnEl = document.createElement('button')
        const plusBtnEl = document.createElement('button')
        const qtyEl = document.createElement('p')

        cartItemEl.classList.add('flex', 'justify-between', 'border-b-2', 'border-dotted', 'border-slate-400')
        imagEl.classList.add('w-9', 'mt-3', 'inline')
        imagEl.src = el.image
        priceEl.classList.add('text-cyan-600', 'text-2xl', 'ml-10')
        priceEl.textContent = `$${el.totalPrice}`
        titleEl.classList.add('w-40', 'text-ellipsis', 'whitespace-nowrap', 'overflow-hidden')
        titleEl.textContent = el.title
        buttonsWrapperEl.classList.add('m-0', 'flex', 'items-center')
        minusBtnEl.classList.add('btn-minus', 'text-cyan-600', 'text-4xl', 'pb-1', 'pr-3')
        minusBtnEl.textContent = '-'
        plusBtnEl.classList.add('btn-plus', 'text-cyan-600', 'text-4xl', 'pb-1', 'pl-2')
        plusBtnEl.textContent = '+'
        qtyEl.classList.add('text-2xl', 'border', 'rounded', 'border-cyan-600', 'p-1')
        qtyEl.textContent = `x${el.qty}`

        itemContentEl.append(imagEl, priceEl, titleEl)
        buttonsWrapperEl.append(minusBtnEl, qtyEl, plusBtnEl)
        cartItemEl.append(itemContentEl, buttonsWrapperEl)
        cartItemsListEl.append(cartItemEl)
    })
    cartTotalEl.textContent = `$${total.toFixed(2)}`
}

// FLASH THE BACKGROUND COLOR OF CART QTY
const flashCartQty = () => {
    cartBtnQty.classList.add("bg-blue-800");
    setTimeout(() => {
        cartBtnQty.classList.remove("bg-blue-800");
    }, 100);
}

// FETCH DATA FOR SPECIFIC LISTING
const displayApiListing = (id) => {
    listingDataEl.previousElementSibling.textContent = 'Loading...'
    listingDataEl.style.display = 'none'
    fetch(`https://fakestoreapi.com/products/${id}`).then(res => res.json())
        .then(data => {
            renderListingData(data)
        })
        .catch(() => {
            listingDataEl.previousElementSibling.textContent = 'Could not fetch the data!'
        })
}

// CREATE ELEMENTS FOR SPECIFIC LISTING PAGE BASED ON PASSED DATA
const renderListingData = (data) => {
    listingDataEl.previousElementSibling.textContent = ''
    listingDataEl.style.display = 'block'

    listingDataEl.children[0].src = data.image
    listingDataEl.children[1].children[0].textContent = data.title
    listingDataEl.children[1].children[1].children[1].textContent = data.price
    listingDataEl.children[1].children[2].children[1].textContent = data.category
    listingDataEl.children[1].children[3].children[1].textContent = data.description
}

// CREATE CARD ELEMENTS FOR ALL LISTINGS PAGE BASED ON PASSED DATA
const renderListingsData = (data) => {
    data.forEach(el => {
        const divEl = document.createElement('div')
        const imgEl = document.createElement('img')
        imgEl.src = el.image
        imgEl.classList.add('pointer-events-none')
        divEl.setAttribute('data-id', `${el.id}`)
        divEl.classList.add('bg-white', 'w-56', 'h-80', 'mb-4', 'cursor-pointer', 'text-2xl', 'rounded-md', 'shadow-lg', 'shadow-slate-300', 'border-2', 'border-solid', 'border-slate-300', 'overflow-hidden')
        divEl.append(imgEl)
        document.querySelector(".listing-list").appendChild(divEl)

    })
}

// FETCH DATA FOR SPECIFIC CATEGORY AND RENDER TO THE PAGE
const displaySingleCatListings = (category) => {
    document.querySelector(".listing-list").textContent = ''
    allListngsEl.children[5].textContent = 'Loading...'
    fetch(`https://fakestoreapi.com/products/category/${category}`).then(res => res.json())
        .then(data => {
            allListngsEl.children[5].textContent = ''
            products.forEach((product) => {
                if (product.category === category) {
                    data.unshift(product)
                }
            })
            renderListingsData(data)
        })
        .catch(() => allListngsEl.children[5].textContent = 'Could not fetch the data!')
}

// FETCH DATA FOR ALL LISTNGS AND RENDER TO THE PAGE
const displayAllCatListings = () => {
    allListngsEl.children[5].textContent = 'Loading...'
    fetch('https://fakestoreapi.com/products/').then(res => res.json())
        .then(data => {
            allListngsEl.children[5].textContent = ''
            data = [...products, ...data]
            renderListingsData(data)
        })
        .catch(() => allListngsEl.children[5].textContent = 'Could not fetch the data!')
}

// BY DEFAULT HAVE ALL LISTINGS ON THE PAGE
displayAllCatListings()

