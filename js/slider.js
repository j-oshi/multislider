(function () {
    let warehouseCarousel = {
        globals: {
            'slideOffset': 0,
        },

        init() {
            warehouseCarousel.displayProduct();
            warehouseCarousel.scrollToLeft();
            warehouseCarousel.scrollToRight();
        },

        showDivs(n) {
            let i;
            let x = document.getElementById("product-container");
            let containerWidth = x.scrollWidth;
            let containerChildren = Array.from(x.children).length - 2;

            let containerOffSet = containerWidth / containerChildren;

            if (n === -1 && x.scrollLeft < x.scrollLeftMax) {
                warehouseCarousel.globals.slideOffset += containerOffSet;
                x.scrollLeft = warehouseCarousel.globals.slideOffset;
            }

            if (n === 1 && x.scrollLeft !== 0) {
                warehouseCarousel.globals.slideOffset -= containerOffSet;
                x.scrollLeft = warehouseCarousel.globals.slideOffset;
            }
        },

        scrollToLeft() {
            let x = document.getElementById("button-left");
            x.addEventListener('click', function () {
                warehouseCarousel.showDivs(-1);
            });
        },

        scrollToRight() {
            let x = document.getElementById("button-right");
            x.addEventListener('click', function () {
                warehouseCarousel.showDivs(1);
            });
        },

        loadProductJSON(callback, url) {
            var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");

            xobj.onreadystatechange = function () {
                if (xobj.readyState == 4 && xobj.status == "200") {
                    callback(xobj.responseText);
                } else {
                    callback(false);
                }
            };

            xobj.open("GET", url, true);
            xobj.send(null);
        },

        displayProduct() {
            var url = "data/recommendations.json";
            warehouseCarousel.loadProductJSON(function (response) {
                if (response !== false) {
                    let value = JSON.parse(response);
                    warehouseCarousel.displayCard(value);
                }
            }, url);
        },

        displayCard(cardArray) {
            // console.log(cardArray.hits);
            let cardContainer = document.getElementById("product-container");
            let cards = cardArray.hits.map(card => {
                if (card.image !== undefined) {
                    return `<div class="card">
                    <img src="${card.image.link}" alt="${card.image.alt}" style="width:100%">
                    <div class="container">
                        <h6>${card.product_name}</h6> 
                        <p class="popUp" data-id="${card.product_id}" >£${card.price}</p> 
                    </div>
                </div>`;
                }
            });
            cardContainer.insertAdjacentHTML("afterbegin", cards.join(""));
            warehouseCarousel.showDivs(warehouseCarousel.globals.slideIndex);
            warehouseCarousel.modalControl();
        },

        modalControl() {
            // Get the modal
            var modal = document.getElementById("myModal");

            // Click on price that opens the modal
            let p = Array.from(document.getElementsByClassName("popUp"));
            p.map(eachP => {
                eachP.addEventListener('click', function () {
                    modal.style.display = "block";
                    warehouseCarousel.displayModalProduct(this.dataset.id);
                });
            });

            // Get the <span> element that closes the modal
            var span = document.getElementsByClassName("close")[0];

            // When the user clicks on <span> (x), close the modal
            span.onclick = function () {
                modal.style.display = "none";
            }

            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        },

        displayModalProduct(n) {
            let master_id = n.substring(0, 6);
            const removeElements = (elms) => elms.forEach(el => el.remove());
            removeElements( document.querySelectorAll(".slide, .slide-button, .slide-title") );
            var cardContainer = document.getElementById("slider");
            var cardController = document.getElementById("slider-controller");
            var url = "data/product.json";
            warehouseCarousel.loadProductJSON(function (response) {
                if (response !== false) {
                    let value = JSON.parse(response);
                    let product = value.data.map(productData => {
                        if (master_id === productData.id) {
                            return productData;
                        }
                    }).filter(products => products !== undefined);

                    var cards = [];
                    var cardLinks = [];
                    product[0].image_groups.map(pic => {
                        pic.images.map( (img, index) => {
                            cards.push(`<div class="slide" id="slide-${index}"><img src="${img.link}" alt="${img.alt}" style="width:100%"></div>`);
                            cardLinks.push(`<a class="slide-button" href="#slide-${index}">${index}</a>`);
                        });
                    });
                    cardContainer.insertAdjacentHTML("afterbegin", cards.join(""));
                    cardController.insertAdjacentHTML("afterbegin", cardLinks.join(""));
                    cardController.insertAdjacentHTML("afterbegin", `<h6 class="slide-title">${value.data[0].name}</h6><p class="slide-title">£${value.data[0].price}</p>`);
                }
            }, url);
        },
    };

    warehouseCarousel.init();
})();