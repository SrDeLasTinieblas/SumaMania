// First, add these imports at the top of your file
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';

export const GameResultModal = ({ visible, onClose, isWin, score, targetNumber, bestPlay }) => {
  const [scaleAnim] = React.useState(new Animated.Value(0));
  
  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

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
            { transform: [{ scale: scaleAnim }] },
            isWin ? styles.modalWin : styles.modalLose
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isWin ? styles.textWin : styles.textLose]}>
              {isWin ? '¡Felicitaciones!' : '¡Fin del Juego!'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isWin 
                ? '¡Has alcanzado el objetivo!' 
                : 'No te preocupes, ¡inténtalo de nuevo!'}
            </Text>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Tu puntaje:</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Objetivo:</Text>
              <Text style={styles.scoreValue}>{targetNumber}</Text>
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
              {isWin ? 'Siguiente Nivel' : 'Intentar de Nuevo'}
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
    borderLeftWidth: 6,
    borderLeftColor: '#2ecc71',
  },
  modalLose: {
    borderLeftWidth: 6,
    borderLeftColor: '#e74c3c',
  },
  modalHeader: {
    alignItems: 'center',
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
    fontSize: 14,
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
