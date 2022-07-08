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
    component: () => import('@/views/root/Home'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/root/Settings'),
  },
  {
    path: '/balance',
    name: 'Balance',
    component: () => import('@/views/account/Balance'),
  },
  {
    path: '/security',
    name: 'Security',
    component: () => import('@/views/account/Security'),
  },
  {
    path: '/multisig/:deployHash',
    name: 'Multisig',
    component: () => import('@/views/multisig/MultiSig'),
  },
  {
    path: '/transfer',
    name: 'Transfer',
    component: () => import('@/views/account/Transfer'),
  },
  {
    path: '/account',
    name: 'Account Info',
    component: () => import('@/views/account/AccountInfo'),
  },
  {
    path: '/stake',
    name: 'Stake',
    component: () => import('@/views/staking/Delegate'),
  },
  {
    path: '/unstake',
    name: 'Unstake',
    component: () => import('@/views/staking/Undelegate'),
  },
  {
    path: '/addbid',
    name: 'Add Bid',
    component: () => import('@/views/validators/AddBid'),
  },
  {
    path: '/withdrawbid',
    name: 'Withdraw Bid',
    component: () => import('@/views/validators/WithdrawBid'),
  },
  {
    path: '/smartcontract',
    name: 'Send smart contract',
    component: () => import('@/views/developers/SmartContract'),
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('@/views/others/FAQ'),
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/others/Contact'),
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/root/Privacy'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;
