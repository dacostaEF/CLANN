import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import ClanStorage from '../clans/ClanStorage';
import MessagesManager from '../messages/MessagesManager';
import { getCurrentTotemId } from '../crypto/totemStorage';
import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import DateSeparator from '../components/chat/DateSeparator';
import TypingIndicator from '../components/chat/TypingIndicator';
import { chatTheme } from '../styles/chatTheme';

export default function ClanChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { clanId, clan: clanFromParams } = route.params || {};
  
  const [clan, setClan] = useState(clanFromParams || null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [currentTotemId, setCurrentTotemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  
  const flatListRef = useRef(null);

  // Inicialização
  useEffect(() => {
    // Inicializar MessagesManager
    MessagesManager.init().catch(error => {
      console.error('Erro ao inicializar MessagesManager:', error);
    });

    // Carregar totemId atual
    const loadTotemId = async () => {
      try {
        const totemId = await getCurrentTotemId();
        setCurrentTotemId(totemId);
      } catch (error) {
        console.error('Erro ao carregar totemId:', error);
      }
    };
    loadTotemId();

    // Se já recebeu o CLANN via params, usa diretamente
    if (clanFromParams) {
      setClan(clanFromParams);
      return;
    }
    
    // Caso contrário, busca no banco
    if (clanId) {
      loadClan();
    }
  }, [clanId, clanFromParams]);

  // Carregar mensagens quando o CLANN estiver disponível
  useEffect(() => {
    if (clan?.id) {
      loadMessages();
    }
  }, [clan?.id, loadMessages]);

  const loadClan = async () => {
    try {
      const data = await ClanStorage.getClanById(clanId);
      setClan(data);
      if (data?.members) {
        setMemberCount(data.members);
      }
    } catch (err) {
      console.error('Erro ao carregar CLANN:', err);
    }
  };

  // Atualizar contagem de membros quando o CLANN mudar
  useEffect(() => {
    if (clan?.members) {
      setMemberCount(clan.members);
    }
  }, [clan]);

  // Carregar mensagens
  const loadMessages = useCallback(async () => {
    if (!clan?.id) return;
    
    try {
      setLoading(true);
      const msgs = await MessagesManager.getMessages(clan.id);
      setMessages(msgs);
      
      // Scroll para o final após um pequeno delay
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  }, [clan?.id]);

  // Recarregar mensagens ao focar na tela
  useFocusEffect(
    useCallback(() => {
      if (clan?.id) {
        loadMessages();
      }
    }, [clan?.id, loadMessages])
  );

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!messageText.trim() || !clan?.id || !currentTotemId) return;
    
    try {
      await MessagesManager.addMessage(
        clan.id,
        currentTotemId,
        messageText.trim()
      );
      
      setMessageText('');
      await loadMessages(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Não foi possível enviar a mensagem');
    }
  };

  // Verificar se deve mostrar nome do autor
  const shouldShowAuthor = useCallback((currentMsg, prevMsg) => {
    if (!prevMsg || prevMsg.type !== 'message') return true;
    if (currentMsg.authorTotem !== prevMsg.authorTotem) return true;
    
    // Mostrar se passou mais de 5 minutos
    const timeDiff = currentMsg.timestamp - prevMsg.timestamp;
    return timeDiff > 5 * 60 * 1000;
  }, []);

  // Agrupar mensagens por data e preparar para renderização
  const groupedMessages = useMemo(() => {
    if (!messages.length) return [];

    const grouped = [];
    let currentDate = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.timestamp);
      const dateKey = `${msgDate.getFullYear()}-${msgDate.getMonth()}-${msgDate.getDate()}`;

      // Adicionar separador de data se necessário
      if (currentDate !== dateKey) {
        currentDate = dateKey;
        grouped.push({
          type: 'date',
          timestamp: msg.timestamp,
          id: `date-${dateKey}`,
        });
      }

      // Adicionar mensagem
      grouped.push({
        type: 'message',
        ...msg,
      });
    });

    return grouped;
  }, [messages]);

  const renderItem = ({ item, index }) => {
    if (item.type === 'date') {
      return <DateSeparator timestamp={item.timestamp} />;
    }

    if (item.type === 'message') {
      const isMyMessage = item.authorTotem === currentTotemId;
      const prevItem = groupedMessages[index + 1];
      const showAuthor = shouldShowAuthor(item, prevItem);

      return (
        <MessageBubble
          message={item.message}
          isSent={isMyMessage}
          authorName={!isMyMessage ? `Totem ${item.authorTotem.slice(0, 8)}...` : null}
          timestamp={item.timestamp}
          showAuthor={showAuthor && !isMyMessage}
          showAvatar={false}
        />
      );
    }

    return null;
  };

  return (
    <LinearGradient
      colors={chatTheme.backgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header Premium */}
        <ChatHeader
          clan={clan}
          onBack={() => navigation.goBack()}
          memberCount={memberCount}
        />

        {/* Área de mensagens */}
        <View style={styles.messagesContainer}>
          {messages.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💬</Text>
              <Text style={styles.emptyStateTitle}>Chat do CLANN</Text>
              <Text style={styles.emptyStateText}>
                Este é o início do chat do CLANN "{clan?.name || ''}"
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Envie a primeira mensagem para começar a conversa
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={groupedMessages}
              keyExtractor={(item) => item.id?.toString() || `item-${item.timestamp}`}
              inverted={true}
              renderItem={renderItem}
              contentContainerStyle={styles.messagesListContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                // Scroll automático para última mensagem
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
            />
          )}
        </View>

        {/* Campo de entrada premium */}
        <MessageInput
          value={messageText}
          onChangeText={setMessageText}
          onSend={handleSendMessage}
          placeholder="Digite uma mensagem…"
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesListContent: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: chatTheme.textPrimary,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: chatTheme.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: chatTheme.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});


