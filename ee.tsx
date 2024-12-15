import React from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground, Image } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.topLeftCircle}>
      <View style={styles.topGreenCircle}></View>
      </View>
      <View style={styles.topRightCircle}></View>
      <View style={styles.topBlueCircle}></View>
    
      <View style={styles.bottomContainer}>
        <TextInput placeholder="Username" style={styles.input} placeholderTextColor="#C2F7DA" />
        <TextInput placeholder="Password" style={styles.input} placeholderTextColor="#C2F7DA" secureTextEntry />
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>LOG IN</Text>
        </TouchableOpacity>
        <Text style={styles.noAccountText}>No account? Sign up</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6A7AA1",
  },
  circleTwo: {
    width: 200, 
    height: 200, 
    borderRadius: 100, 
    zIndex: 2,
  },
  topLeftCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    marginLeft: -150,
    marginTop: -100,  
    width: 500,
    height: 500,
    borderRadius: 250,  
    backgroundColor: "#9DFFD8", 
  },
  topLinearCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 200,
    height: 200,  
    marginLeft: 190,
    marginTop: 230,
    borderRadius: 150,  
    backgroundColor: "#9DFFD8", 
    zIndex: 2,
  },
  topGreenCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 200,
    height: 200,  
    marginLeft: 190,
    marginTop: 230,
    borderRadius: 150, 
    backgroundColor: "#9DFFD8", 
    borderWidth: 4,
    borderColor: "#4C5DF0",  
    zIndex: 2,
  },

  topRightCircle: {
    position: "absolute",
    top: 0,
    right: 0,
    marginRight: -90,
    marginTop: -100,
    width: 300,
    height: 300,
    borderRadius: 180,
    backgroundColor: "#EE7BE4", 
    zIndex: 2,
  },
  topBlueCircle: {
    position: "absolute",
    top: 0,
    right: 0,
    marginRight: -180,
    marginTop: 100,
    width: 300,
    height: 300,
    borderRadius: 180,
    backgroundColor: "#4C5DF0", 
    zIndex: 1,
  },
  topContainer: {
    flex: 2,
    backgroundColor: "#A0FFE0",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  circle1: {
    backgroundColor: "rgba(129, 75, 230, 0.6)",
    top: 50,
    left: 50,
  },
  circle2: {
    backgroundColor: "rgba(255, 182, 193, 0.8)",
    top: -30,
    right: 50,
  },
  circle3: {
    backgroundColor: "rgba(99, 102, 241, 0.7)",
    bottom: 40,
    left: 100,
  },
  centerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "blue",
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    textAlign: "center",
    fontSize: 14,
    color: "black",
  },
  bottomContainer: {
    marginTop:250,
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#C2F7DA",
    marginVertical: 10,
    padding: 5,
    color: "#FFFFFF",
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: "linear-gradient(90deg, #98EECC, #57B892)",
    padding: 1,
    alignItems: "center",
    borderRadius: 20,
  },
  loginButtonText: {
    color: "black",
    fontSize: 16,
  },
  noAccountText: {
    marginTop: 10,
    textAlign: "center",
    color: "black",
    fontSize: 14,
    textTransform: "uppercase",
  },
});
