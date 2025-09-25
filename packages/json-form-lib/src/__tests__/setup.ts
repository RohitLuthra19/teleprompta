// Mock React Native components for testing
const MockButton = "Button";

jest.mock("react-native", () => ({
  View: "View",
  Text: "Text",
  TextInput: "TextInput",
  Button: MockButton,
  ScrollView: "ScrollView",
  TouchableOpacity: "TouchableOpacity",
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (styles: any) => styles,
  },
}));

// Global test setup
// Set __DEV__ for tests (already declared in React Native environment)
(global as any).__DEV__ = false;

// This export makes the file a module, allowing global declarations
export { };

