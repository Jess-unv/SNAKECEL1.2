
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { myColors } from "../styles/Colors";

type Cell = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const BOARD_SIZE = 15;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BOARD_PADDING = 20;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - BOARD_PADDING * 2) / BOARD_SIZE);
const BOARD_PIXEL = CELL_SIZE * BOARD_SIZE;

function randomCell(exclude: Cell[] = []): Cell {
  let c: Cell;
  do {
    c = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (exclude.some((s) => s.x === c.x && s.y === c.y));
  return c;
}

export default function SnakeGame() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [snake, setSnake] = useState<Cell[]>([
    { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) },
  ]);
  const [food, setFood] = useState<Cell>(() => randomCell(snake));
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150); // velocidad inicial
  const [gameOver, setGameOver] = useState(false);

  const directionRef = useRef<Direction>("RIGHT");
  const snakeRef = useRef<Cell[]>(snake);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      moveSnake();
    }, speed);
    return () => clearInterval(id);
  }, [gameOver, food, speed]);

  const moveSnake = useCallback(() => {
    const current = snakeRef.current;
    const head = current[0];
    let newHead: Cell = { x: head.x, y: head.y };

    if (directionRef.current === "UP") newHead.y -= 1;
    else if (directionRef.current === "DOWN") newHead.y += 1;
    else if (directionRef.current === "LEFT") newHead.x -= 1;
    else if (directionRef.current === "RIGHT") newHead.x += 1;

    // bordes (aparece del otro lado)
    if (newHead.x < 0) newHead.x = BOARD_SIZE - 1;
    if (newHead.x >= BOARD_SIZE) newHead.x = 0;
    if (newHead.y < 0) newHead.y = BOARD_SIZE - 1;
    if (newHead.y >= BOARD_SIZE) newHead.y = 0;

    // choca consigo mismo
    if (current.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      setGameOver(true);
      return;
    }

    const ate = newHead.x === food.x && newHead.y === food.y;
    const newSnake = [newHead, ...current];
    if (!ate) {
      newSnake.pop();
    } else {
      setScore((s) => s + 1);

      // cambiar tema al comer
      setTheme((prev) => (prev === "light" ? "dark" : "light"));

      // cada comida hace que la snake sea más rápida
      setSpeed((sp) => Math.max(50, sp - 10));

      setFood(randomCell(newSnake));
    }

    setSnake(newSnake);
    snakeRef.current = newSnake;
  }, [food, setTheme]);

  function changeDirection(newDir: Direction) {
    const opposite: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };
    if (opposite[newDir] === directionRef.current) return;
    directionRef.current = newDir;
  }

  function resetGame() {
    const start = [{ x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) }];
    setSnake(start);
    snakeRef.current = start;
    directionRef.current = "RIGHT";
    setFood(randomCell(start));
    setScore(0);
    setSpeed(150); // reset velocidad
    setGameOver(false);
  }

  const isLight = theme === "light";
  const boardBg = isLight ? myColors.boardLight : myColors.boardDark;
  const snakeColor = isLight ? myColors.snakeLight : myColors.snakeDark;
  const textColor = isLight ? myColors.textLight : myColors.textDark;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>Snake</Text>
      <Text style={[styles.info, { color: textColor }]}>Puntos: {score}</Text>

      <View
        style={[
          styles.board,
          { width: BOARD_PIXEL, height: BOARD_PIXEL, backgroundColor: boardBg },
        ]}
      >
        {/* Comida */}
        <View
          style={[
            styles.cell,
            {
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: myColors.food,
            },
          ]}
        />
        {/* Snake */}
        {snake.map((seg, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              {
                left: seg.x * CELL_SIZE,
                top: seg.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                backgroundColor: snakeColor,
              },
            ]}
          />
        ))}
      </View>

      {/* Controles estilo cruceta */}
      <View style={styles.controls}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => changeDirection("UP")} style={styles.btn}>
            <Text style={styles.btnText}>▲</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => changeDirection("LEFT")} style={styles.btn}>
            <Text style={styles.btnText}>◀</Text>
          </TouchableOpacity>
          <View style={{ width: 50 }} />
          <TouchableOpacity onPress={() => changeDirection("RIGHT")} style={styles.btn}>
            <Text style={styles.btnText}>▶</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => changeDirection("DOWN")} style={styles.btn}>
            <Text style={styles.btnText}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay al perder */}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={{ color: "#fff", fontSize: 22, marginBottom: 10 }}>Perdiste</Text>
          <TouchableOpacity onPress={resetGame} style={styles.restart}>
            <Text style={{ fontWeight: "bold" }}>Reiniciar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold" },
  info: { marginBottom: 10, fontSize: 16 },
  board: { position: "relative", borderWidth: 2, borderColor: "#333" },
  cell: { position: "absolute", borderRadius: 3 },
  controls: { marginTop: 20, alignItems: "center" },
  row: { flexDirection: "row", justifyContent: "center", marginVertical: 5 },
  btn: {
    backgroundColor: "#2ECC71",
    paddingVertical: 25,
    paddingHorizontal: 25,
    marginHorizontal: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  btnText: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  overlay: {
    position: "absolute",
    top: "40%",
    left: "20%",
    right: "20%",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
  },
  restart: {
    marginTop: 10,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
});
