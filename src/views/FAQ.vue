<template>
  <v-container
    fill-height
    class="flex-column justify-center px-0"
  >
    <v-card class="align-center rounded-xl secondary">
      <v-card-title class="align-center">
        <v-avatar
          color="primary"
          size="52"
        >
          <v-icon>mdi-wallet</v-icon>
        </v-avatar>
        <v-card-title class="pl-4">Frequently Asked Questions</v-card-title>
      </v-card-title>
      <v-card-text>
        <h2 class="pb-3">Staking / Unstacking / Delegating / Undelegating ?</h2>
        <p class="text-body-1 pl-9">
          Staking is the same as Delegating.<br />
          Unstacking is the same as Undelegating.<br />
          In the Casper Network you Delegate (Stake) your token to a Validator (Node Operator).<br />
          A node operator is responsible to maintain correctly the node.<br />
          By staking your tokens on a validator node you will help securing the Network and you will receive rewards.<br />
        </p>
        <h2 class="pb-3">Staking Rewards</h2>
        <p class="text-body-1 pl-9">
          Staking reward are payed every ERA (1 ERA is approximately 2 hours actually).<br />
          Once you have delegated your tokens you will receive the rewards at the end of the next ERA.<br />
          Actually there's no way to track easily the APY, but given the feedback from the community it's actually 20%~
          (Per year).
        </p>
        <h2 class="pb-3">Unstacking Delay</h2>
        <p class="text-body-1 pl-9">
          Once you have unstacked your tokens they will become available in your wallet in 7 ERA<br/>
          (1 ERA is approximately 2 hours actually so approximately 14h)<br />
        </p>
        <h2 class="pb-3">Security & Risk</h2>
        <p class="text-body-1 pl-9">
          You can unstack at any time<br />
          The Validator doesn't have access to your tokens.<br />
          Even if the Validator goes offline or is ejected from the auction you can unstack at any time.<br />
        </p>
        <h2 class="pb-3">Who are you ?</h2>
        <p class="text-body-1 pl-9">
          A member of the community ! You can find me on the Casper discord with this id : killian#7405<br />
          Feel free to ping me in an appropriate channel I will try to answer your questions !<br />
          On the more personal note I'm a DevOps Engineer working in a French Bank.<br/>
          I'm always happy to discuss tech with any Ops or Dev :D<br />
        </p>
        <h2 class="pb-3">Why the code isn't open source ?</h2>
        <p class="text-body-1 pl-9">
          I have opened a grant proposal on the DEVxDAO platform. If the grant is accepted I will release the source code ASAP.<br/>
          Otherwise I will try to release the full source code in the comings months,<br/>
          after the official release of the staking UI from Casper Network.<br />
          You will be able to give feedback on github and make pull request to add new features if you want !<br />
        </p>
        <h2 class="pb-3">Any other questions ?</h2>
        <p class="text-body-1 pl-9">Feel free to contact me on discord or through the contact page !</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
    name: 'FAQ',

    data: () => ({})
}
</script>
