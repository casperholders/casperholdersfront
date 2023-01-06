export default function (cy, args) {
  for (const [key, value] of Object.entries(args)) {
    cy.get(`[data-cy=arg-panel-${key}]`)
      .should('have.length', 1)
      .click();
    if (value instanceof Object) {
      switch (value.clType) {
        case 'map':
          cy.get(`[data-cy=arg-panel-content-${key}]`)
            .find('[data-cy=CLValueMapInput]')
            .find('[data-cy="mapKeyType"]')
            .type(value.keyType);
          cy.get('.v-list-item__title').contains(value.keyType).click();
          cy.get(`[data-cy=arg-panel-content-${key}]`)
            .find('[data-cy=CLValueMapInput]')
            .find('[data-cy="mapValueType"]')
            .type(value.valueType);
          cy.get('.v-list-item__title').contains(value.keyType).click();
          break;
        default:
          cy.log(`${value.clType} CY Helper not implemented`);
          break;
      }
    } else {
      cy.get(`[data-cy=arg-panel-content-${key}]`)
        .find('[data-cy=CLValueRawInput]')
        .type(value);
    }
  }
}
