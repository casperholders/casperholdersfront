<template>
  <v-container
    class="flex-column justify-center container__small"
    fill-height
  >
    <v-card
      class="align-center rounded-xl secondary"
      width="100%"
    >
      <v-card-title class="align-center">
        <v-avatar
          color="primary"
          size="52"
        >
          <v-icon>mdi-help</v-icon>
        </v-avatar>
        <v-card-title
          class="pl-4"
          style="word-break: break-word"
        >Frequently Asked Questions
        </v-card-title>
      </v-card-title>
      <v-card-text>
        <h2 class="pb-3">Staking / Unstaking / Delegating / Undelegating ?</h2>
        <p class="text-body-1 pl-9">
          Staking is the same as Delegating.<br />
          Unstaking is the same as Undelegating.<br />
          In the Casper Network you Delegate (Stake) your token to a Validator (Node Operator).<br />
          A node operator is responsible to maintain correctly the node.<br />
          By staking your tokens on a validator node you will help securing the Network and you will receive
          rewards.<br />
        </p>
        <h2 class="pb-3">Staking Rewards</h2>
        <p class="text-body-1 pl-9">
          Staking reward are payed every ERA (1 ERA is approximately 2 hours actually).<br />
          Once you have delegated your tokens you will receive the rewards at the end of the next ERA.<br />
          Actually there's no way to track easily the APY, but given the feedback from the community it's actually 20%~
          (Per year).
        </p>
        <h2 class="pb-3">Unstaking Delay</h2>
        <p class="text-body-1 pl-9">
          Once you have unstaked your tokens they will become available in your wallet in 7 ERA<br />
          (1 ERA is approximately 2 hours actually so approximately 14h)<br />
        </p>
        <h2 class="pb-3">Security & Risk</h2>
        <p class="text-body-1 pl-9">
          You can unstake at any time<br />
          The Validator doesn't have access to your tokens.<br />
          Even if the Validator goes offline or is ejected from the auction you can unstake at any time.<br />
        </p>
        <h2 class="pb-3">Who are you ?</h2>
        <p class="text-body-1 pl-9">
          A member of the community ! You can find me on the Casper discord with this id : killian#7405<br />
          Feel free to ping me in an appropriate channel I will try to answer your questions !<br />
          On the more personal note I'm a DevOps Engineer working in a French Bank.<br />
          I'm always happy to discuss tech with any Ops or Dev :D<br />
        </p>
        <h2 class="pb-3">Any other questions ?</h2>
        <p class="text-body-1 pl-9">Feel free to contact me on discord or through the contact page !</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
/**
 * FAQ View
 */
export default {
    name: 'FAQ',
}
</script>
