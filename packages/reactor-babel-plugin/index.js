const COMPONENT_MODULE_PATTERN = /^@extjs\/reactor\/(modern|classic)$/;

module.exports = function(babel) {
    const t = babel.types;

    return {
        visitor: {
            ImportDeclaration: function(path) {
                const { node } = path;

                if (node.source && node.source.type === 'StringLiteral' && node.source.value.match(COMPONENT_MODULE_PATTERN)) {
                    const declarations = [];
                    let transform = false;

                    node.specifiers.forEach(spec => {
                        const imported = spec.imported.name;
                        const local = spec.local.name;

                        declarations.push(
                            t.variableDeclaration('const', [
                                t.variableDeclarator(
                                    t.identifier(local),
                                    t.callExpression(
                                        t.identifier('reactify'),
                                        [t.stringLiteral(imported.toLowerCase().replace(/_/g, '-'))]
                                    )
                                )
                            ])
                        );
                    });

                    if (declarations.length) {
                        if (!path.scope.hasBinding('reactify')) {
                            path.insertBefore(
                                t.importDeclaration(
                                    [t.importSpecifier(t.identifier('reactify'), t.identifier('reactify'))],
                                    t.stringLiteral('@extjs/reactor')
                                )
                            )
                        }

                        path.replaceWithMultiple(declarations);
                    }
                }
            }
        }
    }
}