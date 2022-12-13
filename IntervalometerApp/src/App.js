/* Copyright (C) 2022 Vladislav Sapegin
 * You may use, distribute and modify this code under the
 * terms of the MIT license
 */

import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import ReconnectingWebSocket from 'react-native-reconnecting-websocket';
import Button from './components/Button';
import Text from './components/Text';
import SliderPanel from './components/SliderPanel';
import Status from './components/Status';
import {useTheme} from './components/ThemeProvider';
import {icons} from './assets';

import {secondsToTimerString} from './utils';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  serverStateContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sliderPanel: {
    width: '100%',
    maxWidth: 340,
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 14,
    marginVertical: 4,
    width: 100,
  },
});

const ESP8266_DEFAULT_IP = '192.168.4.10:81';

const App = () => {
  const [serverState, setServerState] = useState('Connecting...');
  const [timer, setTimer] = useState(1);
  const [shots, setShots] = useState(1);
  const [interval, setInterval] = useState(1);
  const [useBulb, setUseBulb] = useState(false);
  const [bulb, setBulb] = useState(0);
  const [counter, setCounter] = useState(0);
  const [progress, setProgress] = useState(false);

  var ws = useMemo(
    () => new ReconnectingWebSocket(`ws://${ESP8266_DEFAULT_IP}/`),
    [],
  );

  const sendStartCommand = useCallback(() => {
    // convert seconds to ms, format command string
    var command = `START;${timer * 1000};${shots};${interval * 1000}`;
    if (useBulb) {
      command += `;${bulb * 1000}`;
    }
    // send start message to websocket server
    ws.send(command);
  }, [bulb, interval, shots, timer, useBulb, ws]);

  const sendStopCommand = useCallback(() => {
    // send stop message to websocket server
    ws.send('STOP');
  }, [ws]);

  useEffect(() => {
    ws.onopen = () => {
      setServerState('Connected');
    };
    ws.onclose = () => {
      setServerState('Connecting...');
      setProgress(false);
    };
    ws.onerror = () => {
      setServerState('Error');
      setProgress(false);
    };
    ws.onmessage = data => {
      console.log(data.data);
      var messageArr = [];
      if (data?.data) {
        messageArr = data.data.split(';');
      }
      if (messageArr.length >= 3 && messageArr[0] === 'JOB') {
        var count = parseInt(messageArr[1], 10);
        var total = parseInt(messageArr[2], 10);
        setCounter(count);
        setShots(total);
        if (count >= total) {
          setProgress(false);
          setCounter(0);
        }
      }
    };
  }, [ws]);

  const {isDark, colors} = useTheme();

  var backgroundStyle = {
    backgroundColor: colors.background,
  };

  var serverStateBackground = {
    backgroundColor:
      serverState === 'Connected' ? colors.success : colors.warning,
  };

  const calcSummary = useCallback(() => {
    var summary = shots * interval - counter * interval;
    summary += counter > 0 ? 0 : timer;
    if (useBulb) {
      summary += shots * bulb - counter * bulb;
    }
    return summary;
  }, [timer, shots, interval, bulb, useBulb, counter]);

  return (
    <SafeAreaView style={[backgroundStyle, {flex: 1}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={serverStateBackground.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.container}>
        <View style={[styles.serverStateContainer, serverStateBackground]}>
          <Text>SERVER: {ESP8266_DEFAULT_IP}</Text>
          <Text>{serverState}</Text>
        </View>

        <SliderPanel
          style={styles.sliderPanel}
          icon={icons.timer}
          valueText={timer + (timer > 1 ? ' secs' : ' sec')}
          minValue={0}
          maxValue={60}
          onValueChange={value => {
            setTimer(value);
          }}
          title="start after"
          disabled={progress}
        />

        <SliderPanel
          style={styles.sliderPanel}
          icon={icons.shots}
          valueText={shots + (shots > 1 ? ' shots' : ' shot')}
          minValue={1}
          maxValue={100}
          onValueChange={value => {
            setShots(value);
          }}
          title="take"
          disabled={progress}
        />

        <SliderPanel
          style={styles.sliderPanel}
          icon={icons.interval}
          valueText={interval + (interval > 1 ? ' secs' : ' sec')}
          minValue={1}
          maxValue={30}
          onValueChange={value => {
            setInterval(value);
          }}
          title="every"
          disabled={progress}
        />

        <SliderPanel
          style={styles.sliderPanel}
          icon={icons.shutter}
          valueText={bulb + (bulb > 1 ? ' secs' : ' sec')}
          minValue={1}
          maxValue={180}
          onValueChange={value => {
            setBulb(value);
          }}
          title="with bulb timer"
          withCheckBox={true}
          checkBoxValue={useBulb}
          onCheckBoxValueChange={value => {
            setUseBulb(value);
          }}
          disabled={progress || !useBulb}
        />

        <Status
          counter={counter}
          shots={shots}
          estimatedTime={secondsToTimerString(calcSummary())}
        />

        <View>
          <Button
            style={styles.button}
            disable={serverState !== 'Connected'}
            progress={progress}
            title="START"
            onPress={() => {
              sendStartCommand();
              setProgress(true);
            }}
          />
          <Button
            style={styles.button}
            disable={serverState !== 'Connected' || !progress}
            title="STOP"
            onPress={() => {
              sendStopCommand();
              setTimeout(() => {
                setProgress(false);
              }, 1000);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
