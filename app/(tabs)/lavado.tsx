import { StyleSheet, Text, View } from "react-native";
;
export default function LavadoScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Lavado</Text>
</View>
    );
}
const styles = StyleSheet.create({
    container: {flex: 1,justifyContent: 'center',alignItems: 'center',
    },
    text: {fontSize: 20,fontWeight: 'bold',
    },
});