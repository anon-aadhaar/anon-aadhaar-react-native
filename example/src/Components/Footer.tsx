import React, { type FunctionComponent } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { icons } from './illustrations';
import { SvgXml } from 'react-native-svg';

type FooterProps = {
  navigation: any;
};

export const Footer: FunctionComponent<FooterProps> = ({ navigation }) => {
  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('Home')}
      >
        <View style={styles.iconWrapper}>
          <SvgXml xml={icons.home5Line} width="30" height="30" />
          <Text style={styles.footerText}>Home</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('About')}
      >
        <SvgXml xml={icons.rainbowLine} width="30" height="30" />
        <Text style={styles.footerText}>Resources</Text>
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
    color: 'white',
    marginTop: 4,
  },
});
