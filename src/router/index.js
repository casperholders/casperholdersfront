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
    component: () => import('@/views/root/HomeView'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/root/SettingsView'),
  },
  {
    path: '/balance',
    name: 'Balance',
    component: () => import('@/views/account/NewBalanceView'),
  },
  {
    path: '/security',
    name: 'Security',
    component: () => import('@/views/account/SecurityView'),
  },
  {
    path: '/multisig/:deployHash',
    name: 'Multisig',
    component: () => import('@/views/multisig/MultiSigView'),
  },
  {
    path: '/transfer/:token?',
    name: 'Transfer',
    component: () => import('@/views/account/TransferView'),
  },
  {
    path: '/account',
    name: 'Account Info',
    component: () => import('@/views/account/AccountInfoView'),
  },
  {
    path: '/stake/:validator?',
    name: 'Stake',
    component: () => import('@/views/staking/DelegateView'),
  },
  {
    path: '/unstake/:validator?',
    name: 'Unstake',
    component: () => import('@/views/staking/UndelegateView'),
  },
  {
    path: '/addbid',
    name: 'Add Bid',
    component: () => import('@/views/validators/AddBidView'),
  },
  {
    path: '/withdrawbid',
    name: 'Withdraw Bid',
    component: () => import('@/views/validators/WithdrawBidView'),
  },
  {
    path: '/smartcontract',
    name: 'Send smart contract',
    component: () => import('@/views/developers/SmartContractView'),
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('@/views/others/FAQView'),
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/others/ContactView'),
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/root/PrivacyView'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;
