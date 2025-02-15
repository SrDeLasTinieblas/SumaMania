import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { GameResultModal } from './components/GameResultModal';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const LEVEL_CONFIG = {
  1: { ops: ['+'], numberLimit: 2, time: null, title: 'Suma Simple', color: '#4CAF50' },
  2: { ops: ['+'], numberLimit: 3, time: null, title: 'Suma Triple', color: '#2196F3' },
  3: { ops: ['+', '-'], numberLimit: 2, time: null, title: 'Suma y Resta', color: '#9C27B0' },
  4: { ops: ['+', '-'], numberLimit: 3, time: 15, title: 'Contrarreloj', color: '#FF9800' },
  5: { ops: ['+', '-', '*'], numberLimit: 2, time: 15, title: 'Multiplicación', color: '#E91E63' },
  6: { ops: ['+', '-', '*', '/'], numberLimit: 2, time: 15, title: 'División', color: '#F44336' },
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

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startNewGame();
  }, [level]);

  useEffect(() => {
    if (LEVEL_CONFIG[level].time) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: LEVEL_CONFIG[level].time * 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [timeLeft]);

  const animateNumber = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };


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

    if (!numbers.includes(0)) {
        numbers.push(0);
    }

    const generateCombinations = (arr, size) => {
        const results = [];
        const helper = (prefix, remaining) => {
            if (prefix.length === size) {
                results.push([...prefix]);
                return;
            }
            for (let i = 0; i < remaining.length; i++) {
                helper([...prefix, remaining[i]], remaining.slice(i + 1));
            }
        };
        helper([], arr);
        return results;
    };

    const calculateResult = (nums, op) => {
        return nums.reduce((acc, num, index) => {
            if (index === 0) return num;
            if (op === "+") return acc + num;
            if (op === "-") return acc - num;
            if (op === "*") return acc * num;
            if (op === "/" && num !== 0) return acc / num;
            return acc;
        }, 0);
    };

    const subsets = generateCombinations(numbers, numberLimit);

    subsets.forEach(subset => {
        ops.forEach(op => {
            const result = calculateResult(subset, op);
            const diff = Math.abs(target - result);
            if (diff < bestDiff && result <= target) {
                bestDiff = diff;
                bestCombination = [...subset];
                bestOperation = op;
            }
        });
    });

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
    animateNumber();
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

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerCard}>
        <View style={styles.levelBadge}>
          <MaterialIcons name="emoji-events" size={24} color={LEVEL_CONFIG[level].color} />
          <Text style={[styles.levelText, { color: LEVEL_CONFIG[level].color }]}>
            Nivel {level}: {LEVEL_CONFIG[level].title}
          </Text>
        </View>
        
        <View style={styles.targetContainer}>
          <MaterialIcons name="track-changes" size={24} color="#2c3e50" />
          <Text style={styles.targetText}>{targetNumber}</Text>
        </View>

        {timeLeft !== null && (
          <View style={styles.timerContainer}>
            <MaterialIcons 
              name="timer" 
              size={24} 
              color={timeLeft <= 5 ? '#e74c3c' : '#2ecc71'} 
            />
            <Text style={[styles.timerText, timeLeft <= 5 && styles.timerWarning]}>
              {timeLeft}s
            </Text>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: progressWidth, 
                  backgroundColor: timeLeft <= 5 ? '#e74c3c' : '#2ecc71' 
                }
              ]} 
            />
          </View>
        )}
      </View>

      {/* Score Section */}
      <View style={styles.scoreBoard}>
        <View style={[styles.scoreCard, isPlayerTurn && styles.activeScoreCard]}>
          <FontAwesome5 name="user" size={24} color="#2c3e50" />
          <Text style={styles.scoreLabel}>Jugador</Text>
          <Text style={styles.scoreValue}>{playerScore}</Text>
        </View>
        <View style={[styles.scoreCard, !isPlayerTurn && styles.activeScoreCard]}>
          <FontAwesome5 name="robot" size={24} color="#2c3e50" />
          <Text style={styles.scoreLabel}>IA</Text>
          <Text style={styles.scoreValue}>{aiScore}</Text>
        </View>
      </View>

      {/* Operations Section */}
      {LEVEL_CONFIG[level].ops.length > 1 && (
        <View style={styles.operationsContainer}>
          {LEVEL_CONFIG[level].ops.map(op => (
            <TouchableOpacity
              key={op}
              style={[
                styles.opButton,
                selectedOp === op && styles.opButtonSelected,
                { backgroundColor: LEVEL_CONFIG[level].color }
              ]}
              onPress={() => setSelectedOp(op)}
            >
              <Text style={styles.opButtonText}>{op}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Numbers Grid */}
      <Animated.View 
        style={[
          styles.numbersGrid,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {numbers.map((number, index) => (
          number !== null && (
            <TouchableOpacity
              key={index}
              style={[
                styles.numberButton,
                !isPlayerTurn && styles.numberButtonDisabled,
                { backgroundColor: LEVEL_CONFIG[level].color }
              ]}
              onPress={() => handleNumberPress(number, index)}
              disabled={!isPlayerTurn}
            >
              <Text style={styles.numberText}>{number}</Text>
            </TouchableOpacity>
          )
        ))}
      </Animated.View>

      {/* Turn Indicator */}
      <View style={styles.turnIndicator}>
        <MaterialIcons 
          name={isPlayerTurn ? "arrow-forward" : "computer"} 
          size={24} 
          color={LEVEL_CONFIG[level].color} 
        />
        <Text style={[styles.turnText, { color: LEVEL_CONFIG[level].color }]}>
          {isPlayerTurn ? 'Tu turno' : 'Turno de la IA'}
        </Text>
      </View>

      {/* New Game Button */}
      <TouchableOpacity 
        style={[styles.newGameButton, { backgroundColor: LEVEL_CONFIG[level].color }]}
        onPress={startNewGame}
      >
        <MaterialIcons name="refresh" size={24} color="white" />
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
        levelColor={LEVEL_CONFIG[level].color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 35,
    backgroundColor: '#f8f9fa',
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  targetText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  timerWarning: {
    color: '#e74c3c',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: '#2ecc71',
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 5,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activeScoreCard: {
    transform: [{ scale: 1.05 }],
    ...Platform.select({
      ios: {
        shadowOpacity: 0.3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
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
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  opButtonSelected: {
    transform: [{ scale: 1.1 }],
    ...Platform.select({
      ios: {
        shadowOpacity: 0.3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  opButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  numberButton: {
    width: 60,
    height: 60,
    margin: 8,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  numberButtonDisabled: {
    opacity: 0.5,
  },
  numberText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  turnIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  turnText: {
    fontSize: 22,
    fontWeight: '500',
    marginLeft: 10,
  },
  newGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  newGameText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default Game;