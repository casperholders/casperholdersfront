export default function (cy, activeKey, isMultisig) {
  const msg = {
    detail: {
      isUnlocked: true,
      isConnected: true,
      activeKey: activeKey.toLowerCase(),
    },
  };
  if (isMultisig) {
    msg.detail.isMultisig = isMultisig;
  }
  console.log(msg);
  cy.window().then((win) => {
    win.dispatchEvent(new CustomEvent('signer:connected', msg));
  });
}
