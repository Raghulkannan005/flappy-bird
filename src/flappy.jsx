import React, { useState, useEffect, useRef } from 'react';

const FlappyBird = () => {
  const BIRD_SIZE = 40;
  const GAME_WIDTH = 600;
  const GAME_HEIGHT = 600;
  const PIPE_WIDTH = 50;
  const PIPE_GAP = 200;
  const GRAVITY = 2.5;
  const JUMP_STRENGTH = 75;

  const [birdPosition, setBirdPosition] = useState(250);
  const [gameStarted, setGameStarted] = useState(false);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gameRef = useRef(null);

  const handleJump = () => {
    if (!gameStarted || gameOver) {
      startGame();
      return;
    }
    
    setBirdPosition(prev => Math.max(0, prev - JUMP_STRENGTH));
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setBirdPosition(250);
    setScore(0);
    generatePipes();
  };

  const generatePipes = () => {
    const newPipes = [];
    for (let i = 0; i < 3; i++) {
      const randomHeight = Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP));
      newPipes.push({
        left: GAME_WIDTH + i * 300,
        topHeight: randomHeight,
        bottomHeight: GAME_HEIGHT - randomHeight - PIPE_GAP
      });
    }
    setPipes(newPipes);
  };


  useEffect(() => {
    let animationFrame;
    
    const gameLoop = () => {
      if (!gameStarted || gameOver) return;

      setBirdPosition(prev => {
        const newPosition = prev + GRAVITY;
        
        if (newPosition >= GAME_HEIGHT - BIRD_SIZE) {
          setGameOver(true);
          return prev;
        }
        return newPosition;
      });

      setPipes(prevPipes => {
        const updatedPipes = prevPipes.map(pipe => ({
          ...pipe,
          left: pipe.left - 5
        })).filter(pipe => pipe.left > -PIPE_WIDTH);

        const currentPipe = updatedPipes[0];
        if (currentPipe &&
            currentPipe.left < BIRD_SIZE &&
            (birdPosition < currentPipe.topHeight ||
             birdPosition + BIRD_SIZE > GAME_HEIGHT - currentPipe.bottomHeight)) {
          setGameOver(true);
        }

        if (updatedPipes.length < 3) {
          const randomHeight = Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP));
          updatedPipes.push({
            left: GAME_WIDTH,
            topHeight: randomHeight,
            bottomHeight: GAME_HEIGHT - randomHeight - PIPE_GAP
          });
        }

        return updatedPipes;
      });
    };

    if (gameStarted && !gameOver) {
      animationFrame = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [gameStarted, gameOver, birdPosition, GRAVITY, GAME_HEIGHT, BIRD_SIZE]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  return (
    <div
      ref={gameRef}
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        border: '2px solid black',
        overflow: 'hidden',
        position: 'relative'
      }}
      onClick={handleJump}
    >
      {/* Bird */}
      <div
        style={{
          position: 'absolute',
          width: BIRD_SIZE,
          height: BIRD_SIZE,
          backgroundColor: 'yellow',
          borderRadius: '50%',
          left: 50,
          top: birdPosition
        }}
      />

      {/* Pipes */}
      {pipes.map((pipe, index) => (
        <React.Fragment key={index}>
          {/* Top pipe */}
          <div
            style={{
              position: 'absolute',
              width: PIPE_WIDTH,
              height: pipe.topHeight,
              backgroundColor: 'green',
              left: pipe.left,
              top: 0
            }}
          />
          {/* Bottom pipe */}
          <div 
            style={{
              position: 'absolute',
              width: PIPE_WIDTH,
              height: pipe.bottomHeight,
              backgroundColor: 'green',
              left: pipe.left,
              bottom: 0
            }}
          />
        </React.Fragment>
      ))}

      {/* Score and game state */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          fontSize: '20px'
        }}
      >
        Score: {score}
        {gameOver && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Game Over! Click to restart
          </div>
        )}
      </div>
    </div>
  );
};

export default FlappyBird;