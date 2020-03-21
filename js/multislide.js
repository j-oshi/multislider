let multiSlide = (function() {
   
    let slideOffset = 0, slideWrapper, carouselTimer = null;

    setScrollOffset = function( value ) {
        slideOffset += value;
    },

    getScrollOffset = function() {
        return slideOffset;
    },

    resetScrollOffset = function() {
        slideOffset = 0;
    }, 

    getSlideWrapper = function( slideWrapperValue ) {
        slideWrapper = document.getElementById(slideWrapperValue || 'main-slide-container');
    },
    
    slideDisplayOffset = function( n ) {
        // Get number of slides
        let slideContainer = slideWrapper;
        let containerWidth = slideContainer.scrollWidth;
        let containerChildren = Array.from(slideContainer.children).length;

        let containerOffSet = containerWidth / containerChildren;

        if (n === -1 && slideContainer.scrollLeft < slideContainer.scrollLeftMax) {
            setScrollOffset(containerOffSet);
            slideContainer.scrollLeft = getScrollOffset();
        }

        if (n === 1 && slideContainer.scrollLeft !== 0) {
            setScrollOffset(-containerOffSet);
            slideContainer.scrollLeft = getScrollOffset();
        }
    },

    carouselEvent = function( carouselTransitionTime ) {
        let slideContainer = slideWrapper;
        carouselTimer = setInterval(function() {
            slideDisplayOffset(-1);
            if (slideContainer.scrollLeft >= slideContainer.scrollLeftMax) {
                resetScrollOffset();
                slideContainer.scrollLeft = 0;
            }
        },  carouselTransitionTime || 5000);
    },
   
    loadStyleSheet = function( style ) {
        // Check if stylesheet exist before loading script
        let styleSheet = [...document.querySelectorAll("link")];
        let linkArray = styleSheet.map(style => style.href.includes("")).filter(linkExist => linkExist === true);
        if (linkArray.length < 1) {
            let styleTag = document.createElement('link');
            styleTag.type = 'text/css';
            styleTag.rel = 'stylesheet';
            styleTag.href = style || 'css/multislider.css';
            document.getElementsByTagName('head')[0].appendChild(styleTag);
        }
    },

    loadFixScript = function( slideWrapper ) {
        // load script if scroll function does not exist
        let slideContainer = document.getElementById(slideWrapper || 'main-slide-container');
        if (slideContainer.scrollLeftMax === undefined) {
            let scriptTag = document.createElement('script');
            scriptTag.setAttribute('src', 'js/iefix.js');
            document.getElementsByTagName('head')[0].appendChild(scriptTag);
        }
    }; 
   
    return {
        init: function( option = {} ) {
            loadStyleSheet( option.style );
            loadFixScript( option.slideWrapperTag );
            getSlideWrapper( option.slideWrapperTag );
            if ( option.carousel === true ) {
                carouselEvent( option.carouselSpeed );
            }
            if ( option.carousel && option.carouselHover === true ) {
                let buttons = document.querySelectorAll(".arrow");
                [...buttons].forEach(button => {
                    button.addEventListener('mouseover', function () {
                        clearInterval(carouselTimer);
                    });
                    button.addEventListener('mouseout', function () {
                        carouselEvent( option.carouselSpeed );
                    });
                })
            }
        },
        scrollToLeft: function() {
            slideDisplayOffset(1);
        },
        scrollToRight: function() {
            slideDisplayOffset(-1);
        },
    };
  })();