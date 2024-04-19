/* eslint-disable react-native/no-inline-styles */
import React, { type FunctionComponent } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { icons } from './illustrations';
import { SvgXml } from 'react-native-svg';
import { useRoute } from '@react-navigation/native';

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
  footerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 60,
  },
  iconWrapper: {
    alignItems: 'center',
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  footerText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    marginTop: 4,
    color: '#71696A',
  },
});
