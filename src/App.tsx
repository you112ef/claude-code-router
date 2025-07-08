import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './screens/HomeScreen';
import ConfigScreen from './screens/ConfigScreen';
import LogsScreen from './screens/LogsScreen';
import PluginsScreen from './screens/PluginsScreen';
import LocalAIScreen from './screens/LocalAIScreen';

import {AppProvider} from './contexts/AppContext';
import {theme} from './utils/theme';
import {NodeJSService} from './services/NodeJSService';

const Tab = createBottomTabNavigator();

const App = () => {
  const [isServiceReady, setIsServiceReady] = useState(false);

  useEffect(() => {
    const initializeService = async () => {
      try {
        await NodeJSService.initialize();
        setIsServiceReady(true);
      } catch (error) {
        console.error('فشل في تهيئة خدمة Node.js:', error);
      }
    };

    initializeService();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                  let iconName = 'home'; // default icon

                  if (route.name === 'الرئيسية') {
                    iconName = 'home';
                  } else if (route.name === 'الإعدادات') {
                    iconName = 'settings';
                  } else if (route.name === 'السجلات') {
                    iconName = 'list';
                  } else if (route.name === 'الإضافات') {
                    iconName = 'extension';
                  } else if (route.name === 'الذكاء المحلي') {
                    iconName = 'memory';
                  }

                  return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              })}>
              <Tab.Screen 
                name="الرئيسية" 
                component={HomeScreen}
                options={{title: 'إدارة الخدمة'}}
              />
              <Tab.Screen 
                name="الإعدادات" 
                component={ConfigScreen}
                options={{title: 'الإعدادات والمقدمين'}}
              />
              <Tab.Screen 
                name="الذكاء المحلي" 
                component={LocalAIScreen}
                options={{title: 'النموذج المحلي'}}
              />
              <Tab.Screen 
                name="الإضافات" 
                component={PluginsScreen}
                options={{title: 'إدارة الإضافات'}}
              />
              <Tab.Screen 
                name="السجلات" 
                component={LogsScreen}
                options={{title: 'السجلات والمراقبة'}}
              />
            </Tab.Navigator>
          </NavigationContainer>
          <Toast />
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;