import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Balance from "@/views/Balance";
import FAQ from "@/views/FAQ";
import Contact from "@/views/Contact";
import TransferNew from "@/views/TransferNew";
import DelegateNew from "@/views/DelegateNew";
import UndelegateNew from "@/views/UndelegateNew";
import AddBid from "@/views/AddBid";
import WithdrawBid from "@/views/WithdrawBid";
import SmartContract from "@/views/SmartContract";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/balance',
    name: 'Balance',
    component: Balance
  },
  {
    path: '/transfer',
    name: 'Transfer',
    component: TransferNew
  },
  {
    path: '/stake',
    name: 'Stake',
    component: DelegateNew
  },
  {
    path: '/unstake',
    name: 'Unstake',
    component: UndelegateNew
  },
  {
    path: '/addbid',
    name: 'Add Bid',
    component: AddBid
  },
  {
    path: '/withdrawbid',
    name: 'Withdraw Bid',
    component: WithdrawBid
  },
  {
    path: '/smartcontract',
    name: 'Send smart contract',
    component: SmartContract
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQ
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
