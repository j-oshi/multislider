(function () {
    let multislide = {
        globals: {
            'stylesheet': 'css/multislider.css',
            'slideContainer': 'main-slide-container',
            'slideOffset': 0,
            'modelScroller': 0,
            'carousel': true,
            'carouselTransitionTime': 2000,
            'timer': null,
        },

        init() {
            multislide.loadStyleSheet();
            multislide.loadFixScript();
            multislide.displayProduct();
            multislide.scrollToLeft();
            multislide.scrollToRight();
            multislide.slideModalLeft();
            multislide.slideModalRight();
            multislide.carouselEvent();
            multislide.onCarouselHover();
        },

        loadStyleSheet() {
            // Check if stylesheet exist before loading script
            let styleSheet = [...document.querySelectorAll("link")];
            let linkArray = styleSheet.map(style => style.href.includes("")).filter(linkExist => linkExist === true);
            if (linkArray.length < 1) {
                let styleTag = document.createElement('link');
                styleTag.type = 'text/css';
                styleTag.rel = 'stylesheet';
                styleTag.href = multislide.globals.stylesheet;
                document.getElementsByTagName('head')[0].appendChild(styleTag);
            }
        },

        loadFixScript() {
            // load script if scroll function does not exist
            let x = document.getElementById(multislide.globals.slideContainer);
            if (x.scrollLeftMax === undefined) {
                let scriptTag = document.createElement('script');
                scriptTag.setAttribute('src', 'js/iefix.js');
                document.getElementsByTagName('head')[0].appendChild(scriptTag);
            }
        },        

        setScrollOffset(value) {
            multislide.globals.slideOffset += value;
        },

        getScrollOffset() {
            return multislide.globals.slideOffset;
        },

        resetScrollOffset() {
            multislide.globals.slideOffset = 0;
        },  

        slideDisplay(n) {
            let x = document.getElementById(multislide.globals.slideContainer);
            let containerWidth = x.scrollWidth;
            let containerChildren = Array.from(x.children).length;

            let containerOffSet = containerWidth / containerChildren;

            if (n === -1 && x.scrollLeft < x.scrollLeftMax) {
                multislide.setScrollOffset(containerOffSet);
                x.scrollLeft = multislide.getScrollOffset();
            }

            if (n === 1 && x.scrollLeft !== 0) {
                multislide.setScrollOffset(-containerOffSet);
                x.scrollLeft = multislide.getScrollOffset();
            }
        },

        scrollToLeft() {
            let x = document.getElementById("button-left");
            x.addEventListener('click', function () {
                multislide.slideDisplay(1);
            });
        },

        scrollToRight() {
            let x = document.getElementById("button-right");
            x.addEventListener('click', function () {
                multislide.slideDisplay(-1);
            });
        },

        carouselEvent() {
            if (multislide.globals.carousel) {
                let x = document.getElementById(multislide.globals.slideContainer);

                multislide.globals.timer = setInterval(function() {
                    multislide.slideDisplay(-1);
                    if (x.scrollLeft >= x.scrollLeftMax) {
                        multislide.resetScrollOffset();
                        x.scrollLeft = 0;
                    }
                }, multislide.globals.carouselTransitionTime);

            }
        },

        onCarouselHover() {
            let buttons = document.querySelectorAll(".arrow");
            [...buttons].forEach(button => {
                button.addEventListener('mouseover', function () {
                    clearInterval(multislide.globals.timer);
                });
                button.addEventListener('mouseout', function () {
                    multislide.carouselEvent();
                });
            })

        },

        loadProductJSON(callback, url) { 
            let xobj = new XMLHttpRequest();
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
            let url = "data/recommendations.json";
            multislide.loadProductJSON(function (response) {
                if (response !== false) {
                    let value = JSON.parse(response);
                    multislide.displayCard(value);
                }
            }, url);
        },

        displayCard(cardArray) {
            let cardContainer = document.getElementById(multislide.globals.slideContainer);
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
            multislide.slideDisplay(multislide.globals.slideIndex);
            multislide.modalControl();
        },

        setModalValue(n) {
            multislide.globals.modelScroller += n;
        },

        getModalValue() {
            return multislide.globals.modelScroller;
        },

        modalControl() {
            // Get the modal
            let modal = document.getElementById("myModal");

            // Click on price that opens the modal
            let p = Array.from(document.getElementsByClassName("popUp"));
            p.map(eachP => {
                eachP.addEventListener('click', function () {
                    modal.style.display = "block";
                    multislide.displayModalProduct(this.dataset.id);
                });
            });

            // Get the <span> element that closes the modal
            let span = document.getElementsByClassName("close")[0];

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
            removeElements(document.querySelectorAll(".slide, .slide-button, .slide-title"));
            let cardContainer = document.getElementById("slider");
            let cardController = document.getElementById("slider-controller");
            let url = "data/product.json";
            multislide.loadProductJSON(function (response) {
                if (response !== false) {
                    let value = JSON.parse(response);
                    let product = value.data.map(productData => {
                        if (master_id === productData.id) {
                            return productData;
                        }
                    }).filter(products => products !== undefined);

                    let cards = [];
                    let cardLinks = [];
                    let modalImges = [];
                    product[0].image_groups.map(pic => pic.images.map(img => modalImges.push(img)));
                    modalImges.map((img, index) => {
                        cards.push(`<div class="slide" id="slide-${index}"><img src="${img.link}" alt="${img.alt}" style="width:100%"></div>`);
                        cardLinks.push(`<a class="slide-button" href="#slide-${index}">${index}</a>`);
                    });
                    cardContainer.insertAdjacentHTML("afterbegin", cards.join(""));
                    cardController.insertAdjacentHTML("afterbegin", cardLinks.join(""));
                    cardController.insertAdjacentHTML("afterbegin", `<h6 class="slide-title">${value.data[0].name}</h6><p class="slide-title">£${value.data[0].price}</p>`);
                }
            }, url);
        },

        slideModal(n) {
            let slides = Array.from(document.getElementsByClassName("slide-button"));
            let scrollerArray = Array.from(slides).length - 1;
            if (n === 1) {
                multislide.setModalValue(1);
                let l = multislide.getModalValue();
                if (scrollerArray >= l) {
                    window.location.href = slides[l].href;
                }
            }

            if (n === -1) {
                if (multislide.getModalValue() > 0) {
                    multislide.setModalValue(-1);
                    let r = multislide.getModalValue();
                    if (scrollerArray >= r && r >= 0) {
                        window.location.href = slides[r].href;
                    }
                }
            }
        },

        slideModalLeft() {
            let scroller = document.getElementById("modal-button-left");
            scroller.addEventListener('click', function () {
                multislide.slideModal(-1);
            });
        },

        slideModalRight() {
            let scroller = document.getElementById("modal-button-right");
            scroller.addEventListener('click', function () {
                multislide.slideModal(1);
            });
        },
    };

    multislide.init();
})();