import { StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS, FONTS } from "../theme";
import { makeStyles } from "../ui/estilos";

export default function TextField({ label, style, multiline, ...props }) {
  const styles = useStyles();
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.multiline, style]}
        placeholderTextColor={COLORS.placeholder}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}

const useStyles = makeStyles(() => ({
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
    backgroundColor: COLORS.card,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
}));