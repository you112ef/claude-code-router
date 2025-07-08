import React, {useState, useEffect} from 'react';
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
  Text,
  Button,
  Chip,
  Surface,
  IconButton,
  Searchbar,
  SegmentedButtons,
  List,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useApp, LogEntry} from '../contexts/AppContext';
import {NodeJSService} from '../services/NodeJSService';

const LogsScreen = () => {
  const {state, dispatch} = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  useEffect(() => {
    // الاستماع لسجلات جديدة من Node.js
    const unsubscribe = NodeJSService.getInstance().onStatusChange((status) => {
      // يتم التعامل مع السجلات في NodeJSService
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // تصفية السجلات
    let filtered = state.logs;

    // تصفية حسب المستوى
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // تصفية حسب البحث
    if (searchQuery.trim()) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [state.logs, levelFilter, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    // محاكاة جلب السجلات الجديدة
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const clearLogs = () => {
    Alert.alert(
      'مسح السجلات',
      'هل أنت متأكد من مسح جميع السجلات؟',
      [
        {text: 'إلغاء', style: 'cancel'},
        {
          text: 'مسح',
          style: 'destructive',
          onPress: () => {
            dispatch({type: 'CLEAR_LOGS'});
            Toast.show({
              type: 'info',
              text1: 'تم مسح السجلات',
              text2: 'تم مسح جميع السجلات بنجاح',
            });
          },
        },
      ],
    );
  };

  const exportLogs = () => {
    Toast.show({
      type: 'info',
      text1: 'تصدير السجلات',
      text2: 'سيتم إضافة هذه الميزة قريباً',
    });
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getLevelCounts = () => {
    const counts = {
      all: state.logs.length,
      info: state.logs.filter(log => log.level === 'info').length,
      warning: state.logs.filter(log => log.level === 'warning').length,
      error: state.logs.filter(log => log.level === 'error').length,
    };
    return counts;
  };

  const levelCounts = getLevelCounts();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* إحصائيات السجلات */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>إحصائيات السجلات</Title>
            
            <View style={styles.statsRow}>
              <Surface style={styles.statCard}>
                <Text style={styles.statNumber}>{levelCounts.all}</Text>
                <Text style={styles.statLabel}>إجمالي السجلات</Text>
              </Surface>
              
              <Surface style={[styles.statCard, {borderLeftColor: '#F44336'}]}>
                <Text style={[styles.statNumber, {color: '#F44336'}]}>
                  {levelCounts.error}
                </Text>
                <Text style={styles.statLabel}>أخطاء</Text>
              </Surface>
              
              <Surface style={[styles.statCard, {borderLeftColor: '#FF9800'}]}>
                <Text style={[styles.statNumber, {color: '#FF9800'}]}>
                  {levelCounts.warning}
                </Text>
                <Text style={styles.statLabel}>تحذيرات</Text>
              </Surface>
              
              <Surface style={[styles.statCard, {borderLeftColor: '#2196F3'}]}>
                <Text style={[styles.statNumber, {color: '#2196F3'}]}>
                  {levelCounts.info}
                </Text>
                <Text style={styles.statLabel}>معلومات</Text>
              </Surface>
            </View>

            <View style={styles.controlsRow}>
              <Button
                mode="outlined"
                onPress={clearLogs}
                icon="delete"
                style={styles.controlButton}>
                مسح السجلات
              </Button>
              
              <Button
                mode="outlined"
                onPress={exportLogs}
                icon="download"
                style={styles.controlButton}>
                تصدير
              </Button>
              
              <View style={styles.autoScrollToggle}>
                <Text style={styles.autoScrollLabel}>التمرير التلقائي</Text>
                <IconButton
                  icon={isAutoScroll ? 'toggle-switch' : 'toggle-switch-off'}
                  iconColor={isAutoScroll ? '#4CAF50' : '#757575'}
                  onPress={() => setIsAutoScroll(!isAutoScroll)}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* أدوات التصفية والبحث */}
        <Card style={styles.card}>
          <Card.Content>
            <Searchbar
              placeholder="البحث في السجلات..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <SegmentedButtons
              value={levelFilter}
              onValueChange={setLevelFilter}
              buttons={[
                {
                  value: 'all',
                  label: `الكل (${levelCounts.all})`,
                },
                {
                  value: 'error',
                  label: `أخطاء (${levelCounts.error})`,
                },
                {
                  value: 'warning',
                  label: `تحذيرات (${levelCounts.warning})`,
                },
                {
                  value: 'info',
                  label: `معلومات (${levelCounts.info})`,
                },
              ]}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* قائمة السجلات */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>السجلات ({filteredLogs.length})</Title>
            
            {filteredLogs.length === 0 ? (
              <Surface style={styles.emptyState}>
                <Icon name="assignment" size={48} color="#757575" />
                <Text style={styles.emptyText}>
                  {searchQuery || levelFilter !== 'all' 
                    ? 'لا توجد سجلات تطابق المرشحات' 
                    : 'لا توجد سجلات بعد'}
                </Text>
              </Surface>
            ) : (
              <View style={styles.logsList}>
                {filteredLogs.map((log, index) => (
                  <Surface key={index} style={styles.logItem}>
                    <View style={styles.logHeader}>
                      <Icon
                        name={getLogIcon(log.level)}
                        size={18}
                        color={getLogColor(log.level)}
                      />
                      <Chip
                        style={[
                          styles.levelChip,
                          {backgroundColor: getLogColor(log.level)}
                        ]}
                        textStyle={styles.levelChipText}>
                        {log.level.toUpperCase()}
                      </Chip>
                      <Text style={styles.timestamp}>
                        {formatTimestamp(log.timestamp)}
                      </Text>
                    </View>
                    
                    <Text style={styles.logMessage}>{log.message}</Text>
                  </Surface>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* معلومات حالة الخدمة */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>حالة النظام</Title>
            
            <List.Item
              title="حالة الخدمة"
              description={state.serviceStatus.isRunning ? 'تعمل' : 'متوقفة'}
              left={(props) => (
                <Icon
                  name={state.serviceStatus.isRunning ? 'play-circle-filled' : 'pause-circle-filled'}
                  size={24}
                  color={state.serviceStatus.isRunning ? '#4CAF50' : '#757575'}
                  style={{marginTop: 8}}
                />
              )}
              right={() => (
                <Chip
                  style={{
                    backgroundColor: state.serviceStatus.isRunning ? '#4CAF50' : '#757575'
                  }}
                  textStyle={{color: 'white'}}>
                  {state.serviceStatus.isRunning ? 'نشطة' : 'متوقفة'}
                </Chip>
              )}
            />
            
            {state.serviceStatus.isRunning && (
              <List.Item
                title="المنفذ"
                description={`يعمل على المنفذ ${state.serviceStatus.port}`}
                left={(props) => (
                  <Icon name="router" size={24} color="#2196F3" style={{marginTop: 8}} />
                )}
              />
            )}
            
            <List.Item
              title="السجلات"
              description={`${state.logs.length} سجل مخزن`}
              left={(props) => (
                <Icon name="list" size={24} color="#2196F3" style={{marginTop: 8}} />
              )}
            />
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 10,
    color: '#757575',
    marginTop: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  autoScrollToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoScrollLabel: {
    fontSize: 12,
    color: '#757575',
  },
  searchBar: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  logsList: {
    marginTop: 8,
  },
  logItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E0E0E0',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelChip: {
    marginLeft: 8,
    marginRight: 'auto',
  },
  levelChipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
  },
  logMessage: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
  },
});

export default LogsScreen;