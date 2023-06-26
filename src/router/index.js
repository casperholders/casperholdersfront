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
    path: '/account',
    name: 'Account',
    component: () => import('@/views/root/AccountView'),
  },
  {
    path: '/balance',
    name: 'Balance',
    component: () => import('@/views/account/BalanceView'),
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
    path: '/stake/:validator?',
    name: 'Staking operations',
    component: () => import('@/views/staking/StakingView'),
  },
  {
    path: '/unstake/:validator?',
    name: 'Unstaking operations',
    component: () => import('@/views/staking/StakingView'),
  },
  {
    path: '/nft',
    name: 'NFTs',
    component: () => import('@/views/account/NFTView'),
  },
  {
    path: '/marketplace',
    name: 'Marketplace',
    component: () => import('@/views/account/MarketplaceView'),
  },
  {
    path: '/addbid',
    name: 'Add Bid',
    component: () => import('@/views/validators/ValidatorsView'),
  },
  {
    path: '/withdrawbid',
    name: 'Withdraw Bid',
    component: () => import('@/views/validators/ValidatorsView'),
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
