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
  ProgressBar,
  List,
  IconButton,
  Chip,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';

import {useApp} from '../contexts/AppContext';

interface ModelInfo {
  name: string;
  size: string;
  description: string;
  url: string;
  filename: string;
  type: 'ggml' | 'onnx';
}

const AVAILABLE_MODELS: ModelInfo[] = [
  {
    name: 'Phi-3 Mini (GGML)',
    size: '2.4 GB',
    description: 'نموذج صغير وسريع للمحادثات العامة',
    url: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4_0.gguf',
    filename: 'phi-3-mini-q4_0.gguf',
    type: 'ggml',
  },
  {
    name: 'TinyLlama 1.1B (GGML)',
    size: '1.1 GB',
    description: 'نموذج خفيف جداً للأجهزة المحدودة',
    url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGML/resolve/main/tinyllama-1.1b-chat-v1.0.q4_0.bin',
    filename: 'tinyllama-1.1b-q4_0.bin',
    type: 'ggml',
  },
  {
    name: 'Qwen2.5-Coder 1.5B (GGML)',
    size: '1.5 GB',
    description: 'نموذج متخصص في البرمجة',
    url: 'https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-1.5b-instruct-q4_0.gguf',
    filename: 'qwen2.5-coder-1.5b-q4_0.gguf',
    type: 'ggml',
  },
];

const LocalAIScreen = () => {
  const {state, dispatch} = useApp();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [availableStorage, setAvailableStorage] = useState(0);
  const [totalStorage, setTotalStorage] = useState(0);
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [deviceInfo, setDeviceInfo] = useState({
    totalMemory: 0,
    freeDiskStorage: 0,
    manufacturer: '',
    model: '',
  });

  useEffect(() => {
    loadDeviceInfo();
    loadDownloadedModels();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const [totalMemory, freeDiskStorage, manufacturer, model] = await Promise.all([
        DeviceInfo.getTotalMemory(),
        DeviceInfo.getFreeDiskStorage(),
        DeviceInfo.getManufacturer(),
        DeviceInfo.getModel(),
      ]);

      setDeviceInfo({
        totalMemory,
        freeDiskStorage,
        manufacturer,
        model,
      });

      setAvailableStorage(freeDiskStorage);
      // تقدير التخزين الإجمالي
      setTotalStorage(freeDiskStorage * 2); // تقدير تقريبي
    } catch (error) {
      console.error('خطأ في جلب معلومات الجهاز:', error);
    }
  };

  const loadDownloadedModels = async () => {
    try {
      const modelsDir = `${RNFS.DocumentDirectoryPath}/models`;
      const exists = await RNFS.exists(modelsDir);
      
      if (exists) {
        const files = await RNFS.readDir(modelsDir);
        const modelFiles = files
          .filter(file => file.name.endsWith('.gguf') || file.name.endsWith('.bin'))
          .map(file => file.name);
        
        setDownloadedModels(modelFiles);
      }
    } catch (error) {
      console.error('خطأ في جلب النماذج المحملة:', error);
    }
  };

  const downloadModel = async (model: ModelInfo) => {
    try {
      // التحقق من المساحة المتاحة
      const modelSizeGB = parseFloat(model.size.split(' ')[0]);
      const modelSizeBytes = modelSizeGB * 1024 * 1024 * 1024;
      
      if (deviceInfo.freeDiskStorage < modelSizeBytes) {
        Toast.show({
          type: 'error',
          text1: 'مساحة تخزين غير كافية',
          text2: `تحتاج إلى ${model.size} مساحة إضافية`,
        });
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);

      // إنشاء مجلد النماذج
      const modelsDir = `${RNFS.DocumentDirectoryPath}/models`;
      await RNFS.mkdir(modelsDir);

      const filePath = `${modelsDir}/${model.filename}`;

      // تحميل النموذج
      const download = RNFS.downloadFile({
        fromUrl: model.url,
        toFile: filePath,
        progress: (res) => {
          const progress = res.bytesWritten / res.contentLength;
          setDownloadProgress(progress);
        },
      });

      const result = await download.promise;

      if (result.statusCode === 200) {
        Toast.show({
          type: 'success',
          text1: 'تم تحميل النموذج',
          text2: `${model.name} جاهز للاستخدام`,
        });

        // تحديث الحالة
        dispatch({
          type: 'SET_LOCAL_AI',
          payload: {
            modelPath: filePath,
            isEnabled: true,
          },
        });

        await loadDownloadedModels();
      } else {
        throw new Error('فشل في تحميل النموذج');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'فشل في تحميل النموذج',
        text2: (error as Error).message,
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const deleteModel = async (filename: string) => {
    Alert.alert(
      'حذف النموذج',
      'هل أنت متأكد من حذف هذا النموذج؟',
      [
        {text: 'إلغاء', style: 'cancel'},
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const filePath = `${RNFS.DocumentDirectoryPath}/models/${filename}`;
              await RNFS.unlink(filePath);
              
              Toast.show({
                type: 'info',
                text1: 'تم حذف النموذج',
                text2: 'تم توفير مساحة تخزين إضافية',
              });

              await loadDownloadedModels();
              await loadDeviceInfo();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'فشل في حذف النموذج',
                text2: (error as Error).message,
              });
            }
          },
        },
      ],
    );
  };

  const selectModel = (filename: string) => {
    const filePath = `${RNFS.DocumentDirectoryPath}/models/${filename}`;
    dispatch({
      type: 'SET_LOCAL_AI',
      payload: {
        modelPath: filePath,
        isEnabled: true,
      },
    });

    Toast.show({
      type: 'success',
      text1: 'تم تحديد النموذج',
      text2: `${filename} نشط الآن`,
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلو', 'ميجا', 'جيجا', 'تيرا'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getModelStatus = (model: ModelInfo): 'downloaded' | 'current' | 'available' => {
    if (downloadedModels.includes(model.filename)) {
      if (state.localAI.modelPath.includes(model.filename)) {
        return 'current';
      }
      return 'downloaded';
    }
    return 'available';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        
        {/* حالة الذكاء المحلي */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>حالة الذكاء الاصطناعي المحلي</Title>
            
            <View style={styles.statusRow}>
              <Text>تفعيل النموذج المحلي</Text>
              <Switch
                value={state.localAI.isEnabled}
                onValueChange={(value) =>
                  dispatch({type: 'SET_LOCAL_AI', payload: {isEnabled: value}})
                }
              />
            </View>

            {state.localAI.isEnabled && (
              <Surface style={styles.modelInfo}>
                <Icon name="memory" size={24} color="#4CAF50" />
                <View style={styles.modelDetails}>
                  <Text style={styles.modelName}>
                    النموذج النشط: {state.localAI.modelPath ? 
                      state.localAI.modelPath.split('/').pop() : 'لا يوجد'}
                  </Text>
                  <Text style={styles.modelPath}>{state.localAI.modelPath}</Text>
                </View>
              </Surface>
            )}

            <Paragraph style={styles.description}>
              الذكاء الاصطناعي المحلي يتيح لك استخدام النماذج بدون انترنت، 
              مما يضمن الخصوصية والسرعة.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* معلومات الجهاز */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>معلومات الجهاز</Title>
            
            <View style={styles.deviceInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>الجهاز:</Text>
                <Text style={styles.infoValue}>
                  {deviceInfo.manufacturer} {deviceInfo.model}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>الذاكرة:</Text>
                <Text style={styles.infoValue}>
                  {formatBytes(deviceInfo.totalMemory)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>التخزين المتاح:</Text>
                <Text style={styles.infoValue}>
                  {formatBytes(deviceInfo.freeDiskStorage)}
                </Text>
              </View>
            </View>

            <Text style={styles.storageLabel}>التخزين المستخدم:</Text>
            <ProgressBar
              progress={(totalStorage - availableStorage) / totalStorage}
              color="#2196F3"
              style={styles.storageBar}
            />
          </Card.Content>
        </Card>

        {/* النماذج المتاحة */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>النماذج المتاحة للتحميل</Title>
            
            {isDownloading && (
              <Surface style={styles.downloadProgress}>
                <Text>جاري التحميل... {Math.round(downloadProgress * 100)}%</Text>
                <ProgressBar progress={downloadProgress} style={styles.progressBar} />
              </Surface>
            )}

            {AVAILABLE_MODELS.map((model, index) => {
              const status = getModelStatus(model);
              
              return (
                <List.Item
                  key={index}
                  title={model.name}
                  description={`${model.size} • ${model.description}`}
                  left={(props) => (
                    <Icon
                      name={status === 'current' ? 'radio-button-checked' : 'memory'}
                      size={24}
                      color={status === 'current' ? '#4CAF50' : '#2196F3'}
                      style={{marginTop: 8}}
                    />
                  )}
                  right={() => (
                    <View style={styles.modelActions}>
                      {status === 'available' && (
                        <Button
                          mode="contained"
                          onPress={() => downloadModel(model)}
                          disabled={isDownloading}
                          compact>
                          تحميل
                        </Button>
                      )}
                      
                      {status === 'downloaded' && (
                        <>
                          <Button
                            mode="outlined"
                            onPress={() => selectModel(model.filename)}
                            compact
                            style={styles.actionButton}>
                            تفعيل
                          </Button>
                          <IconButton
                            icon="delete"
                            size={20}
                            iconColor="#F44336"
                            onPress={() => deleteModel(model.filename)}
                          />
                        </>
                      )}
                      
                      {status === 'current' && (
                        <Chip
                          icon="check"
                          style={styles.activeChip}
                          textStyle={{color: 'white'}}>
                          نشط
                        </Chip>
                      )}
                    </View>
                  )}
                  style={styles.modelItem}
                />
              );
            })}
          </Card.Content>
        </Card>

        {/* النماذج المحملة */}
        {downloadedModels.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>النماذج المحملة ({downloadedModels.length})</Title>
              
              {downloadedModels.map((filename, index) => (
                <List.Item
                  key={index}
                  title={filename}
                  description="نموذج محلي جاهز للاستخدام"
                  left={(props) => <List.Icon {...props} icon="download" />}
                  right={() => (
                    <View style={styles.modelActions}>
                      {!state.localAI.modelPath.includes(filename) ? (
                        <>
                          <Button
                            mode="outlined"
                            onPress={() => selectModel(filename)}
                            compact
                            style={styles.actionButton}>
                            تفعيل
                          </Button>
                          <IconButton
                            icon="delete"
                            size={20}
                            iconColor="#F44336"
                            onPress={() => deleteModel(filename)}
                          />
                        </>
                      ) : (
                        <Chip
                          icon="check"
                          style={styles.activeChip}
                          textStyle={{color: 'white'}}>
                          نشط
                        </Chip>
                      )}
                    </View>
                  )}
                />
              ))}
            </Card.Content>
          </Card>
        )}

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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  modelDetails: {
    marginLeft: 12,
    flex: 1,
  },
  modelName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  modelPath: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  description: {
    marginTop: 8,
    color: '#757575',
  },
  deviceInfo: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoLabel: {
    color: '#757575',
  },
  infoValue: {
    fontWeight: 'bold',
    color: '#212121',
  },
  storageLabel: {
    marginTop: 16,
    marginBottom: 8,
    color: '#757575',
  },
  storageBar: {
    height: 8,
    borderRadius: 4,
  },
  downloadProgress: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    marginTop: 8,
  },
  modelItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modelActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#4CAF50',
  },
});

export default LocalAIScreen;