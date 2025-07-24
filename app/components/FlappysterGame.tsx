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
const PIPE_GAP = 170;
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
    // Play sound effect
    const audio = new Audio("/flap.mp3");
    audio.currentTime = 0;
    audio.play();

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

  // Preload image
  const birdImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new window.Image();
    img.src = "/flap.png";
    birdImgRef.current = img;
  }, []);

  // Preload background image
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new window.Image();
    img.src = "/bg.png";
    bgImgRef.current = img;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina-friendly canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    canvas.style.width = GAME_WIDTH + "px";
    canvas.style.height = GAME_HEIGHT + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    function drawBackground() {
      if (!ctx) return;
      // Gambar background image jika sudah siap
      const bgImg = bgImgRef.current;
      if (bgImg && bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
      } else {
        // Fallback: gradient biru
        const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        grad.addColorStop(0, "#dbeafe");
        grad.addColorStop(1, "#60a5fa");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      }
      // (Opsional) Tambahkan awan kartun dari kode jika ingin
    }

    function drawPipes() {
      if (!ctx) return;
      ctx.save();
      const capHeight = 16;
      const capWidth = PIPE_WIDTH + 12;
      const capRadius = 6;
      pipes.current.forEach((pipe) => {
        // BADAN PIPA ATAS
        ctx.fillStyle = "#3b82f6";
        ctx.strokeStyle = "#1e40af";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(pipe.x, 0, PIPE_WIDTH, pipe.y);
        ctx.fill();
        ctx.stroke();

        // BIBIR PIPA ATAS (kotak rounded)
        ctx.beginPath();
        const capX = pipe.x + PIPE_WIDTH / 2 - capWidth / 2;
        const capY = pipe.y - capHeight / 2;
        ctx.moveTo(capX + capRadius, capY);
        ctx.lineTo(capX + capWidth - capRadius, capY);
        ctx.quadraticCurveTo(capX + capWidth, capY, capX + capWidth, capY + capRadius);
        ctx.lineTo(capX + capWidth, capY + capHeight - capRadius);
        ctx.quadraticCurveTo(capX + capWidth, capY + capHeight, capX + capWidth - capRadius, capY + capHeight);
        ctx.lineTo(capX + capRadius, capY + capHeight);
        ctx.quadraticCurveTo(capX, capY + capHeight, capX, capY + capHeight - capRadius);
        ctx.lineTo(capX, capY + capRadius);
        ctx.quadraticCurveTo(capX, capY, capX + capRadius, capY);
        ctx.closePath();
        ctx.fillStyle = "#60a5fa";
        ctx.fill();
        ctx.stroke();

        // BADAN PIPA BAWAH
        ctx.fillStyle = "#3b82f6";
        ctx.strokeStyle = "#1e40af";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(pipe.x, pipe.y + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - pipe.y - PIPE_GAP);
        ctx.fill();
        ctx.stroke();

        // BIBIR PIPA BAWAH (kotak rounded)
        ctx.beginPath();
        const capYB = pipe.y + PIPE_GAP - capHeight / 2;
        ctx.moveTo(capX + capRadius, capYB);
        ctx.lineTo(capX + capWidth - capRadius, capYB);
        ctx.quadraticCurveTo(capX + capWidth, capYB, capX + capWidth, capYB + capRadius);
        ctx.lineTo(capX + capWidth, capYB + capHeight - capRadius);
        ctx.quadraticCurveTo(capX + capWidth, capYB + capHeight, capX + capWidth - capRadius, capYB + capHeight);
        ctx.lineTo(capX + capRadius, capYB + capHeight);
        ctx.quadraticCurveTo(capX, capYB + capHeight, capX, capYB + capHeight - capRadius);
        ctx.lineTo(capX, capYB + capRadius);
        ctx.quadraticCurveTo(capX, capYB, capX + capRadius, capYB);
        ctx.closePath();
        ctx.fillStyle = "#60a5fa";
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    }

    function drawBird() {
      if (!ctx) return;
      ctx.save();
      const img = birdImgRef.current;
      const birdW = 64;
      const birdH = 64;
      // Hitung sudut rotasi berdasarkan velocity
      const maxUp = -25 * Math.PI / 180;
      const maxDown = 55 * Math.PI / 180;
      let angle = (velocity.current / 10) * maxDown;
      angle = Math.max(maxUp, Math.min(maxDown, angle));
      if (img && img.complete) {
        ctx.translate(GAME_WIDTH / 4, birdY.current);
        ctx.rotate(angle);
        ctx.drawImage(
          img,
          -birdW / 2,
          -birdH / 2,
          birdW,
          birdH
        );
      } else {
        ctx.translate(GAME_WIDTH / 4, birdY.current);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.arc(0, 0, BIRD_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = "#2563eb";
        ctx.shadowColor = "#60a5fa";
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(8, -6, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(9, -6, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#2563eb";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(28, 3);
        ctx.lineTo(18, 6);
        ctx.closePath();
        ctx.fillStyle = "#fbbf24";
        ctx.fill();
      }
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
        className="w-full max-w-[360px] h-auto max-h-[80vh] rounded-2xl shadow-lg border-4 border-blue-300 bg-blue-200 cursor-pointer mx-auto"
        style={{ display: "block" }}
      />
      {/* Overlay tombol setelah game over */}
      {gameOver && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[90vw] max-w-xs">
          <div className="flex flex-col items-center gap-2 px-4 py-4 bg-white/90 rounded-2xl shadow-xl border border-blue-200">
            <div className="text-base font-bold text-blue-800">Last Score:</div>
            <div className="text-2xl font-extrabold text-blue-700 mb-2">{score}</div>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold text-lg transition mb-2 w-full"
              onClick={resetGame}
            >
              Play Again
            </button>
            <button
              className="px-6 py-2 bg-white text-blue-700 border border-blue-400 rounded-lg shadow hover:bg-blue-50 font-semibold text-lg transition w-full"
              onClick={() => router.push("/")}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}