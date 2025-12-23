const toggleLoginButton = document.querySelector('.auth-button');
const loginPanel = document.querySelector('.login-register');
const toggleButton = document.getElementById('toggle-admin-panel');
const adminPanel = document.getElementById('admin-panel');
const form = document.getElementById('add-item-form');
const login_input = document.querySelector(".login")
const password_input = document.querySelector(".password")
const login_button = document.querySelector(".login-button")
const register_button = document.querySelector(".register-button")
let logged_user = localStorage.getItem("login")

document.addEventListener('DOMContentLoaded', fetchItems);

async function fetchItems() {
    try {
        const response = await fetch('http://127.0.0.1:8000/items/');
        const items = await response.json();
        const container = document.getElementById('item-container');
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.setAttribute("code", item.id)
            const name = document.createElement('h2');
            name.textContent = item.name;

            const img = document.createElement('img');
            img.src = item.image_url;
            img.alt = `Товар ${item.id}`;

            const price = document.createElement('p');
            price.classList.add('price');
            price.textContent = `Price: ${item.price} $`;

            const buyButton = document.createElement('button');
            buyButton.classList.add('buy-button');
            buyButton.textContent = 'Buy';
            buyButton.addEventListener('click', () => {
                addToCart(item.id)
            });

            itemDiv.appendChild(name);
            itemDiv.appendChild(img);
            itemDiv.appendChild(price);
            itemDiv.appendChild(buyButton);
            container.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('Error!:', error);
    }
}

toggleButton.addEventListener('click', () => {
    adminPanel.classList.toggle('active');
    if (adminPanel.classList.contains('active')) {
        toggleButton.textContent = 'Hide';
    } else {
        toggleButton.textContent = 'Show';
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value;
    const imageUrl = document.getElementById('item-image-url').value;
    const price = document.getElementById('item-price').value;
    if (name.length > 15 || price.length > 10) {
        alertify.notify('Name or price is too long!', 'error', 5);
        return
    }
    const newItem = {
        name: name,
        image_url: imageUrl,
        price: parseFloat(price)
    };
    try {
        const response = await fetch('http://127.0.0.1:8000/items/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newItem)
        });

        if (response.ok) {
            alertify.notify('New item added!', 'success', 5);
            location.reload()
        } else {
            alertify.notify('Error!', 'error', 5);
        }
    } catch (error) {
        console.error('Помилка при надсиланні запиту:', error);
    }
});



register_button.addEventListener("click", async () => {
    const user_data = {
        username: login_input.value,
        password: password_input.value,
    };
    try {
        const response = await fetch('http://127.0.0.1:8000/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user_data)
        });

        if (response.ok) {
            alertify.notify('Successfully registered!', 'success', 5);
        } else if (response.status == 409) {
            alertify.notify('User already exists!', 'error', 5);
        }
        else {
            alertify.notify('Server error!', 'error', 5);
        }
    } catch (error) {
        console.error('Server error:', error);
    }
})

login_button.addEventListener("click", async () => {
    const user_data = {
        username: login_input.value,
        password: password_input.value,
    };
    try {
        const response = await fetch('http://127.0.0.1:8000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user_data)
        });

        if (response.ok) {
            alert('Login Successfull!');
            localStorage.setItem("login", user_data.username)
            location.reload()
        } else if (response.status == 404) {
            alertify.notify('No user found or wrong credentials!', 'error', 5);
        }
        else {
            alertify.notify('Server error!', 'error', 5);
        }
    } catch (error) {
        console.error('Error:', error);
    }
})

if (logged_user) {
    if (logged_user == "admin")
        document.getElementById("toggle-admin-panel").style.display = "block"

    document.querySelector(".login-register").innerHTML = `
        <p> Welcome, ${logged_user}!</p>
        <button class="logout">Logout</button>
        <p>Write a review: </p>
        <textarea class="review-content"></textarea>
        <button class="send-review">Send</button>
    `
    document.querySelector(".logout").addEventListener("click", () => {
        localStorage.setItem("login", "")
        location.reload()
    })

    document.querySelector(".send-review").addEventListener('click', async () => {
        let review_content = document.querySelector(".review-content").value
        let username = localStorage.getItem("login")
        if (review_content.length > 100) {
            alertify.notify("Review is too long!", "error", 5)
            return
        }
        await fetch(`http://127.0.0.1:8000/reviews/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                content: review_content
            })
        })
            .then(async (response) => {
                await response
                alertify.notify("Review added!", "success", 5)
            })
            .catch(async (error) => {
                await error
                alertify.notify("Error!", "error", 5)
            })
    })
}
else {
    document.getElementById("toggle-admin-panel").style.display = "none"
}

toggleLoginButton.addEventListener('click', () => {
    loginPanel.classList.toggle('active');
})

document.querySelector(".open-cart").addEventListener("click", () => {
    document.querySelector(".cart").classList.toggle("active")
})

async function addToCart(item_id) {
    const username = localStorage.getItem("login")
    if (!username) {
        alertify.notify('Login first!', 'error', 5);
        return
    }
    const response = await fetch(`http://127.0.0.1:8000/cart/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(async (response) => {
            let cart = await response.json()
            const item_response = await fetch(`http://127.0.0.1:8000/items/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(async (item_response) => {
                    let items = await item_response.json()
                    let current_item = ""
                    items.forEach(item => {
                        delete item.image_url
                        if (item.id == item_id) current_item = item
                    })
                    let new_item = true
                    cart = JSON.parse(cart[0].cartcontent)
                    cart.forEach(cart_item => {
                        if (cart_item.item.id == item_id) {
                            cart_item.count++
                            new_item = false
                        }
                    })
                    if (new_item)
                        cart.push({
                            count: 1,
                            item: current_item
                        })
                    let new_cart = {
                        cartcontent: cart,
                        username: username
                    }
                    console.log(new_cart)
                    await fetch(`http://127.0.0.1:8000/cart/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(new_cart)
                    })
                        .then(async (response) => {
                            if (response.status == 200) {
                                alertify.notify('Added to cart!', 'success', 5);
                            }
                        })

                })
        })
}

setInterval(async () => {
    let username = localStorage.getItem("login")
    if (username)
        await fetch(`http://127.0.0.1:8000/cart/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(async (response) => {
                let cart = await response.json()
                cart = JSON.parse(cart[0].cartcontent)
                let html_cart = ""
                cart.forEach(cart_item => {
                    html_cart += `
                    <li>
                        <p class="cart-item-name">${cart_item.item.name}</p>
                        <p>${cart_item.count}</p>
                        <p>${Number(Number(cart_item.item.price) * cart_item.count).toFixed(2)} $</p>
                    </li>
                    `
                })
                document.querySelector('.cart-items').innerHTML = html_cart
            })
}, 2000)

fetch('http://127.0.0.1:8000/reviews')
    .then(response => response.json())
    .then(data => {
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        data.forEach(review => {
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');

            const username = document.createElement('div');
            username.classList.add('username');
            username.textContent = review.username;

            const content = document.createElement('div');
            content.classList.add('content');
            content.textContent = review.content;

            slide.appendChild(username);
            slide.appendChild(content);

            swiperWrapper.appendChild(slide);
        });
        new Swiper('.swiper-container', {
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            loop: true,
            slidesPerView: 3,
            spaceBetween: 20,
            autoplay: {
                delay: 2000,
            },
            speed: 2000,
        });
    })
    .catch(error => {
        console.error('Error fetching reviews:', error);
    });
