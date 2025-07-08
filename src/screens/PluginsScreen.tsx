import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Switch,
  Text,
  List,
  Chip,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  Surface,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useApp} from '../contexts/AppContext';

interface Plugin {
  name: string;
  description: string;
  author: string;
  version: string;
  enabled: boolean;
  built_in: boolean;
}

const BUILT_IN_PLUGINS: Plugin[] = [
  {
    name: 'notebook-tools-filter',
    description: 'يقوم بتصفية الأدوات المتعلقة بـ Jupyter Notebook لتقليل التعقيد',
    author: 'Claude Code Router Team',
    version: '1.0.0',
    enabled: false,
    built_in: true,
  },
  {
    name: 'toolcall-improvement',
    description: 'يحسن من استخدام الأدوات للنماذج التي لا تتعامل معها بشكل جيد',
    author: 'Claude Code Router Team',
    version: '1.0.0',
    enabled: false,
    built_in: true,
  },
];

const PluginsScreen = () => {
  const {state, dispatch} = useApp();
  const [plugins, setPlugins] = useState<Plugin[]>(BUILT_IN_PLUGINS);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPluginCode, setNewPluginCode] = useState('');
  const [newPluginName, setNewPluginName] = useState('');

  useEffect(() => {
    // تحديث حالة الإضافات بناءً على الإعدادات
    const updatedPlugins = plugins.map(plugin => ({
      ...plugin,
      enabled: state.config.usePlugins.includes(plugin.name),
    }));
    setPlugins(updatedPlugins);
  }, [state.config.usePlugins]);

  const togglePlugin = (pluginName: string, enabled: boolean) => {
    let updatedPlugins;
    
    if (enabled) {
      // إضافة الإضافة
      updatedPlugins = [...state.config.usePlugins, pluginName];
    } else {
      // إزالة الإضافة
      updatedPlugins = state.config.usePlugins.filter(name => name !== pluginName);
    }

    // تحديث الإعدادات
    const updatedConfig = {
      ...state.config,
      usePlugins: updatedPlugins,
    };

    dispatch({type: 'SET_CONFIG', payload: updatedConfig});

    Toast.show({
      type: 'success',
      text1: enabled ? 'تم تفعيل الإضافة' : 'تم إلغاء تفعيل الإضافة',
      text2: `${pluginName} ${enabled ? 'نشطة الآن' : 'معطلة الآن'}`,
    });
  };

  const handleAddCustomPlugin = () => {
    if (!newPluginName.trim() || !newPluginCode.trim()) {
      Toast.show({
        type: 'error',
        text1: 'بيانات ناقصة',
        text2: 'يرجى إدخال اسم الإضافة والكود',
      });
      return;
    }

    // التحقق من عدم وجود إضافة بنفس الاسم
    if (plugins.some(plugin => plugin.name === newPluginName)) {
      Toast.show({
        type: 'error',
        text1: 'اسم موجود',
        text2: 'يوجد إضافة بهذا الاسم بالفعل',
      });
      return;
    }

    // إنشاء إضافة جديدة
    const newPlugin: Plugin = {
      name: newPluginName,
      description: 'إضافة مخصصة من المستخدم',
      author: 'المستخدم',
      version: '1.0.0',
      enabled: false,
      built_in: false,
    };

    setPlugins([...plugins, newPlugin]);
    setShowAddDialog(false);
    setNewPluginName('');
    setNewPluginCode('');

    Toast.show({
      type: 'success',
      text1: 'تم إضافة الإضافة',
      text2: 'يمكنك الآن تفعيلها من القائمة',
    });
  };

  const deleteCustomPlugin = (pluginName: string) => {
    Alert.alert(
      'حذف الإضافة',
      'هل أنت متأكد من حذف هذه الإضافة؟',
      [
        {text: 'إلغاء', style: 'cancel'},
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            // إزالة الإضافة من الإعدادات أولاً
            const updatedUsePlugins = state.config.usePlugins.filter(
              name => name !== pluginName
            );
            
            const updatedConfig = {
              ...state.config,
              usePlugins: updatedUsePlugins,
            };

            dispatch({type: 'SET_CONFIG', payload: updatedConfig});

            // إزالة الإضافة من القائمة
            setPlugins(plugins.filter(plugin => plugin.name !== pluginName));

            Toast.show({
              type: 'info',
              text1: 'تم حذف الإضافة',
              text2: 'تم إزالة الإضافة بنجاح',
            });
          },
        },
      ],
    );
  };

  const getPluginStatusColor = (enabled: boolean) => {
    return enabled ? '#4CAF50' : '#757575';
  };

  const getPluginIcon = (plugin: Plugin) => {
    if (plugin.built_in) {
      return 'extension';
    }
    return 'code';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        
        {/* معلومات الإضافات */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>نظام الإضافات</Title>
            <Paragraph>
              الإضافات تتيح لك تخصيص سلوك Claude Code Router وتحسين 
              أدائه مع نماذج الذكاء الاصطناعي المختلفة.
            </Paragraph>
            
            <View style={styles.statsRow}>
              <Surface style={styles.statCard}>
                <Text style={styles.statNumber}>{plugins.length}</Text>
                <Text style={styles.statLabel}>إجمالي الإضافات</Text>
              </Surface>
              
              <Surface style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {plugins.filter(p => p.enabled).length}
                </Text>
                <Text style={styles.statLabel}>الإضافات النشطة</Text>
              </Surface>
              
              <Surface style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {plugins.filter(p => p.built_in).length}
                </Text>
                <Text style={styles.statLabel}>الإضافات المدمجة</Text>
              </Surface>
            </View>
          </Card.Content>
        </Card>

        {/* قائمة الإضافات */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.pluginsHeader}>
              <Title>الإضافات المتاحة</Title>
              <IconButton
                icon="plus"
                mode="contained"
                onPress={() => setShowAddDialog(true)}
              />
            </View>

            {plugins.map((plugin, index) => (
              <List.Item
                key={index}
                title={plugin.name}
                description={plugin.description}
                left={(props) => (
                  <Icon
                    name={getPluginIcon(plugin)}
                    size={24}
                    color={getPluginStatusColor(plugin.enabled)}
                    style={{marginTop: 8}}
                  />
                )}
                right={() => (
                  <View style={styles.pluginActions}>
                    {plugin.built_in && (
                      <Chip
                        icon="verified"
                        style={styles.builtInChip}
                        textStyle={{color: 'white', fontSize: 10}}>
                        مدمجة
                      </Chip>
                    )}
                    
                    <Switch
                      value={plugin.enabled}
                      onValueChange={(enabled) => togglePlugin(plugin.name, enabled)}
                      style={styles.pluginSwitch}
                    />
                    
                    {!plugin.built_in && (
                      <IconButton
                        icon="delete"
                        size={20}
                        iconColor="#F44336"
                        onPress={() => deleteCustomPlugin(plugin.name)}
                      />
                    )}
                  </View>
                )}
                style={[
                  styles.pluginItem,
                  plugin.enabled && styles.enabledPluginItem
                ]}
              />
            ))}

            {plugins.length === 0 && (
              <Text style={styles.emptyText}>لا توجد إضافات متاحة</Text>
            )}
          </Card.Content>
        </Card>

        {/* تفاصيل الإضافات النشطة */}
        {plugins.filter(p => p.enabled).length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>الإضافات النشطة</Title>
              
              {plugins
                .filter(plugin => plugin.enabled)
                .map((plugin, index) => (
                  <Surface key={index} style={styles.activePluginCard}>
                    <View style={styles.activePluginHeader}>
                      <Icon name={getPluginIcon(plugin)} size={20} color="#4CAF50" />
                      <Text style={styles.activePluginName}>{plugin.name}</Text>
                      <Chip
                        style={styles.versionChip}
                        textStyle={{fontSize: 10}}>
                        v{plugin.version}
                      </Chip>
                    </View>
                    <Text style={styles.activePluginDescription}>
                      {plugin.description}
                    </Text>
                    <Text style={styles.activePluginAuthor}>
                      بواسطة: {plugin.author}
                    </Text>
                  </Surface>
                ))}
            </Card.Content>
          </Card>
        )}

        {/* نصائح وإرشادات */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>نصائح الاستخدام</Title>
            
            <View style={styles.tipItem}>
              <Icon name="lightbulb-outline" size={20} color="#FF9800" />
              <Text style={styles.tipText}>
                استخدم إضافة "notebook-tools-filter" إذا كنت لا تعمل مع Jupyter
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Icon name="lightbulb-outline" size={20} color="#FF9800" />
              <Text style={styles.tipText}>
                فعّل "toolcall-improvement" للنماذج التي تواجه صعوبة في استخدام الأدوات
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Icon name="lightbulb-outline" size={20} color="#FF9800" />
              <Text style={styles.tipText}>
                يمكنك إنشاء إضافات مخصصة بكتابة كود JavaScript
              </Text>
            </View>
          </Card.Content>
        </Card>

      </ScrollView>

      {/* حوار إضافة إضافة مخصصة */}
      <Portal>
        <Dialog
          visible={showAddDialog}
          onDismiss={() => setShowAddDialog(false)}
          style={styles.addDialog}>
          <Dialog.Title>إضافة إضافة مخصصة</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="اسم الإضافة"
              value={newPluginName}
              onChangeText={setNewPluginName}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="كود JavaScript"
              value={newPluginCode}
              onChangeText={setNewPluginCode}
              mode="outlined"
              multiline
              numberOfLines={10}
              style={styles.codeInput}
              placeholder={`// مثال:
function process(requestBody) {
  // معالجة الطلب هنا
  return requestBody;
}

module.exports = { process };`}
            />
            
            <Text style={styles.helpText}>
              يجب أن تحتوي الإضافة على دالة process التي تستقبل requestBody وترجع requestBody محدث
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onPress={handleAddCustomPlugin}>إضافة</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  pluginsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pluginItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  enabledPluginItem: {
    backgroundColor: '#E8F5E8',
  },
  pluginActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  builtInChip: {
    backgroundColor: '#2196F3',
    marginRight: 8,
  },
  pluginSwitch: {
    marginHorizontal: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    marginVertical: 16,
  },
  activePluginCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  activePluginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activePluginName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  versionChip: {
    backgroundColor: '#E0E0E0',
  },
  activePluginDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  activePluginAuthor: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
  addDialog: {
    maxHeight: '80%',
  },
  input: {
    marginBottom: 16,
  },
  codeInput: {
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  helpText: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
});

export default PluginsScreen;