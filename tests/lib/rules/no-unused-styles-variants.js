'use strict';

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-unused-styles');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run('no-unused-styles with useVariants', rule, {
  valid: [
    {
      code: `
        const styles = StyleSheet.create({
          text: {
            variants: {
              size: {
                small: { fontSize: 12 },
                large: { fontSize: 18 }
              }
            }
          }
        });
        function Example({ size = 'small' }) {
          const variantStyles = styles.useVariants({ size });
          return <Text style={variantStyles.text} />;
        }
      `,
    },
    {
      code: `
        function Example() {
          const selected = typography.useVariants({ variant: 'body' });
          return <Text style={selected.text} />;
        }
        const typography = StyleSheet.create(theme => ({
          text: {
            color: theme.colors.primary,
            variants: {
              variant: {
                body: { fontSize: 16 },
                heading: { fontSize: 24, fontWeight: '700' }
              }
            }
          }
        }));
      `,
    },
    {
      code: `
        const styles = StyleSheet.create({
          button: {
            borderRadius: 8,
            variants: {
              size: {
                small: { paddingHorizontal: 12, paddingVertical: 8 },
                large: { paddingHorizontal: 20, paddingVertical: 12 }
              },
              disabled: {
                true: { opacity: 0.4 },
                false: { opacity: 1 }
              }
            }
          },
          pressed: { opacity: 0.7 }
        });
        function Example({ size = 'small', disabled = false }) {
          const selected = styles.useVariants({ size, disabled });
          return <Pressable style={({ pressed }) => [
            selected.button,
            pressed && selected.pressed
          ]} />;
        }
      `,
    },
    {
      code: `
        const firstStyles = StyleSheet.create({
          button: {
            variants: { size: { small: { padding: 8 }, large: { padding: 16 } } }
          }
        });
        const secondStyles = StyleSheet.create({
          button: {
            variants: { tone: { subtle: { opacity: 0.6 }, strong: { opacity: 1 } } }
          }
        });
        function First() {
          const selected = firstStyles.useVariants({ size: 'small' });
          return <View style={selected.button} />;
        }
        function Second() {
          const selected = secondStyles.useVariants({ tone: 'subtle' });
          return <View style={selected.button} />;
        }
      `,
    },
    {
      code: `
        const styles = StyleSheet.create({
          text: {
            variants: { size: { small: { fontSize: 12 }, large: { fontSize: 18 } } }
          }
        });
        function BabelPluginExample() {
          styles.useVariants({ size: 'small' });
          return <Text style={styles.text} />;
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        const styles = StyleSheet.create({
          button: {
            borderRadius: 8,
            variants: {
              size: {
                small: { paddingHorizontal: 12, paddingVertical: 8 },
                large: { paddingHorizontal: 20, paddingVertical: 12 }
              }
            }
          },
          pressed: { opacity: 0.7 },
          unused: { marginTop: 8 }
        });
        function Button({ size = 'small', onPress, children }) {
          const selected = styles.useVariants({ size });
          return (
            <Pressable
              onPress={onPress}
              style={({ pressed }) => [selected.button, pressed && selected.pressed]}
            >
              <Text>{children}</Text>
            </Pressable>
          );
        }
      `,
      errors: [{ message: 'Unused style detected: styles.unused' }],
    },
    {
      code: `
        const styles = StyleSheet.create({
          text: {
            variants: { size: { small: { fontSize: 12 }, large: { fontSize: 18 } } }
          }
        });
        function Example() {
          const selected = styles.useVariants({ size: 'small' });
          function Child({ selected }) {
            return <Text style={selected.text} />;
          }
          return <Child selected={{ text: { fontSize: 20 } }} />;
        }
      `,
      errors: [{ message: 'Unused style detected: styles.text' }],
    },
    {
      code: `
        const styles = StyleSheet.create({
          text: {
            variants: { size: { small: { fontSize: 12 }, large: { fontSize: 18 } } }
          }
        });
        function Example() {
          let selected = styles.useVariants({ size: 'small' });
          selected = { text: { fontSize: 20 } };
          return <Text style={selected.text} />;
        }
      `,
      errors: [{ message: 'Unused style detected: styles.text' }],
    },
    {
      code: `
        const styles = StyleSheet.create({ text: { fontSize: 12 } });
        const styleFactory = {
          create: () => ({ text: { fontSize: 20 } })
        };
        function Example() {
          const selected = styleFactory.create();
          return <Text style={selected.text} />;
        }
      `,
      errors: [{ message: 'Unused style detected: styles.text' }],
    },
    {
      code: `
        const firstStyles = StyleSheet.create({
          button: {
            variants: { size: { small: { padding: 8 }, large: { padding: 16 } } }
          }
        });
        const secondStyles = StyleSheet.create({
          button: {
            variants: { tone: { subtle: { opacity: 0.6 }, strong: { opacity: 1 } } }
          },
          container: { flex: 1 }
        });
        function First() {
          const selected = firstStyles.useVariants({ size: 'small' });
          return <View style={selected.button} />;
        }
        function Second() {
          const selected = secondStyles.useVariants({ tone: 'subtle' });
          return <View style={selected.container} />;
        }
      `,
      errors: [{ message: 'Unused style detected: secondStyles.button' }],
    },
    {
      code: `
        const styles = StyleSheet.create({
          text: {
            variants: { size: { small: { fontSize: 12 }, large: { fontSize: 18 } } }
          }
        });
        function Example() {
          styles.useVariants({ size: 'small' });
          return <Text />;
        }
      `,
      errors: [{ message: 'Unused style detected: styles.text' }],
    },
  ],
});
