// App.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { GameResultModal } from './components/GameResultModal';

const LEVEL_CONFIG = {
  1: { ops: ['+'], numberLimit: 2, time: null, title: 'Suma Simple' },
  2: { ops: ['+'], numberLimit: 3, time: null, title: 'Suma Triple' },
  3: { ops: ['+', '-'], numberLimit: 2, time: null, title: 'Suma y Resta' },
  4: { ops: ['+', '-'], numberLimit: 3, time: 15, title: 'Contrarreloj' },
  5: { ops: ['+', '-', '*'], numberLimit: 2, time: 15, title: 'Multiplicación' },
  6: { ops: ['+', '-', '*', '/'], numberLimit: 2, time: 15, title: 'División' },
};

const Game = () => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [selectedOp, setSelectedOp] = useState('+');
  const [level, setLevel] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bestPlay, setBestPlay] = useState(null);

  const borderAnimation = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    startNewGame();
  }, [level]);

  useEffect(() => {
    if (timeLeft === 5) {
      startBorderAnimation();
    }
    if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [timeLeft]);

  const startBorderAnimation = () => {
    Animated.sequence([
      Animated.timing(borderAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (timeLeft <= 5) {
        startBorderAnimation();
      }
    });
  };

  const startTimer = () => {
    if (LEVEL_CONFIG[level].time) {
      setTimeLeft(LEVEL_CONFIG[level].time);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
  };

  const handleTimeUp = () => {
    clearInterval(timerRef.current);
    setBestPlay(findBestCombination(
      numbers,
      targetNumber - playerScore,
      LEVEL_CONFIG[level].ops,
      LEVEL_CONFIG[level].numberLimit
    ));
    setShowModal(true);
  };

  const startNewGame = () => {
    const newTarget = Math.floor(Math.random() * 50) + 50;
    setTargetNumber(newTarget);
    generateNewNumbers();
    setPlayerScore(0);
    setAiScore(0);
    setSelectedNumbers([]);
    setIsPlayerTurn(true);
    setSelectedOp('+');
    if (LEVEL_CONFIG[level].time) {
      startTimer();
    } else {
      setTimeLeft(null);
    }
  };

  const generateNewNumbers = () => {
    const baseNumbers = Array.from({ length: 10 }, (_, i) => i);
    for (let i = baseNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [baseNumbers[i], baseNumbers[j]] = [baseNumbers[j], baseNumbers[i]];
    }
    setNumbers(baseNumbers);
  };

  const calculateResult = (nums, operation) => {
    let result = nums[0];
    for (let i = 1; i < nums.length; i++) {
      switch (operation) {
        case '+':
          result += nums[i];
          break;
        case '-':
          result -= nums[i];
          break;
        case '*':
          result *= nums[i];
          break;
        case '/':
          if (nums[i] === 0) return Infinity;
          result /= nums[i];
          break;
      }
    }
    return result;
  };

  const findBestCombination = (numbers, target, ops, numberLimit) => {
    let bestDiff = Infinity;
    let bestCombination = [];
    let bestOperation = null;
  
    const permute = (arr, size) => {
      if (size === 1) return arr.map(num => [num]);
      const permutations = [];
      arr.forEach((num, i) => {
        const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
        permute(remaining, size - 1).forEach(subPerm => {
          permutations.push([num, ...subPerm]);
        });
      });
      return permutations;
    };
  
    const generateCombinations = (nums, depth = 0) => {
      if (depth === numberLimit) return;
      for (let i = 1; i <= numberLimit; i++) {
        const subsets = permute(nums, i);
        subsets.forEach(subset => {
          ops.forEach(op => {
            const result = calculateResult(subset, op);
            const diff = Math.abs(target - result);
            if (diff < bestDiff && result <= target) {
              bestDiff = diff;
              bestCombination = subset;
              bestOperation = op;
            }
          });
        });
      }
    };
  
    generateCombinations(numbers);
    
    return {
      numbers: bestCombination,
      operation: bestOperation,
      result: calculateResult(bestCombination, bestOperation),
    };
  };

  const nextTurn = () => {
    clearInterval(timerRef.current);
    setSelectedNumbers([]);
    generateNewNumbers();
    setIsPlayerTurn(prev => !prev);
    if (LEVEL_CONFIG[level].time) {
      startTimer();
    }
  };

  const handleNumberPress = (number, index) => {
    if (!isPlayerTurn) return;

    const numberLimit = LEVEL_CONFIG[level].numberLimit;
    
    if (selectedNumbers.length < numberLimit) {
      setSelectedNumbers([...selectedNumbers, number]);
      const newNumbers = [...numbers];
      newNumbers[index] = null;
      setNumbers(newNumbers);

      if (selectedNumbers.length === numberLimit - 1) {
        setTimeout(() => {
          const result = calculateResult([...selectedNumbers, number], selectedOp);
          const newScore = playerScore + result;

          if (newScore > targetNumber || (selectedOp === '/' && !Number.isInteger(result))) {
            const best = findBestCombination(
              numbers,
              targetNumber - playerScore,
              LEVEL_CONFIG[level].ops,
              numberLimit
            );
            setBestPlay(best);
            setShowModal(true);
          } else if (newScore === targetNumber) {
            setPlayerScore(newScore);
            setShowModal(true);
          } else {
            setPlayerScore(newScore);
            nextTurn();
            setTimeout(() => {
              aiTurn();
            }, 1000);
          }
        }, 500);
      }
    }
  };
  
  const aiTurn = () => {
    const numberLimit = LEVEL_CONFIG[level].numberLimit;
    const availableNumbers = numbers.filter(n => n !== null);
    const aiSelected = [];
    const operation = LEVEL_CONFIG[level].ops[Math.floor(Math.random() * LEVEL_CONFIG[level].ops.length)];
    
    for (let i = 0; i < numberLimit; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      aiSelected.push(availableNumbers[randomIndex]);
      availableNumbers.splice(randomIndex, 1);
    }
  
    const result = calculateResult(aiSelected, operation);
    const newScore = aiScore + result;
  
    if (newScore > targetNumber || (operation === '/' && !Number.isInteger(result))) {
      setAiScore(newScore);
      setShowModal(true);
    } else if (newScore === targetNumber) {
      setAiScore(newScore);
      setBestPlay(null);
      setShowModal(true);
    } else {
      setAiScore(newScore);
      nextTurn();
    }
  };

  const borderColor = borderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#ff0000'],
  });

  return (
    <Animated.View style={[styles.container, {
      borderLeftColor: borderColor,
      borderRightColor: borderColor,
      borderLeftWidth: 5,
      borderRightWidth: 5,
    }]}>
      <View style={styles.header}>
        <Text style={styles.targetText}>Objetivo: {targetNumber}</Text>
        <Text style={styles.levelText}>Nivel {level}: {LEVEL_CONFIG[level].title}</Text>
        {timeLeft !== null && (
          <Text style={[styles.timerText, timeLeft <= 5 && styles.timerWarning]}>
            Tiempo: {timeLeft}s
          </Text>
        )}
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Jugador: {playerScore}</Text>
        <Text style={styles.scoreText}>IA: {aiScore}</Text>
      </View>

      {LEVEL_CONFIG[level].ops.length > 1 && (
        <View style={styles.operationsContainer}>
          {LEVEL_CONFIG[level].ops.map(op => (
            <TouchableOpacity
              key={op}
              style={[styles.opButton, selectedOp === op && styles.opButtonSelected]}
              onPress={() => setSelectedOp(op)}
            >
              <Text style={styles.opButtonText}>{op}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.numbersContainer}>
        {numbers.map((number, index) => (
          number !== null && (
            <TouchableOpacity
              key={index}
              style={[
                styles.numberButton,
                !isPlayerTurn && styles.numberButtonDisabled
              ]}
              onPress={() => handleNumberPress(number, index)}
              disabled={!isPlayerTurn}
            >
              <Text style={styles.numberText}>{number}</Text>
            </TouchableOpacity>
          )
        ))}
      </View>

      <Text style={styles.turnText}>
        {isPlayerTurn ? 'Tu turno' : 'Turno de la IA'}
      </Text>

      <TouchableOpacity style={styles.newGameButton} onPress={startNewGame}>
        <Text style={styles.newGameText}>Nuevo Juego</Text>
      </TouchableOpacity>
      
      <GameResultModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          if (playerScore === targetNumber) {
            setLevel(prev => Math.min(prev + 1, Object.keys(LEVEL_CONFIG).length));
          }
          startNewGame();
        }}
        isWin={playerScore === targetNumber}
        score={playerScore}
        targetNumber={targetNumber}
        bestPlay={bestPlay}
        level={level}
      />


    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  targetText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 20,
    color: '#34495e',
    marginBottom: 5,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  timerWarning: {
    color: '#e74c3c',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  operationsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  opButton: {
    width: 50,
    height: 50,
    margin: 5,
    backgroundColor: '#3498db',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  opButtonSelected: {
    backgroundColor: '#2980b9',
    transform: [{ scale: 1.1 }],
  },
  opButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  numbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  numberButton: {
    width: 60,
    height: 60,
    margin: 5,
    backgroundColor: '#3498db',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  numberButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  numberText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  turnText: {
    fontSize: 22,
    marginBottom: 20,
    color: '#2c3e50',
    fontWeight: '500',
  },
  newGameButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  newGameText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Game;

