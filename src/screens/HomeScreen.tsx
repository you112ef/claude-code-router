import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  Surface,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useApp} from '../contexts/AppContext';
import {NodeJSService} from '../services/NodeJSService';

const HomeScreen = () => {
  const {state, dispatch} = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // الاستماع لتغييرات حالة الخدمة
    const unsubscribe = NodeJSService.getInstance().onStatusChange((status) => {
      dispatch({type: 'UPDATE_SERVICE_STATUS', payload: status});
    });

    // جلب الحالة الحالية
    loadServiceStatus();

    return unsubscribe;
  }, [dispatch]);

  const loadServiceStatus = async () => {
    try {
      const status = await NodeJSService.getInstance().getStatus();
      dispatch({type: 'UPDATE_SERVICE_STATUS', payload: status});
    } catch (error) {
      console.error('فشل في جلب حالة الخدمة:', error);
    }
  };

  const handleStartService = async () => {
    setIsLoading(true);
    try {
      await NodeJSService.getInstance().startService();
      Toast.show({
        type: 'success',
        text1: 'تم بدء الخدمة',
        text2: 'Claude Code Router يعمل الآن',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'فشل في بدء الخدمة',
        text2: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopService = async () => {
    Alert.alert(
      'إيقاف الخدمة',
      'هل أنت متأكد من إيقاف Claude Code Router؟',
      [
        {text: 'إلغاء', style: 'cancel'},
        {
          text: 'إيقاف',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await NodeJSService.getInstance().stopService();
              Toast.show({
                type: 'info',
                text1: 'تم إيقاف الخدمة',
                text2: 'Claude Code Router متوقف الآن',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'فشل في إيقاف الخدمة',
                text2: (error as Error).message,
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServiceStatus();
    setRefreshing(false);
  };

  const getStatusColor = () => {
    if (state.serviceStatus.isRunning) return '#4CAF50';
    if (state.serviceStatus.error) return '#F44336';
    return '#FF9800';
  };

  const getStatusText = () => {
    if (state.serviceStatus.isRunning) return 'يعمل';
    if (state.serviceStatus.error) return 'خطأ';
    return 'متوقف';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* بطاقة حالة الخدمة */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <View style={styles.statusInfo}>
                <Title>حالة الخدمة</Title>
                <View style={styles.statusRow}>
                  <Chip
                    icon={() => (
                      <Icon
                        name={state.serviceStatus.isRunning ? 'play-arrow' : 'stop'}
                        size={16}
                        color="white"
                      />
                    )}
                    style={[styles.statusChip, {backgroundColor: getStatusColor()}]}
                    textStyle={styles.chipText}>
                    {getStatusText()}
                  </Chip>
                  {state.serviceStatus.isRunning && (
                    <Text style={styles.portText}>
                      المنفذ: {state.serviceStatus.port}
                    </Text>
                  )}
                </View>
              </View>
              <IconButton
                icon="refresh"
                mode="contained"
                onPress={loadServiceStatus}
                disabled={isLoading}
              />
            </View>

            {state.serviceStatus.error && (
              <Surface style={styles.errorSurface}>
                <Icon name="error" size={20} color="#F44336" />
                <Text style={styles.errorText}>{state.serviceStatus.error}</Text>
              </Surface>
            )}

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={handleStartService}
                disabled={state.serviceStatus.isRunning || isLoading}
                loading={isLoading}
                icon="play-arrow"
                style={styles.actionButton}>
                بدء الخدمة
              </Button>
              
              <Button
                mode="contained"
                onPress={handleStopService}
                disabled={!state.serviceStatus.isRunning || isLoading}
                loading={isLoading}
                icon="stop"
                buttonColor="#F44336"
                style={styles.actionButton}>
                إيقاف الخدمة
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* بطاقة معلومات الإعدادات */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>معلومات الإعدادات</Title>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>النموذج الافتراضي:</Text>
              <Text style={styles.infoValue}>
                {state.config.OPENAI_MODEL || 'غير محدد'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>عدد المقدمين:</Text>
              <Text style={styles.infoValue}>
                {state.config.Providers.length}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الإضافات المفعلة:</Text>
              <Text style={styles.infoValue}>
                {state.config.usePlugins.length}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الذكاء المحلي:</Text>
              <Chip
                icon={state.localAI.isEnabled ? 'check' : 'close'}
                style={[
                  styles.aiChip,
                  {backgroundColor: state.localAI.isEnabled ? '#4CAF50' : '#FF9800'}
                ]}
                textStyle={{color: 'white'}}>
                {state.localAI.isEnabled ? 'مفعل' : 'معطل'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* بطاقة معلومات النظام */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>معلومات التطبيق</Title>
            <Paragraph>
              Claude Code Router for Android يتيح لك توجيه طلبات Claude Code 
              إلى مقدمي خدمة ذكاء اصطناعي مختلفين مع دعم للنماذج المحلية.
            </Paragraph>
            
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Icon name="router" size={20} color="#2196F3" />
                <Text style={styles.featureText}>توجيه ذكي للطلبات</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="memory" size={20} color="#2196F3" />
                <Text style={styles.featureText}>ذكاء اصطناعي محلي</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="extension" size={20} color="#2196F3" />
                <Text style={styles.featureText}>نظام إضافات متقدم</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="offline-bolt" size={20} color="#2196F3" />
                <Text style={styles.featureText}>يعمل بدون انترنت</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusChip: {
    marginRight: 12,
  },
  chipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  portText: {
    fontSize: 14,
    color: '#757575',
  },
  errorSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    marginVertical: 8,
  },
  errorText: {
    marginLeft: 8,
    color: '#F44336',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 0.48,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  aiChip: {
    paddingHorizontal: 8,
  },
  featureList: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#212121',
  },
});

export default HomeScreen;