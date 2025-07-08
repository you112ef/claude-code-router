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
  TextInput,
  Button,
  Switch,
  Text,
  List,
  IconButton,
  Dialog,
  Portal,
  Chip,
  Divider,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {useApp} from '../contexts/AppContext';
import {NodeJSService} from '../services/NodeJSService';
import {Provider} from '../contexts/AppContext';

const ConfigScreen = () => {
  const {state, dispatch} = useApp();
  const [localConfig, setLocalConfig] = useState(state.config);
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  
  // حقول مقدم الخدمة الجديد
  const [providerForm, setProviderForm] = useState<Provider>({
    name: '',
    api_base_url: '',
    api_key: '',
    models: [],
  });
  
  const [newModel, setNewModel] = useState('');

  useEffect(() => {
    setLocalConfig(state.config);
  }, [state.config]);

  const handleSaveConfig = async () => {
    try {
      await NodeJSService.getInstance().updateConfig(localConfig);
      dispatch({type: 'SET_CONFIG', payload: localConfig});
      
      Toast.show({
        type: 'success',
        text1: 'تم حفظ الإعدادات',
        text2: 'تم تطبيق الإعدادات الجديدة بنجاح',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'فشل في حفظ الإعدادات',
        text2: (error as Error).message,
      });
    }
  };

  const handleAddProvider = () => {
    setProviderForm({
      name: '',
      api_base_url: '',
      api_key: '',
      models: [],
    });
    setNewModel('');
    setEditingProvider(null);
    setEditingIndex(-1);
    setShowProviderDialog(true);
  };

  const handleEditProvider = (provider: Provider, index: number) => {
    setProviderForm({...provider});
    setNewModel('');
    setEditingProvider(provider);
    setEditingIndex(index);
    setShowProviderDialog(true);
  };

  const handleSaveProvider = () => {
    if (!providerForm.name || !providerForm.api_base_url || !providerForm.api_key) {
      Toast.show({
        type: 'error',
        text1: 'بيانات ناقصة',
        text2: 'يرجى ملء جميع الحقول المطلوبة',
      });
      return;
    }

    if (editingIndex >= 0) {
      // تحديث مقدم موجود
      dispatch({
        type: 'UPDATE_PROVIDER',
        payload: {index: editingIndex, provider: providerForm},
      });
    } else {
      // إضافة مقدم جديد
      dispatch({type: 'ADD_PROVIDER', payload: providerForm});
    }

    setShowProviderDialog(false);
    Toast.show({
      type: 'success',
      text1: editingIndex >= 0 ? 'تم تحديث المقدم' : 'تم إضافة المقدم',
      text2: `مقدم الخدمة ${providerForm.name} جاهز للاستخدام`,
    });
  };

  const handleDeleteProvider = (index: number) => {
    Alert.alert(
      'حذف مقدم الخدمة',
      'هل أنت متأكد من حذف هذا المقدم؟',
      [
        {text: 'إلغاء', style: 'cancel'},
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            dispatch({type: 'REMOVE_PROVIDER', payload: index});
            Toast.show({
              type: 'info',
              text1: 'تم حذف المقدم',
              text2: 'تم حذف مقدم الخدمة بنجاح',
            });
          },
        },
      ],
    );
  };

  const handleAddModel = () => {
    if (newModel.trim()) {
      setProviderForm({
        ...providerForm,
        models: [...providerForm.models, newModel.trim()],
      });
      setNewModel('');
    }
  };

  const handleRemoveModel = (modelIndex: number) => {
    setProviderForm({
      ...providerForm,
      models: providerForm.models.filter((_, index) => index !== modelIndex),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        
        {/* إعدادات عامة */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>الإعدادات العامة</Title>
            
            <View style={styles.switchRow}>
              <Text>تفعيل السجلات</Text>
              <Switch
                value={localConfig.log}
                onValueChange={(value) =>
                  setLocalConfig({...localConfig, log: value})
                }
              />
            </View>

            <TextInput
              label="مفتاح OpenAI API"
              value={localConfig.OPENAI_API_KEY}
              onChangeText={(text) =>
                setLocalConfig({...localConfig, OPENAI_API_KEY: text})
              }
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="رابط OpenAI الأساسي"
              value={localConfig.OPENAI_BASE_URL}
              onChangeText={(text) =>
                setLocalConfig({...localConfig, OPENAI_BASE_URL: text})
              }
              mode="outlined"
              style={styles.input}
              placeholder="https://api.openai.com/v1"
            />

            <TextInput
              label="النموذج الافتراضي"
              value={localConfig.OPENAI_MODEL}
              onChangeText={(text) =>
                setLocalConfig({...localConfig, OPENAI_MODEL: text})
              }
              mode="outlined"
              style={styles.input}
              placeholder="gpt-3.5-turbo"
            />
          </Card.Content>
        </Card>

        {/* إعدادات التوجيه */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>إعدادات التوجيه</Title>
            
            <TextInput
              label="نموذج المهام الخلفية"
              value={localConfig.Router.background}
              onChangeText={(text) =>
                setLocalConfig({
                  ...localConfig,
                  Router: {...localConfig.Router, background: text},
                })
              }
              mode="outlined"
              style={styles.input}
              placeholder="provider,model"
            />

            <TextInput
              label="نموذج التفكير"
              value={localConfig.Router.think}
              onChangeText={(text) =>
                setLocalConfig({
                  ...localConfig,
                  Router: {...localConfig.Router, think: text},
                })
              }
              mode="outlined"
              style={styles.input}
              placeholder="provider,model"
            />

            <TextInput
              label="نموذج السياق الطويل"
              value={localConfig.Router.longContext}
              onChangeText={(text) =>
                setLocalConfig({
                  ...localConfig,
                  Router: {...localConfig.Router, longContext: text},
                })
              }
              mode="outlined"
              style={styles.input}
              placeholder="provider,model"
            />
          </Card.Content>
        </Card>

        {/* مقدمو الخدمة */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.providersHeader}>
              <Title>مقدمو الخدمة</Title>
              <IconButton
                icon="plus"
                mode="contained"
                onPress={handleAddProvider}
              />
            </View>

            {state.config.Providers.length === 0 ? (
              <Text style={styles.emptyText}>لا توجد مقدمو خدمة</Text>
            ) : (
              state.config.Providers.map((provider, index) => (
                <List.Item
                  key={index}
                  title={provider.name}
                  description={`${provider.api_base_url} • ${provider.models.length} نماذج`}
                  left={(props) => <List.Icon {...props} icon="cloud" />}
                  right={() => (
                    <View style={styles.providerActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEditProvider(provider, index)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        iconColor="#F44336"
                        onPress={() => handleDeleteProvider(index)}
                      />
                    </View>
                  )}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* زر الحفظ */}
        <Button
          mode="contained"
          onPress={handleSaveConfig}
          style={styles.saveButton}
          icon="content-save">
          حفظ الإعدادات
        </Button>

      </ScrollView>

      {/* حوار إضافة/تعديل مقدم الخدمة */}
      <Portal>
        <Dialog visible={showProviderDialog} onDismiss={() => setShowProviderDialog(false)}>
          <Dialog.Title>
            {editingIndex >= 0 ? 'تعديل مقدم الخدمة' : 'إضافة مقدم خدمة جديد'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="اسم المقدم"
              value={providerForm.name}
              onChangeText={(text) =>
                setProviderForm({...providerForm, name: text})
              }
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="رابط API الأساسي"
              value={providerForm.api_base_url}
              onChangeText={(text) =>
                setProviderForm({...providerForm, api_base_url: text})
              }
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="مفتاح API"
              value={providerForm.api_key}
              onChangeText={(text) =>
                setProviderForm({...providerForm, api_key: text})
              }
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />

            <Divider style={styles.divider} />

            <Text style={styles.sectionLabel}>النماذج المتاحة:</Text>
            
            <View style={styles.modelInput}>
              <TextInput
                label="إضافة نموذج"
                value={newModel}
                onChangeText={setNewModel}
                mode="outlined"
                style={styles.modelTextInput}
              />
              <Button onPress={handleAddModel} mode="contained">
                إضافة
              </Button>
            </View>

            <View style={styles.modelsList}>
              {providerForm.models.map((model, index) => (
                <Chip
                  key={index}
                  onClose={() => handleRemoveModel(index)}
                  style={styles.modelChip}>
                  {model}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowProviderDialog(false)}>إلغاء</Button>
            <Button onPress={handleSaveProvider}>حفظ</Button>
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
  input: {
    marginVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  providersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    marginVertical: 16,
  },
  providerActions: {
    flexDirection: 'row',
  },
  saveButton: {
    marginVertical: 16,
    marginBottom: 32,
  },
  divider: {
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modelInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  modelTextInput: {
    flex: 1,
    marginRight: 8,
  },
  modelsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  modelChip: {
    margin: 4,
  },
});

export default ConfigScreen;