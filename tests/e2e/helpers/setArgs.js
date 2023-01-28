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
          cy.get('.v-list-item__title').contains(value.valueType).click();
          break;
        case 'list':
          cy.get(`[data-cy=arg-panel-content-${key}]`)
            .find('[data-cy=CLValueListInput]')
            .find('[data-cy="listType"]')
            .type(value.type);
          cy.get('.v-list-item__title').contains(value.type).click();
          break;
        case 'option':
          cy.get(`[data-cy=arg-panel-content-${key}]`)
            .find('[data-cy=CLValueOptionInput]')
            .find('[data-cy="CLValueOptionType"]')
            .type(value.type);
          cy.get('.v-list-item__title').contains(value.type).click();
          if (value.none) {
            cy.get(`[data-cy=arg-panel-content-${key}]`)
              .find('[data-cy=CLValueOptionInput]')
              .find('[data-cy="CLValueOptionNone"]').click({force: true});
          }
          if (value.value) {
            cy.get(`[data-cy=arg-panel-content-${key}]`)
              .find('[data-cy=CLValueRawInput]')
              .type(`{selectall}{del}${value.value}`);
          }
          break;
        default:
          cy.log(`${value.clType} CY Helper not implemented`);
          break;
      }
    } else {
      cy.get(`[data-cy=arg-panel-content-${key}]`)
        .find('[data-cy=CLValueRawInput]')
        .type(`{selectall}{del}${value}`);
    }
  }
}
