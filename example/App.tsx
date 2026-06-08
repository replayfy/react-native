import React, { useEffect, useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Replay, { ReplayMask, nativeAvailable } from 'react-native-replayfy';

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    Replay.start({
      projectKey: 'rpl_pk_ef7e2fc8c7f952bcd0a69466e1a42a0625f9',
      // Android emulator → host machine. (iOS sim would use 127.0.0.1.)
      ingestUrl: 'http://10.0.2.2:4000',
      recordNetwork: true,
      recordConsole: true,
      recordErrors: true,
    });
    Replay.identify('rn_demo_user', { plan: 'pro' });
    Replay.screen('Home');
    Replay.getSessionId().then(setSessionId);
  }, []);

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 16 }}>
          Replayfy RN demo
        </Text>
        <Text style={{ marginBottom: 16 }}>
          native module: {nativeAvailable() ? 'linked ✓' : 'not linked'}
          {'\n'}session: {sessionId ?? '…'}
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Button
            title="track purchase"
            onPress={() => Replay.track('purchase', { amount: 4200 })}
          />
        </View>
        <View style={{ marginBottom: 12 }}>
          <Button
            title="fire a network request"
            onPress={() => {
              fetch('https://httpbin.org/get').catch(() => {});
            }}
          />
        </View>
        <View style={{ marginBottom: 12 }}>
          <Button title="log to console" onPress={() => console.log('hello from RN demo')} />
        </View>

        <ReplayMask>
          <View
            style={{ padding: 12, backgroundColor: '#eee', borderRadius: 8 }}
          >
            <Text>Masked card number (hidden in playback)</Text>
            <TextInput
              placeholder="4242 4242 4242 4242"
              style={{ borderWidth: 1, padding: 8, marginTop: 8 }}
            />
          </View>
        </ReplayMask>
      </ScrollView>
    </SafeAreaView>
  );
}
