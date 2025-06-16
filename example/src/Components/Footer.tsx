/* eslint-disable react-native/no-inline-styles */
import { useRoute } from '@react-navigation/native';
import React, { type FunctionComponent } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { icons } from './illustrations';

type FooterProps = {
  navigation: any;
};

export const Footer: FunctionComponent<FooterProps> = ({ navigation }) => {
  const route = useRoute();

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('Home')}
      >
        <View style={styles.iconWrapper}>
          <SvgXml
            xml={route.name === 'Home' ? icons.home5LineGreen : icons.home5Line}
            width="30"
            height="30"
          />
          <Text
            style={[
              styles.footerText,
              route.name === 'Home' ? { color: '#06753B' } : null,
            ]}
          >
            Home
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('About')}
      >
        <SvgXml
          xml={
            route.name === 'About' ? icons.rainbowLineGreen : icons.rainbowLine
          }
          width="30"
          height="30"
        />
        <Text
          style={[
            styles.footerText,
            route.name === 'About' ? { color: '#06753B' } : null,
          ]}
        >
          Resources
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around',
    width: '100%',
  },
  footerText: {
    color: '#71696A',
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  iconWrapper: {
    alignItems: 'center',
  },
});
