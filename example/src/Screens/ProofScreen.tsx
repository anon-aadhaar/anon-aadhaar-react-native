/* eslint-disable react-native/no-inline-styles */
import {
  AnonAadhaarContext,
  bigIntsToString,
  cleanAnonAadhaarState,
  type AnonAadhaarProof,
} from '@anon-aadhaar/react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { BlurView } from '@react-native-community/blur';
import React, { useContext, useState, type FunctionComponent } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import Toast from 'react-native-toast-message';

import { Footer } from '../Components/Footer';
import { icons } from '../Components/illustrations';

type ProofScreenProps = {
  route: any;
  navigation: any;
};

const ConfirmationModal = ({
  setModalVisible,
  modalVisible,
  setProofState,
  navigation,
}: {
  setModalVisible: any;
  modalVisible: boolean;
  navigation: any;
  setProofState: any;
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      {/* TODO: Add blur view */}
      {/* <BlurView
        style={styles.absolute}
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="dark"
      > */}
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Are you sure you want to delete this proof?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
              style={[
                styles.confirmationModalButton,
                { borderEndStartRadius: 8 },
              ]}
            >
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                cleanAnonAadhaarState();
                setProofState('deleted');
                navigation.navigate('Home');
                setModalVisible(!modalVisible);
              }}
              style={[
                styles.confirmationModalButton,
                { borderEndEndRadius: 8, borderLeftWidth: 1 },
              ]}
            >
              <Text style={{ color: '#ED3636', fontWeight: 'bold' }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* </BlurView> */}
    </Modal>
  );
};

export const ProofScreen: FunctionComponent<ProofScreenProps> = ({
  route,
  navigation,
}) => {
  const { anonAadhaarProof } = route.params;
  const proof: AnonAadhaarProof = anonAadhaarProof.anonAadhaarProof;
  const { setProofState } = useContext(AnonAadhaarContext);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const copyToClipboard = () => {
    Clipboard.setString(JSON.stringify(proof));
  };

  const showToast = () => {
    Toast.show({
      type: 'success',
      text1: 'Proof copied to clipboard.',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast />
      <View style={styles.scrollView}>
        {anonAadhaarProof ? (
          <>
            <Text style={styles.heading}>Your identity proof</Text>

            <View style={{ flexDirection: 'row', gap: 10, marginVertical: 5 }}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { justifyContent: 'space-around' },
                ]}
                onPress={() => {
                  copyToClipboard();
                  showToast();
                }}
              >
                <Text style={styles.infoText}>Copy Proof</Text>
                <SvgXml xml={icons.fileCopyLine} width="24" height="24" />
              </TouchableOpacity>
              <ConfirmationModal
                setModalVisible={setModalVisible}
                modalVisible={modalVisible}
                navigation={navigation}
                setProofState={setProofState}
              />
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    borderWidth: 1,
                    borderColor: '#ED3636',
                    justifyContent: 'space-around',
                  },
                ]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={[styles.infoText, { color: '#ED3636' }]}>
                  Delete Proof
                </Text>
                <SvgXml xml={icons.deleteBinLine} width="24" height="24" />
              </TouchableOpacity>
            </View>

            <View>
              <Text style={[styles.subhead, { textAlign: 'left' }]}>
                Nullifier:
              </Text>
              <View style={styles.fieldToRevealContainer}>
                <View style={styles.fieldToReveal}>
                  <Text style={styles.callout}>{proof.nullifier}</Text>
                </View>
              </View>
            </View>

            <View>
              <Text style={[styles.subhead, { textAlign: 'left' }]}>
                Nullifier Seed:
              </Text>
              <View style={styles.fieldToRevealContainer}>
                <View style={styles.fieldToReveal}>
                  <Text style={styles.callout}>{proof.nullifierSeed}</Text>
                </View>
              </View>
            </View>

            <View>
              <Text style={[styles.subhead, { textAlign: 'left' }]}>
                Public Key Hash:
              </Text>
              <View style={styles.fieldToRevealContainer}>
                <View style={styles.fieldToReveal}>
                  <Text style={styles.callout}>{proof.pubkeyHash}</Text>
                </View>
              </View>
            </View>

            <View>
              <Text style={[styles.subhead, { textAlign: 'left' }]}>
                Signal:
              </Text>
              <View style={styles.fieldToRevealContainer}>
                <View style={styles.fieldToReveal}>
                  <Text style={styles.callout}>{proof.signal}</Text>
                </View>
              </View>
            </View>

            <View>
              <Text style={[styles.subhead, { textAlign: 'left' }]}>
                Timestamp:
              </Text>
              <View style={styles.fieldToRevealContainer}>
                <View style={styles.fieldToReveal}>
                  <Text style={styles.callout}>{proof.timestamp}</Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subhead, { textAlign: 'left' }]}>
                  Age above 18:
                </Text>
                <View style={styles.fieldToRevealContainer}>
                  <View style={styles.fieldToReveal}>
                    <Text style={styles.callout}>
                      {proof.ageAbove18 === '0'
                        ? 'Not revealed'
                        : proof.ageAbove18
                          ? 'True'
                          : 'False'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.subhead, { textAlign: 'left' }]}>
                  Gender:
                </Text>
                <View style={styles.fieldToRevealContainer}>
                  <View style={styles.fieldToReveal}>
                    <Text style={styles.callout}>
                      {proof.gender === '0'
                        ? 'Not revealed'
                        : bigIntsToString([BigInt(proof.gender)])}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subhead, { textAlign: 'left' }]}>
                  State:
                </Text>
                <View style={styles.fieldToRevealContainer}>
                  <View style={styles.fieldToReveal}>
                    <Text style={styles.callout}>
                      {proof.state === '0'
                        ? 'Not revealed'
                        : bigIntsToString([BigInt(proof.state)])}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.subhead, { textAlign: 'left' }]}>
                  PIN code:
                </Text>
                <View style={styles.fieldToRevealContainer}>
                  <View style={styles.fieldToReveal}>
                    <Text style={styles.callout}>
                      {proof.pincode === '0' ? 'Not revealed' : proof.pincode}
                    </Text>
                  </View>
                </View>
              </View>

              {/* // */}
            </View>
          </>
        ) : (
          <Text style={styles.heading}>Oops something is missing...</Text>
        )}
      </View>
      <Footer navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  absolute: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#3E3B3B',
    borderRadius: 8,
    elevation: 8,
    flex: 1,
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  callout: {
    color: 'white',
    flexWrap: 'wrap',
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    width: 'auto',
  },
  centeredView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 22,
  },
  confirmationModalButton: {
    alignItems: 'center',
    backgroundColor: '#484343',
    borderColor: 'gray',
    borderTopWidth: 1,
    flex: 1,
    paddingVertical: 15,
  },
  fieldToReveal: {
    alignItems: 'center',
    backgroundColor: '#3E3B3B',
    borderRadius: 4,
    flexDirection: 'row',
    height: 'auto',
    marginBottom: 5,
    marginTop: 5,
    padding: 10,
    paddingHorizontal: 18,
    width: '100%',
  },
  fieldToRevealContainer: {
    width: '100%',
  },
  fieldToRevealText: {
    color: 'white',
    fontFamily: 'Outfit-Bold',
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 6,
  },
  footnote: {
    color: 'white',
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    lineHeight: 16,
  },
  heading: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'left',
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: '#E93CAE',
    borderRadius: 8,
    height: 95,
    justifyContent: 'center',
    width: 95,
  },
  infoText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    textAlign: 'left',
  },
  modalText: {
    color: 'white',
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: '#3E3B3B',
    borderRadius: 8,
    elevation: 5,
    margin: 20,
    paddingTop: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  safeArea: {
    backgroundColor: '#000000',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  subhead: {
    color: '#B3ADAE',
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'left',
  },
});
