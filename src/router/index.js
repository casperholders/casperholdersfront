import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
/**
 * Vue Router with all the views and path associated
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home-view" */ '@/views/Home'),
  },
  {
    path: '/balance',
    name: 'Balance',
    component: () => import(/* webpackChunkName: "balance-view" */ '@/views/Balance'),
  },
  {
    path: '/transfer',
    name: 'Transfer',
    component: () => import(/* webpackChunkName: "transfer-view" */ '@/views/Transfer'),
  },
  {
    path: '/account',
    name: 'Account Info',
    component: () => import(/* webpackChunkName: "account-view" */ '@/views/AccountInfo'),
  },
  {
    path: '/stake',
    name: 'Stake',
    component: () => import(/* webpackChunkName: "stake-view" */ '@/views/Delegate'),
  },
  {
    path: '/unstake',
    name: 'Unstake',
    component: () => import(/* webpackChunkName: "unstake-view" */ '@/views/Undelegate'),
  },
  {
    path: '/addbid',
    name: 'Add Bid',
    component: () => import(/* webpackChunkName: "addbid-view" */ '@/views/AddBid'),
  },
  {
    path: '/withdrawbid',
    name: 'Withdraw Bid',
    component: () => import(/* webpackChunkName: "withdrawbid-view" */ '@/views/WithdrawBid'),
  },
  {
    path: '/smartcontract',
    name: 'Send smart contract',
    component: () => import(/* webpackChunkName: "smartcontract-view" */ '@/views/SmartContract'),
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import(/* webpackChunkName: "faq-view" */ '@/views/FAQ'),
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import(/* webpackChunkName: "contact-view" */ '@/views/Contact'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
