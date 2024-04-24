/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useState, type FunctionComponent } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Footer } from '../Components/Footer';
import {
  AnonAadhaarContext,
  bigIntsToString,
  cleanAnonAadhaarState,
  type AnonAadhaarProof,
} from '@anon-aadhaar/react-native';
import { icons } from '../Components/illustrations';
import { SvgXml } from 'react-native-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { BlurView } from '@react-native-community/blur';

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
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <BlurView
        style={styles.absolute}
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="dark"
      >
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
      </BlurView>
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
  callout: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: 'white',
    flexWrap: 'wrap',
    width: 'auto',
  },
  fieldToRevealContainer: {
    width: '100%',
  },
  fieldToRevealText: {
    fontFamily: 'Outfit-Bold',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 6,
  },
  fieldToReveal: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 4,
    backgroundColor: '#3E3B3B',
    marginBottom: 5,
    marginTop: 5,
    padding: 10,
    paddingHorizontal: 18,
    height: 'auto',
  },
  subhead: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: '#B3ADAE',
  },
  infoIcon: {
    width: 95,
    height: 95,
    backgroundColor: '#E93CAE',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  infoText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
    marginTop: 20,
    fontFamily: 'Outfit-Bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
    marginTop: 20,
    fontFamily: 'Outfit-Bold',
  },
  scrollView: {
    justifyContent: 'center',
    padding: 20,
    flex: 1,
  },
  footnote: {
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    color: 'white',
    lineHeight: 16,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#3E3B3B',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    alignSelf: 'center',
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#3E3B3B',
    borderRadius: 8,
    paddingTop: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  absolute: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  confirmationModalButton: {
    flex: 1,
    backgroundColor: '#484343',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 15,
    borderColor: 'gray',
  },
});
