var app = new Vue({
  el: ".main",
  data: {
    products: [
      {
        id: 1,
        title: "Clementine",
        short_text: "Sweet and aromatic, with a thin orange peel.",
        image: "clementines-318213_1280.jpg",
        desc: "Clementines are a type of mandarin orange known for their sweet taste and delicate aroma. They are easy to peel, making them perfect for snacking or adding to salads.",
      },
      {
        id: 2,
        title: "Tangerine",
        short_text: "Juicy and refreshing, with subtle citrus notes.",
        image: "tangerine-93695_1280.jpg",
        desc: "Tangerines are small, juicy mandarins with a slightly sweet flavor and refreshing aroma. They are rich in vitamin C and other nutrients, making them perfect for eating raw or juicing.",
      },
      {
        id: 3,
        title: "Mandarin",
        short_text:
          "Gentle flavor with a hint of bitterness, ideal for desserts.",
        image: "mandarin-4869909_1280.jpg",
        desc: "Mandarins are a classic variety of mandarin oranges known for their gentle flavor and slight bitterness. They are ideal for use in various desserts, baking, and smoothies. Mandarins can also be added to salads or enjoyed as a snack.",
      },
      {
        id: 4,
        title: "Satsuma",
        short_text: "Easy to peel, with a rich, sweet flavor.",
        image: "mandarin-1756766_1280.jpg",
        desc: "Satsumas are a type of mandarin orange known for their easy-to-peel skin and rich, sweet flavor. They are seedless and often enjoyed as a snack or used in desserts and salads.",
      },
      {
        id: 5,
        title: "Kinnow",
        short_text: "Tangy-sweet with a hint of tartness, bursting with juice.",
        image: "fruit-7902323_1280.jpg",
        desc: "Kinnow is a hybrid variety of mandarin orange, known for its tangy-sweet flavor with a hint of tartness. They are bursting with juice and are often used to make fresh juices and cocktails.",
      },
    ],
    product: [],
    btnVisible: 0,
    cart: [],
    contactFields: {
      name: "",
      company_name: "",
      position: "",
      city: "",
      country: "",
      phone: "",
      email: "",
      job: "",
      details: "",
      interest: "",
      code: "",
    },
    orderSubmitted: false,
  },

  mounted: function () {
    this.getProduct();
    this.checkInCart();
    this.getCart();
  },
  methods: {
    getProduct: function () {
      if (window.location.hash) {
        var id = window.location.hash.replace("#", "");
        if (this.products && this.products.length > 0) {
          for (i in this.products) {
            if (
              this.products[i] &&
              this.products[i].id &&
              id == this.products[i].id
            )
              this.product = this.products[i];
          }
        }
      }
    },
    addToCart: function (id) {
      var cart = [];
      if (window.localStorage.getItem("cart")) {
        cart = window.localStorage.getItem("cart").split(",");
      }
      if (cart.indexOf(String(id)) == -1) {
        cart.push(id);
        window.localStorage.setItem("cart", cart.join());
        this.btnVisible = 1;
      }
    },
    checkInCart: function () {
      if (
        this.product &&
        this.product.id &&
        window.localStorage
          .getItem("cart")
          .split(",")
          .indexOf(String(this.product.id)) != -1
      )
        this.btnVisible = 1;
    },
    getCart: function () {
      var storedCart = window.localStorage.getItem("cart");
      if (storedCart) {
        var storedCartIds = storedCart.split(",");
        for (var i in this.products) {
          if (storedCartIds.indexOf(String(this.products[i].id)) != -1) {
            this.cart.push(this.products[i]);
          }
        }
      }
    },
    removeFromCart: function (id) {
      this.cart = this.cart.filter((item) => item.id !== id);
      var storedCart = window.localStorage.getItem("cart");
      if (storedCart) {
        var cartIds = storedCart.split(",");
        var updatedCartIds = cartIds.filter((cartId) => cartId !== String(id));
        window.localStorage.setItem("cart", updatedCartIds.join());
      }
    },
    makeOrder: function () {
      console.log("Name:", this.contactFields.name);
      this.contactFields.name = "";
      this.cart = [];
      window.localStorage.removeItem("cart");
      this.orderSubmitted = true;
    },
  },
});
