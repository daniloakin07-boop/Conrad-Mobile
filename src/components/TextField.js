import { StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS, FONTS } from "../theme";

export default function TextField({ label, style, multiline, ...props }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.multiline, style]}
        placeholderTextColor="#9aa1ab"
        multiline={multiline}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12 },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    marginBottom: 6,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderInput,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
});
