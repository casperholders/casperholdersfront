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
    component: () => import(/* webpackChunkName: "home-view" */ '@/views/root/Home'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import(/* webpackChunkName: "settings-view" */ '@/views/root/Settings'),
  },
  {
    path: '/balance',
    name: 'Balance',
    component: () => import(/* webpackChunkName: "balance-view" */ '@/views/account/Balance'),
  },
  {
    path: '/security',
    name: 'Security',
    component: () => import(/* webpackChunkName: "balance-view" */ '@/views/account/Security'),
  },
  {
    path: '/multisig/:deployHash',
    name: 'Multisig',
    component: () => import(/* webpackChunkName: "balance-view" */ '@/views/multisig/MultiSig'),
  },
  {
    path: '/transfer',
    name: 'Transfer',
    component: () => import(/* webpackChunkName: "transfer-view" */ '@/views/account/Transfer'),
  },
  {
    path: '/account',
    name: 'Account Info',
    component: () => import(/* webpackChunkName: "account-view" */ '@/views/account/AccountInfo'),
  },
  {
    path: '/stake',
    name: 'Stake',
    component: () => import(/* webpackChunkName: "stake-view" */ '@/views/staking/Delegate'),
  },
  {
    path: '/unstake',
    name: 'Unstake',
    component: () => import(/* webpackChunkName: "unstake-view" */ '@/views/staking/Undelegate'),
  },
  {
    path: '/addbid',
    name: 'Add Bid',
    component: () => import(/* webpackChunkName: "addbid-view" */ '@/views/validators/AddBid'),
  },
  {
    path: '/withdrawbid',
    name: 'Withdraw Bid',
    component: () => import(/* webpackChunkName: "withdrawbid-view" */ '@/views/validators/WithdrawBid'),
  },
  {
    path: '/smartcontract',
    name: 'Send smart contract',
    component: () => import(/* webpackChunkName: "smartcontract-view" */ '@/views/developers/SmartContract'),
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import(/* webpackChunkName: "faq-view" */ '@/views/others/FAQ'),
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import(/* webpackChunkName: "contact-view" */ '@/views/others/Contact'),
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import(/* webpackChunkName: "contact-view" */ '@/views/root/Privacy'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;
