<template>
  <v-container fill-height class="px-0">
    <v-row justify="center">
      <v-col md="auto">
        <v-card
            style="background: #00012a" class="align-center rounded-xl">
          <v-card-title class="justify-center text-h2">
            Frequently Asked Questions
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-card
          style="background: #00012a; width: auto;" class="align-center rounded-xl">
        <v-card-title>Staking / Unstacking / Delegating / Undelegating ?</v-card-title>
        <v-card-text class="text-body-1 ml-9">
          Staking is the same as Delegating.<br/>
          Unstacking is the same as Undelegating.<br/>
          In the Casper Network you Delegate (Stake) your token to a Validator (Node Operator).<br/>
          A node operator is responsible to maintain correctly the node.<br/>
          By staking your tokens on a validator node you will help the validators to secure the Network and you will receive rewards<br/>
        </v-card-text>
        <v-card-title>Staking Rewards</v-card-title>
        <v-card-text class="text-body-1 ml-9">
          Staking reward are payed every ERA (1 ERA is approximately 2 hours actually)<br/>
          Once you have delegated your tokens you will receive the rewards at the end of the next ERA.<br/>
          Actually there's no way to track easily the APY, but given the feedback from the community it's actually 20%~ (Per year).
        </v-card-text>
        <v-card-title>Unstacking Delay</v-card-title>
        <v-card-text class="text-body-1 ml-9">
          Once you have unstacked your tokens they will become available in your wallet in 7 ERA (1 ERA is approximately 2 hours actually so approximately 14h)<br/>
        </v-card-text>
        <v-card-title>Security & Risk</v-card-title>
        <v-card-text class="text-body-1 ml-9">
          You can unstack at any time<br/>
          The Validator doesn't have access to your tokens.<br/>
          Even if the Validator goes offline or is ejected from the auction you can unstack at any time.<br/>
        </v-card-text>
        <v-card-title>Who are you ?</v-card-title>
        <v-card-text class="text-body-1 ml-9">
          A member of the community ! You can find me on the Casper discord with this id : killian#7405<br/>
          Feel free to ping me in an appropriate channel I will try to answer your questions as fast as possible !<br/>
          On the more personal note I'm a DevOps Engineer working in a French Bank. I'm always happy to discuss tech with any Ops or Dev :D<br/>
        </v-card-text>
        <v-card-title>Why the code isn't open source ?</v-card-title>
        <v-card-text class="text-body-1 ml-9">
          I will try to release the full source code in the two months after the official release of the staking UI from Casper Network.<br/>
          You will be able to give feedback on github and make pull request to add new features if you want !<br/>
        </v-card-text>
        <v-card-title>Any other questions ?</v-card-title>
        <v-card-text class="text-body-1 ml-9">
          Feel free to contact me on discord or through the contact page !
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'FAQ',

  data: () => ({})
}
</script>
