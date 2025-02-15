import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';

export const GameResultModal = ({ visible, onClose, isWin, score, targetNumber, bestPlay, level }) => {
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [rotateAnim] = React.useState(new Animated.Value(0));
  
  React.useEffect(() => {
    if (visible) {
      if (isWin) {
        // Animación de victoria con rotación y escala
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      } else {
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      }
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            { 
              transform: [
                { scale: scaleAnim },
                { rotate: isWin ? spin : '0deg' }
              ]
            },
            isWin ? styles.modalWin : styles.modalLose
          ]}
        >
          {isWin && (
            <View style={styles.ribbonContainer}>
              <View style={styles.ribbon}>
                <Text style={styles.ribbonText}>¡NIVEL COMPLETADO!</Text>
              </View>
            </View>
          )}

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isWin ? styles.textWin : styles.textLose]}>
              {isWin ? '¡Felicitaciones!' : '¡Fin del Juego!'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isWin 
                ? '¡Has alcanzado el objetivo perfectamente!' 
                : 'No te preocupes, ¡inténtalo de nuevo!'}
            </Text>
          </View>

          {isWin && (
            <View style={styles.victoryStats}>
              <View style={styles.starContainer}>
                <Text style={styles.starEmoji}>⭐</Text>
                <Text style={styles.victoryLabel}>¡Victoria Perfecta!</Text>
              </View>
              <Text style={styles.levelComplete}>Nivel {level} Completado</Text>
              <View style={styles.achievementBox}>
                <Text style={styles.achievementTitle}>Logros desbloqueados:</Text>
                <Text style={styles.achievementText}>🎯 Precisión Matemática</Text>
                <Text style={styles.achievementText}>🏆 Maestro del Cálculo</Text>
              </View>
            </View>
          )}

          <View style={styles.modalBody}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Tu puntaje:</Text>
              <Text style={[styles.scoreValue, isWin && styles.winningScore]}>{score}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Objetivo:</Text>
              <Text style={[styles.scoreValue, isWin && styles.winningScore]}>{targetNumber}</Text>
            </View>
          </View>

          {!isWin && bestPlay && (
            <View style={styles.bestPlayContainer}>
              <Text style={styles.bestPlayTitle}>Mejor jugada posible:</Text>
              <View style={styles.bestPlayCard}>
                <Text style={styles.bestPlayNumbers}>
                  {bestPlay.numbers.join(` ${bestPlay.operation} `)} = {bestPlay.result}
                </Text>
                <Text style={styles.bestPlayExplanation}>
                  Esta combinación te habría dado {bestPlay.result} puntos,
                  llevándote a un total de {score + bestPlay.result} puntos.
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.modalButton, isWin ? styles.buttonWin : styles.buttonLose]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>
              {isWin ? '¡Siguiente Nivel!' : 'Intentar de Nuevo'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalWin: {
    borderWidth: 3,
    borderColor: '#2ecc71',
    backgroundColor: '#ffffff',
  },
  modalLose: {
    borderLeftWidth: 6,
    borderLeftColor: '#e74c3c',
  },
  ribbonContainer: {
    position: 'absolute',
    top: -15,
    width: '100%',
    alignItems: 'center',
  },
  ribbon: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    elevation: 4,
  },
  ribbonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalHeader: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textWin: {
    color: '#2ecc71',
  },
  textLose: {
    color: '#e74c3c',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  victoryStats: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  victoryLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1c40f',
  },
  levelComplete: {
    fontSize: 18,
    color: '#2ecc71',
    fontWeight: '600',
    marginBottom: 15,
  },
  achievementBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 15,
    color: '#2c3e50',
    marginVertical: 3,
  },
  modalBody: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  winningScore: {
    color: '#2ecc71',
  },
  bestPlayContainer: {
    width: '100%',
    marginBottom: 20,
  },
  bestPlayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  bestPlayCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  bestPlayNumbers: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  bestPlayExplanation: {
    fontSize:
    14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    marginTop: 10,
  },
  buttonWin: {
    backgroundColor: '#2ecc71',
  },
  buttonLose: {
    backgroundColor: '#e74c3c',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});