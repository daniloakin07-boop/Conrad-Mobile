// ============================================================================
// src/components/TypeSelector.js — escolha do tipo de usuário (Aluno | Educador)
// Usado em app/cadastro.js.
// ============================================================================
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "../theme";
import { makeStyles } from "../ui/estilos";

// Espelha .tipo-usuario do Web: duas opções em forma de botão; a escolhida fica
// preenchida de azul-marinho. No Web isso usa <input type="radio" name="tipo">; aqui é
// um componente controlado (props: label, options [{label,value}], value, onChange),
// pois o React Native não tem "radio" nativo.
export default function TypeSelector({ label, options, value, onChange }) {
  const styles = useStyles();
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

const useStyles = makeStyles(() => ({
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
}));