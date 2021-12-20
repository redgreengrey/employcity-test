<template>
  <it-button @click="cartModal = true">Корзина</it-button>
  <it-modal v-model="cartModal" width="75vw">
    <template #header>
      <h3 style="margin: 0">Корзина</h3>
    </template>

    <template #body>
      <div v-if="order.length === 0">В корзине пока пусто</div>
      <div v-else v-for="(item, idx) in order" :key="idx">
        <div>
          {{ item.name }} - {{ item.quantity + " шт" }} -
          {{ Math.ceil(item.price * usdRate) + "&#x20bd;" }}
        </div>
        <it-divider />
      </div>
      <div v-if="order.length !== 0">
        Итого: {{ getPriceInRubles(summary) }}
      </div>
    </template>
    <template #actions>
      <it-button
        type="primary"
        @click="$Message({ text: 'It\'s ok' }), (cartModal = false)"
        >Ok</it-button
      >
    </template>
  </it-modal>

  <it-collapse
    v-for="(group, i) in catalog"
    :title="group.group"
    :key="group.group"
  >
    <it-collapse-item :title="i" :opened="true">
      <div class="collapse-row__header">
        <div>название</div>
        <div>количество</div>
        <div>цена</div>
      </div>
      <div
        v-for="item in group"
        :title="item.group"
        :key="item.name"
        class="collapse-row"
      >
        <div class="collapse-row__content">
          <div class="collapse-row__item">{{ item.name }}</div>
          <div class="collapse-row__item">{{ item.quantity }}</div>
          <div class="collapse-row__item">
            {{ Math.ceil(item.price * usdRate) }} &#x20bd;
          </div>
          <it-button :disabled="item.quantity === 0" @click="addToOrder(item)"
            >+</it-button
          >
        </div>
      </div>
    </it-collapse-item>
  </it-collapse>
</template>

<script>
import axios from "axios";
import { getProperty } from "./utils";

export default {
  name: "App",
  components: {},
  data() {
    return {
      goods: [],
      names: {},

      catalog: {},
      rawCatalog: [],
      order: [],
      cartModal: false,
      usdRate: 75,

      statusValue: "",
    };
  },

  created() {
    const $goods = axios.get("http://localhost:3000/data");
    const $names = axios.get("http://localhost:3000/names");

    Promise.all([$goods, $names])
      .then(([goodsResponse, namesResponse]) => {
        this.goods = goodsResponse?.data?.Value?.Goods || [];
        this.names = namesResponse?.data || {};
      })
      .catch((err) => console.log(err.message))
      .finally(() => {
        this.getCatalog();
      });
  },

  computed: {
    summary() {
      return this.order.reduce((acc, el) => {
        return (acc += el.quantity * el.price);
      }, 0);
    },
  },

  methods: {
    getPriceInRubles(number) {
      return Math.ceil(number * this.usdRate);
    },

    getCatalog() {
      this.rawCatalog = this.goods.reduce((acc, item) => {
        const name = getProperty(this.names, [item.G, "B", item.T, "N"], "-");
        const listItem = {
          price: item.C,
          quantity: item.P,
          group: getProperty(this.names, [item.G, "G"], "-"),
          name: name,
        };
        return [...acc, listItem];
      }, []);

      this.catalog = this.rawCatalog.reduce((acc, el) => {
        if (!acc[el.group]) {
          acc[el.group] = [];
        }
        acc[el.group].push(el);
        return acc;
      }, {});
    },
    addToOrder(item) {
      let idx = this.catalog[item.group].findIndex(
        (el) => el.name === item.name
      );
      let orderIdx = this.order.findIndex((el) => el.name === item.name);

      if (this.catalog[item.group][idx].quantity > 0) {
        if (orderIdx === -1) {
          this.order.push({
            name: item.name,
            group: item.group,
            price: item.price,
            quantity: 1,
          });
        } else {
          this.order[orderIdx] = {
            ...this.order[orderIdx],
            quantity: this.order[orderIdx].quantity + 1,
          };
        }
        this.catalog[item.group][idx].quantity--;
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.collapse-row__content {
  display: grid;
  grid-template-columns: 600px 120px 120px 30px;
  padding-bottom: 10px;
}

.collapse-row__header {
  display: grid;
  grid-template-columns: 600px 120px 120px 30px;
  margin: 5px;
}

.collapse-row__item {
  border: 1px solid black;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 5px;
  margin: 0 5px;
}
</style>
