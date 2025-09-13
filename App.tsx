// App.tsx
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, StatusBar } from "react-native";
import { ThemeContext, ThemeType } from "./src/context/ThemeContext";
import SnakeGame from "./src/screens/SnakeGame";
import { myColors } from "./src/styles/Colors";

export default function App() {
  const [theme, setTheme] = useState<ThemeType>("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme === "light" ? myColors.light : myColors.dark },
        ]}
      >
        <StatusBar barStyle={theme === "light" ? "dark-content" : "light-content"} />
        <SnakeGame />
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
