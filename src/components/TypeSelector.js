import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "../theme";

// Mirrors .tipo-usuario: two label-as-button options, selected one goes
// navy-filled. Web version drives this off <input type="radio" name="tipo">;
// here it's just controlled state since there's no native radio primitive.
export default function TypeSelector({ label, options, value, onChange }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.pill, selected && styles.pillSelected]}
            >
              <Text style={[styles.pillLabel, selected && styles.pillLabelSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  row: { flexDirection: "row", gap: 8 },
  pill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.borderInput,
    borderRadius: 6,
  },
  pillSelected: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  pillLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.text,
  },
  pillLabelSelected: {
    color: COLORS.white,
  },
});
