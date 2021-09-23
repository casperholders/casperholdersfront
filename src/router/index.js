import AccountInfo from '@/views/AccountInfo';
import AddBid from '@/views/AddBid';
import Balance from '@/views/Balance';
import Contact from '@/views/Contact';
import Delegate from '@/views/Delegate';
import FAQ from '@/views/FAQ';
import Home from '@/views/Home';
import SmartContract from '@/views/SmartContract';
import Transfer from '@/views/Transfer';
import Undelegate from '@/views/Undelegate';
import WithdrawBid from '@/views/WithdrawBid';
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
    component: Home,
  },
  {
    path: '/balance',
    name: 'Balance',
    component: Balance,
  },
  {
    path: '/transfer',
    name: 'Transfer',
    component: Transfer,
  },
  {
    path: '/account',
    name: 'Account Info',
    component: AccountInfo,
  },
  {
    path: '/stake',
    name: 'Stake',
    component: Delegate,
  },
  {
    path: '/unstake',
    name: 'Unstake',
    component: Undelegate,
  },
  {
    path: '/addbid',
    name: 'Add Bid',
    component: AddBid,
  },
  {
    path: '/withdrawbid',
    name: 'Withdraw Bid',
    component: WithdrawBid,
  },
  {
    path: '/smartcontract',
    name: 'Send smart contract',
    component: SmartContract,
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQ,
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
