import {
  Clipboard,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {QRscanner} from 'react-native-qr-decode-image-camera';
import SpInAppUpdates, {IAUUpdateKind} from 'sp-react-native-in-app-updates';
import deviceInfoModule from 'react-native-device-info';
const {height} = Dimensions.get('window');

const inAppUpdates = new SpInAppUpdates(
  true, // isDebug
);

const App = () => {
  const [zoom, setzoom] = useState(0.2);
  const [flashMode, setflashMode] = useState(false);
  const [data, setData] = useState('');
  const [isLink, setisLink] = useState(false);

  useEffect(() => {
    requestCameraPermission();
    checkVersion();
    return () => {};
  }, []);

  useEffect(() => {
    return () => {};
  }, []);

  const checkVersion = async () => {
    const curVersion = await deviceInfoModule.getVersion();
    // console.log('curr = ', curVersion);
    inAppUpdates.checkNeedsUpdate({curVersion: curVersion}).then(result => {
      if (result.shouldUpdate) {
        let updateOptions = {};
        if (Platform.OS === 'android') {
          updateOptions = {
            updateType: IAUUpdateKind.IMMEDIATE,
          };
        }
        inAppUpdates.startUpdate(updateOptions);
      }
    });
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Simple Scanner App Camera Permission',
          message: 'Simple Scanner App needs access to your camera',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const onRead = async res => {
    console.log(res);
    setData(res?.data);
    const _ = await Linking.canOpenURL(res?.data);
    if (_) {
      setisLink(true);
    } else {
      setisLink(false);
    }
  };

  const bottomView = () => {
    return (
      <View
        style={{flex: 1, flexDirection: 'row', backgroundColor: '#0000004D'}}>
        <TouchableOpacity
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          onPress={() => setflashMode(!flashMode)}>
          <Text style={{color: '#fff'}}>Back Light</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text>ini adalah update untuk in app update 1.7</Text>
      <Text
        onPress={() => {
          try {
            Linking.openURL(data);
          } catch (error) {
            Clipboard.setString(data);
            ToastAndroid.show(
              data + ', Penyalinan teks sukses!',
              ToastAndroid.SHORT,
            );
          }
        }}
        style={[
          styles.textData,
          {
            textDecorationLine: 'underline',
            color: '#3ba6ed',
          },
        ]}>
        {data}
      </Text>
      <QRscanner
        onRead={onRead}
        renderBottomView={bottomView}
        flashMode={flashMode}
        zoom={zoom}
        finderY={50}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  textData: {
    position: 'absolute',
    alignSelf: 'center',
    top: height / 4,
    zIndex: 999,
    fontSize: 20,
    color: '#fff',
    fontWeight: '400',
  },
});
