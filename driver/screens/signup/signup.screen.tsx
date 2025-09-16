import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import ProgressBar from "@/components/common/progress.bar";
import styles from "./styles";
import { useTheme } from "@react-navigation/native";
import TitleView from "@/components/signup/title.view";
import Input from "@/components/common/input";

import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import { router } from "expo-router";

export default function SignupScreen() {
  const { colors } = useTheme();
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const gotoDocument = () => {
    if (formData.name.trim() === "" || formData.phoneNumber.trim() === "" ) {
      setShowWarning(true);
    } else {
      setShowWarning(false);

      const phone_number = `+91${formData.phoneNumber}`;

      const driverData = {
        name: formData.name,
        country: "India 🇮🇳",
        phone_number: phone_number,
      };
      router.push({
        pathname: "/(routes)/document-verification",
        params: driverData,
      });
    }
  };

  return (
    <ScrollView>
      <View>
        {/* logo */}
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowHeight(22),
            paddingTop: windowHeight(50),
            textAlign: "center",
          }}
        >
          Ride Wave
        </Text>
        <View style={{ padding: windowWidth(20) }}>
          <ProgressBar fill={1} />
          <View
            style={[styles.subView, { backgroundColor: colors.background }]}
          >
            <View style={styles.space}>
              <TitleView
                title={"Create your account"}
                subTitle={"Explore your life by joining Ride Wave"}
              />
              <Input
                title="Name"
                placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                showWarning={showWarning && formData.name === ""}
                warning={"Please enter your name!"}
              />

              <Input
                title="Phone Number"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={(text) => handleChange("phoneNumber", text)}
                showWarning={showWarning && formData.phoneNumber === ""}
                warning={"Please enter your phone number!"}
              />
            </View>
            <View style={styles.margin}>
              <Button
                onPress={gotoDocument}
                height={windowHeight(30)}
                title={"Sign Up"}
                backgroundColor={color.buttonBg}
                textColor={color.whiteColor}
              />
              <TouchableOpacity style={newStyles.loginLink} onPress={() => router.push('/(routes)/login')}>
                <Text style={newStyles.loginText}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const newStyles = StyleSheet.create({
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
