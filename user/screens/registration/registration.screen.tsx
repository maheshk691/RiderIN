import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import TitleView from "@/components/signup/title.view";
import Input from "@/components/common/input";
import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from "@/configs/api";

export default function RegistrationScreen() {
  const { colors } = useTheme();
  const { user } = useLocalSearchParams() as any;
  const parsedUser = JSON.parse(user);
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/user/update', {
        name: formData.name,
        userId: parsedUser.id,
      });
      await AsyncStorage.setItem('accessToken', 'dummy_token'); // Mock token storage for cache
      router.replace("/(tabs)/home");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <View>
        {/* logo */}
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowHeight(25),
            paddingTop: windowHeight(50),
            textAlign: "center",
          }}
        >
          Ride Wave
        </Text>
        <View style={{ padding: windowWidth(20) }}>
          <View
            style={[styles.subView, { backgroundColor: colors.background }]}
          >
            <View style={styles.space}>
              <TitleView
                title={"Create your account"}
                subTitle="Explore your life by joining Ride Wave"
              />
              <Input
                title="Name"
                placeholder="Enter your name"
                value={formData?.name}
                onChangeText={(text) => handleChange("name", text)}
                showWarning={showWarning && formData.name === ""}
                warning={"Please enter your name!"}
              />
              <Input
                title="Phone Number"
                placeholder="Enter your phone number"
                value={parsedUser?.phone_number}
                disabled={true}
              />
              <View style={styles.margin}>
                <Button
                  onPress={() => handleSubmit()}
                  title="Sign Up"
                  disabled={loading}
                  backgroundColor={color.buttonBg}
                  textColor={color.whiteColor}
                />
                <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/(routes)/login')}>
                  <Text style={styles.loginText}>Already have an account? Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  subView: {
    height: "100%",
  },
  space: {
    marginHorizontal: windowWidth(4),
  },
  margin: {
    marginVertical: windowHeight(12),
  },
  loginLink: {
    marginTop: windowHeight(10),
    alignItems: 'center',
  },
  loginText: {
    color: color.buttonBg,
    fontSize: windowHeight(16),
    textDecorationLine: 'underline',
  },
});
