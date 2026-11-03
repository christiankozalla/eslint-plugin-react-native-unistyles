# Detect unused StyleSheet rules in React components
When working on a component over a longer period of time, you could end up with unused StyleSheet rules that slipped in over time but are forgotten as you continue to improve your UX/UI design.

## Rule Details

The following patterns are considered warnings:

```js
const styles = StyleSheet.create({
  text: {}
});

const Hello = React.createClass({
  render: function() {
    return <Text>Hello {this.props.name}</Text>;
  }
});
```

The following patterns are not considered warnings:
```js
const styles = StyleSheet.create({
  name: {}
});

const Hello = React.createClass({
  render: function() {
    return <Text style={styles.name}>Hello {this.props.name}</Text>;
  }
});
```
The most common case.

```js
const styles = StyleSheet.create({
  text: {}
});
const Hello = React.createClass({
  propTypes: {
    textStyle: Text.propTypes.style
  },
  render: function() {
    return <Text style={[styles.text, textStyle]}>Hello {this.props.name}</Text>;
  }
});
```
Style rules referenced in a Style array are marked as used.

```js
const styles = StyleSheet.create({
  name: {}
});

const Hello = React.createClass({
  render: function() {
    return <Text textStyle={styles.name}>Hello {this.props.name}</Text>;
  }
});
```
Style rules referenced in a conditional and logical expressions are marked as used.

```js
const styles = StyleSheet.create({
  name: {}
});

const Hello = React.createClass({
  getInitialState: function() {
    return {condition: true};
  },

  render: function() {
    return <Text textStyle={[this.state.condition && styles.name]}>
      Hello {this.props.name}
    </Text>;
  }
});
```

```js
const styles = StyleSheet.create({
  name: {},
  alternate: {},
});

const Hello = React.createClass({
  getInitialState: function() {
    return {condition: true};
  },

  render: function() {
    return <Text textStyle={[this.state.condition ? styles.name : styles.alternate]}>
      Hello {this.props.name}
    </Text>;
  }
});
```
Rules are also marked as used when they are used in tags that contain the word `style`.

```js
const styles = StyleSheet.create({
  name: {},
  welcome: {}
});
const Hello = React.createClass({
  render: function() {
    return <Text style={styles.name}>Hello {this.props.name}</Text>;
  }
});
const Welcome = React.createClass({
  render: function() {
    return <Text style={styles.welcome}>Welcome</Text>;
  }
});
```
Usage is tracked over multiple components in the same file.

Unistyles 3.8's Metro integration returns a scoped stylesheet from `useVariants`.
References through that returned variable also mark styles as used, including
references inside callbacks:

```jsx
import { Pressable, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    variants: {
      size: {
        small: { paddingHorizontal: 12, paddingVertical: 8 },
        large: { paddingHorizontal: 20, paddingVertical: 12 },
      },
    },
  },
  pressed: { opacity: 0.7 },
  unused: { marginTop: 8 },
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
```

The `size` prop selects the button's padding. Both `button` and `pressed` are
used through `selected`, so only `styles.unused` is reported.
Aliases are resolved in their lexical scope,
so separate components can use the same alias name for different stylesheets.

```js
const styles = StyleSheet.create({
  text: {}
});
```
There should be at least one component, so centralized `StyleSheets` are not checked for unused rules.
