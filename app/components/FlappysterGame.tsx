"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// Tambahkan tipe props
interface FlappysterGameProps {
  onScoreChange?: (score: number) => void;
}

const GAME_WIDTH = 360;
const GAME_HEIGHT = 600;
const BIRD_RADIUS = 20;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const PIPE_SPEED = 2.5;

type Pipe = { x: number; y: number; passed: boolean };

function getRandomPipeY() {
  const minY = 80;
  const maxY = GAME_HEIGHT - PIPE_GAP - minY;
  return Math.floor(Math.random() * (maxY - minY + 1)) + minY;
}

export default function FlappysterGame({ onScoreChange }: FlappysterGameProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  // Game state refs
  const birdY = useRef(GAME_HEIGHT / 2);
  const velocity = useRef(0);
  const pipes = useRef<Pipe[]>([
    { x: GAME_WIDTH + 100, y: getRandomPipeY(), passed: false },
    { x: GAME_WIDTH + 100 + (GAME_WIDTH / 2), y: getRandomPipeY(), passed: false },
  ]);
  const animationRef = useRef<number>();
  const gameStateRef = useRef({ score, gameOver, started });

  // Update game state ref whenever state changes
  useEffect(() => {
    gameStateRef.current = { score, gameOver, started };
  }, [score, gameOver, started]);

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setStarted(false);
    birdY.current = GAME_HEIGHT / 2;
    velocity.current = 0;
    pipes.current = [
      { x: GAME_WIDTH + 100, y: getRandomPipeY(), passed: false },
      { x: GAME_WIDTH + 100 + (GAME_WIDTH / 2), y: getRandomPipeY(), passed: false },
    ];
  }, []);

  const handleFlap = useCallback(() => {
    const currentState = gameStateRef.current;
    if (!currentState.started) {
      setStarted(true);
      setGameOver(false);
    }
    if (!currentState.gameOver) {
      velocity.current = FLAP_STRENGTH;
    } else {
      resetGame();
    }
  }, [resetGame]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        handleFlap();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleFlap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function drawBackground() {
      if (!ctx) return;
      const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      grad.addColorStop(0, "#dbeafe");
      grad.addColorStop(1, "#60a5fa");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(60 + i * 80, 80 + (i % 2) * 30, 30, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawPipes() {
      if (!ctx) return;
      ctx.save();
      pipes.current.forEach((pipe) => {
        ctx.fillStyle = "#2563eb";
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(pipe.x, pipe.y, PIPE_WIDTH, 16);
        ctx.fillStyle = "#2563eb";
        ctx.fillRect(pipe.x, pipe.y + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - pipe.y - PIPE_GAP);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(pipe.x, pipe.y + PIPE_GAP - 16, PIPE_WIDTH, 16);
      });
      ctx.restore();
    }

    function drawBird() {
      if (!ctx) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(GAME_WIDTH / 4, birdY.current, BIRD_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = "#2563eb";
      ctx.shadowColor = "#60a5fa";
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(GAME_WIDTH / 4 + 8, birdY.current - 6, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(GAME_WIDTH / 4 + 9, birdY.current - 6, 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#2563eb";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(GAME_WIDTH / 4 + 18, birdY.current);
      ctx.lineTo(GAME_WIDTH / 4 + 28, birdY.current + 3);
      ctx.lineTo(GAME_WIDTH / 4 + 18, birdY.current + 6);
      ctx.closePath();
      ctx.fillStyle = "#fbbf24";
      ctx.fill();
      ctx.restore();
    }

    function drawScore() {
      if (!ctx) return;
      ctx.save();
      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 6;
      const currentScore = gameStateRef.current.score.toString();
      ctx.strokeText(currentScore, GAME_WIDTH / 2, 80);
      ctx.fillText(currentScore, GAME_WIDTH / 2, 80);
      ctx.restore();
    }

    function drawOverlay() {}

    function checkCollision() {
      if (birdY.current - BIRD_RADIUS < 0 || birdY.current + BIRD_RADIUS > GAME_HEIGHT) {
        return true;
      }
      for (const pipe of pipes.current) {
        if (
          GAME_WIDTH / 4 + BIRD_RADIUS > pipe.x &&
          GAME_WIDTH / 4 - BIRD_RADIUS < pipe.x + PIPE_WIDTH
        ) {
          if (
            birdY.current - BIRD_RADIUS < pipe.y ||
            birdY.current + BIRD_RADIUS > pipe.y + PIPE_GAP
          ) {
            return true;
          }
        }
      }
      return false;
    }

    function update() {
      const currentState = gameStateRef.current;
      
      if (!currentState.started || currentState.gameOver) {
        drawBackground();
        drawPipes();
        drawBird();
        drawScore();
        drawOverlay();
        return;
      }

      // Update physics
      velocity.current += GRAVITY;
      birdY.current += velocity.current;

      // Update pipes
      pipes.current.forEach((pipe) => {
        pipe.x -= PIPE_SPEED;
      });

      // Reset pipes that go off screen
      pipes.current.forEach((pipe) => {
        if (pipe.x + PIPE_WIDTH < 0) {
          pipe.x = GAME_WIDTH + 40;
          pipe.y = getRandomPipeY();
          pipe.passed = false;
        }
      });

      // Check for scoring
      pipes.current.forEach((pipe) => {
        if (
          !pipe.passed &&
          pipe.x + PIPE_WIDTH < GAME_WIDTH / 4 - BIRD_RADIUS
        ) {
          pipe.passed = true;
          setScore(prevScore => prevScore + 1);
        }
      });

      // Check collision
      if (checkCollision()) {
        setGameOver(true);
        setStarted(false);
        return;
      }

      // Draw everything
      drawBackground();
      drawPipes();
      drawBird();
      drawScore();
      drawOverlay();
    }

    function loop() {
      update();
      animationRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []); // Empty dependency array - game loop runs independently

  // Tambahkan efek untuk memanggil onScoreChange saat skor berubah
  useEffect(() => {
    if (onScoreChange) onScoreChange(score);
  }, [score, onScoreChange]);

  // State untuk tombol Play Again & Back
  // Hapus useEffect terkait showOverlayButtons

  return (
    <div className="flex flex-col items-center justify-center w-full h-full select-none relative">
      {/* Judul di atas canvas saat game belum dimulai */}
      {!started && !gameOver && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
          <div className="text-4xl font-extrabold text-blue-800 mb-2 drop-shadow">Flappyster</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        onClick={handleFlap}
        className="rounded-2xl shadow-lg border-4 border-blue-300 bg-blue-200 cursor-pointer"
        style={{ maxWidth: 360, maxHeight: 600, width: "100%", height: "auto" }}
      />
      {/* Overlay tombol setelah game over */}
      {gameOver && (
        <div className="absolute top-1/2 left-1/2 flex flex-col items-center gap-3 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="mb-2 text-xl font-bold text-blue-800">Skor Akhir: {score}</div>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold text-lg transition mb-2"
            onClick={resetGame}
          >
            Play Again
          </button>
          <button
            className="px-6 py-2 bg-white text-blue-700 border border-blue-400 rounded-lg shadow hover:bg-blue-50 font-semibold text-lg transition"
            onClick={() => router.push("/")}
          >
            Back
          </button>
        </div>
      )}
      <div className="mt-4 text-blue-700 text-lg font-semibold">
        Skor: {score}
      </div>
    </div>
  );
}