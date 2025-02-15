// App.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const Game = () => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [level, setLevel] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newTarget = Math.floor(Math.random() * 50) + 50;
    setTargetNumber(newTarget);
    generateNewNumbers();
    setPlayerScore(0);
    setAiScore(0);
    setSelectedNumbers([]);
    setIsPlayerTurn(true);
  };

  const generateNewNumbers = () => {
    // Crear array con números del 0 al 9
    const baseNumbers = Array.from({ length: 10 }, (_, i) => i);
    
    // Mezclar el array usando el algoritmo Fisher-Yates
    for (let i = baseNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [baseNumbers[i], baseNumbers[j]] = [baseNumbers[j], baseNumbers[i]];
    }
    
    setNumbers(baseNumbers);
  };

  const handleNumberPress = (number, index) => {
    if (!isPlayerTurn) return;

    const numberLimit = level > 2 ? 3 : 2;
    
    if (selectedNumbers.length < numberLimit) {
      setSelectedNumbers([...selectedNumbers, number]);
      const newNumbers = [...numbers];
      newNumbers[index] = null;
      setNumbers(newNumbers);

      if (selectedNumbers.length === numberLimit - 1) {
        setTimeout(() => {
          const sum = [...selectedNumbers, number].reduce((a, b) => a + b, 0);
          const newScore = playerScore + sum;

          if (newScore > targetNumber) {
            Alert.alert('¡Perdiste!', 'Te has pasado del número objetivo');
            startNewGame();
          } else if (newScore === targetNumber) {
            Alert.alert('¡Ganaste!', '¡Has alcanzado el número objetivo!');
            startNewGame();
          } else {
            setPlayerScore(newScore);
            setSelectedNumbers([]);
            generateNewNumbers();
            setIsPlayerTurn(false);
            setTimeout(aiTurn, 1000);
          }
        }, 500);
      }
    }
  };

  const aiTurn = () => {
    const numberLimit = level > 2 ? 3 : 2;
    const availableNumbers = numbers.filter(n => n !== null);
    const aiSelected = [];
    
    // Estrategia simple de la IA
    for (let i = 0; i < numberLimit; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      aiSelected.push(availableNumbers[randomIndex]);
      availableNumbers.splice(randomIndex, 1);
    }

    const sum = aiSelected.reduce((a, b) => a + b, 0);
    const newScore = aiScore + sum;

    if (newScore > targetNumber) {
      Alert.alert('¡Ganaste!', 'La IA se ha pasado del número objetivo');
      startNewGame();
    } else if (newScore === targetNumber) {
      Alert.alert('¡Perdiste!', 'La IA ha alcanzado el número objetivo');
      startNewGame();
    } else {
      setAiScore(newScore);
      generateNewNumbers();
      setIsPlayerTurn(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.targetText}>Objetivo: {targetNumber}</Text>
      <Text style={styles.levelText}>Nivel: {level}</Text>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Jugador: {playerScore}</Text>
        <Text style={styles.scoreText}>IA: {aiScore}</Text>
      </View>

      <View style={styles.numbersContainer}>
        {numbers.map((number, index) => (
          number !== null && (
            <TouchableOpacity
              key={index}
              style={styles.numberButton}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  targetText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  levelText: {
    fontSize: 18,
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
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
    backgroundColor: '#007AFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: 'white',
    fontSize: 24,
  },
  turnText: {
    fontSize: 20,
    marginBottom: 20,
  },
  newGameButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
  },
  newGameText: {
    color: 'white',
    fontSize: 18,
  },
});

export default Game;