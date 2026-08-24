document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // PRODUCT SWITCHER
  // ============================================================
  //
  // This script handles:
  //
  // 1. Swatch hover
  //    → Temporarily shows the hovered product's color + edition.
  //
  // 2. Swatch click
  //    → Loads the selected product without a full page reload.
  //
  // 3. Browser URL
  //    → Updates the URL when switching products.
  //
  // 4. Browser Back / Forward
  //    → Loads the correct product when navigation happens.
  //
  // Event delegation is used for swatches because the product
  // section is replaced after every AJAX product switch.
  // ============================================================


  // ============================================================
  // PRODUCT PAGE ELEMENT
  // ============================================================

  const productPage =
    document.querySelector('.js-product-page');


  // If this is not a product page, stop the script.
  if (!productPage) {
    console.log('Product page not found');
    return;
  }


  // ============================================================
  // STATE
  // ============================================================

  // ID of the product currently displayed on the page.
  let currentProductId =
    productPage.dataset.currentProductId;


  // Section ID used to request the product section.
  let productSectionId =
    productPage.dataset.sectionId;


  console.log(
    'Initial current product ID:',
    currentProductId
  );


  // ============================================================
  // GET CURRENT PRODUCT INFO ELEMENTS
  // ============================================================
  //
  // These elements are inside the product section and therefore
  // can be replaced when another product is loaded.
  //
  // So we query them whenever we need them instead of storing
  // permanent references.
  // ============================================================

  function getColorElement() {

    return document.querySelector(
      '.selected_swatch_color'
    );

  }


  function getEditionElement() {

    return document.querySelector(
      '.selected_swatch_edition'
    );

  }


  // ============================================================
  // SWATCH HOVER
  // ============================================================
  //
  // Desktop:
  // Hover over a swatch
  // → show that product's color + edition.
  //
  // Mouse leaves the swatch
  // → restore the current product's values.
  //
  // Mobile:
  // touchstart is used because mobile devices do not have
  // mouseenter / mouseleave in the same way desktop does.
  // ============================================================


  function showSwatchPreview(swatch) {

    const colorElement =
      getColorElement();

    const editionElement =
      getEditionElement();


    const productColor =
      swatch.dataset.productColor || '';

    const productEdition =
      swatch.dataset.productEdition || '';


    // --------------------------------
    // Update color
    // --------------------------------

    if (colorElement) {

      colorElement.textContent =
        productColor;

    }


    // --------------------------------
    // Update edition
    // --------------------------------

    if (editionElement) {

      editionElement.textContent =
        productEdition
          ? `(${productEdition})`
          : '';

    }

  }


  // ============================================================
  // RESTORE CURRENT PRODUCT VALUES
  // ============================================================
  //
  // IMPORTANT:
  //
  // We do NOT store the original color/edition globally.
  //
  // Why?
  //
  // Because after AJAX switching:
  //
  // Old Product
  //      ↓
  // section replaced
  //      ↓
  // New Product
  //
  // The new product has completely different original values.
  //
  // Therefore we read the current values directly from the
  // currently rendered HTML.
  // ============================================================

  function restoreSwatchInfo() {

    // Get the currently active product swatch.
    const activeSwatch =
      document.querySelector(
        '.js-product-swatch.is-active'
      );

    // Nothing to restore.
    if (!activeSwatch) {
      return;
    }

    // Restore the active product's color and edition.
    showSwatchPreview(activeSwatch);

  }

  // ============================================================
  // LOAD PRODUCT
  // ============================================================
  //
  // Fetches only the required Shopify section instead of
  // reloading the complete page.
  //
  // Example:
  //
  // /products/red-shirt
  //
  // becomes:
  //
  // /products/red-shirt?section_id=main-product
  // ============================================================

  function loadProduct(productUrl) {

    // Build the Shopify section URL.
    const sectionUrl =
      `${productUrl}?section_id=${productSectionId}`;


    console.log(
      'Fetching product:',
      sectionUrl
    );


    // --------------------------------
    // Request product section
    // --------------------------------

    fetch(sectionUrl)

      .then(response => {

        if (!response.ok) {

          throw new Error(
            `Product request failed: ${response.status}`
          );

        }

        return response.text();

      })


      // --------------------------------
      // Convert response HTML into DOM
      // --------------------------------

      .then(html => {

        const parser =
          new DOMParser();


        const newDocument =
          parser.parseFromString(
            html,
            'text/html'
          );


        // --------------------------------
        // Find new product section
        // --------------------------------

        const newSection =
          newDocument.querySelector(
            `#shopify-section-${productSectionId}`
          );


        if (!newSection) {

          throw new Error(
            'New product section not found'
          );

        }


        // --------------------------------
        // Find current product section
        // --------------------------------

        const currentSection =
          document.querySelector(
            `#shopify-section-${productSectionId}`
          );


        if (!currentSection) {

          throw new Error(
            'Current product section not found'
          );

        }


        // --------------------------------
        // Get new product information
        // --------------------------------

        const newProductPage =
          newSection.querySelector(
            '.js-product-page'
          );


        if (!newProductPage) {

          throw new Error(
            'New product page element not found'
          );

        }


        const newProductId =
          newProductPage.dataset.currentProductId;


        if (!newProductId) {

          throw new Error(
            'New product ID not found'
          );

        }


        console.log(
          'New product ID:',
          newProductId
        );


        // --------------------------------
        // Replace product section
        // --------------------------------
        //
        // The old product HTML is removed and the new product
        // HTML is inserted in its place.
        // --------------------------------

        currentSection.replaceWith(
          newSection
        );


        // --------------------------------
        // Update JavaScript state
        // --------------------------------

        currentProductId =
          newProductId;


        // The section ID normally stays the same,
        // but reading it again makes the code safer if
        // the markup changes in the future.

        productSectionId =
          newProductPage.dataset.sectionId ||
          productSectionId;


        // --------------------------------
        // Update browser URL
        // --------------------------------

        history.pushState(
          {},
          '',
          productUrl
        );


        console.log(
          'Current product ID:',
          currentProductId
        );

      })

      // --------------------------------
      // Handle errors
      // --------------------------------

      .catch(error => {

        console.error(
          'Error loading product:',
          error
        );

      });

  }


  // ============================================================
  // SWATCH EVENTS
  // ============================================================
  //
  // We listen on document instead of individual swatches.
  //
  // WHY?
  //
  // The swatches are replaced whenever a new product is loaded.
  //
  // If we used:
  //
  // document.querySelectorAll('.js-product-swatch')
  //
  // and attached events directly, those events would disappear
  // after the AJAX replacement.
  //
  // Event delegation solves this problem.
  // ============================================================


  // ------------------------------------------------------------
  // MOUSE ENTER
  // ------------------------------------------------------------

  document.addEventListener(
    'mouseover',
    function (event) {

      const swatch =
        event.target.closest(
          '.js-product-swatch'
        );


      if (!swatch) {
        return;
      }


      // Prevent firing repeatedly when moving between
      // elements inside the same button.
      if (
        swatch.contains(
          event.relatedTarget
        )
      ) {
        return;
      }


      showSwatchPreview(
        swatch
      );

    }
  );


  // ------------------------------------------------------------
  // MOUSE LEAVE
  // ------------------------------------------------------------

  document.addEventListener(
    'mouseout',
    function (event) {

      const swatch =
        event.target.closest(
          '.js-product-swatch'
        );


      if (!swatch) {
        return;
      }


      // If the mouse is still inside the same swatch,
      // don't restore the values yet.
      if (
        swatch.contains(
          event.relatedTarget
        )
      ) {
        return;
      }


      restoreSwatchInfo();

    }
  );


  // ------------------------------------------------------------
  // MOBILE TOUCH
  // ------------------------------------------------------------
  //
  // On mobile there is no normal mouse hover.
  //
  // When the user touches a swatch, temporarily display its
  // color + edition.
  // ------------------------------------------------------------

  document.addEventListener(
    'touchstart',
    function (event) {

      const swatch =
        event.target.closest(
          '.js-product-swatch'
        );


      if (!swatch) {
        return;
      }


      showSwatchPreview(
        swatch
      );

    },
    {
      passive: true
    }
  );


  // ============================================================
  // SWATCH CLICK
  // ============================================================
  //
  // Clicking a swatch loads the selected product.
  // ============================================================

  document.addEventListener(
    'click',
    function (event) {

      const swatch =
        event.target.closest(
          '.js-product-swatch'
        );


      // Click was not on a product swatch.
      if (!swatch) {
        return;
      }


      // --------------------------------
      // Get clicked product information
      // --------------------------------

      const productId =
        swatch.dataset.productId;

      const productUrl =
        swatch.dataset.productUrl;

      const productColor =
        swatch.dataset.productColor;

      const productEdition =
        swatch.dataset.productEdition;


      console.log(
        'Clicked product:',
        productId
      );


      console.log(
        'Current product:',
        currentProductId
      );


      console.log(
        'Clicked product color:',
        productColor
      );


      console.log(
        'Clicked product edition:',
        productEdition
      );


      // --------------------------------
      // Validate product data
      // --------------------------------

      if (!productId || !productUrl) {

        console.error(
          'Product swatch is missing product ID or URL'
        );

        return;

      }


      // --------------------------------
      // SAME PRODUCT CHECK
      // --------------------------------
      //
      // If the user clicks the swatch of the product that is
      // already being displayed, don't make another request.
      // --------------------------------

      if (
        productId === currentProductId
      ) {

        console.log(
          'Already viewing this product'
        );

        return;

      }


      // --------------------------------
      // Load selected product
      // --------------------------------

      loadProduct(
        productUrl
      );

    }
  );


  // ============================================================
  // BROWSER BACK / FORWARD
  // ============================================================
  //
  // Example:
  //
  // Product A
  //    ↓
  // Product B
  //    ↓
  // Product C
  //
  // User presses Back
  //    ↓
  // Product B loads
  //
  // User presses Back again
  //    ↓
  // Product A loads
  // ============================================================

  window.addEventListener(
    'popstate',
    function () {

      const productUrl =
        window.location.pathname;


      console.log(
        'Browser navigation:',
        productUrl
      );


      loadProduct(
        productUrl
      );

    }
  );

});