import React, { useRef, useState } from "react";
import { 
    StyleSheet, View, Text, Image, TouchableOpacity, FlatList, Animated 
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";

const slides = [
    {
        id: "1",
        title: "Explora",
        text: "Cocinar nunca fue tan fácil y divertido. ¡Atrévete a experimentar en la cocina!",
        image: require("../../assets/images/Salad.webp"),
        backgroundColor: "#1dab20" //47b50d
    },
    {
        id: "2",
        title: "Descubre",
        text: "Prueba recetas nuevas y mejora tus habilidades culinarias cada día.",
        image: require("../../assets/images/FastFood.webp"),
        backgroundColor: "#ff5a2f"
    },
    {
        id: "3",
        title: "Comparte",
        text: "Invita a tus amigos y disfruta de una buena comida juntos.",
        image: require("../../assets/images/Postre2.webp"),
        backgroundColor: "#0277BD"
    }
];


export default function ParallaxScreen() {
    const navigation = useNavigation();
    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const backgroundColor = scrollX.interpolate({
        inputRange: slides.map((_, i) => i * wp("100%")),
        outputRange: slides.map(slide => slide.backgroundColor),
    });

    return (
        <Animated.View style={[styles.container, { backgroundColor }]}>
            <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / wp("100%"));
                    setCurrentIndex(index);
                }}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <Image source={require("../../assets/images/background.png")} style={styles.fruitBackground} />
                        <Image source={item.image} style={styles.fastFood} />
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.frase}>{item.text}</Text>
                    </View>
                )}
            />

            {/* Indicadores de página */}
            <View style={styles.dotContainer}>
                {slides.map((_, index) => {
                    const opacity = scrollX.interpolate({
                        inputRange: [
                            wp("100%") * (index - 1),
                            wp("100%") * index,
                            wp("100%") * (index + 1)
                        ],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: "clamp",
                    });

                    return <Animated.View key={index} style={[styles.dot, { opacity }]} />;
                })}
            </View>

            {/* Botón siguiente */}
            {/*<TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.startText}>
                    {currentIndex === slides.length - 1 ? "Empezar" : "Siguiente"}
                </Text>
            </TouchableOpacity>*/}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    fruitBackground: {
        position: 'absolute',
        width: wp('100'),
        height: hp('100'),
    },
    slide: {
        width: wp("100%"),
        alignItems: "center",
        justifyContent: "center",
    },
    fastFood: {
        width: wp("80%"),
        height: wp("80%"),
        top: -hp("3%"),
    },
    title: {
        color: "#fff",
        fontFamily: "serif",
        fontSize: 50,
        fontWeight: "bold",
        position: "absolute",
        top: hp("67%"),
    },
    frase: {
        color: "#fff",
        fontSize: 18,
        position: "absolute",
        top: hp("77%"),
        textAlign: "center",
        paddingHorizontal: wp("10%"),
    },
    dotContainer: {
        flexDirection: "row",
        position: "absolute",
        bottom: hp("12%"),
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
        marginHorizontal: 5,
    },
    button: {
        position: "absolute",
        bottom: hp(5),
        backgroundColor: "#fff",
        paddingVertical: hp(2),
        paddingHorizontal: wp(12),
        borderRadius: hp(1.5),
    },
    startText: {
        fontSize: hp(2.4),
        color: "#058206",
        fontWeight: "bold",
    },
});