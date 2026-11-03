'use strict';

const { astHelpers } = require('./stylesheet');
const { getScope } = require('./variable');

function getStyleReference(node, context) {
  const reference = astHelpers.getPotentialStyleReferenceFromMemberExpression(node);
  if (!reference) {
    return;
  }

  let scope = getScope(context, node);
  let variable;
  while (scope && !variable) {
    variable = scope.set.get(node.object.name);
    scope = scope.upper;
  }

  const declaration = variable && variable.defs.find((definition) => definition.type === 'Variable');
  const init = declaration && declaration.node.init;
  const isVariantAlias = init
    && init.type === 'CallExpression'
    && init.callee.type === 'MemberExpression'
    && !init.callee.computed
    && init.callee.property.name === 'useVariants'
    && init.callee.object.type === 'Identifier';

  if (!isVariantAlias || variable.references.some((ref) => ref.isWrite() && !ref.init)) {
    return reference;
  }

  return [init.callee.object.name, node.property.name].join('.');
}

module.exports = getStyleReference;
